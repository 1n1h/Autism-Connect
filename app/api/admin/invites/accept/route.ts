import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { hashPassword, signAdminJWT, setAdminCookie } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  if (password.length < 10) {
    return NextResponse.json({ error: "Password must be at least 10 characters." }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data: invite, error: inviteErr } = await sb
    .from("admin_invites")
    .select("id, email, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (inviteErr) return NextResponse.json({ error: inviteErr.message }, { status: 500 });
  if (!invite) return NextResponse.json({ error: "Invalid invite link." }, { status: 404 });
  if (invite.accepted_at) return NextResponse.json({ error: "This invite was already used." }, { status: 400 });
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "This invite has expired." }, { status: 400 });
  }

  // Create admin user
  const password_hash = await hashPassword(password);
  const { data: admin, error: createErr } = await sb
    .from("admin_users")
    .insert({ email: invite.email, password_hash, name: name || "Admin", role: "admin" })
    .select("id, email, role")
    .single();

  if (createErr || !admin) {
    return NextResponse.json({ error: createErr?.message ?? "Couldn't create admin." }, { status: 500 });
  }

  // Mark invite used
  await sb
    .from("admin_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  // Sign the new admin in
  const jwt = await signAdminJWT({ sub: admin.id, email: admin.email, role: admin.role ?? "admin" });
  setAdminCookie(jwt);

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  // Validate a token without consuming it — used by the accept page
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false, reason: "missing" });

  const sb = createServiceClient();
  const { data } = await sb
    .from("admin_invites")
    .select("email, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (!data) return NextResponse.json({ valid: false, reason: "not-found" });
  if (data.accepted_at) return NextResponse.json({ valid: false, reason: "used" });
  if (new Date(data.expires_at) < new Date()) return NextResponse.json({ valid: false, reason: "expired" });

  return NextResponse.json({ valid: true, email: data.email });
}
