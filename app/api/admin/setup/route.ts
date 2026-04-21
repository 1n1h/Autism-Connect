import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { hashPassword, signAdminJWT, setAdminCookie } from "@/lib/admin/auth";

export const runtime = "nodejs";

/**
 * One-time bootstrap: creates the first admin.
 * Returns 409 if admin_users already has any rows.
 */
export async function POST(request: Request) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }
  if (!process.env.ADMIN_JWT_SECRET) {
    return NextResponse.json({ error: "ADMIN_JWT_SECRET not set." }, { status: 500 });
  }

  const sb = createServiceClient();
  const { count } = await sb
    .from("admin_users")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "Admin already exists." }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  if (password.length < 10) {
    return NextResponse.json({ error: "Use a password with at least 10 characters." }, { status: 400 });
  }

  const password_hash = await hashPassword(password);
  const { data, error } = await sb
    .from("admin_users")
    .insert({ email, password_hash, name: name || "Admin", role: "admin" })
    .select("id, email, role")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Couldn't create admin." }, { status: 500 });
  }

  const token = await signAdminJWT({ sub: data.id, email: data.email, role: data.role ?? "admin" });
  setAdminCookie(token);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ needsSetup: false, reason: "server-not-configured" });
  }
  const sb = createServiceClient();
  const { count } = await sb
    .from("admin_users")
    .select("*", { count: "exact", head: true });
  return NextResponse.json({ needsSetup: (count ?? 0) === 0 });
}
