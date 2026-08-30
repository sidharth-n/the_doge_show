# dogeshow — State

_Last updated: 2026-08-30_

## Now
- **Sample episode DONE and locked:** `tv/out/episode-final-v3.mp4` (1920x1080, 3:35, ~87 MB), copy at
  `~/Desktop/DogeShow/dogeshow-2026-08-30-this-week-in-ai-crypto-v3.mp4`, sent to Sid's Telegram.
  Branch `main`. Venice balance ≈ $2.30.
- **Shipping in progress:** Sid is uploading v3 to The Doge Show YouTube channel HIMSELF (manual, not via
  youtube-api skill). Metadata (title/description/tags) was drafted in session 2 and handed over in chat.
- **Telegram message to Erik Voorhees drafted and approved in wording** (session 2). Waiting on the YouTube
  link to append, then send text + link (+ video if Sid wants) via the Telegram MCP. Nothing sent yet.

## Next
1. Get the YouTube link from Sid → add to the Erik message → send on Telegram (only on Sid's "go").
2. Optional: trim ~20 s from the AI block (a2/a3) to hit ~3:10 and re-render.
3. Day 3 scope: wheel scheduler + RTMP (Twitch first) + clip saver; chat-roast block; needs a Venice top-up.

## Blockers
- Venice balance $2.30 (fine for tweaks, not for a 24/7 run).
- YouTube API for The Doge Show channel: not authed. Sid chose to do the upload/auth himself; do NOT run
  `auth.mjs` for him. (If ever needed: `YT_CREDENTIALS=.../.yt-credentials-dogeshow.json node auth.mjs`;
  port 8765 is occupied by a stray `python -m http.server 8765`, so the port must be made configurable first.)

## Latest handoff — 2026-08-30 (session 2, short: ship prep)
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
