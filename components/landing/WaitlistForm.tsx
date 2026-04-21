"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { isValidEmail } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

const states = [
  "GA", "FL", "AL", "TN", "SC", "NC", "TX", "CA", "NY", "Other",
];

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [stateInterested, setStateInterested] = useState("GA");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, state_interested: stateInterested }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong.");
      }

      setStatus("success");
      setMessage(
        data?.alreadyOnList
          ? "You're already on the list — we'll be in touch!"
          : "You're in! Watch for a welcome email soon."
      );
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section id="waitlist" className="relative py-24">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-4xl border border-plum-800/5 bg-gradient-to-br from-cream via-white to-coral-50 p-10 shadow-soft md:p-14"
        >
          <div
            aria-hidden
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sunny-200/60 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-teal-200/60 blur-3xl"
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-coral-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-coral-600">
              <Sparkles className="h-3.5 w-3.5" />
              Early access
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-plum-900 md:text-5xl">
              Be first in. <span className="rainbow-text">It&apos;s free.</span>
            </h2>
            <p className="mt-3 max-w-xl text-lg text-plum-800/70">
              Drop your email and we&apos;ll let you know the moment
              AutismConnect goes live in your state.
            </p>

            <form onSubmit={handleSubmit} className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    disabled={status === "submitting" || status === "success"}
                    placeholder="you@example.com"
                    aria-label="Email address"
                    className="w-full rounded-full border-2 border-plum-800/10 bg-white px-6 py-4 text-base text-plum-900 placeholder:text-plum-800/40 outline-none transition focus:border-coral-400 focus:shadow-glow disabled:opacity-60"
                  />
                </div>

                <select
                  value={stateInterested}
                  onChange={(e) => setStateInterested(e.target.value)}
                  disabled={status === "submitting" || status === "success"}
                  aria-label="State"
                  className="rounded-full border-2 border-plum-800/10 bg-white px-5 py-4 text-base font-semibold text-plum-900 outline-none transition focus:border-coral-400 disabled:opacity-60"
                >
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={status === "submitting" || status === "success"}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-plum-800 px-8 py-4 text-base font-bold text-cream shadow-soft transition hover:bg-plum-700 disabled:opacity-70"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : status === "success" ? (
                    <>
                      <Check className="h-4 w-4" />
                      You&apos;re in
                    </>
                  ) : (
                    <>
                      Join waitlist
                      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="status"
                    className={
                      status === "error"
                        ? "mt-4 text-sm font-semibold text-coral-600"
                        : "mt-4 text-sm font-semibold text-teal-600"
                    }
                  >
                    {message}
                  </motion.p>
                )}
              </AnimatePresence>

              <p className="mt-5 text-xs text-plum-800/50">
                We&apos;ll never spam. Unsubscribe any time. Your data is
                private.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
