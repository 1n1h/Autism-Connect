import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { getAllResources } from "@/lib/resources/data";
import { ResourcesView } from "@/components/resources/ResourcesView";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export const metadata = {
  title: "Resources — AutismConnect",
  description: "40+ verified autism resources in Georgia. Therapists, schools, doctors, nonprofits.",
};

export default async function ResourcesPage() {
  const resources = await getAllResources();

  // Optional nav — show the dashboard nav if logged in, otherwise a simple header.
  let authed: { name: string; photo: string | null; isAdmin: boolean } | null = null;
  if (hasSupabaseEnv()) {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, profile_photo_url, is_admin")
          .eq("id", user.id)
          .maybeSingle();
        authed = {
          name: profile?.first_name ?? user.email?.split("@")[0] ?? "You",
          photo: profile?.profile_photo_url ?? null,
          isAdmin: profile?.is_admin ?? false,
        };
      }
    } catch {
      /* non-fatal */
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {authed ? (
        <DashboardNav displayName={authed.name} photoUrl={authed.photo} isAdmin={authed.isAdmin} />
      ) : (
        <PublicHeader />
      )}

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 -z-10 h-64 w-64 rounded-full bg-coral-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-40 -z-10 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl"
        />

        <section className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-coral-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-coral-600">
            <MapPin className="h-3.5 w-3.5" />
            Georgia — more states soon
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-plum-900 md:text-5xl">
            Real providers. <span className="rainbow-text">Real parents vetted.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-plum-800/70">
            Therapists, schools, doctors, and nonprofits serving autistic
            kids across Georgia. Search, filter, and reach out directly.
          </p>
        </section>

        {resources.length === 0 ? (
          <EmptyState />
        ) : (
          <ResourcesView resources={resources} />
        )}
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
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-plum-800/80 hover:text-plum-800 sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-plum-800 px-5 py-2.5 text-sm font-bold text-cream shadow-soft transition hover:bg-plum-700"
          >
            Create account
          </Link>
        </div>
      </nav>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="rounded-4xl border-2 border-dashed border-plum-800/10 bg-white/50 p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sunny-200">
        <Sparkles className="h-8 w-8 text-plum-900" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-bold text-plum-900">
        No resources loaded yet
      </h3>
      <p className="mt-2 max-w-md mx-auto text-sm text-plum-800/70">
        Run <code className="rounded bg-plum-800/5 px-1.5 py-0.5 text-xs">db/seed_resources.sql</code> in
        your Supabase SQL editor to populate the library. You&apos;ll get 12 verified GA
        providers to start.
      </p>
    </div>
  );
}
