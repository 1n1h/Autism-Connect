"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AdminSetupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't create admin.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create admin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Your name" value={name} onChange={setName} placeholder="Katherine" />
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
      <Field label="Password (10+ chars)" type="password" value={password} onChange={setPassword} required />
      <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} required />
      {error && <p role="alert" className="text-sm font-semibold text-coral-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-coral-500 px-6 py-3.5 text-base font-bold text-white shadow-soft transition hover:bg-coral-600 disabled:opacity-60"
      >
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : "Create admin & sign in"}
      </button>
    </form>
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
