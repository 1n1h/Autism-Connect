import { NextResponse } from "next/server";
import { getAdminFromSession, randomToken } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/server";
import { sendAdminInvite } from "@/lib/email/admin-invite";

export const runtime = "nodejs";

/**
 * Admins are now regular Supabase users with profiles.is_admin = true.
 * Inviting someone:
 *  - If they already have a profile, we promote them immediately.
 *  - Otherwise, we create an admin_invites row. When they sign up later,
 *    the handle_new_user() trigger sets is_admin=true and consumes the invite.
 */
export async function GET() {
  const admin = await getAdminFromSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createServiceClient();
  const [admins, invites] = await Promise.all([
    sb
      .from("profiles")
      .select("id, email, first_name, last_name, created_at")
      .eq("is_admin", true)
      .order("created_at"),
    sb
      .from("admin_invites")
      .select("id, email, created_at, expires_at, accepted_at")
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    admins: (admins.data ?? []).map((a) => ({
      id: a.id,
      email: a.email,
      name: [a.first_name, a.last_name].filter(Boolean).join(" ") || null,
      role: "admin",
      last_login: null,
      created_at: a.created_at,
    })),
    pendingInvites: invites.data ?? [],
  });
}

export async function POST(request: Request) {
  const admin = await getAdminFromSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const sb = createServiceClient();

  // Does this user already have a profile?
  const { data: existing } = await sb
    .from("profiles")
    .select("id, is_admin")
    .eq("email", email)
    .maybeSingle();

  if (existing?.is_admin) {
    return NextResponse.json({ error: "That user is already an admin." }, { status: 400 });
  }

  let mode: "promoted" | "invited" = "invited";
  if (existing) {
    // Direct promote
    const { error: upErr } = await sb
      .from("profiles")
      .update({ is_admin: true })
      .eq("id", existing.id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    mode = "promoted";
  } else {
    // Queue invite for when they sign up
    const token = randomToken(32);
    const { error: insertErr } = await sb
      .from("admin_invites")
      .insert({ email, token, created_by: admin.id });
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const emailResult = await sendAdminInvite(email, mode, admin.email);

  return NextResponse.json({
    ok: true,
    mode,
    emailSent: "sent" in emailResult,
    emailSkipped: "skipped" in emailResult,
    emailReason: "failed" in emailResult ? emailResult.reason : undefined,
  });
}
