"use client";

import { useState, useMemo } from "react";
import { Search, Pause, Play } from "lucide-react";

type Row = {
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

export function UsersTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r) =>
      [r.email, r.first_name, r.last_name, r.location].some((v) =>
        (v ?? "").toLowerCase().includes(needle),
      ),
    );
  }, [rows, q]);

  async function toggleSuspend(row: Row) {
    const next = !row.suspended;
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, suspended: next } : r)));
    const res = await fetch(`/api/admin/users/${row.id}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspended: next }),
    });
    if (!res.ok) setRows(prev);
  }

  return (
    <div className="rounded-3xl border border-plum-800/5 bg-white p-4 shadow-soft md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-plum-800/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, city..."
            className="w-full rounded-full border-2 border-plum-800/10 bg-cream py-2 pl-10 pr-4 text-sm outline-none focus:border-coral-400"
          />
        </div>
        <div className="text-xs text-plum-800/60">{filtered.length} / {rows.length}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-plum-800/5 text-left text-[11px] font-bold uppercase tracking-wider text-plum-800/60">
              <th className="py-3 pr-3">Name</th>
              <th className="py-3 pr-3">Email</th>
              <th className="py-3 pr-3">Location</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3 pr-3">Joined</th>
              <th className="py-3 pr-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-plum-800/50">No users match.</td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-plum-800/5 last:border-0">
                  <td className="py-3 pr-3 font-semibold text-plum-900">
                    {[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="py-3 pr-3 text-plum-800/80">{r.email}</td>
                  <td className="py-3 pr-3 text-plum-800/70">
                    {[r.location, r.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="py-3 pr-3">
                    {r.suspended ? (
                      <span className="rounded-full bg-coral-100 px-2 py-0.5 text-[10px] font-bold text-coral-600">
                        Suspended
                      </span>
                    ) : r.onboarded ? (
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-sunny-200 px-2 py-0.5 text-[10px] font-bold text-plum-900">
                        Onboarding
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-plum-800/60">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <button
                      onClick={() => toggleSuspend(r)}
                      className={
                        r.suspended
                          ? "inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-600 hover:bg-teal-100"
                          : "inline-flex items-center gap-1 rounded-full border border-plum-800/10 bg-white px-3 py-1 text-[11px] font-bold text-plum-800/70 hover:border-coral-200 hover:text-coral-600"
                      }
                    >
                      {r.suspended ? <><Play className="h-3 w-3" />Reactivate</> : <><Pause className="h-3 w-3" />Suspend</>}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
