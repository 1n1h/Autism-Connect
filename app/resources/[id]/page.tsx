import { notFound } from "next/navigation";
import Link from "next/link";
import { getResourceById } from "@/lib/resources/data";
import { ResourceDetail } from "@/components/resources/ResourceDetail";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

type PageProps = { params: { id: string } };

export async function generateMetadata({ params }: PageProps) {
  const resource = await getResourceById(params.id);
  if (!resource) return { title: "Resource not found — AutismConnect" };
  return {
    title: `${resource.name} — AutismConnect`,
    description: resource.description ?? undefined,
  };
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const resource = await getResourceById(params.id);
  if (!resource) notFound();

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
            <Link
              href="/signup"
              className="rounded-full bg-plum-800 px-5 py-2.5 text-sm font-bold text-cream shadow-soft hover:bg-plum-700"
            >
              Create account
            </Link>
          </nav>
        </header>
      )}

      <ResourceDetail resource={resource} />
    </div>
  );
}
