"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { fmtClock, handle, sessionId, setHandle, wallet, weightFor, type WalletInfo } from "@/lib/client";
import type { ChannelView, ChatMessage } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];

export default function Studio({ id, name, tagline, adult, system }: { id: string; name: string; tagline: string; adult: boolean; system: string }) {
  const [view, setView] = useState<ChannelView | null>(null);
  const [offset, setOffset] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const [tab, setTab] = useState<"direct" | "chat">("direct");
  const [w, setW] = useState<WalletInfo | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/channel/${id}?s=${sessionId()}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null);
    if (r?.state) { setView(r); setOffset(r.now - Date.now()); }
  }, [id]);

  useEffect(() => {
    load();
    const a = setInterval(load, 2000), b = setInterval(() => setTick(Date.now()), 250);
    const onW = () => setW(wallet());
    onW(); window.addEventListener("dl:wallet", onW);
    return () => { clearInterval(a); clearInterval(b); window.removeEventListener("dl:wallet", onW); };
  }, [load]);

  const now = tick + offset;
  const left = view ? view.state.endsAt - now : 0;
  const playingClip = view ? (view.state.playing.clipId.startsWith("wild:") ? { url: view.state.playing.clipId.slice(5), poster: "" } : view.clips[view.state.playing.clipId]) : null;

  return (
    <main className="mx-auto max-w-[1400px] px-0 sm:px-4 sm:py-4">
      <div className="grid gap-0 lg:grid-cols-[1fr_340px] lg:gap-4">
        <div>
          <Player clip={playingClip} label={view?.state.playing.label ?? ""} since={view?.state.playing.since ?? 0} watching={view?.watching ?? 0} name={name} adult={adult} now={now} />
          <div className="px-4 pt-3 sm:px-0">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h1 className="display text-3xl leading-none sm:text-4xl">{name}</h1>
                <p className="mt-1 text-xs text-muted sm:text-sm">{tagline}</p>
              </div>
              <div className="lg:hidden">
                <div className="flex rounded-md border border-line p-0.5 text-xs">
                  <button onClick={() => setTab("direct")} className={`rounded px-3 py-1 ${tab === "direct" ? "bg-panel2" : "text-muted"}`}>Direct</button>
                  <button onClick={() => setTab("chat")} className={`rounded px-3 py-1 ${tab === "chat" ? "bg-panel2" : "text-muted"}`}>Chat</button>
                </div>
              </div>
            </div>
            <div className={tab === "direct" ? "" : "hidden lg:block"}>
              {view && <Ballot id={id} view={view} left={left} w={w} onVoted={load} />}
              {view && <DirectorChair id={id} view={view} w={w} onDone={load} />}
              <Wildcard id={id} onDone={load} />
              <p className="mt-6 text-[11px] text-muted">Channel rules: {system}</p>
            </div>
          </div>
        </div>
        <aside className={`${tab === "chat" ? "" : "hidden lg:block"} px-4 pt-3 sm:px-0 lg:pt-0`}>
          <Chat id={id} />
        </aside>
      </div>
    </main>
  );
}

function Player({ clip, label, since, watching, name, adult, now }: { clip: { url: string; poster: string } | null; label: string; since: number; watching: number; name: string; adult: boolean; now: number }) {
  const v = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [flash, setFlash] = useState(0);
  const last = useRef<string>("");
  useEffect(() => {
    if (!clip || clip.url === last.current) return;
    last.current = clip.url;
    setFlash(Date.now());
    const el = v.current; if (el) { el.load(); el.play().catch(() => {}); }
  }, [clip]);
  const tc = new Date(now);
  const timecode = `${String(tc.getUTCHours()).padStart(2, "0")}:${String(tc.getUTCMinutes()).padStart(2, "0")}:${String(tc.getUTCSeconds()).padStart(2, "0")}`;
  const onAir = Math.floor((now - since) / 1000);
  return (
    <div className="sticky top-14 z-30 bg-bg sm:static">
      <div className="relative aspect-video overflow-hidden bg-black sm:rounded-lg">
        {clip ? <video ref={v} src={clip.url} poster={clip.poster} muted={muted} playsInline autoPlay loop className="h-full w-full object-contain" /> : <div className="grid h-full place-items-center text-muted">Tuning in…</div>}
        <div className="scanline absolute inset-0" />
        {flash > 0 && <div key={flash} className="cutflash pointer-events-none absolute inset-0 bg-white/70" />}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded bg-black/60 px-2 py-1">
          <span className="tally on" /><span className="display text-sm">On air</span>
          <span className="mono text-[11px] text-muted">{watching} watching</span>
          {adult && <span className="display rounded bg-tally px-1 text-[10px]">18+</span>}
        </div>
        <div className="mono absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-[11px] text-muted">{timecode} UTC · {name.toUpperCase()}</div>
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="min-w-0">
            <div className="mono text-[10px] text-amber">NOW PLAYING · {fmtClock(onAir * 1000)} on air</div>
            <div className="truncate text-sm sm:text-base">{label}</div>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="btn btn-ghost bg-black/50 px-2 py-1 text-xs" aria-label={muted ? "Unmute" : "Mute"}>{muted ? "Sound off" : "Sound on"}</button>
        </div>
      </div>
    </div>
  );
}

function Ballot({ id, view, left, w, onVoted }: { id: string; view: ChannelView; left: number; w: WalletInfo | null; onVoted: () => void }) {
  const round = view.channel.rounds[view.state.round];
  const [mine, setMine] = useState<number | null>(null);
  const [seq, setSeq] = useState(view.state.seq);
  const [err, setErr] = useState("");
  useEffect(() => { if (view.state.seq !== seq) { setSeq(view.state.seq); setMine(null); setErr(""); } }, [view.state.seq, seq]);
  const total = view.state.votes.reduce((a, b) => a + b, 0);
  const finalizing = view.state.phase === "finalizing";
  const weight = weightFor(w?.vvv ?? 0);
  const pct = Math.max(0, Math.min(1, left / 40000));

  async function vote(i: number) {
    if (mine !== null || finalizing) return;
    setErr("");
    const r = await fetch(`/api/channel/${id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ option: i, voterId: sessionId(), vvv: w?.vvv ?? 0 }) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error ?? "Vote failed"); return; }
    setMine(i); onVoted();
  }

  return (
    <section className="mt-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="mono text-[11px] text-amber">NEXT SCENE · {round.beat.toUpperCase()}</div>
          <h2 className="display text-2xl">{finalizing ? "Votes are in. Cutting…" : "Pick what happens next"}</h2>
        </div>
        <div className="mono text-right text-sm"><span className={finalizing ? "text-tally" : "text-amber"}>{finalizing ? "CUT" : fmtClock(left)}</span><div className="text-[10px] text-muted">{total} vote{total === 1 ? "" : "s"}{w ? ` · yours ×${weight}` : ""}</div></div>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded bg-panel2"><div className={`h-full ${finalizing ? "bg-tally" : "bg-amber"}`} style={{ width: `${finalizing ? 100 : pct * 100}%`, transition: "width .25s linear" }} /></div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {round.options.map((o, i) => {
          const clip = view.clips[o.clipId];
          const won = finalizing && view.state.lastWinner?.option === i;
          const share = total ? view.state.votes[i] / total : 0;
          return (
            <button key={i} onClick={() => vote(i)} disabled={mine !== null || finalizing} aria-pressed={mine === i}
              className={`group relative overflow-hidden rounded-md border text-left transition ${won ? "border-tally" : mine === i ? "border-amber" : "border-line hover:border-amber/60"} disabled:cursor-default`}>
              <div className="relative aspect-video bg-black">
                {clip?.poster && <img src={clip.poster} alt="" className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" />}
                <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5">
                  <span className={`tally ${won ? "on" : mine === i ? "pvw" : ""}`} /><span className="mono text-[10px]">{won ? "ON AIR" : `PVW ${LETTERS[i]}`}</span>
                </div>
                {o.sample && <span className="mono absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[9px] text-muted">sample</span>}
              </div>
              <div className="p-2">
                <div className="line-clamp-2 text-xs leading-snug sm:text-sm">{o.label}</div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded bg-panel2"><div className={`h-full ${won ? "bg-tally" : "bg-amber"}`} style={{ width: `${share * 100}%`, transition: "width .4s" }} /></div>
                <div className="mono mt-1 text-[10px] text-muted">{view.state.votes[i]} vote{view.state.votes[i] === 1 ? "" : "s"}</div>
              </div>
            </button>
          );
        })}
      </div>
      {err && <p className="mt-2 text-xs text-tally">{err}</p>}
      {mine !== null && !err && <p className="mt-2 text-xs text-muted">Vote counted ×{weight}. {w ? "" : "Connect a wallet holding VVV to vote with weight."}</p>}
    </section>
  );
}

function DirectorChair({ id, view, w, onDone }: { id: string; view: ChannelView; w: WalletInfo | null; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [prompt, setPrompt] = useState("");
  const [msg, setMsg] = useState("");
  const top = view.state.topBid;
  async function bid(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    const r = await fetch(`/api/channel/${id}/bid`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(amount), prompt, name: handle() }) });
    const j = await r.json();
    if (!r.ok) { setMsg(j.error ?? "Bid failed"); return; }
    setMsg("You hold the chair for this round."); setPrompt(""); onDone();
  }
  return (
    <section className="mt-5 rounded-md border border-line bg-panel p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="mono text-[11px] text-amber">DIRECTOR&apos;S CHAIR · TEST MODE</div>
          <div className="text-sm">{top ? <><span className="mono text-amber">{top.amount} VVV</span> · {top.name}: &ldquo;{top.prompt}&rdquo;</> : "No bids this round. Top bid writes the next scene."}</div>
        </div>
        <button onClick={() => setOpen((o) => !o)} className="btn btn-amber shrink-0 text-xs">{open ? "Close" : "Bid VVV"}</button>
      </div>
      {open && (
        <form onSubmit={bid} className="mt-3 grid gap-2 sm:grid-cols-[120px_1fr_auto]">
          <input className="field mono" inputMode="decimal" placeholder={top ? `> ${top.amount}` : "VVV"} value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <input className="field" placeholder="The scene you want on air next" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={200} required />
          <button className="btn btn-tally text-xs" type="submit">Place bid</button>
          <p className="text-[11px] text-muted sm:col-span-3">Test mode: no funds move. {w ? `Wallet holds ${w.vvv.toFixed(0)} VVV.` : "Connect a wallet to bid with real VVV when settlement ships."}</p>
          {msg && <p className="text-xs text-amber sm:col-span-3">{msg}</p>}
        </form>
      )}
    </section>
  );
}

function Wildcard({ id, onDone }: { id: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<"idle" | "queued" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault(); setState("queued"); setMsg("Queued on Venice with your key…");
    const post = (b: object) => fetch(`/api/channel/${id}/wildcard`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: handle(), prompt, key, ...b }) }).then(async (r) => [r.ok, await r.json()] as const);
    const [ok, j] = await post({});
    if (!ok) { setState("error"); setMsg(typeof j.error === "string" ? j.error : "Venice rejected the request"); return; }
    const qid = j.queue_id; const t0 = Date.now();
    while (Date.now() - t0 < 180000) {
      await new Promise((r) => setTimeout(r, 4000));
      const [ok2, s] = await post({ queue_id: qid });
      if (!ok2) { setState("error"); setMsg(typeof s.error === "string" ? s.error : "Generation failed"); return; }
      if (s.status === "COMPLETED") { setState("done"); setMsg("Generated on your DIEM. It airs after this round."); setKey(""); onDone(); return; }
      setMsg(`Generating… ${Math.round((Date.now() - t0) / 1000)}s`);
    }
    setState("error"); setMsg("Timed out waiting for Venice");
  }
  return (
    <section className="mt-3 rounded-md border border-line bg-panel p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="mono text-[11px] text-diem">BRING YOUR DIEM</div>
          <div className="text-sm">Generate a wildcard scene on your own Venice allowance. It airs next.</div>
        </div>
        <button onClick={() => setOpen((o) => !o)} className="btn btn-ghost shrink-0 text-xs">{open ? "Close" : "Use my key"}</button>
      </div>
      {open && (
        <form onSubmit={go} className="mt-3 grid gap-2">
          <input className="field mono" type="password" placeholder="Venice API key (used once, never stored)" value={key} onChange={(e) => setKey(e.target.value)} required autoComplete="off" />
          <textarea className="field" rows={2} placeholder="Describe the scene" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={500} required />
          <div className="flex items-center gap-3">
            <button className="btn btn-tally text-xs" type="submit" disabled={state === "queued"}>{state === "queued" ? "Generating…" : "Generate on my DIEM"}</button>
            <span className="mono text-[11px] text-muted">H3 Max · 5 s · 480P · about $0.08 of your allowance</span>
          </div>
          {msg && <p className={`text-xs ${state === "error" ? "text-tally" : "text-diem"}`}>{msg}</p>}
        </form>
      )}
    </section>
  );
}

function Chat({ id }: { id: string }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setName(handle());
    let alive = true;
    const load = () => fetch(`/api/channel/${id}/chat`, { cache: "no-store" }).then((r) => r.json()).then((j) => { if (alive && j.messages) setMsgs(j.messages); }).catch(() => {});
    load(); const t = setInterval(load, 2500);
    return () => { alive = false; clearInterval(t); };
  }, [id]);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }); }, [msgs.length]);
  async function send(e: React.FormEvent) {
    e.preventDefault(); if (!text.trim()) return;
    setHandle(name || "anon");
    const r = await fetch(`/api/channel/${id}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, name: name || "anon" }) });
    if (r.ok) { setText(""); const j = await r.json(); setMsgs((m) => [...m, j.message]); }
  }
  return (
    <div className="flex h-[60dvh] flex-col rounded-md border border-line bg-panel lg:h-[calc(100dvh-7.5rem)]">
      <div className="flex items-center justify-between border-b border-line px-3 py-2"><span className="display text-lg">Control room chat</span><span className="mono text-[10px] text-muted">{msgs.length}</span></div>
      <div ref={box} className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2 text-sm">
        {msgs.length === 0 && <p className="text-xs text-muted">Nobody has said anything yet. Call the next scene.</p>}
        {msgs.map((m) => (
          <div key={m.id} className={m.system ? "rounded bg-panel2 px-2 py-1 text-xs text-amber" : ""}>
            {!m.system && <span className="mono mr-1.5 text-[11px] text-diem">{m.name}</span>}
            <span>{m.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-1.5 border-t border-line p-2">
        <input className="field mono w-24 shrink-0 text-xs" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} aria-label="Your name" />
        <input className="field text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something" maxLength={240} />
        <button className="btn btn-ghost text-xs" type="submit">Send</button>
      </form>
    </div>
  );
}
