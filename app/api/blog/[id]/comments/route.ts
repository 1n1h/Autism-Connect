import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listComments } from "@/lib/blog/data";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const comments = await listComments(params.id);
  return NextResponse.json({ comments });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (content.length < 1 || content.length > 4000) {
    return NextResponse.json({ error: "Comment must be 1–4000 characters." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("blog_comments")
    .insert({ blog_post_id: params.id, user_id: user.id, content })
    .select(`*, author:profiles!blog_comments_user_id_fkey(id, first_name, last_name, location, state, profile_photo_url)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ comment: data });
}
