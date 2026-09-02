import { NextResponse } from "next/server";
import { getView } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = new URL(req.url).searchParams.get("s") ?? undefined;
  const view = await getView(id, s);
  if (!view) return NextResponse.json({ error: "No such channel" }, { status: 404 });
  return NextResponse.json(view, { headers: { "Cache-Control": "no-store" } });
}
