import { redis } from "./redis";
import { getChannel, manifest } from "./manifest";
import type { Channel, ChannelView, ChatMessage, LiveState } from "./types";

export const VOTE_MS = 40_000;
export const FINAL_MS = 3_000;
const WATCH_WINDOW_MS = 30_000;

const key = (id: string) => `live:${id}`;

function initialState(ch: Channel): LiveState {
  const last = ch.rounds[ch.rounds.length - 1].options[0];
  return {
    channelId: ch.id,
    seq: 1,
    round: 0,
    phase: "voting",
    endsAt: Date.now() + VOTE_MS,
    votes: ch.rounds[0].options.map(() => 0),
    playing: { clipId: last.clipId, label: "Cold open", since: Date.now() },
  };
}

function pickWinner(votes: number[]): number {
  const max = Math.max(...votes);
  const tied = votes.map((v, i) => (v === max ? i : -1)).filter((i) => i >= 0);
  return tied[Math.floor(Math.random() * tied.length)];
}

async function advance(ch: Channel, st: LiveState, now: number): Promise<LiveState> {
  const r = redis();
  const lock = await r.set(`lock:${ch.id}`, "1", { nx: true, px: 2500 });
  if (!lock) return st;
  const fresh = (await r.get<LiveState>(key(ch.id))) ?? st;
  if (now < fresh.endsAt) return fresh;
  let next: LiveState;
  if (fresh.phase === "voting") {
    const option = pickWinner(fresh.votes);
    const round = ch.rounds[fresh.round];
    next = {
      ...fresh,
      phase: "finalizing",
      endsAt: now + FINAL_MS,
      lastWinner: { option, label: round.options[option].label, votes: fresh.votes[option] },
    };
  } else {
    const round = ch.rounds[fresh.round];
    const won = fresh.lastWinner ?? { option: 0, label: round.options[0].label, votes: 0 };
    const nextRound = (fresh.round + 1) % ch.rounds.length;
    const chosen = fresh.wildcard
      ? { clipId: `wild:${fresh.wildcard.url}`, label: `Wildcard by ${fresh.wildcard.name}: ${fresh.wildcard.prompt}` }
      : { clipId: round.options[won.option].clipId, label: won.label };
    next = {
      ...fresh,
      seq: fresh.seq + 1,
      round: nextRound,
      phase: "voting",
      endsAt: now + VOTE_MS,
      votes: ch.rounds[nextRound].options.map(() => 0),
      playing: { ...chosen, since: now },
      topBid: undefined,
      wildcard: undefined,
    };
    await pushChat(ch.id, {
      id: `sys-${now}`,
      name: "control room",
      text: fresh.wildcard
        ? `Wildcard on air: ${fresh.wildcard.prompt}`
        : `"${won.label}" won with ${won.votes} vote${won.votes === 1 ? "" : "s"}. Now on air.`,
      at: now,
      system: true,
    });
  }
  await r.set(key(ch.id), next);
  return next;
}

export async function getView(channelId: string, sessionId?: string): Promise<ChannelView | null> {
  const ch = await getChannel(channelId);
  if (!ch) return null;
  const r = redis();
  const now = Date.now();
  let st = (await r.get<LiveState>(key(ch.id))) ?? null;
  if (!st) {
    st = initialState(ch);
    await r.set(key(ch.id), st);
  }
  if (now >= st.endsAt) st = await advance(ch, st, now);
  let watching = 0;
  if (sessionId) {
    await r.zadd(`watch:${ch.id}`, { score: now, member: sessionId });
    await r.zremrangebyscore(`watch:${ch.id}`, 0, now - WATCH_WINDOW_MS);
    watching = await r.zcard(`watch:${ch.id}`);
  } else {
    await r.zremrangebyscore(`watch:${ch.id}`, 0, now - WATCH_WINDOW_MS);
    watching = await r.zcard(`watch:${ch.id}`);
  }
  const clips: ChannelView["clips"] = {};
  for (const rd of ch.rounds) for (const o of rd.options) if (manifest.clips[o.clipId]) clips[o.clipId] = manifest.clips[o.clipId];
  if (manifest.clips[st.playing.clipId]) clips[st.playing.clipId] = manifest.clips[st.playing.clipId];
  return { channel: ch, state: st, watching, now, clips };
}

export async function castVote(channelId: string, option: number, voterId: string, weight: number) {
  const ch = await getChannel(channelId);
  if (!ch) return { ok: false, error: "No such channel" };
  const r = redis();
  const st = await r.get<LiveState>(key(ch.id));
  if (!st || st.phase !== "voting" || Date.now() >= st.endsAt) return { ok: false, error: "Voting is closed for this round" };
  if (option < 0 || option >= st.votes.length) return { ok: false, error: "Bad option" };
  const added = await r.sadd(`voted:${ch.id}:${st.seq}`, voterId);
  if (!added) return { ok: false, error: "You already voted this round" };
  await r.expire(`voted:${ch.id}:${st.seq}`, 600);
  const fresh = (await r.get<LiveState>(key(ch.id))) ?? st;
  if (fresh.seq !== st.seq) return { ok: false, error: "Round just ended" };
  fresh.votes[option] += weight;
  await r.set(key(ch.id), fresh);
  return { ok: true, votes: fresh.votes };
}

export async function placeBid(channelId: string, amount: number, name: string, prompt: string) {
  const r = redis();
  const st = await r.get<LiveState>(key(channelId));
  if (!st) return { ok: false, error: "Channel not live" };
  if (st.topBid && amount <= st.topBid.amount) return { ok: false, error: `Top bid is ${st.topBid.amount} VVV. Bid higher.` };
  st.topBid = { amount, name, prompt, at: Date.now() };
  await r.set(key(channelId), st);
  await pushChat(channelId, { id: `bid-${Date.now()}`, name: "control room", text: `${name} bid ${amount} VVV for the director's chair: "${prompt}"`, at: Date.now(), system: true });
  return { ok: true, topBid: st.topBid };
}

export async function queueWildcard(channelId: string, name: string, prompt: string, url: string) {
  const r = redis();
  const st = await r.get<LiveState>(key(channelId));
  if (!st) return { ok: false, error: "Channel not live" };
  st.wildcard = { name, prompt, url, at: Date.now() };
  await r.set(key(channelId), st);
  await pushChat(channelId, { id: `wild-${Date.now()}`, name: "control room", text: `${name} generated a wildcard on their own DIEM. It airs next.`, at: Date.now(), system: true });
  return { ok: true };
}

export async function pushChat(channelId: string, m: ChatMessage) {
  const r = redis();
  await r.lpush(`chat:${channelId}`, m);
  await r.ltrim(`chat:${channelId}`, 0, 79);
}

export async function readChat(channelId: string): Promise<ChatMessage[]> {
  const rows = await redis().lrange<ChatMessage>(`chat:${channelId}`, 0, 59);
  return rows.reverse();
}
