# Learning
- **2026-08-30 · Voice pick · Audition locally first, let Sid pick by ear.** Sid chose a free on-device Kokoro
  voice with a crude ffmpeg pitch shift over every hosted TTS (Inworld/MiniMax/ElevenLabs). Comic character
  comes from *treatment + persona writing*, not from a premium model. Example: `am_santa` +32% pitch beat all.
- **2026-08-30 · Newsroom · Never let a haiku fetcher "aggregate manually".** It padded the Venice bucket with
  invented items (generic URLs, made-up engagement). Rule: every item needs a real article/post URL; X goes
  through agent-reach `twitter -c user-posts <handle>`; audit the JSON before scripting.
- **2026-08-30 · Mouth compositing · Alpha-blending a patch from a different render always leaves a seam; Poisson (cv2.seamlessClone) against the actual video frame does not.** 12 passes taught: (1) register edits to base first (scale/shift search), (2) mask the mouth only — never fur, (3) blend against the *loop frame*, not the still (compression shifts tone), (4) cv2.seamlessClone mutates the mask in place — pass `.copy()`, (5) wide margin + wide feather hides the cut, (6) no cross-fades between visemes (ghosting) — step-limit the motion instead.
- **2026-08-30 · Venice API quirks:** `/video/retrieve` and `/audio/retrieve` need `model` too and return raw bytes when done; `end_image_url` requires `audio:false`; `resolution` rejected by Kling; music models reject `duration_seconds`; `/image/edit` takes ONE image (paste a logo into the corner and prompt "put it on the cap" works); big chat models drop the connection on long non-streamed completions — write the script yourself or use a small model.
