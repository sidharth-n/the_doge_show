# State Log

## Handoff — 2026-08-30 (session 1, full day: sample episode built end to end)
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

## Latest handoff — 2026-08-30 (session 1: sample episode build)
Newsroom pull (real: Verge/CoinDesk/HN/CoinGecko + agent-reach X for Erik/AskVenice), screenplay, voice audition → Kokoro,
studio still + idle loop, 12 iterations on the mouth (Poisson blend was the fix), Remotion frame with all overlays, music+SFX.

## 2026-08-30 (session 2) — ship prep
### Handoff
- Cleaned up Sid's message to Erik (kept his words, fixed language, no em dashes). Final text:
  "Hey Erik, I chatted with Vanessa last week and sent over my resume, waiting for the callback. Meanwhile I saw
  your tweet on the H3 Max model yesterday and really got intrigued by the possibilities ahead. Also saw fal.ai now
  has a 24x7 live stream running on the model they trained, on Twitch. So I thought I'd build something along
  similar lines. This is an experiment I have done: the world's first fully AI-powered 24x7 live news channel. The
  AI aggregates news from across social media and other authentic sources, verifies it, and puts it live through a
  show called The Doge Show. It consumes very few credits since the audio models are cheaper ones (Kokoro), and
  it's basically collecting data and using LLMs (I used the Venice uncensored model here since Doge needs some
  comedy and freedom of speech). Occasionally we can use H3 Max for b-roll or content that needs video, and we can
  also scrape real images or articles from the internet to show on screen, so it looks much like a real news
  channel. This is a 3-minute concept I've done and the project v1 is ready. Would love to know your thoughts on it."
  Unconfirmed: "Vanessa" was a guess for "avennsa"; check with Sid before sending.
- YouTube metadata drafted: title "The Doge Show | This Week in AI & Crypto | Ep. 1 (30 Aug 2026)", description
  with tonight's headlines + how-it's-built list, tags, category News & Politics, altered-content = Yes.
- Tried to re-auth youtube-api for the Doge Show channel; Sid stopped it ("no i do it"). `auth.mjs` unchanged.
- **First thing next session:** ask Sid for the YouTube link and the Vanessa name check, then send to Erik.

