"use client";

export function sessionId(): string {
  if (typeof window === "undefined") return "";
  let s = localStorage.getItem("dl:session");
  if (!s) {
    s = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("dl:session", s);
  }
  return s;
}

export function handle(): string {
  if (typeof window === "undefined") return "anon";
  let h = localStorage.getItem("dl:handle");
  if (!h) {
    h = "viewer" + Math.floor(Math.random() * 9000 + 1000);
    localStorage.setItem("dl:handle", h);
  }
  return h;
}

export function setHandle(h: string) {
  localStorage.setItem("dl:handle", h.slice(0, 24));
}

export type WalletInfo = { address: string; vvv: number };

export function wallet(): WalletInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("dl:wallet");
  return raw ? (JSON.parse(raw) as WalletInfo) : null;
}

export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function weightFor(vvv: number): number {
  if (!vvv || vvv <= 0) return 1;
  return Math.min(5, 1 + Math.floor(Math.log10(vvv + 1)));
}
