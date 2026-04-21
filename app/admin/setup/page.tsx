import Link from "next/link";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getAdminFromCookie } from "@/lib/admin/auth";
import { AdminSetupForm } from "@/components/admin/AdminSetupForm";

export const metadata = { title: "First admin setup — AutismConnect" };

export default async function AdminSetupPage() {
  const admin = await getAdminFromCookie();
  if (admin) redirect("/admin");

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-plum-900 px-6 py-12 text-cream">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl font-bold">Setup unavailable</h1>
          <p className="mt-3 text-cream/80">
            Supabase isn&apos;t configured yet. Set NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY first.
          </p>
        </div>
      </main>
    );
  }

  const sb = createServiceClient();
  const { count } = await sb.from("admin_users").select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0) redirect("/admin/login");

  return (
    <main className="flex min-h-screen items-center justify-center bg-plum-900 px-6 py-12 text-cream">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cream text-plum-800">
            <span className="rainbow-text font-display text-xl font-bold">∞</span>
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Autism<span className="rainbow-text">Connect</span>
          </span>
        </Link>

        <div className="rounded-4xl bg-cream p-8 text-plum-900 shadow-soft md:p-10">
          <div className="mb-5">
            <div className="inline-flex rounded-full bg-sunny-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-plum-900">
              First-time setup
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold">Create the first admin</h1>
            <p className="mt-1 text-sm text-plum-800/70">
              This one-time page disappears once an admin exists.
            </p>
          </div>
          <AdminSetupForm />
        </div>
      </div>
    </main>
  );
}
