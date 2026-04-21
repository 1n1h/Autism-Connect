import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Reset password — AutismConnect" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title={<>Set a new password</>}
      subtitle="You're signed in via the reset link. Pick something you'll remember."
      footer={
        <>
          <Link href="/login" className="font-semibold text-coral-500 hover:text-coral-600">
            Back to sign in
          </Link>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
