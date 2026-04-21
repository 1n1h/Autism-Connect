import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Message, MessageAuthor, Thread } from "@/types/messaging";

const AUTHOR_COLS = "id, first_name, last_name, location, state, profile_photo_url";

/**
 * List all threads for a user. A "thread" = all messages exchanged with
 * a given counterparty. We fetch all messages involving me, group them
 * in JS (fine for MVP scale), and return the latest + unread count per thread.
 */
export async function listThreads(userId: string): Promise<Thread[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createClient();

  const { data: msgs, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error || !msgs) return [];

  const byOther = new Map<string, { last: Message; unread: number }>();
  for (const m of msgs as Message[]) {
    const other = m.sender_id === userId ? m.recipient_id : m.sender_id;
    const entry = byOther.get(other);
    if (!entry) {
      byOther.set(other, {
        last: m,
        unread: m.recipient_id === userId && !m.read_at ? 1 : 0,
      });
    } else {
      if (m.recipient_id === userId && !m.read_at) entry.unread += 1;
    }
  }

  const otherIds = Array.from(byOther.keys());
  if (otherIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select(AUTHOR_COLS)
    .in("id", otherIds);

  const profileMap = new Map<string, MessageAuthor>();
  for (const p of (profiles ?? []) as MessageAuthor[]) profileMap.set(p.id, p);

  return otherIds
    .map((id) => {
      const entry = byOther.get(id)!;
      const profile = profileMap.get(id);
      if (!profile) return null;
      return {
        otherUser: profile,
        lastMessage: entry.last,
        unreadCount: entry.unread,
      } as Thread;
    })
    .filter((t): t is Thread => t !== null)
    .sort(
      (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime(),
    );
}

export async function getThread(meId: string, otherId: string): Promise<{
  other: MessageAuthor | null;
  messages: Message[];
}> {
  if (!hasSupabaseEnv()) return { other: null, messages: [] };
  const supabase = createClient();

  const [{ data: other }, { data: messages }] = await Promise.all([
    supabase.from("profiles").select(AUTHOR_COLS).eq("id", otherId).maybeSingle(),
    supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${meId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${meId})`,
      )
      .order("created_at", { ascending: true }),
  ]);

  return {
    other: (other as MessageAuthor) ?? null,
    messages: (messages ?? []) as Message[],
  };
}

export async function totalUnread(userId: string): Promise<number> {
  if (!hasSupabaseEnv()) return 0;
  const supabase = createClient();
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);
  return count ?? 0;
}
