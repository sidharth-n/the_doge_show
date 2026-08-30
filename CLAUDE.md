# dogeshow — The Doge Show: 24/7 live AI crypto news channel, powered by Venice

## What this is (Sid, 2026-08-30)
A real news channel that never stops: **live 24×7 on YouTube + Twitch simultaneously**, run by an AI
Doge anchor. Claim we are going for: the world's first live AI-streamed news channel. Built entirely on
the Venice API (Erik Voorhees / Venice application context — see `Personal/venice-inspect`). Erik posted
on 2026-08-27: *"Amazing model, generates vids in 15 seconds"* about **MiniMax H3 Max** on Venice
(50% off until 2026-09-01). This channel is our reply to that post — speed + taste.

## The show, like a real news channel
- **Fetch news live** from relevant sources (crypto feeds, X posts, discussions) → script per story.
- **Anchor**: lip-synced Doge anchor (cheap lip-sync model), voice from **local TTS** (free).
- **B-roll**: real photos, quotes, screenshots of X posts / discussions, bullet-news tickers, lower
  thirds, breaking-news bars — the whole grammar of a news channel.
- **H3 Max** (Venice) for AI video "once in a while" — hero shots, not the whole stream. Cost control:
  fully-generated 24/7 video would be thousands of $/day; anchor + b-roll + occasional H3 clip is
  $50–150/day.
- **Streams from Sid's own machine** (no streaming-server cost) via RTMP to YouTube Live + Twitch.
- **Clips**: every segment saved; best ones uploaded as clips to YouTube (Shorts), X and other socials.

## Assets we already own
- Brand: The Doge Show — domain (thedogeshow, confirm exact TLD), social handles, YouTube channel.
- `legacy/` = the Dec 2025 static landing page (roast-a-Shiba, HTML/Tailwind). Reuse brand, not code.

## Stack (to be settled in planning — proposals)
- Orchestrator: Node or Python on Sid's Mac. ffmpeg compositing → RTMP (YouTube + Twitch).
- Venice API: text (script — MiniMax M3 / others), image, **MiniMax H3 Max** video, maybe music.
- Lip-sync: local/cheap (evaluate MuseTalk / Wav2Lip / LatentSync on Apple Silicon) — free per minute.
- TTS: local (Kokoro from `privoice`/`uncensored-local-voice`, or mlx-audio).
- News ingest: RSS + `agent-reach` (X, Reddit) + screenshot capture for "show the post".
- Overlays: HTML/CSS scene rendered headless → composited (tickers, lower thirds, breaking bars).

## 72-hour scope (strict)
1. **Day 1–2: one 2–3 minute fully automated episode** — fetch → script → TTS → lip-sync anchor →
   b-roll/overlays → one H3 Max hero clip → rendered MP4. This is what we reply to Erik with.
2. **Day 3: the 24/7 loop** — rolling segment generation, RTMP to Twitch + YouTube at once, clip saver.
Ship inside the H3 Max 50%-off window (ends 2026-09-01).

## Risks to own
- YouTube AI/"inauthentic content" + monetization policy → Twitch is the safer first rail; YouTube second.
- Crypto news = scam comments/impersonators → moderation is part of launch.
- Summarize sources, never read them verbatim; credit screenshots.
- Venice API key/plan for this project: confirm with Sid (venice-inspect key issue still open).

## Commands
- (fill in once the orchestrator exists)

## Conventions
- Micro-commits; commit + push are one operation; never break the previously-working state.
- File tangents/ideas/bugs in `issues/`. Session memory: `state.md`, `learning.md`.
- Related: `Personal/livefunAI` (parked — H3 Max is a *partial* unlock, hosted not self-hosted),
  `Personal/privoice` (local TTS), `Personal/venice-inspect` (Venice intel), `Work/video-engine`.
