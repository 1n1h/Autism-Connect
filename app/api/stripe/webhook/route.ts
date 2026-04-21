import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, hasStripeEnv } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";

/**
 * Stripe webhook receiver. Events we care about:
 *   checkout.session.completed        — finalize sub after checkout
 *   customer.subscription.updated     — renewal, plan change, cancel-at-period-end
 *   customer.subscription.deleted     — fully canceled
 *   invoice.paid                      — renewal extended period
 *
 * STRIPE_WEBHOOK_SECRET must be set. Get it from `stripe listen` in dev or
 * from Stripe dashboard → Webhooks endpoint → signing secret in prod.
 */
export async function POST(request: Request) {
  if (!hasStripeEnv() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook not configured." },
      { status: 501 },
    );
  }
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature." }, { status: 400 });

  const stripe = getStripe();
  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe webhook] signature check failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const sb = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const tier = session.metadata?.tier ?? "plus";
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
        if (!userId || !subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const item = sub.items.data[0];
        await upsertSubscription(sb, {
          user_id: userId,
          stripe_subscription_id: sub.id,
          plan_type: tier,
          status: sub.status,
          current_period_start: toIso(item?.current_period_start),
          current_period_end: toIso(item?.current_period_end),
          canceled_at: sub.canceled_at ? toIso(sub.canceled_at) : null,
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        const tier = sub.metadata?.tier ?? "plus";
        if (!userId) break;
        const item = sub.items.data[0];
        await upsertSubscription(sb, {
          user_id: userId,
          stripe_subscription_id: sub.id,
          plan_type: tier,
          status: sub.status,
          current_period_start: toIso(item?.current_period_start),
          current_period_end: toIso(item?.current_period_end),
          canceled_at: sub.canceled_at ? toIso(sub.canceled_at) : null,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await sb
          .from("subscriptions")
          .update({ status: "canceled", canceled_at: new Date().toISOString() })
          .eq("stripe_subscription_id", sub.id);
        break;
      }
      default:
        // ignore everything else
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler failed:", err);
    // Still return 200 so Stripe doesn't retry on our bug — we log and move on.
  }

  return NextResponse.json({ received: true });
}

type SubUpsert = {
  user_id: string;
  stripe_subscription_id: string;
  plan_type: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
};

async function upsertSubscription(sb: ReturnType<typeof createServiceClient>, row: SubUpsert) {
  // Manual upsert because stripe_subscription_id isn't a unique column in schema.
  const { data: existing } = await sb
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", row.stripe_subscription_id)
    .maybeSingle();

  if (existing) {
    await sb.from("subscriptions").update(row).eq("id", existing.id);
  } else {
    await sb.from("subscriptions").insert(row);
  }
}

function toIso(unix: number | null | undefined): string | null {
  if (!unix) return null;
  return new Date(unix * 1000).toISOString();
}
