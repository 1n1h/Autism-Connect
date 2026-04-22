import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPostById } from "@/lib/blog/data";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { BlogPostForm } from "@/components/blog/BlogPostForm";

export const metadata = { title: "Edit post — AutismConnect" };

export default async function BlogEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/blog/${params.id}/edit`);

  const post = await getPostById(params.id);
  if (!post) notFound();
  if (post.user_id !== user.id) redirect(`/blog/${params.id}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, profile_photo_url, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav
        displayName={profile?.first_name ?? user.email?.split("@")[0] ?? "You"}
        photoUrl={profile?.profile_photo_url ?? null}
        isAdmin={profile?.is_admin ?? false}
      />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/blog/${post.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-plum-800/70 hover:text-plum-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to post
        </Link>

        <div className="mt-6 mb-8">
          <h1 className="font-display text-4xl font-bold leading-tight text-plum-900">
            Edit <span className="rainbow-text">your post</span>
          </h1>
        </div>

        <BlogPostForm mode="edit" initial={post} />
      </main>
    </div>
  );
}
