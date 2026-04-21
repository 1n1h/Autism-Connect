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
  const { data } = await sb
    .from("waitlist")
    .select("email, state_interested, created_at, converted, converted_user_id, email_sent")
    .order("created_at", { ascending: false });

  const rows = (data ?? []).map((e) => [
    e.email,
    e.state_interested,
    e.created_at,
    e.converted ? "Yes" : "No",
    e.converted_user_id ?? "",
    e.email_sent ? "Yes" : "No",
  ]);

  const csv = toCsv(
    ["Email", "State", "Signup Date", "Converted", "User ID", "Email Sent"],
    rows,
  );

  return new Response(csv, {
    headers: csvResponseHeaders(`autism-connect-waitlist-${todayStamp()}.csv`),
  });
}
