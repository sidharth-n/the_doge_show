import { NextResponse } from "next/server";
import { allChannels, samplePool } from "@/lib/manifest";
import { getView } from "@/lib/engine";
import { redis } from "@/lib/redis";
import type { Channel } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const channels = await allChannels();
  const views = await Promise.all(channels.map((c) => getView(c.id)));
  const rows = views
    .filter((v): v is NonNullable<typeof v> => !!v)
    .map((v) => ({
      id: v.channel.id,
      name: v.channel.name,
      tagline: v.channel.tagline,
      adult: v.channel.adult,
      community: !!v.channel.community,
      watching: v.watching,
      playing: v.state.playing,
      clip: v.clips[v.state.playing.clipId] ?? null,
      beat: v.channel.rounds[v.state.round].beat,
      endsAt: v.state.endsAt,
      phase: v.state.phase,
      now: v.now,
    }));
  return NextResponse.json({ channels: rows });
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 32);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.system || !Array.isArray(body.options) || body.options.length !== 4) {
    return NextResponse.json({ error: "Name, premise and four opening scenes are required" }, { status: 400 });
  }
  const id = `c-${slug(body.name)}-${Math.random().toString(36).slice(2, 6)}`;
  const pool = samplePool(id.length);
  const rounds = [0, 1].map((ri) => ({
    beat: ri === 0 ? "Opening scene" : "What happens next",
    options: (body.options as string[]).map((label, oi) => ({ label: String(label).slice(0, 80), clipId: pool[(ri * 4 + oi) % pool.length], sample: true })),
  }));
  const ch: Channel = {
    id,
    name: String(body.name).slice(0, 40),
    tagline: String(body.tagline ?? "").slice(0, 80),
    adult: !!body.adult,
    system: String(body.system).slice(0, 600),
    community: true,
    creator: String(body.creator ?? "anon").slice(0, 40),
    rounds,
  };
  await redis().set(`community:${id}`, ch);
  await redis().sadd("community:index", id);
  return NextResponse.json({ ok: true, id });
}
