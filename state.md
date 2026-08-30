# dogeshow — State

_Last updated: 2026-08-30_

## Now
- **Final v3 (LOCKED mix) rendered 2026-08-30: `tv/out/episode-final-v3.mp4` (1920x1080, 3:35), copy `~/Desktop/DogeShow/…-v3.mp4`.** v2→v3: bed −30 dB baked, SFX −12 dB, idle loop fixed with <Loop>. Next: Sid final watch → upload + Erik.
- Built the sample episode "This Week in AI & Crypto" (2026-08-30). Pipeline is end-to-end local except
  Venice calls for stills/clips/music. Screenplay: `docs/screenplay-2026-08-30.md`; rundown data:
  `producer/rundown-2026-08-30.json`; frame: `tv/` (Remotion). Preview render in progress.
- Venice balance ≈ $2.30 after both H3 Max clips (h3-1 newsroom 8 s, h3-2 Shiba astronaut 10 s; ~20 s each to generate).

## Locked decisions (Sid)
- Anchor still: `studio/assets/still-cap-v3.png` (Nano Banana Pro edit of the 2025 roast-stream set: Venice cap, MacBook, meme jars).
- Idle loop: `studio/assets/anchor-idle-v1.mp4` (Kling 2.6 Pro, first+last frame = still, 5.08 s, seamless).
- Mouth: photoreal 6-shape visemes (`studio/mouth/a/`, built by `studio/mouth/build_sprites_poisson.py` — Poisson clone vs
  loop frame 0, mouth-only masks, wide soft feather). Driver `studio/mouth/lipsync.py` (RMS + ZCR, step-limited, 2-frame hold).
  Sid: "this works" (v12). Cartoon sprite (option B) kept in `studio/mouth/b/` for a roast/comedy mode.
- Voice: Kokoro `am_santa` local + toon-heavy pitch (`studio/tts.py`).
- Only 2 H3 Max clips. Bed music: MiniMax Music 2.6 (`tv/public/music/bed.mp3`), SFX: ElevenLabs SFX v2.

## Next
1. Review preview (`tv/out/preview-half.mp4`), fix timing/typography, then generate the 2 H3 clips (`studio/video.py`) into `tv/public/h3-1.mp4`, `h3-2.mp4`.
2. Final 1080p render → Sid review → upload to The Doge Show YouTube (UCcd-IviqTtc0Gq-udPP8fSg) + send to Erik.
3. Day 3: wheel scheduler + RTMP (Twitch first) + clip saver; chat-roast block from the 2025 overlay idea.

## Commands
- Build episode data (VO + visemes): `cd ~/Developer/Personal/privoice && uv run python ~/Developer/Personal/dogeshow/producer/build.py producer/rundown-2026-08-30.json`
- Rebuild mouth sprites: `source <scratch>/cvenv/bin/activate && python studio/mouth/build_sprites_poisson.py` (needs opencv; scratch venv — recreate with `uv venv cvenv && uv pip install opencv-python-headless numpy pillow`)
- Render: `cd tv && npx remotion render Episode out/episode.mp4` · stills: `npx remotion still Episode out/x.jpg --frame=N`
- Venice helpers: `studio/edit.py` (image edit), `studio/video.py` (video queue/retrieve), `studio/audio.py` (music/sfx).

## Blockers
- Venice top-up needed before any 24/7 run (balance ~$3.50).

## Latest handoff — 2026-08-30 (session 1: sample episode build)
Newsroom pull (real: Verge/CoinDesk/HN/CoinGecko + agent-reach X for Erik/AskVenice), screenplay, voice audition → Kokoro,
studio still + idle loop, 12 iterations on the mouth (Poisson blend was the fix), Remotion frame with all overlays, music+SFX.
