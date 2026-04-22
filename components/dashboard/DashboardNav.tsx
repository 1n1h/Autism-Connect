"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";

export function DashboardNav({
  displayName,
  photoUrl,
  isAdmin = false,
}: {
  displayName: string;
  photoUrl: string | null;
  isAdmin?: boolean;
}) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-plum-800/5 bg-cream/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-plum-800 text-cream">
            <span className="rainbow-text font-display text-xl font-bold">∞</span>
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Autism<span className="rainbow-text">Connect</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="/dashboard">Home</NavLink>
          <NavLink href="/resources">Resources</NavLink>
          <NavLink href="/blog">Community</NavLink>
          <NavLink href="/messages">Messages</NavLink>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              title="Admin dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-plum-800 px-3 py-1.5 text-xs font-bold text-cream shadow-soft transition hover:bg-plum-700"
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          <Link
            href="/profile/edit"
            className="flex items-center gap-2 rounded-full border border-plum-800/10 bg-white px-2 py-1.5 pr-3 text-sm font-semibold text-plum-900 transition hover:border-plum-800/25"
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={displayName} className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-coral-300 to-teal-300 text-xs font-bold text-plum-900">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="hidden sm:inline">{displayName}</span>
          </Link>
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="rounded-full p-2 text-plum-800/60 transition hover:bg-white hover:text-plum-900"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-semibold text-plum-800/70 transition hover:text-plum-900"
    >
      {children}
    </Link>
  );
}
