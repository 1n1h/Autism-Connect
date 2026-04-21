"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-6 py-12">
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-20 left-[10%] h-80 w-80 rounded-full bg-coral-200/60 blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-[5%] h-96 w-96 rounded-full bg-teal-200/60 blur-3xl"
          animate={{ x: [0, -30, 20, 0], y: [0, 20, -25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/3 top-1/2 h-60 w-60 rounded-full bg-lavender-200/60 blur-3xl"
          animate={{ x: [0, 20, -20, 0], y: [0, -25, 15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-plum-800 text-cream">
            <span className="rainbow-text font-display text-xl font-bold">∞</span>
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Autism<span className="rainbow-text">Connect</span>
          </span>
        </Link>

        <div className="rounded-4xl border border-plum-800/5 bg-white p-8 shadow-soft md:p-10">
          <h1 className="font-display text-3xl font-bold leading-tight text-plum-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-plum-800/70">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-plum-800/70">{footer}</div>
        )}
      </motion.div>
    </main>
  );
}
