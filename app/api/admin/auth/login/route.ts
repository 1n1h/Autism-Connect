import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { verifyPassword, signAdminJWT, setAdminCookie } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }
  if (!process.env.ADMIN_JWT_SECRET) {
    return NextResponse.json({ error: "ADMIN_JWT_SECRET not set." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data: admin } = await sb
    .from("admin_users")
    .select("id, email, role, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (!admin || !admin.password_hash) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const ok = await verifyPassword(password, admin.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  await sb.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", admin.id);

  const token = await signAdminJWT({ sub: admin.id, email: admin.email, role: admin.role ?? "admin" });
  setAdminCookie(token);

  return NextResponse.json({ ok: true });
}
