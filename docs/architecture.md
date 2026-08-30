# The Doge Show — channel architecture (draft 2026-08-30, awaiting Sid's OK)

## 1. How a real 24/7 news channel actually works (the model we clone)

Reference channels: **Bloomberg TV, CNBC, CNN, BBC News, CoinDesk TV, Cheddar**. They all share
the same machinery; the brand is a skin on top.

### The "wheel" (clock)
A 24h channel is not one long show. It is a **repeating hour ("the wheel")** with fixed slots,
so a viewer joining at any minute knows what is coming. Typical Bloomberg/CNBC hour:

| Minute | Slot | What it is |
|---|---|---|
| :00 | **Top of the hour** | Sting + headlines (3–5 stories, 10 s each) + "here's what's coming" |
| :02 | **A-block** | Lead story — the biggest thing right now (2–4 min) |
| :06 | **Markets check** | Prices, movers, % change, one-liner why (60–90 s) |
| :08 | B-block | 2nd/3rd stories (package or VO) |
| :14 | Tease + break | "After the break…" — we use a 30–60 s ticker/montage instead of ads |
| :15 | C-block | Feature: "what people are saying" (X/Reddit reactions), explainer |
| :22 | Markets check | again (channels repeat markets every 15–30 min) |
| :28 | Headlines recap | Same 5 headlines, refreshed if changed |
| :30 | **Bottom of the hour** — repeat the structure, refreshed stories |
| :45 | Lighter block | Memes, community, "doge of the day", viewer comments |
| :58 | Next-hour tease + sting |

Key insight: **the channel is a loop of a few segment TYPES, refilled with new content.** Only the
content changes; the frame is fixed. That is exactly what makes it automatable.

### Segment types (the "grammar")
- **Reader** — anchor on camera reads 15–30 s. Cheapest. Most of the hour.
- **VO** (voice-over) — anchor voice over b-roll/screenshots/charts. Our workhorse.
- **VO/SOT** — VO + a "sound bite" = for us, a quoted X post shown full-screen and read.
- **Package** — a 60–120 s produced piece (H3 Max hero shot + b-roll + music). 1–2 per hour max.
- **Breaking news** — interrupts the wheel: red bar, sting, anchor reads the alert, returns.
- **Live ticker** — bottom crawl, always on: prices + headlines.

### Visual grammar (always on screen)
Lower third (name/topic) · headline bar · price ticker crawl · clock + "LIVE" bug · channel logo ·
"BREAKING" red bar · full-screen quote card for posts · chart card for markets.

### Editorial rules real channels follow (we adopt)
- Lead with the newest, biggest, most-people-affected story.
- Every story: **what happened → why it matters → what people are saying → what's next**.
- Attribute everything ("according to CoinDesk", "posted on X by …"). Summarize, never read verbatim.
- Re-run stories across hours with refreshed angles; a story lives ~6–12 h on the wheel.
- Delay is normal: TV runs on a 7-s to minutes delay. **We run ~5–10 min behind real time** —
  that is the generation buffer and nobody notices.

## 2. Our pipeline (mirrors a newsroom)

```
 NEWSROOM (ingest)        PRODUCER (LLM)          STUDIO (render)          MASTER CONTROL (stream)
 RSS/APIs/X/Reddit  ─▶  rundown + scripts   ─▶  TTS + lipsync + overlays ─▶ playlist → ffmpeg → RTMP
 prices (CoinGecko)      per-slot, per-wheel     segment .mp4 files          YouTube + Twitch
```

1. **Ingest (`newsroom/`)** — polls every 2–5 min:
   - RSS: CoinDesk, The Block, Decrypt, Cointelegraph, Bitcoin Magazine, Blockworks.
   - Prices: CoinGecko free API (BTC/ETH/DOGE/SOL top-20 + 24h movers).
   - Social: `agent-reach` X (crypto accounts + trending), Reddit (r/CryptoCurrency, r/dogecoin),
     screenshot each cited post (headless Chromium) for the "show the post" card.
   - Dedupe + cluster into stories; score (recency × source count × social velocity).
2. **Producer (`producer/`)** — Venice text model (MiniMax M3 or Llama/Qwen on Venice):
   - Builds the **rundown** for the next wheel slot from the story pool.
   - Writes the script per segment in the Doge anchor voice (persona sheet), with markup:
     `[SHOW post:123] [CHART BTC 24h] [LOWER_THIRD "…"] [BREAKING]`.
   - Decides when a story earns an H3 Max package (max N/day = cost cap).
3. **Studio (`studio/`)** — all local, free:
   - **TTS**: Kokoro (mlx-audio) — reuse `privoice` engine. Doge voice = Kokoro voice + pitch/formant
     shift + speed + persona writing ("much wow" cadence). If Kokoro can't sell it: try local
     **Chatterbox / F5-TTS / XTTS** with a 10-s reference clip (voice cloning, free). Decide by ear.
   - **Lip-sync**: one high-quality Doge anchor loop; candidates on Apple Silicon: **MuseTalk**,
     **Wav2Lip**, **LatentSync**, or 2D mouth-sprite sync (Rhubarb Lip Sync → mouth shapes on a still,
     zero GPU, always works). Start with Rhubarb (guaranteed 24/7), upgrade to MuseTalk if it runs
     real-time on the Mac.
   - **Overlays**: one HTML/CSS scene (ticker, lower thirds, cards, breaking bar) rendered by
     headless Chromium → PNG sequence/alpha → ffmpeg composite.
   - **Packages**: Venice image model for stills; **H3 Max** for hero clips (budgeted).
   - Output: `segments/<wheel>/<slot>.mp4` + a JSON manifest.
4. **Master control (`mcr/`)** — a playlist runner:
   - Plays segments in wheel order; fills gaps with ticker/markets loop (never dead air).
   - ffmpeg → RTMP to YouTube Live + Twitch (tee). Restarts on failure.
   - Breaking-news preemption: a high-score story jumps the queue.
   - Clip saver: every segment kept; top-scored → 9:16 Shorts export.

## 3. Runs on Venice key AND locally
Two backends behind one interface (same pattern as `privoice` engines.py):
- `LLM_BACKEND=venice|ollama` · `TTS_BACKEND=kokoro-local|venice` · `VIDEO=h3max|none`.
- Fully-local mode = Ollama script + Kokoro + Rhubarb + overlays → runs with zero API spend.
- Venice mode adds better scripts + image + H3 Max packages.

## 4. Build order (72 h)
- **Day 1**: ingest + producer + TTS + overlays → one 3-min episode MP4 (no lip-sync yet, static
  anchor with mouth sprites). Doge voice chosen by ear.
- **Day 2**: lip-sync upgrade, H3 Max hero package, polish → the Erik reply episode.
- **Day 3**: wheel scheduler + RTMP to Twitch (first) + YouTube, clip saver, moderation.

## 5. Open decisions for Sid
1. Which prior "funny Doge voice" (ElevenLabs? a Kokoro voice?) — or build locally by ear.
2. Venice balance: top up (H3 Max packages ≈ $X each; confirm price on venice.ai/pricing).
3. Anchor look: 3D-ish generated Doge (Venice image) vs the legacy 2D style.
4. Delay: 5–10 min behind real time OK?

## 6. Lineage (settled 2026-08-30)
- The channel: YouTube **The Doge Show** `UCcd-IviqTtc0Gq-udPP8fSg`. Prior stream 2025-12-01
  "I Am Only Roasting SUBSCRIBERS" (8 min, https://www.youtube.com/live/M-8iUii-A8U): a chat-roast
  show built on `sidharth-n/dynamic-live-youtube` (React overlay, YouTube chat poller, Cartesia TTS).
  The Doge variant was never committed; only the Hanuman version is on GitHub.
- **Anchor technique = still studio image + mouth-sprite overlay while TTS plays** (no lip-sync model).
  Frames in `docs/reference/`. New version drives the sprite from the audio envelope.
- Studio DNA to keep: photoreal Shiba at a broadcast mic, neon "THE DOGE SHOW", polaroid board,
  Pepe/Wojak plushies, warm wood-panel set. News version: Venice cap/hoodie, desk, lower thirds + ticker.
- Voice: old show used Cartesia. New show auditions 4 (Kokoro-pitched, Chatterbox HD, MiniMax
  Speech-02 HD, ElevenLabs on Venice); Sid picks by ear.
- Venice: $6.57 balance. H3 Max 768p = $0.24/5s, $0.48/10s, $0.72/15s. Music $0.18/track.
