import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getStripe, hasStripeEnv } from "@/lib/stripe/client";

export const runtime = "nodejs";

/**
 * Stripe Customer Portal link — lets users manage/cancel their sub.
 * Looks up the Stripe customer via the latest subscription row.
 */
export async function POST() {
  if (!hasStripeEnv() || !hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const sb = createServiceClient();
  const { data: sub } = await sb
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub?.stripe_subscription_id) {
    return NextResponse.json({ error: "No subscription found." }, { status: 404 });
  }

  const stripe = getStripe();
  const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
  const customerId = typeof stripeSub.customer === "string"
    ? stripeSub.customer
    : stripeSub.customer.id;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard`,
  });

  return NextResponse.json({ url: portal.url });
}
