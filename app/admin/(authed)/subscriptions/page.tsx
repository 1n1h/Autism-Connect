import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type Sub = {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
};

type Enriched = Sub & { email?: string | null };

export default async function AdminSubscriptionsPage() {
  let subs: Enriched[] = [];
  if (hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as Sub[];
    const ids = Array.from(new Set(rows.map((s) => s.user_id)));
    if (ids.length > 0) {
      const { data: profiles } = await sb
        .from("profiles")
        .select("id, email")
        .in("id", ids);
      const map = new Map((profiles ?? []).map((p) => [p.id, p.email as string]));
      subs = rows.map((s) => ({ ...s, email: map.get(s.user_id) ?? null }));
    } else {
      subs = rows;
    }
  }

  const active = subs.filter((s) => s.status === "active");
  const canceled = subs.filter((s) => s.status !== "active");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-plum-900">Subscriptions</h1>
          <p className="text-sm text-plum-800/60">
            {active.length.toLocaleString()} active · {canceled.length.toLocaleString()} inactive
          </p>
        </div>
        <a
          href="/api/admin/export/subscriptions"
          className="inline-flex items-center gap-2 rounded-full bg-plum-800 px-5 py-2.5 text-sm font-bold text-cream shadow-soft transition hover:bg-plum-700"
        >
          Export CSV →
        </a>
      </div>

      <div className="rounded-3xl border border-plum-800/5 bg-white p-6 shadow-soft">
        {subs.length === 0 ? (
          <p className="text-sm text-plum-800/60">
            No subscriptions yet. Once Stripe is wired and a user subscribes, rows will show here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-plum-800/5 text-left text-[11px] font-bold uppercase tracking-wider text-plum-800/60">
                  <th className="py-3 pr-3">User</th>
                  <th className="py-3 pr-3">Plan</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-3">Period end</th>
                  <th className="py-3 pr-3">Started</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-b border-plum-800/5 last:border-0">
                    <td className="py-3 pr-3 text-plum-800/80">{s.email ?? s.user_id}</td>
                    <td className="py-3 pr-3 font-semibold capitalize">{s.plan_type}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={
                          s.status === "active"
                            ? "rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600"
                            : "rounded-full bg-coral-100 px-2 py-0.5 text-[10px] font-bold text-coral-600"
                        }
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-plum-800/70">
                      {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 pr-3 text-plum-800/60">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
