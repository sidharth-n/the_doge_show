import Link from "next/link";
import { BRAND } from "@/lib/brand";
import Wallet from "./Wallet";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="tally on" aria-hidden />
          <span className="display text-2xl font-800 leading-none">{BRAND}</span>
        </Link>
        <span className="mono hidden text-[11px] text-muted sm:inline">powered by Venice</span>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/create" className="btn btn-ghost hidden sm:inline-flex">Start a channel</Link>
          <Wallet />
        </div>
      </div>
    </header>
  );
}
