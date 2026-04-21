import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWaitlistWelcome } from "@/lib/email/resend";

/**
 * Waitlist API.
 * - If Supabase env is set → writes to public.waitlist (service-role bypasses RLS
 *   so the landing form works without a session) and sends welcome email.
 * - Otherwise → falls back to the local JSON stub so Phase 1 dev keeps working.
 */

type WaitlistEntry = {
  email: string;
  state_interested: string;
  created_at: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE = path.join(DATA_DIR, "waitlist.json");

async function readStore(): Promise<WaitlistEntry[]> {
  try {
    return JSON.parse(await fs.readFile(STORE, "utf8")) as WaitlistEntry[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeStore(entries: WaitlistEntry[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE, JSON.stringify(entries, null, 2), "utf8");
}

export async function POST(request: Request) {
  let body: { email?: string; state_interested?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const state = typeof body.state_interested === "string" ? body.state_interested.trim() : "GA";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }

  // ---- Supabase path ----
  if (hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const sb = createServiceClient();

    const { data: existing } = await sb
      .from("waitlist")
      .select("id, email_sent")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, alreadyOnList: true });
    }

    const { error: insertErr } = await sb
      .from("waitlist")
      .insert({ email, state_interested: state || "GA" });

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Fire welcome email (best effort).
    try {
      const result = await sendWaitlistWelcome(email, state || "GA");
      if ("sent" in result) {
        await sb.from("waitlist").update({ email_sent: true }).eq("email", email);
      }
    } catch (err) {
      console.error("[waitlist] email failed:", err);
    }

    return NextResponse.json({ ok: true, alreadyOnList: false });
  }

  // ---- Local JSON stub path (no Supabase configured yet) ----
  const entries = await readStore();
  if (entries.some((e) => e.email === email)) {
    return NextResponse.json({ ok: true, alreadyOnList: true });
  }
  entries.push({
    email,
    state_interested: state || "GA",
    created_at: new Date().toISOString(),
  });
  await writeStore(entries);

  return NextResponse.json({ ok: true, alreadyOnList: false, stub: true });
}

export async function GET() {
  if (hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const sb = createServiceClient();
    const { count } = await sb
      .from("waitlist")
      .select("*", { count: "exact", head: true });
    return NextResponse.json({ count: count ?? 0 });
  }
  const entries = await readStore();
  return NextResponse.json({ count: entries.length });
}
