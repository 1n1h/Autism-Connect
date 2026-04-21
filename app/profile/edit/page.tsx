import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata = { title: "Edit profile — AutismConnect" };

export default async function ProfileEditPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="relative min-h-screen bg-cream px-6 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-10 left-[10%] h-72 w-72 rounded-full bg-coral-200/50 blur-3xl" />
        <div className="absolute bottom-0 right-[5%] h-80 w-80 rounded-full bg-teal-200/50 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <div className="mb-6 w-full max-w-2xl">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-plum-800/70 hover:text-plum-900"
          >
            ← Back to dashboard
          </Link>
        </div>
        <div className="mb-6 text-center">
          <h1 className="font-display text-4xl font-bold leading-tight text-plum-900">
            Edit your <span className="rainbow-text">profile</span>
          </h1>
        </div>

        <OnboardingWizard
          initialProfile={{
            first_name: profile?.first_name ?? "",
            last_name: profile?.last_name ?? "",
            bio: profile?.bio ?? "",
            profile_photo_url: profile?.profile_photo_url ?? "",
            location: profile?.location ?? "",
            state: profile?.state ?? "GA",
            child_age: profile?.child_age ? String(profile.child_age) : "",
            child_autism_level: profile?.child_autism_level ?? "",
          }}
        />
      </div>
    </main>
  );
}
