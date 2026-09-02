# H3 Max on Venice — measured latency and cost (2026-09-02)

Measured with `studio/video.py` on Sid's Venice key. Poll interval 6 s, so true generation time is up
to 6 s less than wall time. All clips 1344x768, 24 fps, 768P. Prices are live quotes from `/video/quote`.

| Run | Model id | Clip | Wall | Cost | Note |
|---|---|---|---|---|---|
| 1 | minimax-h3-max-text-to-video | 5 s | 11 s | $0.12 | alone |
| 2 | minimax-h3-max-image-to-video (last frame of run 1) | 5 s | 31 s | $0.12 | alone, outlier or queue |
| 3 | minimax-h3-max-image-to-video (same frame) | 15 s | 34 s | $0.36 | concurrent with run 4 |
| 4 | minimax-h3-max-text-to-video | 10 s | 20 s | $0.24 | concurrent with run 3 |

- Price is **$0.024/s** at 768P (the $0.24/5 s we recorded on 08-30 has halved; the "50% off until 09-01"
  price appears to have stuck, or list price dropped). fal lists H3 Max at $0.08/s list, $0.04/s promo.
- Real-time factor (RTF, gen time / clip length) on Venice ≈ **2.0–2.3** for a single job. Not faster than
  real time (fal's own serving claims RTF < 1). But **two concurrent jobs produced 25 s of footage in 34 s**
  (aggregate RTF ≈ 1.4), so with 3–4 parallel jobs and a lookahead buffer a continuous stream is feasible.
- **Chaining works:** first frame of the i2v clip is pixel-identical to the last frame fed in; the 15 s clip
  followed the prompt (anchor → rocket launch). No first/last-frame "Director" mode on Venice; continuity
  must be done by last-frame → image_url chaining.
- API quirks found today: `resolution` enum is `480P|768P` (uppercase); the `audio` field is now rejected
  ("This model does not support audio configuration") — remove `--no-audio`.
- 24/7 cost at $0.024/s: continuous single stream ≈ **$2,074/day**; 4 candidates pre-generated per round
  ≈ 4x that. A vote-round format (one 15 s clip per ~90 s round, ballot screen in between) ≈ **$350/day**.
- Test clips: `~/Desktop/DogeShow/{t2v,t2v10,i2v15}.mp4`.
