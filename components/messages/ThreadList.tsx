"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import type { Thread } from "@/types/messaging";

export function ThreadList({ threads }: { threads: Thread[] }) {
  if (threads.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-4xl border-2 border-dashed border-plum-800/10 bg-white/50 p-12 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100">
          <MessageCircle className="h-7 w-7 text-teal-600" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-plum-900">
          No conversations yet.
        </h3>
        <p className="mt-2 text-sm text-plum-800/70">
          Search for another parent above to start a conversation.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="divide-y divide-plum-800/5 rounded-3xl border border-plum-800/5 bg-white shadow-soft">
      {threads.map((t, i) => (
        <motion.div
          key={t.otherUser.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.2) }}
        >
          <Link
            href={`/messages/${t.otherUser.id}`}
            className="flex items-center gap-4 px-5 py-4 transition hover:bg-cream/60"
          >
            {t.otherUser.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.otherUser.profile_photo_url}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral-300 to-teal-300 text-base font-bold text-plum-900">
                {(t.otherUser.first_name ?? "P").charAt(0).toUpperCase()}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="truncate font-display font-bold text-plum-900">
                  {[t.otherUser.first_name, t.otherUser.last_name].filter(Boolean).join(" ") || "Parent"}
                </div>
                <div className="shrink-0 text-[11px] text-plum-800/50">
                  {relativeShort(t.lastMessage.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={
                    "truncate text-sm " +
                    (t.unreadCount > 0
                      ? "font-bold text-plum-900"
                      : "text-plum-800/60")
                  }
                >
                  {t.lastMessage.content}
                </div>
                {t.unreadCount > 0 && (
                  <span className="shrink-0 rounded-full bg-coral-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {t.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function relativeShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}
