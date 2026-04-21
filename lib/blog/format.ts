/**
 * Lightweight post formatter. No heavy Markdown lib — just what we actually
 * support in the editor:
 *   **bold**                 → <strong>
 *   *italic*                 → <em>
 *   [text](https://url)      → <a>
 *   [[youtube:VIDEO_ID]]     → sentinel token (rendered as iframe in React)
 *   Bare http(s)://... URLs  → autolinked; YouTube URLs become embeds
 *   Two blank lines          → paragraph break
 *
 * All user input is escaped first — we never innerHTML raw content.
 */

export type Segment =
  | { type: "paragraph"; children: InlineSegment[] }
  | { type: "youtube"; videoId: string };

export type InlineSegment =
  | { type: "text"; content: string }
  | { type: "bold"; content: string }
  | { type: "italic"; content: string }
  | { type: "link"; url: string; content: string };

const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);

export function extractYouTubeId(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (!YT_HOSTS.has(u.hostname)) return null;
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.pathname === "/watch") {
      return u.searchParams.get("v");
    }
    if (u.pathname.startsWith("/shorts/") || u.pathname.startsWith("/embed/")) {
      return u.pathname.split("/")[2] || null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Safely break the post body into paragraphs and YouTube embed blocks. */
export function parsePost(raw: string): Segment[] {
  if (!raw) return [];
  // Normalize line endings
  const normalized = raw.replace(/\r\n/g, "\n");

  // Step 1: pull out YouTube embed tokens and line-by-line detect bare YouTube URLs
  const lines = normalized.split("\n");
  const blocks: string[] = [];
  let buf: string[] = [];

  const flush = () => {
    if (buf.length) {
      blocks.push(buf.join("\n"));
      buf = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    // Explicit YouTube marker
    const markerMatch = trimmed.match(/^\[\[youtube:([A-Za-z0-9_-]{6,20})\]\]$/);
    if (markerMatch) {
      flush();
      blocks.push(`__YT__${markerMatch[1]}`);
      continue;
    }
    // Bare YouTube URL on its own line
    if (/^https?:\/\/\S+$/.test(trimmed)) {
      const vid = extractYouTubeId(trimmed);
      if (vid) {
        flush();
        blocks.push(`__YT__${vid}`);
        continue;
      }
    }
    buf.push(line);
  }
  flush();

  // Step 2: group into paragraphs (split each text block on double newlines)
  const segments: Segment[] = [];
  for (const block of blocks) {
    if (block.startsWith("__YT__")) {
      segments.push({ type: "youtube", videoId: block.slice(6) });
      continue;
    }
    const paragraphs = block.split(/\n{2,}/);
    for (const p of paragraphs) {
      const text = p.trim();
      if (!text) continue;
      segments.push({ type: "paragraph", children: parseInline(text) });
    }
  }

  return segments;
}

/** Parse inline markdown-lite into text / bold / italic / link segments. */
function parseInline(text: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  let i = 0;
  let current = "";

  const flushText = () => {
    if (current) {
      out.push(...autolink(current));
      current = "";
    }
  };

  while (i < text.length) {
    // [text](url)
    if (text.startsWith("[", i)) {
      const end = text.indexOf("]", i + 1);
      if (end !== -1 && text[end + 1] === "(") {
        const urlEnd = text.indexOf(")", end + 2);
        if (urlEnd !== -1) {
          const linkText = text.slice(i + 1, end);
          const url = text.slice(end + 2, urlEnd).trim();
          if (isSafeUrl(url)) {
            flushText();
            out.push({ type: "link", url, content: linkText });
            i = urlEnd + 1;
            continue;
          }
        }
      }
    }
    // **bold**
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        flushText();
        out.push({ type: "bold", content: text.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }
    // *italic* — avoid treating lone asterisks as italics if they don't close
    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = text.indexOf("*", i + 1);
      if (end !== -1) {
        flushText();
        out.push({ type: "italic", content: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    current += text[i];
    i++;
  }
  flushText();
  return out;
}

/** Split plain text into runs that autolink bare http(s) URLs. */
function autolink(text: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  const regex = /https?:\/\/[^\s<]+/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      out.push({ type: "text", content: text.slice(lastIdx, m.index) });
    }
    const url = m[0].replace(/[.,;:!?)]+$/, "");
    out.push({ type: "link", url, content: url });
    lastIdx = m.index + url.length;
  }
  if (lastIdx < text.length) {
    out.push({ type: "text", content: text.slice(lastIdx) });
  }
  return out;
}

function isSafeUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Extract a plain-text excerpt of the post, stripping markers. */
export function extractExcerpt(raw: string, max = 220): string {
  const stripped = raw
    .replace(/\[\[youtube:[^\]]+\]\]/g, "")
    .replace(/\!\[[^\]]*\]\([^\)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= max) return stripped;
  return stripped.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}
