import { AdminsManager } from "@/components/admin/AdminsManager";

export default function AdminsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-plum-900">Admins</h1>
        <p className="text-sm text-plum-800/60">Invite teammates by email — they&apos;ll get a link to set their password.</p>
      </div>
      <AdminsManager />
    </div>
  );
}
