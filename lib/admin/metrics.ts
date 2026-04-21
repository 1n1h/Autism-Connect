import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type AdminMetrics = {
  totalUsers: number;
  totalWaitlist: number;
  waitlistConverted: number;
  totalPosts: number;
  totalMessages: number;
  totalResources: number;
  activeLast7Days: number;
  totalActiveSubscriptions: number;
  mrrCents: number;
};

export async function getAdminMetrics(): Promise<AdminMetrics> {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return empty();
  }
  const sb = createServiceClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    users,
    waitlistTotal,
    waitlistConverted,
    posts,
    messages,
    resources,
    activeUsers,
    subs,
  ] = await Promise.all([
    sb.from("profiles").select("*", { count: "exact", head: true }),
    sb.from("waitlist").select("*", { count: "exact", head: true }),
    sb.from("waitlist").select("*", { count: "exact", head: true }).eq("converted", true),
    sb.from("blog_posts").select("*", { count: "exact", head: true }),
    sb.from("messages").select("*", { count: "exact", head: true }),
    sb.from("resources").select("*", { count: "exact", head: true }),
    sb
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", sevenDaysAgo),
    sb.from("subscriptions").select("plan_type, status").eq("status", "active"),
  ]);

  // Tier prices in cents (matches lib/stripe/plans.ts)
  const TIER_PRICE: Record<string, number> = { plus: 900, premium: 1900, concierge: 9900 };
  const activeSubs = (subs.data ?? []) as { plan_type: string; status: string }[];
  const mrrCents = activeSubs.reduce((acc, s) => acc + (TIER_PRICE[s.plan_type] ?? 0), 0);

  return {
    totalUsers: users.count ?? 0,
    totalWaitlist: waitlistTotal.count ?? 0,
    waitlistConverted: waitlistConverted.count ?? 0,
    totalPosts: posts.count ?? 0,
    totalMessages: messages.count ?? 0,
    totalResources: resources.count ?? 0,
    activeLast7Days: activeUsers.count ?? 0,
    totalActiveSubscriptions: activeSubs.length,
    mrrCents,
  };
}

function empty(): AdminMetrics {
  return {
    totalUsers: 0,
    totalWaitlist: 0,
    waitlistConverted: 0,
    totalPosts: 0,
    totalMessages: 0,
    totalResources: 0,
    activeLast7Days: 0,
    totalActiveSubscriptions: 0,
    mrrCents: 0,
  };
}
