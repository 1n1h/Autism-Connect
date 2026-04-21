import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getThread } from "@/lib/messages/data";

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const thread = await getThread(user.id, params.userId);
  if (!thread.other) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Mark all messages from the other user to me as read.
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", params.userId)
    .eq("recipient_id", user.id)
    .is("read_at", null);

  return NextResponse.json(thread);
}
