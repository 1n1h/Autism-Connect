"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CropModal } from "./CropModal";

type Step = 0 | 1 | 2;

const STATES = ["GA", "FL", "AL", "TN", "SC", "NC", "TX", "CA", "NY", "Other"];
const AUTISM_LEVELS = [
  { value: "", label: "Prefer not to say" },
  { value: "level_1", label: "Level 1 (needs support)" },
  { value: "level_2", label: "Level 2 (needs substantial support)" },
  { value: "level_3", label: "Level 3 (needs very substantial support)" },
  { value: "exploring", label: "Still exploring / pre-diagnosis" },
];

type FormState = {
  first_name: string;
  last_name: string;
  bio: string;
  profile_photo_url: string;
  location: string;
  state: string;
  child_age: string;
  child_autism_level: string;
};

const INITIAL: FormState = {
  first_name: "",
  last_name: "",
  bio: "",
  profile_photo_url: "",
  location: "",
  state: "GA",
  child_age: "",
  child_autism_level: "",
};

export function OnboardingWizard({ initialProfile }: { initialProfile?: Partial<FormState> }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>({ ...INITIAL, ...initialProfile });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const revokeRef = useRef<string | null>(null);

  // Clean up any outstanding blob: URL when the component unmounts.
  useEffect(() => {
    return () => {
      if (revokeRef.current) URL.revokeObjectURL(revokeRef.current);
    };
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onFilePicked(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image is too large. Keep it under 10MB.");
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    if (revokeRef.current) URL.revokeObjectURL(revokeRef.current);
    revokeRef.current = url;
    setCropSrc(url);
  }

  function closeCrop() {
    if (revokeRef.current) {
      URL.revokeObjectURL(revokeRef.current);
      revokeRef.current = null;
    }
    setCropSrc(null);
  }

  async function handleCropConfirmed(blob: Blob) {
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      const path = `${user.id}/${Date.now()}.jpg`;
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: "image/jpeg" });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust so the cropped image shows immediately
      update("profile_photo_url", `${pub.publicUrl}?t=${Date.now()}`);
      closeCrop();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload photo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name || null,
          last_name: form.last_name || null,
          bio: form.bio || null,
          profile_photo_url: form.profile_photo_url || null,
          location: form.location || null,
          state: form.state || null,
          child_age: form.child_age ? parseInt(form.child_age, 10) : null,
          child_autism_level: form.child_autism_level || null,
          onboarded: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't save profile.");

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save profile.");
    } finally {
      setSaving(false);
    }
  }

  const canAdvance =
    (step === 0 && form.first_name.trim().length > 0) ||
    (step === 1 && form.state.length > 0) ||
    step === 2;

  return (
    <div className="w-full max-w-2xl">
      <CropModal
        src={cropSrc}
        open={cropSrc !== null}
        onCancel={closeCrop}
        onConfirm={handleCropConfirmed}
      />
      <StepDots step={step} />

      <div className="mt-6 rounded-4xl border border-plum-800/5 bg-white p-8 shadow-soft md:p-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-display text-3xl font-bold text-plum-900">Let&apos;s meet you</h1>
              <p className="mt-2 text-sm text-plum-800/70">
                How should other parents know you? You can change any of this later.
              </p>

              <div className="mt-6 flex items-center gap-5">
                <AvatarPreview url={form.profile_photo_url} name={form.first_name} />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-plum-800/10 bg-cream px-5 py-2.5 text-sm font-semibold text-plum-900 transition hover:border-plum-800/30">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {form.profile_photo_url ? "Change photo" : "Upload photo"}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onFilePicked(file);
                      // allow picking the same file again later
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <TextField label="First name" value={form.first_name} onChange={(v) => update("first_name", v)} required />
                <TextField label="Last name" value={form.last_name} onChange={(v) => update("last_name", v)} />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-plum-900">Bio (optional)</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  rows={3}
                  placeholder="A line or two about your family or what you're looking for."
                  className="mt-2 w-full rounded-2xl border-2 border-plum-800/10 bg-cream px-4 py-3 outline-none transition focus:border-coral-400 focus:shadow-glow"
                />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-display text-3xl font-bold text-plum-900">Where are you?</h1>
              <p className="mt-2 text-sm text-plum-800/70">
                We show you local resources first. (AutismConnect is live in Georgia — tell us if you&apos;re elsewhere and we&apos;ll track demand.)
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-[2fr_1fr]">
                <TextField label="City / town" value={form.location} onChange={(v) => update("location", v)} placeholder="Atlanta" />
                <div>
                  <label className="block text-sm font-semibold text-plum-900">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="mt-2 w-full rounded-2xl border-2 border-plum-800/10 bg-cream px-4 py-3 font-semibold outline-none transition focus:border-coral-400"
                  >
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-display text-3xl font-bold text-plum-900">Tell us about your kiddo</h1>
              <p className="mt-2 text-sm text-plum-800/70">
                Optional — this helps us surface relevant resources. Private by default.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-plum-900">Child&apos;s age</label>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={form.child_age}
                    onChange={(e) => update("child_age", e.target.value)}
                    placeholder="e.g. 6"
                    className="mt-2 w-full rounded-2xl border-2 border-plum-800/10 bg-cream px-4 py-3 outline-none transition focus:border-coral-400 focus:shadow-glow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-plum-900">Autism level</label>
                  <select
                    value={form.child_autism_level}
                    onChange={(e) => update("child_autism_level", e.target.value)}
                    className="mt-2 w-full rounded-2xl border-2 border-plum-800/10 bg-cream px-4 py-3 outline-none transition focus:border-coral-400"
                  >
                    {AUTISM_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-4 text-sm font-semibold text-coral-600">{error}</p>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-plum-800/70 transition hover:text-plum-900 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={() => canAdvance && setStep((s) => ((s + 1) as Step))}
              disabled={!canAdvance}
              className="inline-flex items-center gap-2 rounded-full bg-plum-800 px-6 py-3 text-sm font-bold text-cream shadow-soft transition hover:bg-plum-700 disabled:opacity-60"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-7 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-coral-600 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finishing up...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Finish setup
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepDots({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <motion.div
            animate={{
              width: step === i ? 32 : 10,
              backgroundColor: i <= step ? "#FF6B5A" : "#E9E3DB",
            }}
            transition={{ duration: 0.3 }}
            className="h-2.5 rounded-full"
          />
        </div>
      ))}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-plum-900">
        {label}
        {required && <span className="ml-1 text-coral-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border-2 border-plum-800/10 bg-cream px-4 py-3 outline-none transition focus:border-coral-400 focus:shadow-glow"
      />
    </div>
  );
}

function AvatarPreview({ url, name }: { url: string; name: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="Profile" className="h-20 w-20 rounded-full object-cover shadow-soft" />;
  }
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-coral-300 via-sunny-300 to-teal-300 font-display text-2xl font-bold text-plum-900 shadow-soft">
      {(name || "?").trim().charAt(0).toUpperCase()}
    </div>
  );
}
