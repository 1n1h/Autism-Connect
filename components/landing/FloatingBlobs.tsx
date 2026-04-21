"use client";

import { motion } from "framer-motion";

/**
 * Soft, animated background blobs. Sits behind hero / sections.
 * Positioned absolutely — parent must be `relative overflow-hidden`.
 */
export function FloatingBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <motion.div
        className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-coral-300/60 blur-3xl"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-teal-300/50 blur-3xl"
        animate={{ x: [0, -40, 30, 0], y: [0, 20, -25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lavender-200/70 blur-3xl"
        animate={{ x: [0, 25, -35, 0], y: [0, -15, 25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 h-40 w-40 rounded-full bg-sunny-200/70 blur-2xl"
        animate={{ x: [0, 20, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
