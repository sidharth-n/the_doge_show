import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {EpisodeData, Segment} from '../types';
// Idle loop (5.08 s) looped by seeking; mouth sprite chosen from the segment's precomputed viseme list.
export const Anchor: React.FC<{data: EpisodeData; seg?: Segment; segStartFrame: number; scale?: number}> = ({data, seg, segStartFrame, scale = 1}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  const loopFrames = Math.round(5.083 * fps); const loopFrame = frame % loopFrames;
  const local = frame - segStartFrame; const v = seg?.visemes && local >= 0 && local < seg.visemes.length ? seg.visemes[local] : 0;
  const a = data.anchor; const sx = 1920 / a.srcW; // loop is 1928x1072 → fit to 1920x1080 cover
  return (
    <AbsoluteFill style={{overflow: 'hidden', transform: `scale(${scale}) translateX(-110px)`, transformOrigin: "top left"}}>
      <OffthreadVideo src={staticFile(a.loop)} muted startFrom={loopFrame} style={{width: 1920, height: 1080, objectFit: 'cover'}} />
      <Img src={staticFile(`mouth/v${v}.png`)} style={{position: 'absolute', left: a.cx * sx - (a.w * sx) / 2, top: (a.cy - (a.w * 224 / 308) / 2) * (1080 / a.srcH), width: a.w * sx}} />
    </AbsoluteFill>
  );
};
