"use client";

import { useState, useMemo } from "react";
import { BlogCard } from "./BlogCard";
import { BLOG_CATEGORIES, type BlogPost } from "@/types/blog";
import { motion } from "framer-motion";
import { PenSquare } from "lucide-react";
import Link from "next/link";

export function BlogFeed({ posts }: { posts: BlogPost[] }) {
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    if (category === "all") return posts;
    return posts.filter((p) => p.category === category);
  }, [category, posts]);

  return (
    <div>
      <div className="sticky top-20 z-10 -mx-2 mb-6 overflow-x-auto rounded-3xl border border-plum-800/5 bg-white/80 p-3 shadow-soft backdrop-blur">
        <div className="flex items-center gap-2 px-2">
          <Pill active={category === "all"} onClick={() => setCategory("all")}>
            All posts
          </Pill>
          {BLOG_CATEGORIES.map((c) => (
            <Pill
              key={c.value}
              active={category === c.value}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </Pill>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <BlogCard key={p.id} post={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "shrink-0 rounded-full bg-plum-800 px-4 py-1.5 text-xs font-bold text-cream shadow-soft"
          : "shrink-0 rounded-full border border-plum-800/10 bg-white px-4 py-1.5 text-xs font-bold text-plum-800/70 transition hover:border-plum-800/30"
      }
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-4xl border-2 border-dashed border-plum-800/10 bg-white/50 p-12 text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-100">
        <PenSquare className="h-7 w-7 text-coral-600" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-bold text-plum-900">
        Be the first.
      </h3>
      <p className="mt-2 max-w-md mx-auto text-sm text-plum-800/70">
        Share what you&apos;ve learned, what you&apos;re stuck on, or a win.
        Other parents are looking for exactly what you have to say.
      </p>
      <Link
        href="/blog/create"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-coral-600"
      >
        Write a post →
      </Link>
    </motion.div>
  );
}
