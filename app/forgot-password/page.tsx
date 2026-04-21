import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Forgot password — AutismConnect" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title={<>Forgot password?</>}
      subtitle="Drop your email — we'll send a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-coral-500 hover:text-coral-600">
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
