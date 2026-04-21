"use client";

import { useEffect, useState } from "react";
import { AIChatPopup } from "./AIChatPopup";

/**
 * Renders the AI chat popup only when the user is signed in.
 * Tracks auth state via Supabase's onAuthStateChange listener so the
 * popup appears/disappears without a reload after login/logout.
 *
 * If Supabase isn't configured the popup never renders.
 */
export function AIChatGate() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        setAuthed(Boolean(user));
        setReady(true);

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          setAuthed(Boolean(session?.user));
        });
        unsub = () => sub.subscription.unsubscribe();
      } catch {
        // Supabase not configured — stay hidden.
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  if (!ready || !authed) return null;
  return <AIChatPopup />;
}
