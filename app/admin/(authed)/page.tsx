import { getAdminMetrics } from "@/lib/admin/metrics";
import {
  Users,
  Mailbox,
  BookOpen,
  MessageSquareText,
  Activity,
  Library,
  CreditCard,
  DollarSign,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const m = await getAdminMetrics();

  const stats = [
    { label: "Total users", value: m.totalUsers, icon: Users, accent: "bg-teal-100 text-teal-600" },
    { label: "Waitlist", value: m.totalWaitlist, icon: Mailbox, accent: "bg-coral-100 text-coral-600" },
    { label: "Blog posts", value: m.totalPosts, icon: BookOpen, accent: "bg-lavender-100 text-lavender-400" },
    { label: "Messages", value: m.totalMessages, icon: MessageSquareText, accent: "bg-sunny-200 text-plum-900" },
    { label: "Active (7d)", value: m.activeLast7Days, icon: Activity, accent: "bg-teal-100 text-teal-600" },
    { label: "Resources", value: m.totalResources, icon: Library, accent: "bg-coral-100 text-coral-600" },
    { label: "Active subs", value: m.totalActiveSubscriptions, icon: CreditCard, accent: "bg-lavender-100 text-lavender-400" },
    {
      label: "MRR",
      value: `$${(m.mrrCents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      accent: "bg-sunny-200 text-plum-900",
    },
  ];

  const conversionRate = m.totalWaitlist
    ? Math.round((m.waitlistConverted / m.totalWaitlist) * 100)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-plum-900">Overview</h1>
        <p className="text-sm text-plum-800/60">Snapshot of your AutismConnect instance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-plum-800/5 bg-white p-5 shadow-soft">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.accent}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-xs font-bold uppercase tracking-wider text-plum-800/60">
              {s.label}
            </div>
            <div className="mt-1 font-display text-3xl font-bold text-plum-900">
              {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-plum-800/5 bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-plum-900">Waitlist → Signup</h2>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="font-display text-4xl font-bold text-plum-900">{conversionRate}%</div>
              <div className="text-xs text-plum-800/60">
                {m.waitlistConverted.toLocaleString()} of {m.totalWaitlist.toLocaleString()} converted
              </div>
            </div>
            <div className="h-16 w-40 rounded-2xl bg-gradient-to-br from-coral-100 to-teal-100" />
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-plum-800/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-coral-400 to-teal-400"
              style={{ width: `${Math.min(conversionRate, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-plum-800/5 bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-plum-900">Next steps</h2>
          <ul className="mt-3 space-y-2 text-sm text-plum-800/80">
            <li>• Verify resources in <a className="font-semibold text-coral-600 hover:text-coral-700" href="/admin/resources">Resources</a> before launch.</li>
            <li>• Export waitlist to <a className="font-semibold text-coral-600 hover:text-coral-700" href="/admin/waitlist">CSV</a> for outreach.</li>
            <li>• Invite teammates via <a className="font-semibold text-coral-600 hover:text-coral-700" href="/admin/admins">Admins → Invite</a>.</li>
            <li>• Set up Stripe products & the webhook before going live.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
