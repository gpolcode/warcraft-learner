import type { SpellRecord, SpellEffect } from '../../app/domains/raid-analysis/data/simc/simc.models';
import type { ParseSample } from '../../app/domains/raid-analysis/data/rulebook-build/rulebook-build.models';
import type { WclEvent } from '../../app/domains/raid-analysis/data/wcl/wcl.models';
import type { TimedEvent } from '../../app/domains/raid-analysis/data/analysis/wcl-projections-service';

const MS_PER_SECOND = 1000;
const ENERGY = 3;
const COMBO_POINTS = 4;

export function spellRecord(over: Partial<SpellRecord> & Pick<SpellRecord, 'id' | 'name'>): SpellRecord {
  return {
    passive: false, hidden: false, className: null, talent: null, cooldownS: null, rechargeS: null, durationS: null,
    maxStacks: null, resources: [], gcd: true, castTimeS: null, executeHealthPct: null, effects: [], ...over,
  };
}

export function selfAura(subtype = 'Dummy', baseValue: number | null = null): SpellEffect {
  return { type: 'Apply Aura', subtype, target: 'self', baseValue };
}

export function enemyDot(): SpellEffect {
  return { type: 'Apply Aura', subtype: 'Periodic Damage', target: 'enemy', baseValue: 0 };
}

/** A builder costs energy; a finisher spends combo points too. */
export function builder(id: number, name: string, over: Partial<SpellRecord> = {}): SpellRecord {
  return spellRecord({ id, name, resources: [{ powerType: ENERGY, amount: 35 }], ...over });
}

export function finisher(id: number, name: string, over: Partial<SpellRecord> = {}): SpellRecord {
  return spellRecord({ id, name, resources: [{ powerType: ENERGY, amount: 35 }, { powerType: COMBO_POINTS, amount: 1 }], ...over });
}

function timed(events: WclEvent[]): TimedEvent[] {
  return events.map(event => ({ ...event, atS: event.timestamp / MS_PER_SECOND }));
}

type SampleSeed = Omit<Partial<ParseSample>, 'casts' | 'buffs' | 'debuffs'> & { casts?: WclEvent[]; buffs?: WclEvent[]; debuffs?: WclEvent[] };

export function parseSample(over: SampleSeed = {}): ParseSample {
  return {
    fightDurationS: over.fightDurationS ?? 100,
    casts: timed(over.casts ?? []), buffs: timed(over.buffs ?? []), debuffs: timed(over.debuffs ?? []),
  };
}
