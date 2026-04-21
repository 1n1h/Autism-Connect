import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, hasStripeEnv } from "@/lib/stripe/client";
import { planByTier, type PlanTier } from "@/lib/stripe/plans";

export const runtime = "nodejs";

/**
 * Creates a Stripe Checkout Session for a subscription.
 * Body: { tier: 'plus' | 'premium' | 'concierge' }
 */
export async function POST(request: Request) {
  if (!hasStripeEnv()) {
    return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 500 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const tier = body?.tier as PlanTier | undefined;
  if (!tier || tier === "free") {
    return NextResponse.json({ error: "Pick a paid plan." }, { status: 400 });
  }
  const plan = planByTier(tier);
  if (!plan || plan.priceCents <= 0) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          recurring: { interval: "month" },
          unit_amount: plan.priceCents,
          product_data: {
            name: `AutismConnect ${plan.name}`,
            description: plan.tagline,
          },
        },
      },
    ],
    success_url: `${appUrl}/dashboard?subscription=success&tier=${tier}`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
    metadata: {
      user_id: user.id,
      tier,
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        tier,
      },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
