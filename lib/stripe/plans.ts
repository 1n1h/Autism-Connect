/**
 * Plan catalog. Prices are in cents/USD and sent to Stripe via `price_data`
 * on the fly — no pre-created products needed in the Stripe dashboard.
 * Switch to lookup_keys with pre-created Prices before serious production use.
 */

export type PlanTier = "free" | "plus" | "premium" | "concierge";

export type Plan = {
  tier: PlanTier;
  name: string;
  tagline: string;
  priceCents: number;
  features: string[];
  cta: string;
  accent: string;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    tier: "free",
    name: "Free",
    tagline: "For every parent, always.",
    priceCents: 0,
    features: [
      "Full resource library",
      "Community blog + messaging",
      "AI guidance (50 questions/hour)",
    ],
    cta: "Current plan",
    accent: "from-teal-100 to-cream",
  },
  {
    tier: "plus",
    name: "Plus",
    tagline: "A little more support.",
    priceCents: 900,
    features: [
      "Everything in Free",
      "Saved searches + custom alerts",
      "Resource waitlist tracking",
      "Priority AI responses",
    ],
    cta: "Start Plus",
    accent: "from-coral-100 to-sunny-200",
    featured: true,
  },
  {
    tier: "premium",
    name: "Premium",
    tagline: "For the deep-in-it years.",
    priceCents: 1900,
    features: [
      "Everything in Plus",
      "1-on-1 parent mentor matching",
      "Resource referral letters",
      "Early access to new states",
    ],
    cta: "Start Premium",
    accent: "from-lavender-100 to-coral-100",
  },
  {
    tier: "concierge",
    name: "Concierge",
    tagline: "Hand-held navigation.",
    priceCents: 9900,
    features: [
      "Everything in Premium",
      "Monthly 45-min call with an IEP coach",
      "Provider appointments booked for you",
      "Dedicated concierge email",
    ],
    cta: "Start Concierge",
    accent: "from-plum-800/10 to-lavender-200",
  },
];

export function planByTier(tier: PlanTier): Plan | undefined {
  return PLANS.find((p) => p.tier === tier);
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(0)}`;
}
