export type Clip = { id: string; url: string; poster: string; duration: number; sample?: boolean };
export type Option = { label: string; clipId: string; sample?: boolean };
export type Round = { beat: string; options: Option[] };
export type Channel = {
  id: string;
  name: string;
  tagline: string;
  adult: boolean;
  system: string;
  community?: boolean;
  creator?: string;
  rounds: Round[];
};
export type Manifest = { generated: string; clips: Record<string, Clip>; channels: Channel[] };

export type Bid = { amount: number; name: string; prompt: string; at: number };
export type Wildcard = { name: string; prompt: string; url: string; at: number };

export type LiveState = {
  channelId: string;
  seq: number;
  round: number;
  phase: "voting" | "finalizing";
  endsAt: number;
  votes: number[];
  playing: { clipId: string; label: string; since: number };
  lastWinner?: { option: number; label: string; votes: number };
  topBid?: Bid;
  wildcard?: Wildcard;
};

export type ChatMessage = { id: string; name: string; text: string; at: number; system?: boolean };

export type ChannelView = {
  channel: Channel;
  state: LiveState;
  watching: number;
  now: number;
  clips: Record<string, Clip>;
};
