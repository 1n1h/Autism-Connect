import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { UsersTable } from "@/components/admin/UsersTable";

type UserRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  state: string | null;
  onboarded: boolean;
  suspended: boolean;
  created_at: string;
};

export default async function AdminUsersPage() {
  const users = hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? await fetchUsers()
    : [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-plum-900">Users</h1>
          <p className="text-sm text-plum-800/60">{users.length.toLocaleString()} total accounts.</p>
        </div>
        <a
          href="/api/admin/export/users"
          className="inline-flex items-center gap-2 rounded-full bg-plum-800 px-5 py-2.5 text-sm font-bold text-cream shadow-soft transition hover:bg-plum-700"
        >
          Export CSV →
        </a>
      </div>
      <UsersTable initial={users} />
    </div>
  );
}

async function fetchUsers(): Promise<UserRow[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("profiles")
    .select("id, email, first_name, last_name, location, state, onboarded, suspended, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as UserRow[];
}
