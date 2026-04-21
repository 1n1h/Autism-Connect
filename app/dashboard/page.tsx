import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, MessageCircle, Users, Bot, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export const metadata = { title: "Dashboard — AutismConnect" };

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarded) redirect("/onboarding");

  const displayName = profile?.first_name || user.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav
        displayName={displayName}
        photoUrl={profile?.profile_photo_url ?? null}
      />

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-10 -z-10 h-64 w-64 rounded-full bg-coral-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-40 -z-10 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl"
        />

        <section className="rounded-4xl bg-gradient-to-br from-plum-800 via-plum-700 to-lavender-400 p-10 text-cream shadow-soft md:p-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-sunny-300" />
            Welcome back
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
            Hey {displayName}. <span className="rainbow-text">Glad you&apos;re here.</span>
          </h1>
          <p className="mt-3 max-w-xl text-cream/80">
            Your home base for resources, community, and AI guidance. More
            features land each phase — here&apos;s what&apos;s coming online.
          </p>
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureTile
            href="/resources"
            icon={BookOpen}
            title="Resource library"
            blurb="40+ verified GA providers."
            ready={false}
            accent="bg-coral-100 text-coral-600"
          />
          <FeatureTile
            href="/blog"
            icon={Users}
            title="Community"
            blurb="Blog + parent feed."
            ready={false}
            accent="bg-teal-100 text-teal-600"
          />
          <FeatureTile
            href="/messages"
            icon={MessageCircle}
            title="Messages"
            blurb="Direct messages with other parents."
            ready={false}
            accent="bg-sunny-200 text-plum-900"
          />
          <FeatureTile
            href="#ai"
            icon={Bot}
            title="AI guidance"
            blurb="Ask anything, anytime."
            ready={false}
            accent="bg-lavender-100 text-lavender-400"
          />
        </section>

        <section className="mt-10 rounded-3xl border border-plum-800/5 bg-white p-8 shadow-soft">
          <h2 className="font-display text-2xl font-bold text-plum-900">
            Your profile
          </h2>
          <div className="mt-5 grid gap-6 md:grid-cols-[auto_1fr]">
            <div>
              {profile?.profile_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.profile_photo_url}
                  alt={displayName}
                  className="h-28 w-28 rounded-3xl object-cover shadow-soft"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-coral-300 via-sunny-300 to-teal-300 font-display text-4xl font-bold text-plum-900 shadow-soft">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-display text-xl font-bold text-plum-900">
                {displayName} {profile?.last_name ?? ""}
              </div>
              <div className="text-sm text-plum-800/70">
                {profile?.location ? `${profile.location}, ` : ""}
                {profile?.state ?? ""}
              </div>
              {profile?.bio && (
                <p className="mt-3 text-plum-800/80">{profile.bio}</p>
              )}
              <Link
                href="/profile/edit"
                className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-plum-800/10 bg-cream px-5 py-2 text-sm font-semibold text-plum-900 transition hover:border-plum-800/25"
              >
                Edit profile →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureTile({
  href,
  icon: Icon,
  title,
  blurb,
  ready,
  accent,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  blurb: string;
  ready: boolean;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-plum-800/5 bg-white p-6 shadow-soft transition hover:-translate-y-1"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-plum-900">{title}</h3>
      <p className="mt-1 text-sm text-plum-800/70">{blurb}</p>
      {!ready && (
        <span className="mt-4 inline-flex rounded-full bg-plum-800/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-plum-800/60">
          Coming soon
        </span>
      )}
    </Link>
  );
}
