import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getAdminFromCookie();
  return NextResponse.json({ admin });
}
