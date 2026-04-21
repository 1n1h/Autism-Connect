import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractExcerpt } from "@/lib/blog/format";
import { getPostById } from "@/lib/blog/data";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fire-and-forget view increment (doesn't await)
  try {
    const supabase = createClient();
    void supabase
      .from("blog_posts")
      .update({ views: (post.views ?? 0) + 1 })
      .eq("id", params.id);
  } catch { /* non-fatal */ }

  return NextResponse.json({ post });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.content === "string") {
    update.content = body.content.trim();
    update.excerpt = extractExcerpt(body.content, 220);
  }
  if ("category" in body) update.category = body.category ?? null;
  if ("featured_image_url" in body) update.featured_image_url = body.featured_image_url ?? null;

  const { data, error } = await supabase
    .from("blog_posts")
    .update(update)
    .eq("id", params.id)
    .eq("user_id", user.id) // defense in depth — RLS already enforces
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ post: data });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
