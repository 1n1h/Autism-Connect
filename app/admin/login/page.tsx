import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminFromCookie } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Admin Sign In — AutismConnect" };

export default async function AdminLoginPage() {
  const admin = await getAdminFromCookie();
  if (admin) redirect("/admin");

  // If there are NO admins yet, send the visitor to /admin/setup instead.
  if (hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const sb = createServiceClient();
      const { count } = await sb.from("admin_users").select("*", { count: "exact", head: true });
      if ((count ?? 0) === 0) redirect("/admin/setup");
    } catch { /* non-fatal */ }
  }

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
            <div className="inline-flex rounded-full bg-plum-800/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-plum-800/70">
              Staff access
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold">Admin sign in</h1>
            <p className="mt-1 text-sm text-plum-800/70">For AutismConnect team members only.</p>
          </div>
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
