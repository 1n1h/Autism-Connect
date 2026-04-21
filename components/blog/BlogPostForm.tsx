"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Youtube,
  Image as ImageIcon,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BLOG_CATEGORIES, type BlogPost } from "@/types/blog";
import { extractYouTubeId, parsePost } from "@/lib/blog/format";
import { FormattedPost } from "./FormattedPost";

type Props = {
  initial?: Partial<BlogPost>;
  mode?: "create" | "edit";
};

export function BlogPostForm({ initial, mode = "create" }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "community");
  const [featuredImage, setFeaturedImage] = useState(initial?.featured_image_url ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save draft to localStorage (create mode only)
  useEffect(() => {
    if (mode !== "create") return;
    const saved = localStorage.getItem("ac_blog_draft");
    if (saved && !initial?.title && !initial?.content) {
      try {
        const draft = JSON.parse(saved);
        if (draft.title) setTitle(draft.title);
        if (draft.content) setContent(draft.content);
        if (draft.category) setCategory(draft.category);
        if (draft.featuredImage) setFeaturedImage(draft.featuredImage);
      } catch { /* ignore */ }
    }
  }, [mode, initial]);

  useEffect(() => {
    if (mode !== "create") return;
    const t = setTimeout(() => {
      localStorage.setItem(
        "ac_blog_draft",
        JSON.stringify({ title, content, category, featuredImage }),
      );
    }, 500);
    return () => clearTimeout(t);
  }, [mode, title, content, category, featuredImage]);

  function insertAtCursor(before: string, after: string = "", placeholder = "") {
    const ta = textareaRef.current;
    if (!ta) {
      setContent((c) => c + before + placeholder + after);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    // Restore selection around the placeholder
    requestAnimationFrame(() => {
      ta.focus();
      const newStart = start + before.length;
      ta.setSelectionRange(newStart, newStart + selected.length);
    });
  }

  function addLink() {
    const url = window.prompt("Link URL (https://...)");
    if (!url) return;
    const u = url.trim();
    if (!/^https?:\/\//i.test(u)) {
      setError("Links must start with http:// or https://");
      return;
    }
    const text = window.prompt("Link text (leave blank to show the URL)") ?? "";
    const display = text.trim() || u;
    insertAtCursor(`[${display}](${u})`);
  }

  function addYouTube() {
    const url = window.prompt("YouTube URL");
    if (!url) return;
    const id = extractYouTubeId(url.trim());
    if (!id) {
      setError("Couldn't find a YouTube video ID in that URL.");
      return;
    }
    insertAtCursor(`\n\n[[youtube:${id}]]\n\n`);
  }

  async function handleFeaturedImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image is too large. Keep it under 10MB.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("blog-images")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(path);
      setFeaturedImage(`${pub.publicUrl}?t=${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = JSON.stringify({
        title: title.trim(),
        content: content.trim(),
        category,
        featured_image_url: featuredImage || null,
      });
      const url = mode === "edit" ? `/api/blog/${initial?.id}` : "/api/blog";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't save post.");
      if (mode === "create") localStorage.removeItem("ac_blog_draft");
      router.push(`/blog/${data.post.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save post.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (mode !== "edit" || !initial?.id) return;
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${initial.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Couldn't delete post.");
      }
      router.push("/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete post.");
      setDeleting(false);
    }
  }

  const previewSegments = preview ? parsePost(content) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give it a title..."
          required
          maxLength={500}
          className="w-full rounded-3xl border-2 border-plum-800/10 bg-white px-6 py-4 font-display text-2xl font-bold text-plum-900 outline-none transition placeholder:text-plum-800/30 focus:border-coral-400 focus:shadow-glow md:text-3xl"
        />
      </div>

      {/* Category + featured image row */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-plum-800/60">Category</label>
          <select
            value={category ?? ""}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-2xl border-2 border-plum-800/10 bg-white px-4 py-3 font-semibold outline-none transition focus:border-coral-400"
          >
            {BLOG_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-plum-800/60">Featured image</label>
          <div className="mt-2 flex items-center gap-3">
            {featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredImage} alt="" className="h-14 w-20 rounded-xl object-cover shadow-soft" />
            ) : (
              <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-plum-800/5">
                <ImageIcon className="h-5 w-5 text-plum-800/40" />
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-plum-800/10 bg-white px-4 py-2.5 text-sm font-semibold text-plum-900 transition hover:border-plum-800/30">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {featuredImage ? "Replace" : "Upload"}
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFeaturedImage(f);
                  e.target.value = "";
                }}
              />
            </label>
            {featuredImage && (
              <button
                type="button"
                onClick={() => setFeaturedImage("")}
                className="text-xs font-semibold text-plum-800/60 hover:text-coral-600"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editor with toolbar */}
      <div className="rounded-3xl border-2 border-plum-800/10 bg-white focus-within:border-coral-400 focus-within:shadow-glow">
        <div className="flex flex-wrap items-center gap-1 border-b border-plum-800/5 px-3 py-2">
          <ToolbarButton onClick={() => insertAtCursor("**", "**", "bold text")} icon={Bold} label="Bold" />
          <ToolbarButton onClick={() => insertAtCursor("*", "*", "italic text")} icon={Italic} label="Italic" />
          <div className="mx-1 h-5 w-px bg-plum-800/10" />
          <ToolbarButton onClick={addLink} icon={LinkIcon} label="Add article link" />
          <ToolbarButton onClick={addYouTube} icon={Youtube} label="Embed YouTube" />
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={
                !preview
                  ? "rounded-full bg-plum-800 px-3 py-1 text-xs font-bold text-cream"
                  : "rounded-full px-3 py-1 text-xs font-bold text-plum-800/60 hover:text-plum-900"
              }
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={
                preview
                  ? "rounded-full bg-plum-800 px-3 py-1 text-xs font-bold text-cream"
                  : "rounded-full px-3 py-1 text-xs font-bold text-plum-800/60 hover:text-plum-900"
              }
            >
              Preview
            </button>
          </div>
        </div>

        {preview ? (
          <div className="min-h-[320px] px-6 py-5">
            {content.trim() ? (
              <FormattedPost content={content} />
            ) : (
              <p className="text-plum-800/50">Nothing to preview yet. Write something on the left and flip back.</p>
            )}
            {previewSegments && previewSegments.length === 0 && content.trim() && (
              <p className="text-plum-800/50">(Content doesn&apos;t parse to anything — try adding a paragraph.)</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              "Share your story...\n\n" +
              "Tip: use the toolbar above to add **bold**, *italic*, article links, or embed a YouTube video.\n\n" +
              "Two blank lines = new paragraph."
            }
            rows={16}
            required
            className="block min-h-[320px] w-full resize-y rounded-b-3xl bg-transparent px-6 py-5 text-[17px] leading-relaxed text-plum-900 outline-none placeholder:text-plum-800/40"
          />
        )}
      </div>

      {/* Actions */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="text-sm font-semibold text-coral-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-plum-800/50">
          {mode === "create" ? "Draft auto-saves to this browser." : "Edits save on publish."}
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-full border border-coral-200 bg-white px-5 py-3 text-sm font-bold text-coral-600 transition hover:bg-coral-50 disabled:opacity-60"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </button>
          )}
          <button
            type="submit"
            disabled={saving || !title.trim() || content.trim().length < 10}
            className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-7 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-coral-600 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === "edit" ? "Save changes" : "Publish"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function ToolbarButton({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-plum-800/70 transition hover:bg-plum-800/5 hover:text-plum-900"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
