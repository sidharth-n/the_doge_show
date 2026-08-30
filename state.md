# dogeshow — State

_Last updated: 2026-08-30_

## Now
- **Sample episode DONE and locked:** `tv/out/episode-final-v3.mp4` (1920x1080, 3:35), copies at
  `~/Desktop/DogeShow/dogeshow-2026-08-30-this-week-in-ai-crypto-v3.mp4` and sent to Sid's Telegram.
  Branch `main`, everything committed + pushed. Venice balance ≈ $2.30.
- Sid's verdict on v3: "perfect / this is fine" after the audio lock. Not yet published anywhere.

## Next
1. **Ship**: upload v3 to The Doge Show YouTube (`UCcd-IviqTtc0Gq-udPP8fSg`; the youtube-api skill is bound to BHKScanner,
   token expired, so re-auth for this channel or upload manually) + draft the reply to Erik's 2026-08-27 post
   (https://x.com/ErikVoorhees/status/2092992500348727551) for Sid's approval. Nothing posts without Sid.
2. Runtime is 3:35; Sid asked for ~3:10. Optional trim: cut ~20 s from the AI block (a2/a3) and re-render.
3. Day 3 scope: wheel scheduler + RTMP (Twitch first) + clip saver; chat-roast block; needs a Venice top-up.

## Blockers
- Venice balance $2.30 (fine for tweaks, not for a 24/7 run). YouTube API auth for The Doge Show channel.

## Latest handoff — 2026-08-30 (session 1, full day: sample episode built end to end)
**Pipeline (all in repo):** `newsroom/raw/2026-08-30.json` (real pulls: Verge/CoinDesk/HN/CoinGecko RSS+API,
agent-reach `twitter -c user-posts` for Erik/AskVenice, opencli reddit) → `producer/rundown-2026-08-30.json`
(scripts, visuals, bumpers; `producer/punchup.py` = Venice uncensored rewrite, then hand-fixed for facts) →
`producer/build.py` (Kokoro VO via `studio/tts.py`, visemes via `studio/mouth/lipsync.py --json-only`, writes
`tv/public/episode.json`; run inside `~/Developer/Personal/privoice` uv env) → `tv/` Remotion app
(`npx remotion render Episode out/x.mp4`; stills `npx remotion still Episode out/x.jpg --frame=N`).
**Anchor:** still `studio/assets/still-cap-v3.png` (Nano Banana Pro edit of the 2025 roast set + Venice cap + MacBook +
meme jars) → idle loop `studio/assets/anchor-idle-v1.mp4` (Kling 2.6 Pro, first=last frame, 5.08 s) → mouth: 6 photoreal
visemes `studio/mouth/a/` built by `studio/mouth/build_sprites_poisson.py` (needs opencv venv; Poisson clone vs
`loop-frame0.png`, mouth-only masks, wide feather). Cartoon option kept in `studio/mouth/b/`.
**Frame:** two-box layout when content shows (anchor box left 50%, cards right), full studio otherwise; section
bumpers (`bumper` field), 2.5 s linger, timed `visuals[]` per segment, LIVE bug, clock, lower-thirds, breaking bar,
title/end cards, ticker with rotating price pair (BTC ETH SOL DOGE VVV DIEM) + news crawl. Fonts Oswald/Inter.
**Audio (LOCKED):** `tv/public/music/bed-quiet.mp3` = bed −30 dB baked (intro ×6 first 8 s), SFX `*-q.mp3` −12 dB at 0.7,
VO untouched. **H3 Max clips:** `tv/public/h3-1.mp4` (newsroom push-in 8 s), `h3-2.mp4` (Shiba astronaut 10 s), 768p,
~20 s each to generate, $0.86 total. Wrapped in `<Sequence>` (was frozen before). Idle loop uses `<Loop>` (was frozen).
**Rules Sid set (keep):** no em dashes anywhere; visuals follow what is being said; graphics linger a few seconds;
big section headers; full studio visible; only 2 H3 clips; ask before verifying/moving on look-and-feel calls.
**First thing next session:** confirm Telegram delivery happened, then do Next #1.
