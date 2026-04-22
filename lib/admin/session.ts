import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  id: string;      // auth.users.id
  email: string;
  firstName: string | null;
};

/**
 * Returns the current Supabase-authed user ONLY if their profile
 * has is_admin = true. Unified admin check — use this everywhere
 * instead of the old getAdminFromCookie / JWT-cookie helpers.
 */
export async function getAdminFromSession(): Promise<AdminSession | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, first_name, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) return null;
  return {
    id: user.id,
    email: profile.email ?? user.email ?? "",
    firstName: profile.first_name ?? null,
  };
}

/** Hex-encoded random token for admin invites. */
export function randomToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}
