import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Clock, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getPostById, listComments } from "@/lib/blog/data";
import { FormattedPost } from "@/components/blog/FormattedPost";
import { CommentSection } from "@/components/blog/CommentSection";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { categoryLabel, categoryAccent } from "@/types/blog";

type PageProps = { params: { id: string } };

export async function generateMetadata({ params }: PageProps) {
  const post = await getPostById(params.id);
  if (!post) return { title: "Post not found — AutismConnect" };
  return {
    title: `${post.title} — AutismConnect`,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPostById(params.id);
  if (!post) notFound();
  const comments = await listComments(params.id);

  let authed: { id: string; name: string; photo: string | null; isAdmin: boolean } | null = null;
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
          id: user.id,
          name: profile?.first_name ?? user.email?.split("@")[0] ?? "You",
          photo: profile?.profile_photo_url ?? null,
          isAdmin: profile?.is_admin ?? false,
        };
      }
    } catch { /* non-fatal */ }
  }

  const author = post.author;
  const authorName = [author?.first_name, author?.last_name].filter(Boolean).join(" ") || "Parent";
  const canEdit = authed?.id === post.user_id;

  return (
    <div className="min-h-screen bg-cream">
      {authed ? (
        <DashboardNav displayName={authed.name} photoUrl={authed.photo} isAdmin={authed.isAdmin} />
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

      <article className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-plum-800/70 hover:text-plum-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to community
        </Link>

        {post.featured_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featured_image_url}
            alt=""
            className="mt-6 aspect-[16/9] w-full rounded-4xl object-cover shadow-soft"
          />
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {post.category && (
            <span className={`inline-flex rounded-full ${categoryAccent(post.category)} px-3 py-1 text-[10px] font-bold uppercase tracking-wider`}>
              {categoryLabel(post.category)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs text-plum-800/60">
            <Clock className="h-3.5 w-3.5" />
            {new Date(post.created_at).toLocaleDateString(undefined, {
              year: "numeric", month: "long", day: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-plum-800/60">
            <Eye className="h-3.5 w-3.5" />
            {post.views ?? 0}
          </span>
          {canEdit && (
            <Link
              href={`/blog/${post.id}/edit`}
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-plum-800/10 bg-white px-3 py-1 text-xs font-bold text-plum-800/70 transition hover:border-plum-800/30 hover:text-plum-900"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Link>
          )}
        </div>

        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-plum-900 md:text-5xl">
          {post.title}
        </h1>

        {/* Author card */}
        <div className="mt-6 flex items-center gap-3 rounded-3xl border border-plum-800/5 bg-white px-4 py-3 shadow-soft">
          {author?.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.profile_photo_url}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-coral-300 to-teal-300 text-lg font-bold text-plum-900">
              {authorName.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <div className="font-display font-bold text-plum-900">{authorName}</div>
            {(author?.location || author?.state) && (
              <div className="text-xs text-plum-800/60">
                {[author?.location, author?.state].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <FormattedPost content={post.content} />
        </div>

        <CommentSection
          postId={post.id}
          initialComments={comments}
          currentUserId={authed?.id ?? null}
        />
      </article>
    </div>
  );
}
