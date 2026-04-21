import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "./env";

/**
 * Server Supabase client for Server Components / Route Handlers / Server Actions.
 * Uses Next.js cookie store so auth state flows through SSR.
 */
export function createClient() {
  const cookieStore = cookies();
  const { url, anonKey } = requireSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // `set` is called from Server Components — safe to ignore.
          // Middleware handles the real cookie rotation.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // same as above
        }
      },
    },
  });
}

/**
 * Service-role client for server-only admin operations (bypasses RLS).
 * Never import this into client components.
 */
export function createServiceClient() {
  const { url } = requireSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }
  // Lazy-require to avoid bundling into client builds.
  const { createClient: createSbClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
  return createSbClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
