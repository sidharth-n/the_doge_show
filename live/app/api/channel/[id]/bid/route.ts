import { NextResponse } from "next/server";
import { placeBid } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const amount = Number(body?.amount);
  const prompt = String(body?.prompt ?? "").trim().slice(0, 200);
  const name = String(body?.name ?? "anon").trim().slice(0, 24) || "anon";
  if (!(amount > 0) || !prompt) return NextResponse.json({ error: "A VVV amount and a scene are required" }, { status: 400 });
  const res = await placeBid(id, amount, name, prompt);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 409 });
  return NextResponse.json(res);
}
