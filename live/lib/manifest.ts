import manifestJson from "@/content/manifest.json";
import type { Channel, Manifest } from "./types";
import { redis } from "./redis";

export const manifest = manifestJson as Manifest;

export function builtinChannel(id: string): Channel | undefined {
  return manifest.channels.find((c) => c.id === id);
}

export async function communityChannels(): Promise<Channel[]> {
  const ids = await redis().smembers<string[]>("community:index");
  if (!ids || ids.length === 0) return [];
  const rows = await redis().mget<(Channel | null)[]>(...ids.map((id) => `community:${id}`));
  return rows.filter((c): c is Channel => !!c);
}

export async function getChannel(id: string): Promise<Channel | undefined> {
  const b = builtinChannel(id);
  if (b) return b;
  const c = await redis().get<Channel>(`community:${id}`);
  return c ?? undefined;
}

export async function allChannels(): Promise<Channel[]> {
  const community = await communityChannels();
  return [...manifest.channels, ...community];
}

/** Clip pool used for community channels until they generate their own. */
export function samplePool(seed: number): string[] {
  const ids = Object.keys(manifest.clips).filter((k) => k.startsWith("chaos/"));
  const out: string[] = [];
  for (let i = 0; i < ids.length; i++) out.push(ids[(i * 7 + seed) % ids.length]);
  return out;
}
