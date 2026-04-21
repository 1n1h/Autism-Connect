import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = {
  title: "Sign up — AutismConnect",
};

export default function SignupPage() {
  return (
    <AuthShell
      title={<>Create your account</>}
      subtitle="Join a warm, parent-led community. Free while we're in early access."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-coral-500 hover:text-coral-600">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
