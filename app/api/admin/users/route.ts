import { NextResponse } from "next/server";
import { getAdminFromSession } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await getAdminFromSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();

  const sb = createServiceClient();
  let query = sb
    .from("profiles")
    .select("id, email, first_name, last_name, location, state, onboarded, suspended, created_at")
    .order("created_at", { ascending: false });
  if (q) query = query.or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data ?? [] });
}
