import { NextResponse } from "next/server";
import { pushChat, readChat } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ messages: await readChat(id) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const text = String(body?.text ?? "").trim().slice(0, 240);
  const name = String(body?.name ?? "anon").trim().slice(0, 24) || "anon";
  if (!text) return NextResponse.json({ error: "Say something" }, { status: 400 });
  const m = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, text, at: Date.now() };
  await pushChat(id, m);
  return NextResponse.json({ ok: true, message: m });
}
