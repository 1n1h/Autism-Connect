import Link from "next/link";
import { AcceptInviteForm } from "@/components/admin/AcceptInviteForm";

export const metadata = { title: "Accept admin invite — AutismConnect" };

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
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
          <AcceptInviteForm token={params.token} />
        </div>
      </div>
    </main>
  );
}
