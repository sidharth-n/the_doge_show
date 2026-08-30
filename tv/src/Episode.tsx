import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import type {EpisodeData, Segment} from './types';
import {Anchor} from './components/Anchor';
import {LiveBug, Clock, LowerThird, Ticker, BreakingBar, Dim} from './components/Overlays';
import {QuoteCard, HeadlineCard, BarsCard, PricesCard, HeadlinesCycle, H3Slot} from './components/Cards';
import {T} from './theme';
const SFX: Record<string, string> = {sting: 'sfx/sting.mp3', breaking: 'sfx/breaking.mp3', whoosh: 'sfx/whoosh.mp3', wow: 'sfx/wow.mp3'};
export const Episode: React.FC<{data: EpisodeData}> = ({data}) => {
  if (!data) return null;
  const {fps} = useVideoConfig(); const frame = useCurrentFrame();
  const F = (s: number) => Math.round(s * fps);
  const prices = (data.segments.find((s) => s.visual?.kind === 'prices')?.visual as any)?.rows ?? [];
  const tickerItems = data.segments.flatMap((s) => (s.cards ?? []).map((c) => c.text)).concat(['Live 24/7 on YouTube + Twitch', 'Built on the Venice API']);
  const cur = data.segments.find((s) => frame >= F(s.start) && frame < F(s.start + s.duration));
  const hasCard = cur?.visual && cur.visual.kind !== 'h3' || cur?.type === 'headlines';
  const h3 = cur?.visual?.kind === 'h3' ? cur.visual : null;
  const h3full = h3 && (cur?.type === 'cold_open' || (h3.fullscreenAfter !== undefined && frame >= F(cur!.start + h3.fullscreenAfter)));
  // anchor stays full-frame; slides left when a story card is up, and a dark story pane sits behind the card
  const slide = hasCard ? -230 : 0;
  return (
    <AbsoluteFill style={{background: T.ink}}>
      <div style={{position: 'absolute', left: slide, top: 0, width: 1920, height: 1080, transition: 'none'}}>
        <Anchor data={data} seg={cur} segStartFrame={cur ? F(cur.start) : 0} scale={1.12} />
      </div>
      {hasCard ? <div style={{position: 'absolute', right: 0, top: 0, width: 1100, height: 1080, background: 'linear-gradient(90deg, rgba(11,11,15,0) 0%, rgba(11,11,15,0.85) 30%, rgba(11,11,15,0.95) 100%)'}} /> : null}
      {h3 ? <H3Slot src={h3.ref} caption={h3.caption} full={!!h3full} enterFrame={F(cur!.start)} /> : null}
      {/* cards */}
      {cur?.type === 'headlines' && cur.cards ? <HeadlinesCycle cards={cur.cards} enterFrame={F(cur.start)} durationFrames={F(cur.duration)} /> : null}
      {cur?.visual?.kind === 'quote' ? <QuoteCard v={cur.visual} enterFrame={F(cur.start)} /> : null}
      {cur?.visual?.kind === 'headline' ? <HeadlineCard v={cur.visual} enterFrame={F(cur.start)} /> : null}
      {cur?.visual?.kind === 'bars' ? <BarsCard v={cur.visual} enterFrame={F(cur.start)} /> : null}
      {cur?.visual?.kind === 'prices' ? <PricesCard v={cur.visual} enterFrame={F(cur.start)} /> : null}
      {cur?.type === 'breaking' ? <BreakingBar text={cur.lower?.[1] ?? ''} enterFrame={F(cur.start)} /> : null}
      {/* chrome */}
      {!h3full ? <><LiveBug /><Clock start="18:00" />
        {cur?.lower && cur.type !== 'breaking' ? <LowerThird title={cur.lower[0]} sub={cur.lower[1]} enterFrame={F(cur.start)} /> : null}
        <Ticker items={tickerItems} prices={prices} /></> : null}
      {/* audio */}
      {data.segments.map((s) => s.vo ? <Sequence key={s.id} from={F(s.start)} durationInFrames={F(s.duration)}><Audio src={staticFile(s.vo)} /></Sequence> : null)}
      {data.segments.flatMap((s) => (s.sfx ?? []).map((x, i) => SFX[x] ? <Sequence key={s.id + x + i} from={F(s.start)} durationInFrames={F(3)}><Audio src={staticFile(SFX[x])} volume={0.8} /></Sequence> : null))}
      <Audio src={staticFile('music/bed.mp3')} volume={(f) => (f < F(8) ? 0.5 : 0.14)} loop />
    </AbsoluteFill>
  );
};
