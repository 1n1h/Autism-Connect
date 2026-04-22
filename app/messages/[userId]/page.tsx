import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getThread } from "@/lib/messages/data";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Thread } from "@/components/messages/Thread";

export const metadata = { title: "Conversation — AutismConnect" };

export default async function MessageThreadPage({ params }: { params: { userId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/messages/${params.userId}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, profile_photo_url, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { other, messages } = await getThread(user.id, params.userId);
  if (!other) notFound();

  // Mark incoming messages as read on page load
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", params.userId)
    .eq("recipient_id", user.id)
    .is("read_at", null);

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav
        displayName={profile?.first_name ?? user.email?.split("@")[0] ?? "You"}
        photoUrl={profile?.profile_photo_url ?? null}
        isAdmin={profile?.is_admin ?? false}
      />

      <main className="mx-auto max-w-3xl px-6 py-6">
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-sm font-semibold text-plum-800/70 hover:text-plum-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All conversations
        </Link>
        <div className="mt-4">
          <Thread other={other} initialMessages={messages} currentUserId={user.id} />
        </div>
      </main>
    </div>
  );
}
