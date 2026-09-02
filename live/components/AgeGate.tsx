"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => { setOk(localStorage.getItem("dl:adult") === "1"); }, []);
  if (ok === null) return null;
  if (ok) return <>{children}</>;
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="display text-6xl font-800 text-tally">18+</span>
      <h1 className="display text-3xl">After Dark is unfiltered</h1>
      <p className="text-sm text-muted">Horror, dark comedy, no safety rails. Generated on Venice's uncensored models. You must be 18 or older to enter.</p>
      <div className="flex gap-2">
        <button className="btn btn-tally" onClick={() => { localStorage.setItem("dl:adult", "1"); setOk(true); }}>I am 18 or older, enter</button>
        <Link href="/" className="btn btn-ghost">Back to the guide</Link>
      </div>
    </div>
  );
}
