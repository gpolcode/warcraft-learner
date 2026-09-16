import type { ParseSample } from '../../app/domains/raid-analysis/data/rulebook-build/rulebook-build.models';
import type { WclEvent } from '../../app/domains/raid-analysis/data/wcl/wcl.models';
import type { TimedEvent } from '../../app/domains/raid-analysis/data/analysis/wcl-projections-service';

const MS_PER_SECOND = 1000;
const DEFAULT_FIGHT_S = 100;

function timed(events: WclEvent[]): TimedEvent[] {
  return events.map(event => ({ ...event, atS: event.timestamp / MS_PER_SECOND }));
}

type SampleSeed = Omit<Partial<ParseSample>, 'casts' | 'buffs' | 'debuffs'> & { casts?: WclEvent[]; buffs?: WclEvent[]; debuffs?: WclEvent[] };

/** One sampled top parse from raw WCL events, stamped with fight-relative seconds. */
export function parseSample(over: SampleSeed = {}): ParseSample {
  return {
    fightDurationS: over.fightDurationS ?? DEFAULT_FIGHT_S,
    casts: timed(over.casts ?? []), buffs: timed(over.buffs ?? []), debuffs: timed(over.debuffs ?? []),
  };
}
