import Link from "next/link";
import { PenSquare, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { listPosts } from "@/lib/blog/data";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { BlogFeed } from "@/components/blog/BlogFeed";

export const metadata = { title: "Community — AutismConnect" };

export default async function BlogIndexPage() {
  const posts = await listPosts({ limit: 100 });

  let authed: { name: string; photo: string | null } | null = null;
  if (hasSupabaseEnv()) {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, profile_photo_url")
          .eq("id", user.id)
          .maybeSingle();
        authed = {
          name: profile?.first_name ?? user.email?.split("@")[0] ?? "You",
          photo: profile?.profile_photo_url ?? null,
        };
      }
    } catch { /* non-fatal */ }
  }

  return (
    <div className="min-h-screen bg-cream">
      {authed ? (
        <DashboardNav displayName={authed.name} photoUrl={authed.photo} />
      ) : (
        <PublicHeader />
      )}

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 -z-10 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-40 -z-10 h-72 w-72 rounded-full bg-coral-200/40 blur-3xl"
        />

        <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600">
              <Sparkles className="h-3.5 w-3.5" />
              Parent community
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-plum-900 md:text-5xl">
              Real stories, <span className="rainbow-text">real parents.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-plum-800/70">
              Wins, tough days, tips, and things you wish someone had told you.
            </p>
          </div>

          {authed && (
            <Link
              href="/blog/create"
              className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-coral-600"
            >
              <PenSquare className="h-4 w-4" />
              Write a post
            </Link>
          )}
        </section>

        <BlogFeed posts={posts} />
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
            className="rounded-full bg-plum-800 px-5 py-2.5 text-sm font-bold text-cream shadow-soft transition hover:bg-plum-700"
          >
            Create account
          </Link>
        </div>
      </nav>
    </header>
  );
}
