# Venice Live — the interactive AI-TV opportunity, and the ask to Erik

_Elon · 2026-09-02 · For Sid. Evidence from four research runs (fal.live teardown, realtime-video landscape, Venice API + tokenomics, crypto monetization), plus H3 Max timing tests run today on our own Venice key. Anything marked UNVERIFIED is not confirmed._

---

## 0 · The call in six lines

1. **The category was born five days ago** (28 Aug to 1 Sep): MiniMax H3 Max → a fal engineer's Twitch stream (5.9M views) → fal.live (31 Aug) → World Labs Atlas and Orbis 1.0 (1 Sep). Nobody has won "audience steers the stream" yet, and fal.live has no monetization at all ("Nothing during the pilot program").
2. **Venice already serves H3 Max itself**, since 27 Aug, tagged `uncensored: true` and on the `private` (zero-data-retention) tier. Base H3 on Venice is only `anonymized`. That makes Venice the only uncensored, private H3 Max endpoint we know of. fal's is moderated with an 18+ gate and "layered automated moderation".
3. **Measured today on Venice:** about 2x slower than real time per job, but two parallel jobs already beat real time in aggregate, chaining clips by last frame is pixel-exact, and the price is $0.024 per second (half what we paid on 30 Aug). A continuous stream is feasible now with a lookahead buffer and 3–4 parallel jobs. What Venice lacks is fal's "Director" continuity mode.
4. **The Venice-native twist fal cannot copy:** every DIEM is a $1/day allowance and, per Venice's docs, "Unused DIEM in an epoch does not roll over." Idle allowance is dead compute, about $37K/day of it in total. "Connect your key, your idle DIEM directs the show" turns unused inference into vote weight and airtime. That is a DIEM utility story, which is the story Erik is selling right now.
5. **Money without a token:** pay-to-steer in USDC on Base via x402 (the exact rail Venice uses for its own API) or Base Pay, VVV balance checks for weighted votes, and no project token ever. Coinbase Commerce is dead for India since 31 Mar 2026. First crypto revenue is technically two weeks away.
6. **The ask to Erik changes from "job" to "credits to run this in public for Venice".** Draft DM in §8. Send after Sid confirms the "Vanessa" name and the YouTube link.

---

## 1 · fal.live, torn down

**What it is.** "fal.live | AI television directed by everyone." Launched by @fal on 31 Aug 2026: *"A new platform for infinite, interactive AI livestreams. Pick a channel, prompt what happens next, and watch it generate in real time. You aren't just watching the show. You're directing it."* (1,905 likes, 492K views). Streams on its own site, not Twitch or YouTube.

**How it got there in 48 hours.** On 29 Aug fal engineer Rehan Sheikh hooked H3 Max to Twitch chat: *"Minimax H3 Max generates video faster than you can watch it so I hooked it to a twitch livestream! Now you can watch infinite interdimensional cable"* (13,389 likes, 5.89M views). It was bounced YouTube → Twitch → Kick → Rumble by moderation. r/singularity thread on it: 1,169 upvotes, "but it keeps getting taken down". fal then shipped the polished, moderated product two days later. Raw prototype validated demand, polish followed.

**The mechanic, confirmed live on 2 Sep.** Exactly four candidates, A to D, with vote counts visible (e.g. "A Astronaut spots a shimmering anomaly (2 votes) … D Astronaut activates communication array (1 vote)"). Since the 1 Sep relaunch the options are **LLM-generated** and viewers upvote; on creator channels the audience pitches and votes. The creator's standing system prompt frames every winner ("Your story, your cast, your tone. You write it, and it stays in charge"). UI states: Tuning in → Finalizing → "Votes are in" → Now playing. Vote window length UNVERIFIED. Channels seen: Chaos (88 watching), Sitcom (33), Anime (21), Storybook (12).

**Model.** "H3 Max Director": *"an autoregressive and natively continuous version of H3 Max with up to two minutes of context"* (@fal, 31 Aug). H3 Max itself is fal's post-train of open-weight MiniMax H3, served on NVIDIA GB200 NVL72. fal claims a 5 s 768p clip in under 3 s. Reference-to-video: "up to RTF=1 … and we aim to improve the speed by 2x while slashing costs during this week."

**Money.** None. `/creators` FAQ: *"What does it cost? Nothing during the pilot program."* No tokens, no points, no leaderboard. fal is paying for it as a demo (est. ~$4,000/day per always-on channel at list price, per Theoretically Media).

**Moderation.** Hard 18+ gate, "layered automated moderation before the director ever sees it", live admin controls, a Report Content link in the header.

**Legal flag aimed at fal.** @SilkVectorAI, 31 Aug: the MiniMax H3 Community License excludes the United States; fal is US-based. UNVERIFIED whether this is a real violation, but it is a live pattern to keep in mind for any H3-based public product.

**fal pricing.** H3 Max $0.08/s list, $0.04/s for the first 14 days at 768p (Artificial Analysis, quoted by @burkaygur). Artificial Analysis Video Arena: #1 image-to-video with audio, #3 text-to-video with audio.

## 2 · The landscape: a five-day arms race

- **MiniMax H3** (base) launched 31 Jul 2026, 2K/24fps, 4–15 s, native audio, $0.13/s at MiniMax. Open weights under a Community License that excludes commercial use in the US, EU, UK and South Korea without authorization.
- **H3 Max** (fal post-train) ~27 Aug. @levelsio, 29 Aug (15,325 likes, 2.39M views): *"Today is a very historical moment for AI video generation. You can now generate AI video faster than you can watch it … It generates 15 seconds of video in 9 seconds!"* @designarena: I2V in 6.4 s, T2V in 4.7 s.
- **Decart** (Mirage): live video-to-video under 40 ms; raised $300M at ~$4B in May 2026. Closed.
- **Krea Realtime 14B**: open weights, Self-Forcing distilled from Wan 2.1, 11 fps on a B200, 40 GB+ VRAM. The clearest open realtime model.
- **LTX 2.5** (Lightricks, Aug 2026): open weights, 22B; FastVideo built a faster-than-realtime PoC on it ("30 s 1080p videos with 4.5 s latency", r/StableDiffusion 469 upvotes).
- **World Labs Atlas** (1 Sep, 15,641 likes, 3.9M views) and **Orbis 1.0** (1 Sep, "stream them in real time, with persistent memory") landed the same day: "live world model" positioning is piling up.
- **Google Genie 3**: $200/mo, US only, no API. Not a rail.
- **Format is already iterating.** @henrydaubrez, 1 Sep: *"Two futures generate ahead. The winner becomes canon and the story keeps unfolding … AI video doesn't need another infinite slop machine. It needs a showrunner."* "Infinite Slop" (@levelsio, fal-sponsored compute) and live.reactor.inc are the other running clones.
- **Twitch already pulled the first raw stream.** Any clone needs moderation and platform strategy on day one. Own site plus a restream is the pattern fal chose.

**Read:** the speed tech is commoditized across fal, Krea and Decart within one week. The mechanic (vote to steer) is uncontested and unmonetized. The uncensored-and-private variant is uncontested entirely. Window is now, not in three months.

## 3 · What Venice has today, measured

From `/models?type=video` on 2 Sep: 129 video models. The three that matter:

| Model id | Created | Privacy | Uncensored | Res | Durations |
|---|---|---|---|---|---|
| `minimax-h3-max-text-to-video` | 27 Aug | **private** | true | 480P / 768P | 5–15 s |
| `minimax-h3-max-image-to-video` | 27 Aug | **private** | true | 480P / 768P | 5–15 s |
| `minimax-h3-max-reference-to-video` | 27 Aug | **private** | true | 480P / 768P | 5–15 s |
| `minimax-h3-*` (base, 3 variants) | 31 Jul | anonymized | true | 768P / 2K | 5–15 s |

`private` is Venice's zero-data-retention tier, used for self-hosted weights or a ZDR contract (the Grok pattern). Base H3 is a proxied `anonymized` model. So H3 Max on Venice is either self-hosted or under a ZDR deal. UNVERIFIED which; worth asking Erik directly.

**Timing on our key** (full table in `knowledge/h3max-venice-latency-2026-09-02.md`):

| Job | Clip | Wall | Cost |
|---|---|---|---|
| T2V alone | 5 s | 11 s | $0.12 |
| I2V alone, from last frame | 5 s | 31 s | $0.12 |
| I2V, concurrent | 15 s | 34 s | $0.36 |
| T2V, concurrent | 10 s | 20 s | $0.24 |

- Per-job real-time factor ≈ 2.0–2.3 (Venice's own claim of 15 s in 21 s is RTF 1.4; fal serves under 1). Two concurrent jobs gave 25 s of footage in 34 s. With 3–4 parallel jobs and a 30 s buffer, continuous playback holds.
- **Chaining is exact.** The first frame of the I2V clip matches the last frame fed in; the clip followed its prompt. No Director mode, so continuity is last-frame → `image_url`, plus the reference-to-video variant for character lock.
- **Price: $0.024/s** at 768P. That is below fal's promo ($0.04/s) and a third of fal's list. Continuous single stream ≈ $2,074/day; a vote-round format (one 15 s clip per ~90 s round, ballot screen between) ≈ $350/day.
- API quirks today: `resolution` must be `480P|768P` uppercase; the `audio` field is rejected. Balance on the key: $6.16, 0 DIEM.

**What Venice does not have:** RTF under 1, a continuity model, first/last-frame control, and any live-stream product. That gap is the pitch.

## 4 · The product: "Venice Live", channel 1 = The Doge Show

- **Format.** Rounds of ~90 s. The anchor (our lip-synced Doge, local TTS, near-free) holds the screen and reads the ballot while four candidate next-scenes are generated in parallel. Viewers vote. Winner airs (15 s H3 Max clip, chained from the last frame). The anchor reacts. Repeat. This keeps the H3 Max spend to one to four clips per round instead of 24/7 generation.
- **Channels.** Doge Show (news, our existing pipeline), Chaos (open prompts), and an 18+ uncensored channel that is only possible on Venice. The uncensored channel is the wedge fal cannot follow; it also needs the strongest moderation for illegal content, gate, and Venice's sign-off before it exists.
- **Steering rights.** Three tiers. Free votes for anyone. Weighted votes for wallets holding VVV (balance check on Base, contract `0xacfE…21bf`, 145K holders). Paid "director's chair" per round: highest USDC bid writes the prompt outright, subject to the channel's system prompt.
- **DIEM as fuel (the Venice-native part).** A holder connects their own Venice API key; clips they steer are billed to their daily allowance, not to us. 100 DIEM = $100/day = 69 minutes of H3 Max footage per day, refreshed daily. Today most of that is unused. BYOK is allowed as far as the docs go, allowance expires daily, and wallet-signed x402 requests can draw on linked DIEM without us holding a key: see §5.
- **Distribution.** Own site first (fal's lesson), restream to Twitch with the SFW channels only, YouTube last (AI-disclosure label mandatory, monetization policy risk).
- **What we reuse.** Everything in `tv/` and `studio/`: anchor, mouth compositing, tickers, Remotion scenes, the newsroom fetcher. The new parts are the ballot service, the vote/payment rail, the clip scheduler with parallel generation, and the RTMP output that we already scoped for Day 3.

## 5 · Venice mechanics: DIEM, BYOK, builder programs

**DIEM, verbatim from docs.venice.ai/overview/vvv-diem.** *"Unused DIEM in an epoch does not roll over. The allowance refreshes at 00:00 UTC."* Spend order is DIEM first, then bundled credits, then USD. A holder calls the API *"with a normal Bearer key. No extra headers … are required"*; Venice deducts from staked DIEM automatically. Minimum 0.1 staked DIEM. Per-key epoch consumption limits exist, so one integration cannot drain a whole day's allowance.

**Live market (CoinGecko, 2 Sep):** VVV $16.26, market cap $776M, 47.7M circulating. DIEM $1,458 each, market cap $54M, ~37,267 circulating, supply target 39,500 rising to 40,000 on 14 Sep. The market prices "forever $1/day" as an annuity, not a stablecoin. What fraction of the daily ~$37K allowance goes unused is not published anywhere (no stats page, no Dune). We can only estimate it; a public "idle DIEM meter" on the stream would itself be new data Venice does not have.

**BYOK.** A viewer generating their own key and pasting it into our app is an ordinary Bearer call; nothing in the docs prohibits it, and the terms-of-service page 404s in the current sitemap, so there is no clause to check (UNVERIFIED that no ToS exists elsewhere; ask on Discord before going public).

**Delegation without handing over a key: partial.** There is no sub-key, OAuth or standing grant. But the x402 guide says wallet auth checks *"USDC holdings or linked Venice account with DIEM balance (prioritized first)"*. A viewer who signs a sign-in-with-X message in the browser can have that signed request routed through our app and billed to their linked DIEM. Per-session signature, not a persistent grant, and undocumented as an intermediary pattern. It is a build-it-yourself integration and a good thing to ask Erik to bless.

**Builder programs.**
- No affiliate or referral program exists (`/affiliate`, `/partners`, `/builders` all 404).
- **Incentive Fund:** $5k to $100k paid in VVV, *"solo developers particularly welcome"*, decision in 1 to 2 weeks. This is the formal door for the ask.
- **Lumara Film Festival** (with MoonPay): $100K cash plus 10M Venice credits across 7 categories, closes 15 Sep, "use any preferred AI filmmaking platform". Not live-format, but the Doge Show episode can be entered as-is.
- Erik hands out live API keys in public posts ("dropping an Ox Alpha API key here because why not"). A capped key for us is inside his normal behaviour.

**Erik's last two weeks.** 27 Aug: "Amazing model, generates vids in 15 seconds." ~29 Aug: a long thread on his first "organic agentic x402 magic experience", an agent that found Apify, set up a wallet and paid over x402 on its own. Current CTA in his posts: **"Build without permission."** 1 Sep: @AskVenice shipped H3 Max reference-to-video ("15s clips generated in ~25s. Private and uncensored"), cut VVV emissions to 2.5M/yr, and put Claude Fable 5.1 on Venice. No Venice post mentions live or realtime streaming. Closest adjacent: the Pemba Everest robot, "powered by @livekit, with support from @AskVenice", so a Venice plus realtime-infra pairing already has a precedent.

**Limits for a 24/7 stream.** Video queue 40 req/min, retrieve 120 req/min, a "partner tier" with higher limits and no published threshold. No concurrency cap documented. The queue endpoint still returns 422 for content-policy violations and 409 when likeness consent is required, so "uncensored" is not "no gate"; handle rejected prompts gracefully. `/video/quote` needs no auth, so live pricing can be shown on the ballot.

**Pricing detail.** H3 Max 480P is $0.08 per 5 s ($0.016/s), 768P $0.12, reference-to-video 768P $0.48 per 5 s (4x). Stream at 480P for the ballot candidates and 768P only for the winner if cost bites.

## 6 · How we earn, as a non-crypto builder in India

**Rails that work in 2026.**
- **Coinbase Commerce is dead for us.** Shut for merchants outside the US and Singapore on 31 Mar 2026, no migration path. Do not build on it.
- **x402 (Coinbase + Cloudflare protocol)** for micro-payments: HTTP 402, USDC only, on Base and Solana, zero protocol fee, ~119M transactions on Base. Venice's own API runs on it (`docs.venice.ai/guides/integrations/x402-venice-api`, SDK `veniceai/x402-client`). Paying us the way people pay Venice is a clean story.
- **Base Pay** (`@base-org/account`): one `pay()` call and a prebuilt button, USDC, zero merchant fee, settles to our self-custody wallet. Lowest-effort option for the per-round auction.
- **Privy** embedded wallets (Stripe-owned since Jun 2025) so a viewer with no wallet can pay with email login.
- **thirdweb Pay** is the only route that could take VVV directly (auto-swaps any token); UNVERIFIED that VVV has enough liquidity in its routing.
- VVV is not x402-native. Use it for **balance-gated vote weight**, not as the payment token.

**Precedents.** Freysa (Base, Nov 2024): escalating fee up to $443 per message, 70% to the pot, winner took $47,316. That is the cleanest pay-to-interact precedent. Truth Terminal / GOAT hit ~$1B market cap on a token the builder did not launch and still absorbed the reputational spillover. pump.fun: an estimated 98.6% of launched tokens show rug behaviour; a streamer drained ~$14K live on camera in Feb 2026. "Nothing, Forever" got a 14-day Twitch ban after a cheaper model was swapped in without re-testing moderation.

**Rules we set for ourselves.**
1. Never launch a token. Fees to a wallet only.
2. Pay for creative influence, never pay for a chance to win money back. That keeps us out of gambling policy on Twitch and YouTube.
3. Moderation between generation and broadcast, not only at the prompt.
4. YouTube AI-disclosure on from day one.

**India.** 30% flat plus cess on VDA gains, no loss offset, 1% TDS on transfers over ₹50K/year. Crypto received as income is taxed at slab rate on receipt. TDS mechanics for on-chain payments landing in a self-custody wallet are an enforcement grey zone (UNVERIFIED). RBI still leans toward prohibition for banks; stablecoins are not "currency" under FEMA, so cross-border USDC receipts should be treated like foreign remittance and cashed out through FIU-registered exchanges (CoinDCX, WazirX, Binance; 54 registered as of 9 Mar 2026). Get a CA to confirm Schedule FA treatment before volume.

**Paths that do not depend on us paying API bills.**
- BYOK / DIEM: the steerer's allowance pays for the clip (§4, §5).
- Sponsorship: Venice funds compute for a public "built on Venice" showcase. This is the Erik ask.
- Fiat in parallel: Twitch bits/subs and YouTube Super Chat for non-crypto viewers.
- The product itself: a white-label "interactive channel" kit for token communities, run on their own Venice keys. We sell the software, not the compute.

## 7 · Domains

Checked 2 Sep via RDAP and registry whois.

| Available | Taken |
|---|---|
| venicelive.ai · venicetv.ai · livevenice.ai | venice.live · venicelive.com · venice.tv · venice.stream |
| vvv.live · diem.tv | diem.live · doge.live |
| thedogeshow.live · thedogeshow.tv · dogeshow.live · dogelive.tv · dogetv.live · infinitedoge.tv | whatsnext.live · nextscene.live · nextscene.ai · steer.live · pickthenext.com · neverending.live |
| steerstream.ai · crowdstream.ai · voteclip.ai | |

**Straight advice on "buy it so Venice buys it from us later".** Do not plan on that. Registering a domain containing Venice's mark to resell to Venice is textbook cybersquatting: it is UDRP-exposed and, more importantly, it is the one move that would end the relationship with Erik on sight. Two clean plays instead:

1. **Own the product brand yourself:** `thedogeshow.live` (about $3/yr) now, and one neutral "steer the stream" name if we generalise (`steerstream.ai` or `crowdstream.ai`). This is the asset that has value whether or not Venice ever pays.
2. **If we want `venicelive.ai`, register it and say so in the DM**, offering to hand it over free if they want the name. That reads as goodwill, not a shakedown. Register nothing else with "venice" in it.

## 8 · The ask to Erik (rewritten from "job" to "credits")

Why this ask is stronger: Erik amplifies shipped builds (his feed is 80% amplification of things built on Venice), he is currently pushing video (Lumara festival, $100K, closes 15 Sep), and the DIEM-utility angle is his own tokenomics story. A credits ask for a public experiment is small, concrete and flattering; a job ask is neither.

Draft (Telegram, plain text, no formatting):

> Hey Erik, quick one. I spoke with Vanessa last week and my résumé is with Tim, so no ask on that front here.
>
> Different thing. I saw fal.live go up on Sunday and thought: this belongs on Venice. I already have a working AI news channel built on your API (The Doge Show, 3-minute episode: [YouTube link]). Yesterday I tested H3 Max on Venice for the live format: 15 seconds of footage in 34 seconds, two jobs in parallel beat real time, last-frame chaining is exact, and it costs $0.024 a second. So an audience-steered live channel is buildable on Venice this week, and yours is the only H3 Max that is uncensored and private.
>
> The part fal can't do: let VVV and DIEM holders connect their key and spend their idle daily allowance to direct what airs next. Unused DIEM becomes airtime. Paid director slots in USDC over x402, the same rail you use.
>
> The ask: could Venice give me API credits (or a DIEM allocation) for a 3-week public experiment, built and shown as "on Venice"? I'll ship it in the open with a moderated SFW channel first, share every number, and hand over the keys or the domain if you want it in-house. If a capped key is easier than credits, that works too, and if the Incentive Fund is the right door I'll apply there instead.
>
> Happy to send the demo link the moment the first live round runs.

Checks before sending: the "Vanessa" name (Sid's original text said "avennsa"), the YouTube link, and Sid's decision on whether to mention the domain at all.

## 9 · Risks, honestly

- **Speed gap.** Venice's H3 Max is 2x slower than real time per job. Continuous playback depends on parallel jobs; if Venice rate-limits video concurrency, rounds get longer. Ask Erik about video concurrency and Director/continuity plans.
- **Cost.** $350/day for the vote-round format is still $10K/month. Without credits, DIEM fuel or paying steerers, we cannot run 24/7. Run scheduled "live hours" until one of those lands.
- **License.** H3 is under MiniMax's Community License with territory exclusions. On Venice's API that is Venice's problem, not ours. Self-hosting is off the table.
- **Platform bans.** The first raw H3 stream was removed from three platforms in a day. Own site plus SFW restream only.
- **Reputation with Venice.** No token, no venice-branded domain for resale, no uncensored channel without their nod.
- **Regulatory.** Crypto income in India is taxable and FEMA-grey; small volumes first, CA before scale.

## 10 · Next 72 hours

1. Sid: confirm Vanessa's name, the YouTube link, domain decision. Register `thedogeshow.live`.
2. Send the Erik DM (§8).
3. Build the ballot loop on the existing pipeline: LLM proposes 4 options → parallel H3 Max I2V → vote (free, web) → play winner → anchor reaction. Local first, then own site.
4. Add Base Pay for a single "director's chair" per round and a VVV balance check for weighted votes.
5. First public live hour on our site, restream SFW to Twitch. Post the numbers.
6. In parallel: enter the Doge Show episode in Lumara before 15 Sep (free credits if it places), and apply to the Incentive Fund with the live demo once it runs.
