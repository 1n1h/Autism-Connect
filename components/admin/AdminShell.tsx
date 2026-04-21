"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Mailbox,
  Users,
  Shield,
  BookOpen,
  CreditCard,
  LogOut,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/waitlist", label: "Waitlist", icon: Mailbox },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/admins", label: "Admins", icon: Shield },
  { href: "/admin/resources", label: "Resources", icon: BookOpen },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
];

export function AdminShell({
  children,
  adminEmail,
}: {
  children: React.ReactNode;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-plum-800/5 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-plum-800 text-cream">
              <Shield className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Autism<span className="rainbow-text">Connect</span>
              <span className="ml-2 rounded-full bg-plum-800/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-plum-800/70">
                Admin
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-plum-800/60 sm:inline">{adminEmail}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-plum-800/10 bg-white px-3 py-1.5 text-xs font-bold text-plum-800/70 transition hover:border-coral-200 hover:text-coral-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row">
        <aside className="md:w-60 md:shrink-0">
          <nav className="rounded-3xl border border-plum-800/5 bg-white p-2 shadow-soft">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition " +
                    (active
                      ? "bg-plum-800 text-cream shadow-soft"
                      : "text-plum-800/70 hover:bg-cream/60 hover:text-plum-900")
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
