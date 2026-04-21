"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, Shield, X, Mail } from "lucide-react";

type Admin = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  last_login: string | null;
  created_at: string;
};

type Invite = {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
};

export function AdminsManager() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  async function load() {
    const res = await fetch("/api/admin/invites");
    const data = await res.json();
    setAdmins(data.admins ?? []);
    setInvites(data.pendingInvites ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't send invite.");
      setEmail("");
      if (data.emailSent) {
        setMessage({ tone: "ok", text: `Invite sent to ${email}.` });
      } else if (data.emailSkipped) {
        setMessage({ tone: "ok", text: `Invite created, but Resend isn't configured. Share the accept link manually.` });
      } else if (data.emailReason) {
        setMessage({ tone: "err", text: `Invite saved, but email failed: ${data.emailReason}` });
      }
      await load();
    } catch (err) {
      setMessage({ tone: "err", text: err instanceof Error ? err.message : "Couldn't send invite." });
    } finally {
      setSending(false);
    }
  }

  async function revokeInvite(id: string) {
    if (!window.confirm("Revoke this pending invite?")) return;
    setInvites((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <div className="rounded-3xl border border-plum-800/5 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-coral-500" />
          <h2 className="font-display text-lg font-bold text-plum-900">Invite an admin</h2>
        </div>
        <form onSubmit={sendInvite} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="teammate@example.com"
            className="flex-1 rounded-full border-2 border-plum-800/10 bg-cream px-4 py-2.5 text-sm outline-none focus:border-coral-400"
          />
          <button
            type="submit"
            disabled={sending || !email.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-plum-800 px-6 py-2.5 text-sm font-bold text-cream shadow-soft transition hover:bg-plum-700 disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send invite
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm font-semibold ${message.tone === "ok" ? "text-teal-600" : "text-coral-600"}`}>
            {message.text}
          </p>
        )}
        <p className="mt-3 text-xs text-plum-800/50">
          They&apos;ll get an email with a link that expires in 7 days.
        </p>
      </div>

      {/* Pending invites */}
      <div className="rounded-3xl border border-plum-800/5 bg-white p-6 shadow-soft">
        <h2 className="mb-3 font-display text-lg font-bold text-plum-900">
          Pending invites {invites.length > 0 && <span className="text-plum-800/50">· {invites.length}</span>}
        </h2>
        {loading ? (
          <div className="flex items-center gap-2 text-plum-800/50">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : invites.length === 0 ? (
          <p className="text-sm text-plum-800/60">No pending invites.</p>
        ) : (
          <ul className="divide-y divide-plum-800/5">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-plum-900">{i.email}</div>
                  <div className="text-xs text-plum-800/60">
                    Expires {new Date(i.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => revokeInvite(i.id)}
                  aria-label="Revoke invite"
                  className="rounded-full p-1.5 text-plum-800/40 hover:bg-coral-50 hover:text-coral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Current admins */}
      <div className="rounded-3xl border border-plum-800/5 bg-white p-6 shadow-soft">
        <h2 className="mb-3 font-display text-lg font-bold text-plum-900">
          Admins {admins.length > 0 && <span className="text-plum-800/50">· {admins.length}</span>}
        </h2>
        {loading ? (
          <div className="flex items-center gap-2 text-plum-800/50">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : admins.length === 0 ? (
          <p className="text-sm text-plum-800/60">No admins yet.</p>
        ) : (
          <ul className="divide-y divide-plum-800/5">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-plum-800/5">
                  <Shield className="h-4 w-4 text-plum-800/60" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-plum-900">{a.name ?? a.email}</div>
                  <div className="text-xs text-plum-800/60">{a.email}</div>
                </div>
                <div className="text-right text-xs text-plum-800/50">
                  <div>{a.role ?? "admin"}</div>
                  <div>
                    {a.last_login
                      ? `Last login ${new Date(a.last_login).toLocaleDateString()}`
                      : "Never signed in"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
