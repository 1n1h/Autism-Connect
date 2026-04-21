import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { BlogPostForm } from "@/components/blog/BlogPostForm";

export const metadata = { title: "Write a post — AutismConnect" };

export default async function BlogCreatePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/blog/create");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, profile_photo_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav
        displayName={profile?.first_name ?? user.email?.split("@")[0] ?? "You"}
        photoUrl={profile?.profile_photo_url ?? null}
      />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-plum-800/70 hover:text-plum-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to community
        </Link>

        <div className="mt-6 mb-8">
          <h1 className="font-display text-4xl font-bold leading-tight text-plum-900">
            Write a <span className="rainbow-text">post</span>
          </h1>
          <p className="mt-2 text-plum-800/70">
            Use the toolbar to add links to articles or embed YouTube videos.
          </p>
        </div>

        <BlogPostForm mode="create" />
      </main>
    </div>
  );
}
