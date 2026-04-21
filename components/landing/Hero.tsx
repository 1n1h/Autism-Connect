"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, MessageCircle } from "lucide-react";
import { FloatingBlobs } from "./FloatingBlobs";

const fadeUp = {
  initial: { y: 24, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden grain">
      <FloatingBlobs />

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left — copy */}
          <div>
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-plum-800/10 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-plum-700 backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-coral-500" />
              Launching in Georgia
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-plum-900 md:text-7xl"
            >
              All autism resources,{" "}
              <span className="rainbow-text">in one place.</span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-plum-800/80 md:text-xl"
            >
              A warm, parent-led home for therapies, schools, and doctors —
              plus a real community and AI guidance that actually understands
              your family.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <a
                href="#waitlist"
                className="group inline-flex items-center gap-2 rounded-full bg-coral-500 px-7 py-3.5 text-base font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-coral-600"
              >
                Join the waitlist
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border-2 border-plum-800/15 bg-white/70 px-6 py-3 text-base font-semibold text-plum-800 backdrop-blur transition hover:border-plum-800/30"
              >
                Learn more
              </a>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-plum-800/70"
            >
              <span className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4 text-coral-500" /> 40+ verified GA resources
              </span>
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-teal-500" /> Parent-to-parent community
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-lavender-400" /> AI guidance, 24/7
              </span>
            </motion.div>
          </div>

          {/* Right — playful illustration stack */}
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
      className="relative mx-auto aspect-square w-full max-w-md"
    >
      {/* big soft blob */}
      <motion.div
        animate={{ rotate: [0, 6, -4, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-4 rounded-[44%_56%_60%_40%/50%_42%_58%_50%] bg-gradient-to-br from-coral-300 via-sunny-300 to-teal-300 shadow-soft"
      />

      {/* floating card — resource */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 top-8 w-56 rounded-3xl bg-white p-4 shadow-soft"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Therapy
            </div>
            <div className="font-display text-sm font-bold">Runnymede TRC</div>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-teal-100">
          <div className="h-full w-3/4 rounded-full bg-teal-400" />
        </div>
        <div className="mt-1 text-[11px] text-plum-800/60">Warner Robins, GA</div>
      </motion.div>

      {/* floating card — community message */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute right-0 top-36 w-60 rounded-3xl bg-white p-4 shadow-soft"
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-coral-300 to-lavender-300" />
          <div className="text-xs font-semibold text-plum-800">Maya · Atlanta</div>
        </div>
        <p className="mt-2 text-sm leading-snug text-plum-800/80">
          Has anyone done the IEP process in Fulton County? Looking for tips 💛
        </p>
        <div className="mt-3 flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-plum-800/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-plum-800/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-plum-800/30" />
        </div>
      </motion.div>

      {/* floating card — AI chat */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-4 left-8 w-64 rounded-3xl bg-plum-800 p-4 text-cream shadow-soft"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sunny-300 text-plum-800">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-xs font-semibold">AutismConnect AI</div>
        </div>
        <p className="mt-2 text-sm leading-snug">
          Here&apos;s a quick breakdown of how ABA works and what to ask at
          your intake...
        </p>
      </motion.div>

      {/* tiny sparkles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute right-10 top-4"
      >
        <Sparkles className="h-6 w-6 text-sunny-400" />
      </motion.div>
    </motion.div>
  );
}
