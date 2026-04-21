"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Sign in failed.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-plum-800/60">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="mt-2 w-full rounded-2xl border-2 border-plum-800/10 bg-white px-4 py-3 outline-none transition focus:border-coral-400 focus:shadow-glow"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-plum-800/60">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-2xl border-2 border-plum-800/10 bg-white px-4 py-3 outline-none transition focus:border-coral-400 focus:shadow-glow"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm font-semibold text-coral-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-plum-800 px-6 py-3.5 text-base font-bold text-cream shadow-soft transition hover:bg-plum-700 disabled:opacity-60"
      >
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</> : "Sign in"}
      </button>
    </form>
  );
}
