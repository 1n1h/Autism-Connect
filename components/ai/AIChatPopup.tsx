"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  RefreshCcw,
  Bot,
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string; id: string };

const SUGGESTIONS = [
  "How does the IEP process work in Georgia?",
  "What's the difference between ABA, speech, and OT?",
  "My child just got diagnosed — where do I start?",
  "How do I apply for Medicaid waivers in GA?",
];

export function AIChatPopup() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opening
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: Message = { role: "user", content: trimmed, id: cryptoId() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, id: cryptoId() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function resetChat() {
    setMessages([]);
    setError(null);
    setInput("");
  }

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open AI guidance chat"
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.3 }}
        className={
          "fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-plum-800 px-5 py-3.5 text-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-plum-700 " +
          (open ? "pointer-events-none opacity-0" : "")
        }
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-sunny-300/60" />
          <Sparkles className="relative h-4 w-4 text-sunny-300" />
        </span>
        <span className="hidden text-sm font-bold sm:inline">Ask anything</span>
      </motion.button>

      {/* Chat popup */}
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-plum-900/30 backdrop-blur-sm sm:hidden"
            />
            <motion.div
              role="dialog"
              aria-label="AutismConnect AI"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="fixed inset-x-4 bottom-4 top-16 z-50 flex flex-col overflow-hidden rounded-4xl border border-plum-800/10 bg-white shadow-soft sm:left-auto sm:right-5 sm:top-auto sm:h-[600px] sm:w-[400px]"
            >
              {/* Header */}
              <div className="relative flex items-center justify-between gap-3 border-b border-plum-800/5 bg-gradient-to-br from-plum-800 via-plum-700 to-lavender-400 px-5 py-4 text-cream">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sunny-300 text-plum-900">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold">AutismConnect AI</div>
                    <div className="text-[11px] text-cream/70">Here for questions — big or small.</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={resetChat}
                      aria-label="Start a new chat"
                      className="rounded-full p-1.5 text-cream/70 transition hover:bg-cream/10 hover:text-cream"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                    className="rounded-full p-1.5 text-cream/70 transition hover:bg-cream/10 hover:text-cream"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto bg-cream/40 px-4 py-5"
              >
                {messages.length === 0 ? (
                  <EmptyState onPick={send} />
                ) : (
                  <div className="space-y-4">
                    {messages.map((m) => (
                      <Bubble key={m.id} message={m} />
                    ))}
                    {loading && <TypingBubble />}
                  </div>
                )}
                {error && (
                  <div className="mt-3 rounded-2xl bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-600">
                    {error}
                  </div>
                )}
              </div>

              {/* Composer */}
              <form onSubmit={onSubmit} className="border-t border-plum-800/5 bg-white p-3">
                <div className="flex items-end gap-2 rounded-3xl border-2 border-plum-800/10 bg-cream px-3 py-2 focus-within:border-coral-400 focus-within:shadow-glow">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    placeholder="Ask anything about autism, IEPs, therapies..."
                    aria-label="Message"
                    disabled={loading}
                    className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent py-1.5 text-sm text-plum-900 outline-none placeholder:text-plum-800/40"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    aria-label="Send"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-plum-800 text-cream shadow-soft transition hover:bg-plum-700 disabled:opacity-40"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-2 px-2 text-[10px] text-plum-800/50">
                  AI guidance — not a substitute for medical, legal, or
                  professional advice.
                </p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col items-center justify-center text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-coral-300 via-sunny-300 to-teal-300 shadow-soft">
        <Sparkles className="h-7 w-7 text-plum-900" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-plum-900">
        What can I help with?
      </h3>
      <p className="mt-1 max-w-[280px] text-xs text-plum-800/60">
        Diagnosis, IEPs, therapies, benefits, finding providers — ask in plain words.
      </p>
      <div className="mt-5 flex w-full flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-2xl border border-plum-800/10 bg-white px-4 py-2.5 text-left text-xs font-semibold text-plum-900 transition hover:border-coral-300 hover:bg-coral-50"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={isUser ? "flex justify-end" : "flex items-start gap-2"}
    >
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-sunny-300 text-plum-900">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}
      <div
        className={
          isUser
            ? "max-w-[82%] rounded-3xl rounded-br-sm bg-plum-800 px-4 py-2.5 text-sm text-cream"
            : "max-w-[82%] rounded-3xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-plum-900 shadow-sm"
        }
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-sunny-300 text-plum-900">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="rounded-3xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-plum-800/40 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-plum-800/40 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-plum-800/40" />
        </div>
      </div>
    </div>
  );
}

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
