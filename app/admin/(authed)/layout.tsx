import { redirect } from "next/navigation";
import { getAdminFromSession } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AuthedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromSession();
  // Not signed in at all → middleware already redirected to /login.
  // Signed in but not an admin → drop them back on the regular dashboard.
  if (!admin) redirect("/dashboard");
  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}
