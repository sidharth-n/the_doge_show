"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { handle } from "@/lib/client";

export default function CreatePage() {
  const r = useRouter();
  const [f, setF] = useState({ name: "", tagline: "", system: "", adult: false, options: ["", "", "", ""] });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const res = await fetch("/api/channels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, creator: handle() }) });
    const j = await res.json(); setBusy(false);
    if (!res.ok) { setErr(j.error ?? "Could not create the channel"); return; }
    r.push(`/c/${j.id}`);
  }
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mono text-[11px] text-amber">NEW CHANNEL</div>
      <h1 className="display text-4xl sm:text-5xl">Start a channel</h1>
      <p className="mt-2 text-sm text-muted">Set the premise and four opening scenes. Your room votes, the winner airs, and every director&apos;s bid on your channel pays you the majority. Until your channel generates on its own key, it airs sample scenes.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="grid gap-1 text-sm">Channel name<input className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={40} required placeholder="Midnight Diner" /></label>
        <label className="grid gap-1 text-sm">One line<input className="field" value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} maxLength={80} placeholder="A diner where every customer is a ghost." /></label>
        <label className="grid gap-1 text-sm">The rules of the show<textarea className="field" rows={3} value={f.system} onChange={(e) => setF({ ...f, system: e.target.value })} maxLength={600} required placeholder="Tone, cast, what can never happen. This stays in charge no matter what the room votes." /></label>
        <fieldset className="grid gap-2">
          <legend className="text-sm">Four opening scenes</legend>
          {f.options.map((o, i) => (
            <input key={i} className="field" value={o} onChange={(e) => { const options = [...f.options]; options[i] = e.target.value; setF({ ...f, options }); }} maxLength={80} required placeholder={["The cook drops a plate and it floats", "A customer orders a dish that does not exist", "The lights go out mid-meal", "Someone walks in soaking wet on a dry night"][i]} />
          ))}
        </fieldset>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.adult} onChange={(e) => setF({ ...f, adult: e.target.checked })} />18+ channel (age gate, uncensored models)</label>
        {err && <p className="text-sm text-tally">{err}</p>}
        <div className="flex items-center gap-3">
          <button className="btn btn-tally" disabled={busy} type="submit">{busy ? "Creating…" : "Go live"}</button>
          <span className="mono text-[11px] text-muted">Free during the pilot.</span>
        </div>
      </form>
    </main>
  );
}
