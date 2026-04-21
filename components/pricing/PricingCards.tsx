"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { PLANS, formatPrice, type PlanTier } from "@/lib/stripe/plans";

export function PricingCards({
  currentTier,
  loggedIn,
}: {
  currentTier: string;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(tier: PlanTier) {
    setError(null);
    if (!loggedIn) {
      router.push(`/signup?next=/pricing`);
      return;
    }
    if (tier === "free") return;
    setLoadingTier(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data?.error ?? "Couldn't start checkout.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
      setLoadingTier(null);
    }
  }

  async function openPortal() {
    setError(null);
    setLoadingTier("plus"); // reuse spinner marker
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data?.error ?? "Couldn't open portal.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open portal.");
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan, i) => {
          const isCurrent = currentTier === plan.tier;
          const paid = plan.priceCents > 0;
          return (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={
                "relative overflow-hidden rounded-4xl border p-6 shadow-soft " +
                (plan.featured
                  ? "border-coral-300 bg-white"
                  : "border-plum-800/5 bg-white")
              }
            >
              {plan.featured && (
                <div className="absolute right-4 top-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-coral-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    <Sparkles className="h-3 w-3" />
                    Popular
                  </span>
                </div>
              )}
              <div
                className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${plan.accent}`}
              />
              <h3 className="mt-4 font-display text-2xl font-bold text-plum-900">
                {plan.name}
              </h3>
              <p className="text-sm text-plum-800/60">{plan.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-plum-900">
                  {formatPrice(plan.priceCents)}
                </span>
                {paid && <span className="text-sm font-semibold text-plum-800/60">/mo</span>}
              </div>

              <ul className="mt-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-plum-800/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent && paid ? (
                  <button
                    onClick={openPortal}
                    disabled={loadingTier !== null}
                    className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-plum-800/10 bg-cream px-5 py-3 text-sm font-bold text-plum-900 transition hover:border-plum-800/25 disabled:opacity-60"
                  >
                    {loadingTier !== null && <Loader2 className="h-4 w-4 animate-spin" />}
                    Manage subscription
                  </button>
                ) : isCurrent ? (
                  <div className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-teal-200 bg-teal-50 px-5 py-3 text-sm font-bold text-teal-600">
                    <Check className="h-4 w-4" />
                    Current plan
                  </div>
                ) : (
                  <button
                    onClick={() => subscribe(plan.tier)}
                    disabled={loadingTier !== null || (!paid && !loggedIn)}
                    className={
                      paid
                        ? "flex w-full items-center justify-center gap-2 rounded-full bg-plum-800 px-5 py-3 text-sm font-bold text-cream shadow-soft transition hover:bg-plum-700 disabled:opacity-60"
                        : "flex w-full items-center justify-center gap-2 rounded-full border-2 border-plum-800/10 bg-cream px-5 py-3 text-sm font-bold text-plum-900 transition hover:border-plum-800/25"
                    }
                  >
                    {loadingTier === plan.tier ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-6 text-center text-sm font-semibold text-coral-600">
          {error}
        </p>
      )}
    </div>
  );
}
