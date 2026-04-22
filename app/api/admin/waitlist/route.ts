import { NextResponse } from "next/server";
import { getAdminFromSession } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await getAdminFromSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ entries: [] });
  }

  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const convertedFilter = url.searchParams.get("converted");
  const q = url.searchParams.get("q")?.trim();

  const sb = createServiceClient();
  let query = sb.from("waitlist").select("*").order("created_at", { ascending: false });
  if (state) query = query.eq("state_interested", state);
  if (convertedFilter === "true") query = query.eq("converted", true);
  if (convertedFilter === "false") query = query.eq("converted", false);
  if (q) query = query.ilike("email", `%${q.replace(/[%_]/g, "\\$&")}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data ?? [] });
}
