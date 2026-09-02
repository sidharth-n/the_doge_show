import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { queueWildcard } from "@/lib/engine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VENICE = "https://api.venice.ai/api/v1";
const MODEL = "minimax-h3-max-text-to-video";

/**
 * Bring-your-own-DIEM. The viewer's Venice key is used for this one request and never stored.
 * POST {name, prompt, key}            -> queues on Venice, returns queue_id
 * POST {name, prompt, key, queue_id}  -> polls once; when done, stores the clip and schedules it to air next
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const key = String(body?.key ?? "").trim();
  const prompt = String(body?.prompt ?? "").trim().slice(0, 500);
  const name = String(body?.name ?? "anon").trim().slice(0, 24) || "anon";
  if (!key || !prompt) return NextResponse.json({ error: "A Venice API key and a prompt are required" }, { status: 400 });
  const H = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  if (!body.queue_id) {
    const r = await fetch(`${VENICE}/video/queue`, { method: "POST", headers: H, body: JSON.stringify({ model: MODEL, prompt, duration: "5s", resolution: "480P", aspect_ratio: "16:9" }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return NextResponse.json({ error: j?.error ?? `Venice said ${r.status}` }, { status: 502 });
    return NextResponse.json({ queue_id: j.queue_id, status: "QUEUED" });
  }

  const r = await fetch(`${VENICE}/video/retrieve`, { method: "POST", headers: H, body: JSON.stringify({ queue_id: body.queue_id, model: MODEL }) });
  const ct = r.headers.get("content-type") ?? "";
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    return NextResponse.json({ error: j?.error ?? `Venice said ${r.status}` }, { status: 502 });
  }
  let url: string | null = null;
  if (ct.includes("json")) {
    const j = await r.json();
    if (j.download_url) url = j.download_url;
    else {
      const st = String(j.status ?? "").toUpperCase();
      if (["FAILED", "ERROR", "CANCELLED"].includes(st)) return NextResponse.json({ error: "Venice could not generate that" }, { status: 502 });
      return NextResponse.json({ status: st || "PROCESSING" });
    }
  } else {
    const buf = Buffer.from(await r.arrayBuffer());
    const blob = await put(`wild/${id}/${Date.now()}.mp4`, buf, { access: "public", contentType: "video/mp4" });
    url = blob.url;
  }
  await queueWildcard(id, name, prompt, url!);
  return NextResponse.json({ status: "COMPLETED", url });
}
