import { ToneService } from '../../app/domains/raid-analysis/data/verdict/tone-service';
import type { Tone, ToneLevel } from '../../app/domains/raid-analysis/data/verdict/tone.models';

/** Built outside TestBed, so a component spec can still configure its module after making its rows. */
const tones = new ToneService();

/** A tone made the one way the app makes it, so a fixture row carries what a producer would. */
export function tone(level: ToneLevel | 'muted'): Tone {
  if (level === 'muted') return tones.muted();
  return tones.tone({ tier: level, costClass: 'high' }, { level, n: 10, observed: 0, target: null, excess: 0 });
}
