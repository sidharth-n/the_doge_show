import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {T} from '../theme';
export const LiveBug: React.FC = () => {
  const f = useCurrentFrame(); const pulse = 0.55 + 0.45 * Math.abs(Math.sin(f / 12));
  return (<div style={{position: 'absolute', left: 48, top: 40, display: 'flex', alignItems: 'center', gap: 14, fontFamily: T.font}}>
    <div style={{background: T.yellow, color: T.ink, fontFamily: T.head, fontWeight: 700, fontSize: 30, letterSpacing: 2, padding: '6px 14px', borderRadius: 6}}>THE DOGE SHOW</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.55)', padding: '8px 14px', borderRadius: 6}}>
      <div style={{width: 14, height: 14, borderRadius: 7, background: T.red, opacity: pulse}} /><span style={{color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: 2}}>LIVE</span></div>
  </div>);
};
export const Clock: React.FC<{start: string}> = ({start}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const [h, m] = start.split(':').map(Number); const t = h * 3600 + m * 60 + Math.floor(f / fps);
  const hh = String(Math.floor(t / 3600) % 24).padStart(2, '0'), mm = String(Math.floor(t / 60) % 60).padStart(2, '0');
  return <div style={{position: 'absolute', right: 48, top: 44, color: '#fff', fontFamily: T.mono, fontSize: 26, fontWeight: 700, background: 'rgba(0,0,0,0.55)', padding: '6px 12px', borderRadius: 6}}>{hh}:{mm} UTC</div>;
};
export const LowerThird: React.FC<{title: string; sub?: string; enterFrame: number; breaking?: boolean}> = ({title, sub, enterFrame, breaking}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const s = spring({frame: f - enterFrame, fps, config: {damping: 200}}); const x = interpolate(s, [0, 1], [-900, 0]);
  return (<div style={{position: 'absolute', left: 48, bottom: 118, transform: `translateX(${x}px)`, fontFamily: T.font}}>
    <div style={{display: 'inline-block', background: breaking ? T.red : T.yellow, color: breaking ? '#fff' : T.ink, fontFamily: T.head, fontWeight: 700, fontSize: 34, letterSpacing: 2, padding: '6px 18px', borderRadius: '6px 6px 0 0'}}>{title}</div>
    {sub ? <div style={{background: 'rgba(8,8,12,0.92)', color: '#fff', fontWeight: 600, fontSize: 30, padding: '12px 20px', borderRadius: '0 8px 8px 8px', maxWidth: 1100}}>{sub}</div> : null}
  </div>);
};
export const Ticker: React.FC<{items: string[]; prices: {sym: string; price: string; chg: number}[]}> = ({items, prices}) => {
  const f = useCurrentFrame(); const text = items.join('     •     '); const x = -((f * 2.6) % 6000);
  return (<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 92, fontFamily: T.font, display: 'flex'}}>
    <div style={{background: T.ink, color: '#fff', display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', fontSize: 21, fontWeight: 800, fontFamily: T.mono, zIndex: 2, borderTop: `4px solid ${T.yellow}`}}>
      {prices.map((p) => (<span key={p.sym}>{p.sym} <span style={{color: '#fff'}}>{p.price}</span> <span style={{color: p.chg >= 0 ? T.green : T.red}}>{p.chg >= 0 ? '▲' : '▼'}{Math.abs(p.chg).toFixed(2)}%</span></span>))}
    </div>
    <div style={{flex: 1, background: T.yellow, color: T.ink, overflow: 'hidden', display: 'flex', alignItems: 'center', fontSize: 30, fontWeight: 700, fontFamily: T.head, letterSpacing: 1, whiteSpace: 'nowrap', borderTop: `4px solid ${T.yellow}`}}>
      <div style={{transform: `translateX(${x}px)`, paddingLeft: 1920}}>{text}     •     {text}     •     {text}</div>
    </div>
  </div>);
};
export const BreakingBar: React.FC<{text: string; enterFrame: number}> = ({text, enterFrame}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const s = spring({frame: f - enterFrame, fps, config: {damping: 30, stiffness: 200}}); const w = interpolate(s, [0, 1], [0, 100]);
  return (<div style={{position: 'absolute', left: 0, top: 130, width: `${w}%`, overflow: 'hidden', fontFamily: T.font}}>
    <div style={{background: T.red, color: '#fff', fontFamily: T.head, fontWeight: 700, fontSize: 52, letterSpacing: 4, padding: '10px 48px', whiteSpace: 'nowrap', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'}}>BREAKING NEWS <span style={{fontWeight: 600, letterSpacing: 1, marginLeft: 24}}>{text}</span></div>
  </div>);
};
export const Dim: React.FC<{opacity: number}> = ({opacity}) => <AbsoluteFill style={{background: `rgba(0,0,0,${opacity})`}} />;

export const TitleCard: React.FC<{enterFrame: number; title: string; sub: string}> = ({enterFrame, title, sub}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const s = spring({frame: f - enterFrame, fps, config: {damping: 14, stiffness: 120}});
  return (<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)'}}>
    <div style={{transform: `scale(${0.8 + 0.2 * s})`, opacity: s, textAlign: 'center', marginTop: 260}}>
      <div style={{fontFamily: T.head, fontWeight: 700, fontSize: 150, color: T.yellow, letterSpacing: 6, textShadow: '0 0 40px rgba(255,200,61,0.6), 0 10px 40px rgba(0,0,0,0.8)', lineHeight: 1}}>THE DOGE SHOW</div>
      <div style={{fontFamily: T.head, fontWeight: 500, fontSize: 54, color: '#fff', letterSpacing: 8, marginTop: 10}}>{sub.toUpperCase()}</div>
    </div></AbsoluteFill>);
};
export const EndCard: React.FC<{enterFrame: number}> = ({enterFrame}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const s = spring({frame: f - enterFrame, fps, config: {damping: 200}});
  return (<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150}}>
    <div style={{opacity: s, transform: `translateY(${(1 - s) * 60}px)`, background: 'rgba(8,8,12,0.9)', borderTop: `8px solid ${T.yellow}`, padding: '26px 60px', borderRadius: 12, textAlign: 'center'}}>
      <div style={{fontFamily: T.head, fontWeight: 700, fontSize: 64, color: '#fff', letterSpacing: 3}}>LIVE 24/7 · YOUTUBE · TWITCH</div>
      <div style={{fontFamily: T.body, fontWeight: 600, fontSize: 30, color: T.muted, marginTop: 8}}>built entirely on the Venice API · thedogeshow</div>
    </div></AbsoluteFill>);
};

export const SectionBumper: React.FC<{text: string; enterFrame: number}> = ({text, enterFrame}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f - enterFrame;
  const s = spring({frame: t, fps, config: {damping: 22, stiffness: 160}}); const out = interpolate(t, [fps * 2.2, fps * 2.7], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<div style={{position: 'absolute', left: 0, right: 0, top: 380, opacity: out, transform: `scaleX(${s})`, transformOrigin: 'left', fontFamily: T.head}}>
    <div style={{background: T.yellow, height: 14}} />
    <div style={{background: 'rgba(8,8,12,0.94)', padding: '26px 80px', color: '#fff', fontWeight: 700, fontSize: 120, letterSpacing: 8, lineHeight: 1}}>{text}</div>
    <div style={{background: T.yellow, height: 14}} />
  </div>);
};
export const StudioBackdrop: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(1200px 700px at 30% 40%, #2a1c0e 0%, #12100f 55%, #0b0b0f 100%)'}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,200,61,0.05) 0 2px, transparent 2px 46px)'}} />
    <div style={{position: 'absolute', left: 60, bottom: 140, fontFamily: T.head, fontWeight: 700, fontSize: 200, color: 'rgba(255,200,61,0.06)', letterSpacing: 10}}>DOGE</div>
  </AbsoluteFill>
);
