"use client";

import { parsePost, type InlineSegment } from "@/lib/blog/format";

export function FormattedPost({ content, className }: { content: string; className?: string }) {
  const segments = parsePost(content);
  return (
    <div className={className}>
      {segments.map((s, i) => {
        if (s.type === "youtube") return <YouTubeEmbed key={i} videoId={s.videoId} />;
        return (
          <p key={i} className="mb-5 text-[17px] leading-relaxed text-plum-900/90">
            <RenderInline segments={s.children} />
          </p>
        );
      })}
    </div>
  );
}

function RenderInline({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "text") return <span key={i}>{seg.content}</span>;
        if (seg.type === "bold") return <strong key={i}>{seg.content}</strong>;
        if (seg.type === "italic") return <em key={i}>{seg.content}</em>;
        if (seg.type === "link") {
          return (
            <a
              key={i}
              href={seg.url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-coral-600 underline decoration-coral-200 underline-offset-4 transition hover:decoration-coral-500"
            >
              {seg.content}
            </a>
          );
        }
        return null;
      })}
    </>
  );
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="my-6 overflow-hidden rounded-3xl bg-plum-900 shadow-soft">
      <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}
