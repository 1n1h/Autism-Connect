import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST() {
  clearAdminCookie();
  return NextResponse.json({ ok: true });
}
