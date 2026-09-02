"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fmtClock } from "@/lib/client";
import type { Clip } from "@/lib/types";

type Row = { id: string; name: string; tagline: string; adult: boolean; community: boolean; watching: number; playing: { label: string }; clip: Clip | null; beat: string; endsAt: number; phase: string; now: number };

export default function Guide() {
  const [rows, setRows] = useState<Row[]>([]);
  const [offset, setOffset] = useState(0);
  const [tick, setTick] = useState(Date.now());
  const [adultOk, setAdultOk] = useState(false);
  useEffect(() => {
    setAdultOk(localStorage.getItem("dl:adult") === "1");
    let alive = true;
    const load = async () => {
      const r = await fetch("/api/channels", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
      if (alive && r?.channels) { setRows(r.channels); if (r.channels[0]) setOffset(r.channels[0].now - Date.now()); }
    };
    load();
    const a = setInterval(load, 5000), b = setInterval(() => setTick(Date.now()), 500);
    return () => { alive = false; clearInterval(a); clearInterval(b); };
  }, []);
  if (!rows.length) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="aspect-video animate-pulse rounded-lg bg-panel" />)}</div>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((c) => <Card key={c.id} c={c} left={c.endsAt - (tick + offset)} blur={c.adult && !adultOk} />)}
    </div>
  );
}

function Card({ c, left, blur }: { c: Row; left: number; blur: boolean }) {
  const v = useRef<HTMLVideoElement>(null);
  return (
    <Link href={`/c/${c.id}`} className="group overflow-hidden rounded-lg border border-line bg-panel transition hover:border-amber/60">
      <div className="relative aspect-video bg-black">
        {c.clip && (
          <video ref={v} src={c.clip.url} poster={c.clip.poster} muted playsInline autoPlay loop preload="metadata" className={`h-full w-full object-cover ${blur ? "blur-xl" : ""}`} />
        )}
        <div className="scanline absolute inset-0" />
        <div className="absolute left-2 top-2 flex items-center gap-2 rounded bg-black/60 px-2 py-1">
          <span className="tally on" /><span className="display text-sm">Live</span>
          <span className="mono text-[11px] text-muted">{c.watching} watching</span>
        </div>
        {c.adult && <span className="display absolute right-2 top-2 rounded bg-tally px-1.5 py-0.5 text-xs">18+</span>}
        {c.community && <span className="mono absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-diem">community</span>}
        {blur && <div className="absolute inset-0 grid place-items-center"><span className="display text-4xl text-tally">18+</span></div>}
      </div>
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="display text-2xl leading-none">{c.name}</h2>
          <span className="mono text-[11px] text-amber">{c.phase === "voting" ? `next cut ${fmtClock(left)}` : "cutting…"}</span>
        </div>
        <p className="mt-1 truncate text-xs text-muted">{c.tagline}</p>
        <p className="mt-2 truncate text-xs"><span className="text-muted">On air: </span>{c.playing.label}</p>
      </div>
    </Link>
  );
}
