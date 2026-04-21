import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/**
 * GET /api/resources
 *   ?type=therapy|school|doctor|nonprofit
 *   ?city=Atlanta
 *   ?specialization=aba
 *   ?insurance=true
 *   ?q=search term
 *
 * Public — RLS allows select for all.
 */
export async function GET(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ resources: [], error: "Supabase not configured." });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const city = url.searchParams.get("city");
  const specialization = url.searchParams.get("specialization");
  const insurance = url.searchParams.get("insurance");
  const q = url.searchParams.get("q")?.trim();

  const supabase = createClient();
  let query = supabase.from("resources").select("*").order("name");

  if (type) query = query.eq("resource_type", type);
  if (city) query = query.eq("city", city);
  if (specialization) query = query.contains("specializations", [specialization]);
  if (insurance === "true") query = query.eq("accepts_insurance", true);
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ resources: data ?? [] });
}
