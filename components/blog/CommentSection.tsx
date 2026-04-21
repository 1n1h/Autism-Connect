"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Trash2 } from "lucide-react";
import type { BlogComment } from "@/types/blog";

export function CommentSection({
  postId,
  initialComments,
  currentUserId,
}: {
  postId: string;
  initialComments: BlogComment[];
  currentUserId: string | null;
}) {
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't post comment.");
      setComments((prev) => [data.comment as BlogComment, ...prev]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post comment.");
    } finally {
      setPosting(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this comment?")) return;
    const prev = comments;
    setComments((c) => c.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/blog/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setComments(prev);
      setError("Couldn't delete that comment.");
    }
  }

  return (
    <section className="mt-12 border-t border-plum-800/10 pt-10">
      <h2 className="font-display text-2xl font-bold text-plum-900">
        {comments.length === 0
          ? "No comments yet — be the first."
          : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
      </h2>

      {currentUserId ? (
        <form onSubmit={submit} className="mt-5">
          <div className="rounded-3xl border-2 border-plum-800/10 bg-white px-4 py-3 focus-within:border-coral-400 focus-within:shadow-glow">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or a 'me too'..."
              rows={3}
              maxLength={4000}
              className="block w-full resize-none bg-transparent text-sm text-plum-900 outline-none placeholder:text-plum-800/40"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-plum-800/50">
                Keep it kind. Other parents are reading.
              </span>
              <button
                type="submit"
                disabled={posting || !content.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-plum-800 px-5 py-2 text-xs font-bold text-cream shadow-soft transition hover:bg-plum-700 disabled:opacity-60"
              >
                {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Post
              </button>
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs font-semibold text-coral-600">{error}</p>
          )}
        </form>
      ) : (
        <div className="mt-5 rounded-3xl border border-plum-800/10 bg-white px-5 py-4 text-sm text-plum-800/70">
          <a href="/login" className="font-semibold text-coral-600 hover:text-coral-700">Sign in</a> to join the conversation.
        </div>
      )}

      <div className="mt-8 space-y-5">
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              canDelete={currentUserId === c.user_id}
              onDelete={() => remove(c.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  canDelete,
  onDelete,
}: {
  comment: BlogComment;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const a = comment.author;
  const name = [a?.first_name, a?.last_name].filter(Boolean).join(" ") || "Parent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      layout
      className="flex gap-3"
    >
      {a?.profile_photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={a.profile_photo_url}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral-300 to-teal-300 text-sm font-bold text-plum-900">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-display font-bold text-plum-900">{name}</span>
            {a?.location && (
              <span className="ml-2 text-xs text-plum-800/60">
                {a.location}
                {a.state ? `, ${a.state}` : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-plum-800/50">
            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label="Delete comment"
                className="rounded-full p-1 text-plum-800/40 transition hover:bg-coral-50 hover:text-coral-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-plum-900/90">
          {comment.content}
        </p>
      </div>
    </motion.div>
  );
}
