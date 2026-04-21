import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listThreads } from "@/lib/messages/data";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const threads = await listThreads(user.id);
  return NextResponse.json({ threads });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const recipient_id = typeof body?.recipient_id === "string" ? body.recipient_id : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!recipient_id) return NextResponse.json({ error: "Missing recipient." }, { status: 400 });
  if (recipient_id === user.id) {
    return NextResponse.json({ error: "You can't message yourself." }, { status: 400 });
  }
  if (content.length < 1 || content.length > 4000) {
    return NextResponse.json({ error: "Message must be 1–4000 characters." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: user.id, recipient_id, content })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: data });
}
