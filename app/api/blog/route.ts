import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractExcerpt } from "@/lib/blog/format";
import { listPosts } from "@/lib/blog/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const posts = await listPosts({ category, limit });
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : null;
  const featured_image_url =
    typeof body.featured_image_url === "string" && body.featured_image_url.trim()
      ? body.featured_image_url.trim()
      : null;

  if (title.length < 3 || title.length > 500) {
    return NextResponse.json({ error: "Title must be 3–500 characters." }, { status: 400 });
  }
  if (content.length < 10) {
    return NextResponse.json({ error: "Add a bit more to the post." }, { status: 400 });
  }

  const excerpt = extractExcerpt(content, 220);

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      user_id: user.id,
      title,
      content,
      excerpt,
      category,
      featured_image_url,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ post: data });
}
