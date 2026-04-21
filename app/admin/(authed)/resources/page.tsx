import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getAllResources } from "@/lib/resources/data";

export default async function AdminResourcesPage() {
  const resources = await getAllResources();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-plum-900">Resources</h1>
        <p className="text-sm text-plum-800/60">{resources.length} published.</p>
      </div>

      <div className="rounded-3xl border border-plum-800/5 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-coral-100">
            <BookOpen className="h-5 w-5 text-coral-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-plum-900">Verification workflow</h2>
            <p className="text-xs text-plum-800/60">
              For now, add or edit resources directly via Supabase SQL (db/seed_resources.sql).
              A full admin editor ships next.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-plum-800/5 text-left text-[11px] font-bold uppercase tracking-wider text-plum-800/60">
                <th className="py-3 pr-3">Name</th>
                <th className="py-3 pr-3">Type</th>
                <th className="py-3 pr-3">City</th>
                <th className="py-3 pr-3">Insurance</th>
                <th className="py-3 pr-3 text-right">Link</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id} className="border-b border-plum-800/5 last:border-0">
                  <td className="py-3 pr-3 font-semibold text-plum-900">{r.name}</td>
                  <td className="py-3 pr-3 text-plum-800/70">{r.resource_type ?? "—"}</td>
                  <td className="py-3 pr-3 text-plum-800/70">{r.city ?? "—"}</td>
                  <td className="py-3 pr-3 text-plum-800/70">
                    {r.accepts_insurance === null ? "—" : r.accepts_insurance ? "Yes" : "No"}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <Link
                      href={`/resources/${r.id}`}
                      className="text-xs font-bold text-coral-600 hover:text-coral-700"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
