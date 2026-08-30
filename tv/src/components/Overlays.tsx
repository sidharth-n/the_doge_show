import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {T} from '../theme';
export const LiveBug: React.FC = () => {
  const f = useCurrentFrame(); const pulse = 0.55 + 0.45 * Math.abs(Math.sin(f / 12));
  return (<div style={{position: 'absolute', left: 48, top: 40, display: 'flex', alignItems: 'center', gap: 14, fontFamily: T.font}}>
    <div style={{background: T.yellow, color: T.ink, fontWeight: 900, fontSize: 26, letterSpacing: 1, padding: '8px 14px', borderRadius: 6}}>THE DOGE SHOW</div>
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
    <div style={{display: 'inline-block', background: breaking ? T.red : T.yellow, color: breaking ? '#fff' : T.ink, fontWeight: 900, fontSize: 30, letterSpacing: 1.5, padding: '8px 18px', borderRadius: '6px 6px 0 0'}}>{title}</div>
    {sub ? <div style={{background: 'rgba(8,8,12,0.92)', color: '#fff', fontWeight: 600, fontSize: 30, padding: '12px 20px', borderRadius: '0 8px 8px 8px', maxWidth: 1100}}>{sub}</div> : null}
  </div>);
};
export const Ticker: React.FC<{items: string[]; prices: {sym: string; price: string; chg: number}[]}> = ({items, prices}) => {
  const f = useCurrentFrame(); const text = items.join('     •     '); const x = -((f * 2.6) % 6000);
  return (<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 92, fontFamily: T.font, display: 'flex'}}>
    <div style={{background: T.ink, color: '#fff', display: 'flex', alignItems: 'center', gap: 28, padding: '0 28px', fontSize: 26, fontWeight: 800, fontFamily: T.mono, zIndex: 2, borderTop: `4px solid ${T.yellow}`}}>
      {prices.map((p) => (<span key={p.sym}>{p.sym} <span style={{color: '#fff'}}>{p.price}</span> <span style={{color: p.chg >= 0 ? T.green : T.red}}>{p.chg >= 0 ? '▲' : '▼'}{Math.abs(p.chg).toFixed(2)}%</span></span>))}
    </div>
    <div style={{flex: 1, background: T.yellow, color: T.ink, overflow: 'hidden', display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 700, whiteSpace: 'nowrap', borderTop: `4px solid ${T.yellow}`}}>
      <div style={{transform: `translateX(${x}px)`, paddingLeft: 1920}}>{text}     •     {text}     •     {text}</div>
    </div>
  </div>);
};
export const BreakingBar: React.FC<{text: string; enterFrame: number}> = ({text, enterFrame}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const s = spring({frame: f - enterFrame, fps, config: {damping: 30, stiffness: 200}}); const w = interpolate(s, [0, 1], [0, 100]);
  return (<div style={{position: 'absolute', left: 0, top: 130, width: `${w}%`, overflow: 'hidden', fontFamily: T.font}}>
    <div style={{background: T.red, color: '#fff', fontWeight: 900, fontSize: 44, letterSpacing: 4, padding: '14px 48px', whiteSpace: 'nowrap', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'}}>BREAKING NEWS <span style={{fontWeight: 600, letterSpacing: 1, marginLeft: 24}}>{text}</span></div>
  </div>);
};
export const Dim: React.FC<{opacity: number}> = ({opacity}) => <AbsoluteFill style={{background: `rgba(0,0,0,${opacity})`}} />;
