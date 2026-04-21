import { NextResponse } from "next/server";
import { getResourceById } from "@/lib/resources/data";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const resource = await getResourceById(params.id);
  if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ resource });
}
