"use client";
import { useEffect, useState } from "react";
import { createPublicClient, http, formatUnits, getAddress } from "viem";
import { base } from "viem/chains";
import { VVV_CONTRACT } from "@/lib/brand";
import { wallet as readWallet, type WalletInfo, weightFor } from "@/lib/client";

const erc20 = [{ type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] }] as const;

declare global {
  interface Window { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }
}

export default function Wallet() {
  const [w, setW] = useState<WalletInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { setW(readWallet()); }, []);

  async function connect() {
    setErr("");
    if (!window.ethereum) { setErr("No wallet found. Install Coinbase Wallet or MetaMask."); return; }
    setBusy(true);
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const address = getAddress(accounts[0]);
      const client = createPublicClient({ chain: base, transport: http() });
      const bal = await client.readContract({ address: VVV_CONTRACT, abi: erc20, functionName: "balanceOf", args: [address] });
      const info = { address, vvv: Number(formatUnits(bal, 18)) };
      localStorage.setItem("dl:wallet", JSON.stringify(info));
      setW(info);
      window.dispatchEvent(new Event("dl:wallet"));
    } catch (e) {
      setErr((e as Error).message.slice(0, 80));
    } finally { setBusy(false); }
  }
  function disconnect() { localStorage.removeItem("dl:wallet"); setW(null); window.dispatchEvent(new Event("dl:wallet")); }

  if (w) {
    return (
      <button onClick={disconnect} className="btn btn-ghost mono text-xs" title="Disconnect">
        <span className="h-2 w-2 rounded-full bg-diem" />
        {w.vvv.toLocaleString(undefined, { maximumFractionDigits: 0 })} VVV · ×{weightFor(w.vvv)}
        <span className="hidden text-muted sm:inline">{w.address.slice(0, 6)}…{w.address.slice(-4)}</span>
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {err && <span className="hidden max-w-[220px] truncate text-xs text-tally sm:inline">{err}</span>}
      <button onClick={connect} disabled={busy} className="btn btn-ghost text-xs">{busy ? "Connecting…" : "Connect wallet"}</button>
    </div>
  );
}
