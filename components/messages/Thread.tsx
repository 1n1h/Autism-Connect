"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import type { Message, MessageAuthor } from "@/types/messaging";

type Props = {
  other: MessageAuthor;
  initialMessages: Message[];
  currentUserId: string;
};

export function Thread({ other, initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);

    // Optimistic
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      sender_id: currentUserId,
      recipient_id: other.id,
      content: trimmed,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setContent("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: other.id, content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't send.");
      setMessages((m) => m.map((x) => (x.id === tempId ? (data.message as Message) : x)));
    } catch (err) {
      setMessages((m) => m.filter((x) => x.id !== tempId));
      setError(err instanceof Error ? err.message : "Couldn't send.");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(e as unknown as React.FormEvent);
    }
  }

  const otherName = [other.first_name, other.last_name].filter(Boolean).join(" ") || "Parent";

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col overflow-hidden rounded-3xl border border-plum-800/5 bg-white shadow-soft">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-plum-800/5 px-5 py-4">
        {other.profile_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={other.profile_photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-coral-300 to-teal-300 text-sm font-bold text-plum-900">
            {otherName.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <div className="font-display font-bold text-plum-900">{otherName}</div>
          {(other.location || other.state) && (
            <div className="text-xs text-plum-800/60">
              {[other.location, other.state].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-cream/40 px-4 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="font-display text-lg font-bold text-plum-900">Say hi to {otherName} 👋</div>
              <p className="mt-1 text-sm text-plum-800/60">
                Every conversation here is private between you two.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <Bubble key={m.id} mine={m.sender_id === currentUserId} message={m} />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={send} className="border-t border-plum-800/5 bg-white p-3">
        {error && (
          <p role="alert" className="mb-2 px-3 text-xs font-semibold text-coral-600">{error}</p>
        )}
        <div className="flex items-end gap-2 rounded-3xl border-2 border-plum-800/10 bg-cream px-3 py-2 focus-within:border-coral-400 focus-within:shadow-glow">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={`Message ${otherName}...`}
            disabled={sending}
            className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent py-1.5 text-sm text-plum-900 outline-none placeholder:text-plum-800/40"
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-plum-800 text-cream shadow-soft transition hover:bg-plum-700 disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}

function Bubble({ mine, message }: { mine: boolean; message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={mine ? "flex justify-end" : "flex justify-start"}
    >
      <div
        className={
          mine
            ? "max-w-[78%] rounded-3xl rounded-br-sm bg-plum-800 px-4 py-2.5 text-sm text-cream"
            : "max-w-[78%] rounded-3xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-plum-900 shadow-sm"
        }
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <div className={mine ? "mt-1 text-right text-[10px] text-cream/60" : "mt-1 text-[10px] text-plum-800/50"}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </div>
      </div>
    </motion.div>
  );
}
