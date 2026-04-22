import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listThreads } from "@/lib/messages/data";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { ThreadList } from "@/components/messages/ThreadList";
import { UserSearch } from "@/components/messages/UserSearch";

export const metadata = { title: "Messages — AutismConnect" };

export default async function MessagesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/messages");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, profile_photo_url, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const threads = await listThreads(user.id);

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav
        displayName={profile?.first_name ?? user.email?.split("@")[0] ?? "You"}
        photoUrl={profile?.profile_photo_url ?? null}
        isAdmin={profile?.is_admin ?? false}
      />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-lavender-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-lavender-400">
            <MessageCircle className="h-3.5 w-3.5" />
            Messages
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-plum-900">
            Your <span className="rainbow-text">conversations</span>
          </h1>
        </div>

        <div className="mb-6">
          <UserSearch />
        </div>

        <ThreadList threads={threads} />
      </main>
    </div>
  );
}
