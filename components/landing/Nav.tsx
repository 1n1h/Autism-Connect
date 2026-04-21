"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Nav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-20"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-plum-800 text-cream transition-transform group-hover:-rotate-6">
            <span className="rainbow-text font-display text-xl font-bold">∞</span>
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Autism<span className="rainbow-text">Connect</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-semibold text-plum-800/80 hover:text-plum-800 transition-colors">
            Features
          </a>
          <a href="#coverage" className="text-sm font-semibold text-plum-800/80 hover:text-plum-800 transition-colors">
            Where we are
          </a>
          <a href="#waitlist" className="text-sm font-semibold text-plum-800/80 hover:text-plum-800 transition-colors">
            Waitlist
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-plum-800/80 hover:text-plum-800 sm:block"
          >
            Sign in
          </Link>
          <Link
            href="#waitlist"
            className="group relative inline-flex items-center gap-2 rounded-full bg-plum-800 px-5 py-2.5 text-sm font-bold text-cream shadow-soft transition hover:bg-plum-700"
          >
            Join waitlist
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
