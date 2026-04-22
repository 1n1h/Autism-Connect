import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { PricingCards } from "@/components/pricing/PricingCards";

export const metadata = { title: "Plans — AutismConnect" };

export default async function PricingPage() {
  let authed: { id: string; name: string; photo: string | null; tier: string; isAdmin: boolean } | null = null;
  if (hasSupabaseEnv()) {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [{ data: profile }, { data: sub }] = await Promise.all([
          supabase.from("profiles").select("first_name, profile_photo_url, is_admin").eq("id", user.id).maybeSingle(),
          supabase
            .from("subscriptions")
            .select("plan_type, status")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle(),
        ]);
        authed = {
          id: user.id,
          name: profile?.first_name ?? user.email?.split("@")[0] ?? "You",
          photo: profile?.profile_photo_url ?? null,
          tier: sub?.plan_type ?? "free",
          isAdmin: profile?.is_admin ?? false,
        };
      }
    } catch { /* non-fatal */ }
  }

  return (
    <div className="min-h-screen bg-cream">
      {authed ? (
        <DashboardNav displayName={authed.name} photoUrl={authed.photo} isAdmin={authed.isAdmin} />
      ) : (
        <PublicHeader />
      )}

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sunny-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-plum-900">
            Free forever for the core
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-plum-900 md:text-5xl">
            Plans that grow with <span className="rainbow-text">your family</span>.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-plum-800/70">
            The resource library, community, and AI guidance are free for every
            parent. Paid plans add 1:1 help and early access.
          </p>
        </div>

        <div className="mt-12">
          <PricingCards currentTier={authed?.tier ?? "free"} loggedIn={Boolean(authed)} />
        </div>

        <p className="mt-10 text-center text-xs text-plum-800/50">
          All payments via Stripe. Cancel any time from your dashboard.
        </p>
      </main>
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-plum-800/5 bg-cream/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-plum-800 text-cream">
            <span className="rainbow-text font-display text-xl font-bold">∞</span>
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Autism<span className="rainbow-text">Connect</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-semibold text-plum-800/80 hover:text-plum-800 sm:block">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-plum-800 px-5 py-2.5 text-sm font-bold text-cream shadow-soft hover:bg-plum-700"
          >
            Create account
          </Link>
        </div>
      </nav>
    </header>
  );
}
