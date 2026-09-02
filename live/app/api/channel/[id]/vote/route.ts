import { NextResponse } from "next/server";
import { castVote } from "@/lib/engine";

export const dynamic = "force-dynamic";

/** Vote weight from VVV held: 1 for anyone, +1 per order of magnitude, capped at 5. Demo: balance is client-reported. */
export function weightFor(vvv: number): number {
  if (!vvv || vvv <= 0) return 1;
  return Math.min(5, 1 + Math.floor(Math.log10(vvv + 1)));
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.option !== "number" || !body.voterId) return NextResponse.json({ error: "option and voterId required" }, { status: 400 });
  const weight = weightFor(Number(body.vvv ?? 0));
  const res = await castVote(id, body.option, String(body.voterId).slice(0, 64), weight);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 409 });
  return NextResponse.json({ ...res, weight });
}
