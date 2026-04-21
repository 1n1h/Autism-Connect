import { redirect } from "next/navigation";
import { getAdminFromCookie } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");
  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}
