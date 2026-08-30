import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {T} from '../theme';
import type {Visual} from '../types';
const Panel: React.FC<{enterFrame: number; children: React.ReactNode; wide?: boolean}> = ({enterFrame, children, wide}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const s = spring({frame: f - enterFrame, fps, config: {damping: 200}});
  return (<div style={{position: 'absolute', right: 64, top: 150, width: wide ? 1180 : 820, transform: `translateX(${interpolate(s, [0, 1], [400, 0])}px)`, opacity: s, fontFamily: T.font}}>{children}</div>);
};
export const QuoteCard: React.FC<{v: Extract<Visual, {kind: 'quote'}>; enterFrame: number}> = ({v, enterFrame}) => (
  <Panel enterFrame={enterFrame}><div style={{background: '#fff', color: '#0f1419', borderRadius: 20, padding: '30px 34px', boxShadow: '0 30px 80px rgba(0,0,0,0.55)'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}><div style={{width: 56, height: 56, borderRadius: 28, background: v.handle.startsWith('r/') ? '#ff4500' : '#111'}} />
      <div><div style={{fontWeight: 800, fontSize: 28}}>{v.name}</div><div style={{color: '#536471', fontSize: 24}}>{v.handle}</div></div></div>
    <div style={{fontSize: 30, lineHeight: 1.3, marginTop: 20, fontWeight: 500}}>{v.text}</div>
    <div style={{color: '#536471', fontSize: 22, marginTop: 20, display: 'flex', gap: 24}}><span>{v.date}</span>{v.likes ? <span>♥ {v.likes}</span> : null}</div>
  </div></Panel>);
export const HeadlineCard: React.FC<{v: Extract<Visual, {kind: 'headline'}>; enterFrame: number}> = ({v, enterFrame}) => (
  <Panel enterFrame={enterFrame}><div style={{background: T.panel, borderLeft: `10px solid ${T.yellow}`, borderRadius: 12, padding: '28px 34px', color: '#fff', boxShadow: '0 30px 80px rgba(0,0,0,0.55)'}}>
    <div style={{color: T.yellow, fontWeight: 800, fontSize: 22, letterSpacing: 2}}>{v.src.toUpperCase()}</div>
    <div style={{fontFamily: T.head, fontSize: 40, fontWeight: 700, lineHeight: 1.15, marginTop: 12}}>{v.title}</div>
    {v.sub ? <div style={{fontSize: 26, color: T.muted, marginTop: 14, lineHeight: 1.3}}>{v.sub}</div> : null}
  </div></Panel>);
export const BarsCard: React.FC<{v: Extract<Visual, {kind: 'bars'}>; enterFrame: number}> = ({v, enterFrame}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const max = Math.max(...v.rows.map((r) => r.value));
  return (<Panel enterFrame={enterFrame}><div style={{background: T.panel, borderRadius: 12, padding: '28px 34px', color: '#fff'}}>
    <div style={{fontSize: 26, fontWeight: 800, color: T.yellow, letterSpacing: 1}}>{v.title.toUpperCase()}</div>
    {v.rows.map((r, i) => { const s = spring({frame: f - enterFrame - 10 - i * 8, fps, config: {damping: 200}}); const w = interpolate(s, [0, 1], [0, (r.value / max) * 100]);
      return (<div key={r.label} style={{marginTop: 22}}><div style={{fontSize: 26, fontWeight: 600}}>{r.label}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 8}}><div style={{height: 34, width: `${Math.max(w, 4) * 0.8}%`, background: i ? T.green : T.red, borderRadius: 6}} /><div style={{fontFamily: T.mono, fontSize: 28, fontWeight: 800, whiteSpace: 'nowrap'}}>{r.text}</div></div></div>); })}
    {v.src ? <div style={{color: T.muted, fontSize: 20, marginTop: 20}}>Source: {v.src}</div> : null}
  </div></Panel>);
};
export const PricesCard: React.FC<{v: Extract<Visual, {kind: 'prices'}>; enterFrame: number}> = ({v, enterFrame}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return (<Panel enterFrame={enterFrame}><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16}}>
    {v.rows.map((r, i) => { const s = spring({frame: f - enterFrame - i * 6, fps, config: {damping: 200}});
      return (<div key={r.sym} style={{background: T.panel, borderRadius: 14, padding: '22px 26px', color: '#fff', transform: `scale(${0.9 + 0.1 * s})`, opacity: s}}>
        <div style={{fontSize: 24, fontWeight: 800, color: T.muted, letterSpacing: 2}}>{r.sym}</div>
        <div style={{fontSize: 44, fontWeight: 900, fontFamily: T.mono, marginTop: 4, whiteSpace: 'nowrap'}}>{r.price}</div>
        <div style={{fontSize: 24, fontWeight: 800, color: r.chg >= 0 ? T.green : T.red, marginTop: 4, whiteSpace: 'nowrap'}}>{r.chg >= 0 ? '▲' : '▼'} {Math.abs(r.chg).toFixed(2)}% 24h</div></div>); })}
  </div></Panel>);
};
export const HeadlinesCycle: React.FC<{cards: {tag: string; text: string; src: string}[]; enterFrame: number; durationFrames: number}> = ({cards, enterFrame, durationFrames}) => {
  const f = useCurrentFrame(); const per = durationFrames / cards.length; const i = Math.min(cards.length - 1, Math.max(0, Math.floor((f - enterFrame) / per))); const c = cards[i];
  return (<Panel enterFrame={enterFrame + i * per}><div style={{background: T.panel, borderRadius: 12, padding: '28px 34px', color: '#fff', borderLeft: `10px solid ${T.yellow}`}}>
    <div style={{display: 'flex', justifyContent: 'space-between', color: T.yellow, fontWeight: 800, fontSize: 22, letterSpacing: 2}}><span>{c.tag}</span><span style={{color: T.muted}}>{i + 1} / {cards.length}</span></div>
    <div style={{fontFamily: T.head, fontSize: 38, fontWeight: 700, lineHeight: 1.15, marginTop: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{c.text}</div><div style={{color: T.muted, fontSize: 22, marginTop: 14}}>{c.src}</div>
  </div></Panel>);
};
export const H3Slot: React.FC<{src: string; caption?: string; full: boolean; enterFrame: number; durationFrames: number}> = ({src, caption, full, enterFrame, durationFrames}) => {
  const box = full ? {left: 0, top: 0, width: 1920, height: 1080, borderRadius: 0} : {left: 1040, top: 190, width: 816, height: 459, borderRadius: 14};
  return (<Sequence from={enterFrame} durationInFrames={durationFrames} layout="none">
    <div style={{position: 'absolute', ...box, overflow: 'hidden', boxShadow: full ? 'none' : '0 30px 80px rgba(0,0,0,0.6)', outline: full ? 'none' : `6px solid ${T.yellow}`, background: '#000'}}>
      <OffthreadVideo src={staticFile(src)} muted loop style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      {caption ? <div style={{position: 'absolute', left: 24, bottom: 20, background: 'rgba(0,0,0,0.7)', color: '#fff', fontFamily: T.font, fontSize: 24, fontWeight: 700, padding: '8px 14px', borderRadius: 6}}>{caption}</div> : null}
    </div>
  </Sequence>);
};
export const ListCard: React.FC<{v: Extract<Visual, {kind: 'list'}>; enterFrame: number}> = ({v, enterFrame}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return (<Panel enterFrame={enterFrame}><div style={{background: T.panel, borderRadius: 12, padding: '26px 34px', color: '#fff', borderLeft: `10px solid ${T.yellow}`}}>
    <div style={{fontFamily: T.head, fontWeight: 700, fontSize: 40, color: T.yellow, letterSpacing: 2}}>{v.title.toUpperCase()}</div>
    {v.items.map((it, i) => { const s = spring({frame: f - enterFrame - 6 - i * 5, fps, config: {damping: 200}});
      return (<div key={it.k} style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 16, opacity: s, transform: `translateX(${(1 - s) * 40}px)`}}>
        <div style={{fontFamily: T.head, fontWeight: 700, fontSize: 34, whiteSpace: 'nowrap'}}>{it.k}</div><div style={{fontSize: 22, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{it.v}</div></div>); })}
    {v.src ? <div style={{color: T.muted, fontSize: 20, marginTop: 18}}>Source: {v.src}</div> : null}
  </div></Panel>);
};
