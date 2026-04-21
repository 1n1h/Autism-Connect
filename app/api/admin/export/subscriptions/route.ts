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
  const { data: subs } = await sb
    .from("subscriptions")
    .select("user_id, plan_type, status, current_period_start, current_period_end, canceled_at, created_at");

  const rows = subs ?? [];
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const emailMap = new Map<string, string>();
  if (userIds.length) {
    const { data: profiles } = await sb.from("profiles").select("id, email").in("id", userIds);
    for (const p of profiles ?? []) emailMap.set(p.id, p.email as string);
  }

  const csv = toCsv(
    ["User Email", "Plan", "Status", "Period Start", "Period End", "Canceled At", "Created At"],
    rows.map((s) => [
      emailMap.get(s.user_id) ?? s.user_id,
      s.plan_type,
      s.status,
      s.current_period_start ?? "",
      s.current_period_end ?? "",
      s.canceled_at ?? "",
      s.created_at ?? "",
    ]),
  );

  return new Response(csv, {
    headers: csvResponseHeaders(`autism-connect-subscriptions-${todayStamp()}.csv`),
  });
}
