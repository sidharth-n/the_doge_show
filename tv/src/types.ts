export type Visual =
  | {kind: 'h3'; ref: string; caption?: string; fullscreenAfter?: number; background?: boolean}
  | {kind: 'quote'; handle: string; name: string; date: string; text: string; likes?: string}
  | {kind: 'headline'; src: string; title: string; sub?: string}
  | {kind: 'bars'; title: string; rows: {label: string; value: number; text: string}[]; src?: string}
  | {kind: 'prices'; rows: {sym: string; price: string; chg: number}[]}
  | {kind: 'list'; title: string; items: {k: string; v: string}[]; src?: string};
export type Segment = {id: string; type: string; title: string; lower: [string, string] | null; script: string | null;
  start: number; duration: number; vo?: string; visemes?: number[]; visual?: Visual | null; visuals?: (Visual & {at: number})[]; bumper?: string | null; cards?: {tag: string; text: string; src: string}[]; sfx?: string[]};
export type EpisodeData = {title: string; date: string; fps: number; total: number; segments: Segment[];
  anchor: {loop: string; cx: number; cy: number; w: number; srcW: number; srcH: number}};
