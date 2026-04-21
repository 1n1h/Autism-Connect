import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * Waitlist stub route. Phase 1 only — persists to ./data/waitlist.json
 * so the form works end-to-end in local dev before Supabase is wired.
 *
 * Phase 2: replace the file I/O with Supabase `waitlist` table + Resend email.
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
    const raw = await fs.readFile(STORE, "utf8");
    return JSON.parse(raw) as WaitlistEntry[];
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

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }

  const entries = await readStore();
  const existing = entries.find((e) => e.email === email);
  if (existing) {
    return NextResponse.json({ ok: true, alreadyOnList: true });
  }

  const entry: WaitlistEntry = {
    email,
    state_interested: state || "GA",
    created_at: new Date().toISOString(),
  };
  entries.push(entry);
  await writeStore(entries);

  return NextResponse.json({ ok: true, alreadyOnList: false });
}

export async function GET() {
  const entries = await readStore();
  return NextResponse.json({ count: entries.length });
}
