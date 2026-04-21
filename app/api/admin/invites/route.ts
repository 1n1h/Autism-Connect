import { NextResponse } from "next/server";
import { getAdminFromCookie, randomToken } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { sendAdminInvite } from "@/lib/email/admin-invite";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createServiceClient();
  const [admins, invites] = await Promise.all([
    sb.from("admin_users").select("id, email, name, role, last_login, created_at").order("created_at"),
    sb
      .from("admin_invites")
      .select("id, email, created_at, expires_at, accepted_at")
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    admins: admins.data ?? [],
    pendingInvites: invites.data ?? [],
  });
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const sb = createServiceClient();

  // Refuse if already admin
  const { data: existing } = await sb
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "That email is already an admin." }, { status: 400 });
  }

  const token = randomToken(32);

  const { error: insertErr } = await sb
    .from("admin_invites")
    .insert({ email, token, created_by: admin.sub });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const emailResult = await sendAdminInvite(email, token, admin.email);

  return NextResponse.json({
    ok: true,
    emailSent: "sent" in emailResult,
    emailSkipped: "skipped" in emailResult,
    emailReason: "failed" in emailResult ? emailResult.reason : undefined,
  });
}
