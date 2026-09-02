import Link from "next/link";
import Guide from "@/components/Guide";
import { TAGLINE, SUB } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-16">
      <section className="flex flex-col gap-3 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-5xl font-800 leading-[0.9] sm:text-7xl">{TAGLINE}</h1>
          <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">{SUB} Every channel airs what the room votes for next. Hold VVV and your vote counts more. Bid VVV and you write the scene.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/create" className="btn btn-tally">Start a channel</Link>
          <Link href="/c/doge" className="btn btn-ghost">Watch Doge</Link>
        </div>
      </section>
      <Guide />
      <section className="mt-14 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
        <div>
          <div className="mono text-[11px] text-amber">VOTE</div>
          <h3 className="display mt-1 text-2xl">Four scenes, forty seconds</h3>
          <p className="mt-1 text-sm text-muted">The room votes while the current scene airs. The winner is generated and cut on air. Wallets holding VVV vote with weight.</p>
        </div>
        <div>
          <div className="mono text-[11px] text-amber">DIRECT</div>
          <h3 className="display mt-1 text-2xl">Bid for the chair</h3>
          <p className="mt-1 text-sm text-muted">Top VVV bid each round writes the next scene outright, inside the channel's rules. Creators keep the majority of every bid.</p>
        </div>
        <div>
          <div className="mono text-[11px] text-diem">BRING YOUR DIEM</div>
          <h3 className="display mt-1 text-2xl">Your allowance, your scene</h3>
          <p className="mt-1 text-sm text-muted">Unused DIEM expires at midnight UTC. Paste your Venice key, generate a wildcard on your own allowance, and it airs next. The key is used once and never stored.</p>
        </div>
      </section>
    </main>
  );
}
