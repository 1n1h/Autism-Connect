"use client";

import { useState, useMemo } from "react";
import { Trash2, CheckCircle2, Search } from "lucide-react";

type Row = {
  id: string;
  email: string;
  state_interested: string | null;
  created_at: string;
  converted: boolean;
  converted_user_id: string | null;
  email_sent: boolean;
};

export function WaitlistTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [q, setQ] = useState("");
  const [state, setState] = useState<string>("all");
  const [filter, setFilter] = useState<"all" | "converted" | "unconverted">("all");

  const states = useMemo(() => {
    const set = new Set<string>();
    for (const r of initial) if (r.state_interested) set.add(r.state_interested);
    return ["all", ...Array.from(set).sort()];
  }, [initial]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (q && !r.email.toLowerCase().includes(q.toLowerCase())) return false;
      if (state !== "all" && r.state_interested !== state) return false;
      if (filter === "converted" && !r.converted) return false;
      if (filter === "unconverted" && r.converted) return false;
      return true;
    });
  }, [rows, q, state, filter]);

  async function remove(id: string) {
    if (!window.confirm("Delete this waitlist entry?")) return;
    const prev = rows;
    setRows((rs) => rs.filter((r) => r.id !== id));
    const res = await fetch(`/api/admin/waitlist/${id}`, { method: "DELETE" });
    if (!res.ok) setRows(prev);
  }

  async function toggleConverted(row: Row) {
    const next = !row.converted;
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, converted: next } : r)));
    const res = await fetch(`/api/admin/waitlist/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ converted: next }),
    });
    if (!res.ok) setRows(prev);
  }

  return (
    <div className="rounded-3xl border border-plum-800/5 bg-white p-4 shadow-soft md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-plum-800/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search emails..."
            className="w-full rounded-full border-2 border-plum-800/10 bg-cream py-2 pl-10 pr-4 text-sm outline-none focus:border-coral-400"
          />
        </div>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="rounded-full border-2 border-plum-800/10 bg-cream px-4 py-2 text-sm font-semibold outline-none focus:border-coral-400"
        >
          {states.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All states" : s}</option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          {(["all", "converted", "unconverted"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={
                filter === k
                  ? "rounded-full bg-plum-800 px-3 py-1.5 text-xs font-bold text-cream"
                  : "rounded-full border border-plum-800/10 bg-white px-3 py-1.5 text-xs font-bold text-plum-800/70 hover:border-plum-800/30"
              }
            >
              {k === "all" ? "All" : k === "converted" ? "Converted" : "Not yet"}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-plum-800/60">
          {filtered.length} / {rows.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-plum-800/5 text-left text-[11px] font-bold uppercase tracking-wider text-plum-800/60">
              <th className="py-3 pr-3">Email</th>
              <th className="py-3 pr-3">State</th>
              <th className="py-3 pr-3">Signed up</th>
              <th className="py-3 pr-3">Email</th>
              <th className="py-3 pr-3">Converted</th>
              <th className="py-3 pr-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-plum-800/50">
                  No waitlist entries match.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-plum-800/5 last:border-0">
                  <td className="py-3 pr-3 font-semibold text-plum-900">{r.email}</td>
                  <td className="py-3 pr-3 text-plum-800/70">{r.state_interested ?? "—"}</td>
                  <td className="py-3 pr-3 text-plum-800/60">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-3">
                    {r.email_sent ? (
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600">
                        Sent
                      </span>
                    ) : (
                      <span className="rounded-full bg-plum-800/5 px-2 py-0.5 text-[10px] font-bold text-plum-800/60">
                        —
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <button
                      onClick={() => toggleConverted(r)}
                      className={
                        r.converted
                          ? "inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-600 hover:bg-teal-100"
                          : "inline-flex items-center gap-1 rounded-full border border-plum-800/10 bg-white px-2.5 py-0.5 text-[11px] font-bold text-plum-800/60 hover:border-teal-400 hover:text-teal-600"
                      }
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {r.converted ? "Converted" : "Mark converted"}
                    </button>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      aria-label="Delete"
                      className="rounded-full p-1.5 text-plum-800/40 transition hover:bg-coral-50 hover:text-coral-600"
                    >
                      <Trash2 className="h-4 w-4" />
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
