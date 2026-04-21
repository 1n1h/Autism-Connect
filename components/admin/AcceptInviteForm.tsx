"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, Shield } from "lucide-react";

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "valid" | "invalid">("loading");
  const [email, setEmail] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/admin/invites/accept?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (cancelled) return;
      if (data.valid) {
        setEmail(data.email);
        setState("valid");
      } else {
        setReason(data.reason ?? "invalid");
        setState("invalid");
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't accept invite.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't accept invite.");
    } finally {
      setSubmitting(false);
    }
  }

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <Loader2 className="h-6 w-6 animate-spin text-plum-800/40" />
        <p className="text-sm text-plum-800/60">Checking invite...</p>
      </div>
    );
  }

  if (state === "invalid") {
    const msg =
      reason === "expired" ? "This invite has expired." :
      reason === "used" ? "This invite was already used." :
      "This invite link isn't valid.";
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-100">
          <ShieldAlert className="h-7 w-7 text-coral-600" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Can&apos;t accept</h1>
        <p className="mt-1 text-sm text-plum-800/70">{msg}</p>
        <p className="mt-4 text-xs text-plum-800/50">
          Ask an existing admin to send a new invite.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sunny-200">
          <Shield className="h-5 w-5 text-plum-900" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Finish admin setup</h1>
          <p className="text-xs text-plum-800/60">Signing up as <strong>{email}</strong></p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Your name" value={name} onChange={setName} placeholder="Your name" />
        <Field label="Password (10+ chars)" type="password" value={password} onChange={setPassword} required />
        <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} required />
        {error && <p role="alert" className="text-sm font-semibold text-coral-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-plum-800 px-6 py-3.5 text-base font-bold text-cream shadow-soft transition hover:bg-plum-700 disabled:opacity-60"
        >
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : "Create admin & sign in"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label, type = "text", value, onChange, placeholder, required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-plum-800/60">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border-2 border-plum-800/10 bg-white px-4 py-3 outline-none transition focus:border-coral-400 focus:shadow-glow"
      />
    </div>
  );
}
