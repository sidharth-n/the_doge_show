import {loadFont as loadOswald} from '@remotion/google-fonts/Oswald';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
const o = loadOswald('normal', {weights: ['500', '700']}); const i = loadInter('normal', {weights: ['500', '700', '800']});
export const HEAD = o.fontFamily; export const BODY = i.fontFamily;
