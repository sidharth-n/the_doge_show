import {Composition, staticFile} from 'remotion';
import {Episode} from './Episode';
import type {EpisodeData} from './types';
export const Root = () => (
  <Composition id="Episode" component={Episode} width={1920} height={1080} fps={24} durationInFrames={24 * 200}
    defaultProps={{data: null as unknown as EpisodeData}}
    calculateMetadata={async () => {
      const data: EpisodeData = await fetch(staticFile('episode.json')).then((r) => r.json());
      return {durationInFrames: Math.ceil(data.total * data.fps), fps: data.fps, props: {data}};
    }} />
);
