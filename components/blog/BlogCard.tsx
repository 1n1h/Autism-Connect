"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Eye, Clock } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { categoryLabel, categoryAccent } from "@/types/blog";

export function BlogCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  const author = post.author;
  const authorName =
    [author?.first_name, author?.last_name].filter(Boolean).join(" ") || "Parent";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={`/blog/${post.id}`}
        className="group block overflow-hidden rounded-3xl border border-plum-800/5 bg-white shadow-soft transition"
      >
        {post.featured_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featured_image_url}
            alt=""
            className="aspect-[16/9] w-full object-cover"
            loading="lazy"
          />
        )}
        <div className="p-6">
          {post.category && (
            <span className={`inline-flex rounded-full ${categoryAccent(post.category)} px-3 py-1 text-[10px] font-bold uppercase tracking-wider`}>
              {categoryLabel(post.category)}
            </span>
          )}
          <h3 className="mt-3 font-display text-xl font-bold leading-tight text-plum-900 group-hover:text-coral-600">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-plum-800/70">
              {post.excerpt}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 text-xs text-plum-800/60">
            <div className="flex items-center gap-2 min-w-0">
              {author?.profile_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.profile_photo_url}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral-300 to-teal-300 text-[10px] font-bold text-plum-900">
                  {authorName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="truncate font-semibold text-plum-800/80">{authorName}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {post.comment_count !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {post.comment_count}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.views ?? 0}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {relativeTime(post.created_at)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}
