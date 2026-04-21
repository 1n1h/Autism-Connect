import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Resource } from "@/types/resource";

/** Fetch all resources (public — no auth needed). Returns [] if Supabase isn't configured yet. */
export async function getAllResources(): Promise<Resource[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[resources] fetch failed:", error.message);
    return [];
  }
  return (data ?? []) as Resource[];
}

export async function getResourceById(id: string): Promise<Resource | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[resources] fetch by id failed:", error.message);
    return null;
  }
  return (data as Resource) ?? null;
}
