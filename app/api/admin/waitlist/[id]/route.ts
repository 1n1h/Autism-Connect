import { NextResponse } from "next/server";
import { getAdminFromSession } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = createServiceClient();
  const { error } = await sb.from("waitlist").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const sb = createServiceClient();
  const update: Record<string, unknown> = {};
  if (typeof body.converted === "boolean") update.converted = body.converted;
  const { error } = await sb.from("waitlist").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
