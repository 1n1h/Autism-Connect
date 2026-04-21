"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const upcomingStates = [
  "Florida",
  "Alabama",
  "Tennessee",
  "South Carolina",
  "North Carolina",
  "Texas",
];

export function GeographicMessaging() {
  return (
    <section id="coverage" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-4xl bg-plum-800 p-10 text-cream md:p-16">
          {/* decorative blobs */}
          <motion.div
            aria-hidden
            animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-coral-400/30 blur-3xl"
          />
          <motion.div
            aria-hidden
            animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-teal-400/30 blur-3xl"
          />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-sunny-300" />
                Where we are
              </div>
              <h2 className="mt-5 font-display text-4xl font-bold leading-tight md:text-5xl">
                Starting in{" "}
                <span className="rainbow-text">Georgia</span>.
                <br />
                Coming to a state near you.
              </h2>
              <p className="mt-5 max-w-lg text-lg text-cream/80">
                We&apos;re building this state by state so the resources are
                actually accurate — not a national dump of dead links. Tell us
                where to land next.
              </p>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatePill active>Georgia</StatePill>
                {upcomingStates.map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <StatePill>{s}</StatePill>
                  </motion.div>
                ))}
              </div>
              <p className="mt-5 text-sm text-cream/60">
                Not on the list? Drop your email below — we&apos;ll track
                demand and head there next.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatePill({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={
        active
          ? "flex items-center justify-center gap-2 rounded-2xl bg-sunny-300 px-4 py-3 text-sm font-bold text-plum-900 shadow-soft"
          : "flex items-center justify-center gap-2 rounded-2xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm font-semibold text-cream/80 backdrop-blur"
      }
    >
      {active && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-plum-800 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-plum-800" />
        </span>
      )}
      {children}
      {!active && (
        <span className="text-[10px] uppercase tracking-wider text-cream/50">
          soon
        </span>
      )}
    </div>
  );
}
