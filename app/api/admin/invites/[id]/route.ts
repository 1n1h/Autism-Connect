import { NextResponse } from "next/server";
import { getAdminFromSession } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = createServiceClient();
  const { error } = await sb.from("admin_invites").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
