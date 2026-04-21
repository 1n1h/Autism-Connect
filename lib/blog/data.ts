import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { BlogPost, BlogComment } from "@/types/blog";

const AUTHOR_COLS = "id, first_name, last_name, location, state, profile_photo_url";

export async function listPosts(opts?: { limit?: number; category?: string; authorId?: string }): Promise<BlogPost[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createClient();
  let q = supabase
    .from("blog_posts")
    .select(`*, author:profiles!blog_posts_user_id_fkey(${AUTHOR_COLS})`)
    .order("created_at", { ascending: false });

  if (opts?.limit) q = q.limit(opts.limit);
  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.authorId) q = q.eq("user_id", opts.authorId);

  const { data, error } = await q;
  if (error) {
    console.error("[blog] list failed:", error.message);
    return [];
  }
  const posts = (data ?? []) as unknown as BlogPost[];

  // Fetch comment counts in one roundtrip
  if (posts.length) {
    const ids = posts.map((p) => p.id);
    const { data: counts } = await supabase
      .from("blog_comments")
      .select("blog_post_id")
      .in("blog_post_id", ids);

    const countMap = new Map<string, number>();
    for (const c of counts ?? []) {
      countMap.set(c.blog_post_id, (countMap.get(c.blog_post_id) ?? 0) + 1);
    }
    for (const p of posts) {
      p.comment_count = countMap.get(p.id) ?? 0;
    }
  }

  return posts;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`*, author:profiles!blog_posts_user_id_fkey(${AUTHOR_COLS})`)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[blog] get failed:", error.message);
    return null;
  }
  return data as unknown as BlogPost | null;
}

export async function listComments(postId: string): Promise<BlogComment[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_comments")
    .select(`*, author:profiles!blog_comments_user_id_fkey(${AUTHOR_COLS})`)
    .eq("blog_post_id", postId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[blog] comments failed:", error.message);
    return [];
  }
  return (data ?? []) as unknown as BlogComment[];
}
