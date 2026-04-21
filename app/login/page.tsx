import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign in — AutismConnect",
};

export default function LoginPage() {
  return (
    <AuthShell
      title={<>Welcome back</>}
      subtitle="Sign in to keep building your village."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-coral-500 hover:text-coral-600">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
