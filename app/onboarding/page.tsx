import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata = {
  title: "Welcome — AutismConnect",
};

export default async function OnboardingPage() {
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

  if (profile?.onboarded) redirect("/dashboard");

  return (
    <main className="relative min-h-screen bg-cream px-6 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-10 left-[10%] h-72 w-72 rounded-full bg-coral-200/50 blur-3xl" />
        <div className="absolute bottom-0 right-[5%] h-80 w-80 rounded-full bg-teal-200/50 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-coral-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-coral-600">
            Welcome
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-plum-900 md:text-5xl">
            Let&apos;s set up <span className="rainbow-text">your space</span>.
          </h1>
          <p className="mt-2 text-plum-800/70">Takes about 60 seconds.</p>
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
