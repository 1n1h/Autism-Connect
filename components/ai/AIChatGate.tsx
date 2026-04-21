"use client";

import { usePathname } from "next/navigation";
import { AIChatPopup } from "./AIChatPopup";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/**
 * Always renders the AI chat popup (per spec: bottom-right, always visible),
 * except on admin pages and the auth pages where it'd clutter the UX.
 * The API route itself returns a clear "please sign in" error if the user
 * isn't authenticated, which the popup surfaces inline.
 */
export function AIChatGate() {
  const pathname = usePathname() ?? "";

  // Hide on pages where the chat would be noise or out of context.
  const hide =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  if (hide) return null;
  if (!hasSupabaseEnv()) return null;

  return <AIChatPopup />;
}
