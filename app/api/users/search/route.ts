import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/users/search?q=...
 * Auth required. Returns up to 20 profiles matching the query against
 * first_name, last_name, or location (ILIKE).
 */
export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ users: [] });

  const escaped = q.replace(/[%_]/g, "\\$&");
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, location, state, profile_photo_url")
    .neq("id", user.id)
    .eq("onboarded", true)
    .or(
      `first_name.ilike.%${escaped}%,last_name.ilike.%${escaped}%,location.ilike.%${escaped}%`,
    )
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data ?? [] });
}
