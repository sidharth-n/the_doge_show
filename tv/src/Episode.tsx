import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import type {EpisodeData, Segment} from './types';
import {Anchor} from './components/Anchor';
import {LiveBug, Clock, LowerThird, Ticker, BreakingBar, Dim, TitleCard, EndCard, SectionBumper, StudioBackdrop} from './components/Overlays';
import {QuoteCard, HeadlineCard, BarsCard, PricesCard, HeadlinesCycle, H3Slot, ListCard} from './components/Cards';
import {T} from './theme';
const SFX: Record<string, string> = {sting: 'sfx/sting.mp3', breaking: 'sfx/breaking.mp3', whoosh: 'sfx/whoosh.mp3', wow: 'sfx/wow.mp3'};
export const Episode: React.FC<{data: EpisodeData}> = ({data}) => {
  if (!data) return null;
  const {fps} = useVideoConfig(); const frame = useCurrentFrame();
  const F = (s: number) => Math.round(s * fps);
  const prices = (data.segments.find((s) => s.visual?.kind === 'prices')?.visual as any)?.rows ?? [];
  const tickerItems = data.segments.flatMap((s) => (s.cards ?? []).map((c) => c.text)).concat(['Live 24/7 on YouTube + Twitch', 'Built on the Venice API']);
  const cur = data.segments.find((s) => frame >= F(s.start) && frame < F(s.start + s.duration));
  const LINGER = 2.5;
  // card source: current segment's visual (or timed visuals), else the previous segment's visual lingering for LINGER s
  const idx = cur ? data.segments.indexOf(cur) : -1; const prev = idx > 0 ? data.segments[idx - 1] : undefined;
  const pick = (seg: Segment | undefined, at: number) => {
    if (!seg) return null; const list = seg.visuals ?? (seg.visual ? [{...seg.visual, at: 0}] : []);
    const act = list.filter((v) => at >= v.at).pop(); return act ? {v: act, enter: F(seg.start + act.at), seg} : null;
  };
  const curAt = cur ? (frame - F(cur.start)) / fps : 0;
  let card = pick(cur, curAt);
  if (!card && prev && cur && !(cur.type === 'headlines') && frame < F(prev.start + prev.duration + LINGER)) card = pick(prev, prev.duration);
  const isH3 = card?.v.kind === 'h3';
  const h3 = isH3 ? (card!.v as Extract<typeof card.v, {kind: 'h3'}>) : null;
  const h3full = h3 && (card!.seg.type === 'cold_open' || (h3.fullscreenAfter !== undefined && frame >= F(card!.seg.start + h3.fullscreenAfter)));
  const headlines = cur?.type === 'headlines';
  const twoBox = (card && !isH3) || headlines || (isH3 && !h3full);
  return (
    <AbsoluteFill style={{background: T.ink}}>
      {twoBox ? <StudioBackdrop /> : null}
      {/* anchor: full frame, or framed box on the left in two-box mode */}
      <div style={{position: 'absolute', left: twoBox ? 64 : 0, top: twoBox ? 190 : 0, width: twoBox ? 1920 * 0.5 : 1920, height: twoBox ? 1080 * 0.5 : 1080, overflow: 'hidden', borderRadius: twoBox ? 14 : 0, boxShadow: twoBox ? '0 30px 80px rgba(0,0,0,0.6)' : 'none', outline: twoBox ? `6px solid ${T.yellow}` : 'none'}}>
        <Anchor data={data} seg={cur} segStartFrame={cur ? F(cur.start) : 0} scale={twoBox ? 0.5 : 1} />
      </div>
      {h3 ? <H3Slot src={h3.ref} caption={card!.seg.type === 'cold_open' ? undefined : h3.caption} full={!!h3full} enterFrame={card!.enter} durationFrames={F(card!.seg.start + card!.seg.duration) - card!.enter} /> : null}
      {headlines && cur?.cards ? <HeadlinesCycle cards={cur.cards} enterFrame={F(cur.start)} durationFrames={F(cur.duration)} /> : null}
      {card?.v.kind === 'quote' ? <QuoteCard v={card.v} enterFrame={card.enter} /> : null}
      {card?.v.kind === 'headline' ? <HeadlineCard v={card.v} enterFrame={card.enter} /> : null}
      {card?.v.kind === 'bars' ? <BarsCard v={card.v} enterFrame={card.enter} /> : null}
      {card?.v.kind === 'prices' ? <PricesCard v={card.v} enterFrame={card.enter} /> : null}
      {card?.v.kind === 'list' ? <ListCard v={card.v} enterFrame={card.enter} /> : null}
      {cur?.type === 'cold_open' && frame >= F(cur.start + 4.5) ? <TitleCard enterFrame={F(cur.start + 4.5)} title="THE DOGE SHOW" sub={data.title} /> : null}
      {cur?.type === 'signoff' && frame >= F(cur.start + cur.duration - 5.5) ? <EndCard enterFrame={F(cur.start + cur.duration - 5.5)} /> : null}
      {cur?.type === 'breaking' ? <BreakingBar text={cur.lower?.[1] ?? ''} enterFrame={F(cur.start)} /> : null}
      {cur?.bumper && frame < F(cur.start + 2.7) ? <SectionBumper text={cur.bumper} enterFrame={F(cur.start)} /> : null}
      {/* chrome */}
      {!h3full ? <><LiveBug /><Clock start="18:00" />
        {cur?.lower && cur.type !== 'breaking' && !(cur.type === 'signoff' && frame >= F(cur.start + cur.duration - 5.5)) ? <LowerThird title={cur.lower[0]} sub={cur.lower[1]} enterFrame={F(cur.start)} /> : null}
        <Ticker items={tickerItems} prices={prices} /></> : null}
      {/* audio */}
      {data.segments.map((s) => s.vo ? <Sequence key={s.id} from={F(s.start)} durationInFrames={F(s.duration)}><Audio src={staticFile(s.vo)} /></Sequence> : null)}
      {data.segments.flatMap((s) => (s.sfx ?? []).map((x, i) => SFX[x] ? <Sequence key={s.id + x + i} from={F(s.start)} durationInFrames={F(3)}><Audio src={staticFile(SFX[x])} volume={0.8} /></Sequence> : null))}
      <Audio src={staticFile('music/bed.mp3')} volume={(f) => (f < F(8) ? 0.45 : 0.11)} loop />
    </AbsoluteFill>
  );
};
