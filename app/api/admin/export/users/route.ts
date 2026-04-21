import { getAdminFromCookie } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { toCsv, csvResponseHeaders, todayStamp } from "@/lib/admin/csv";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return new Response("Unauthorized", { status: 401 });
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response("Server not configured", { status: 500 });
  }

  const sb = createServiceClient();
  const { data: profiles } = await sb
    .from("profiles")
    .select("id, email, first_name, last_name, location, state, onboarded, suspended, created_at")
    .order("created_at", { ascending: false });

  const userIds = (profiles ?? []).map((p) => p.id);
  const tierMap = new Map<string, string>();
  if (userIds.length) {
    const { data: subs } = await sb
      .from("subscriptions")
      .select("user_id, plan_type, status")
      .in("user_id", userIds)
      .eq("status", "active");
    for (const s of subs ?? []) tierMap.set(s.user_id, s.plan_type);
  }

  const rows = (profiles ?? []).map((p) => [
    p.email,
    p.first_name ?? "",
    p.last_name ?? "",
    p.location ?? "",
    p.state ?? "",
    tierMap.get(p.id) ?? "free",
    p.onboarded ? "Yes" : "No",
    p.suspended ? "Yes" : "No",
    p.created_at,
  ]);

  const csv = toCsv(
    ["Email", "First Name", "Last Name", "Location", "State", "Tier", "Onboarded", "Suspended", "Signup Date"],
    rows,
  );

  return new Response(csv, {
    headers: csvResponseHeaders(`autism-connect-users-${todayStamp()}.csv`),
  });
}
