import { WaitlistTable } from "@/components/admin/WaitlistTable";
import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function AdminWaitlistPage() {
  const entries: WaitlistRow[] = hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? await fetchEntries()
    : [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-plum-900">Waitlist</h1>
          <p className="text-sm text-plum-800/60">{entries.length.toLocaleString()} total signups.</p>
        </div>
        <a
          href="/api/admin/export/waitlist"
          className="inline-flex items-center gap-2 rounded-full bg-plum-800 px-5 py-2.5 text-sm font-bold text-cream shadow-soft transition hover:bg-plum-700"
        >
          Export CSV →
        </a>
      </div>
      <WaitlistTable initial={entries} />
    </div>
  );
}

type WaitlistRow = {
  id: string;
  email: string;
  state_interested: string | null;
  created_at: string;
  converted: boolean;
  converted_user_id: string | null;
  email_sent: boolean;
};

async function fetchEntries(): Promise<WaitlistRow[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("waitlist")
    .select("id, email, state_interested, created_at, converted, converted_user_id, email_sent")
    .order("created_at", { ascending: false });
  return (data ?? []) as WaitlistRow[];
}
