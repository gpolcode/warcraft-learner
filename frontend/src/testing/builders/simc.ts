import type { SpellRecord, SpellEffect } from '../../app/domains/raid-analysis/data/simc/simc.models';
import { COMBO_POINT_TYPE, ENERGY_TYPE } from '../../app/domains/raid-analysis/data/rotation/rotation-rules/rule-fixtures';

export function spellRecord(over: Partial<SpellRecord> & Pick<SpellRecord, 'id' | 'name'>): SpellRecord {
  return {
    passive: false, hidden: false, className: null, talent: null, cooldownS: null, rechargeS: null, durationS: null,
    maxStacks: null, powerTypes: [], gcd: true, castTimeS: null, executeHealthPct: null, effects: [], ...over,
  };
}

export function selfAura(subtype = 'Dummy', baseValue: number | null = null): SpellEffect {
  return { type: 'Apply Aura', subtype, target: 'self', baseValue };
}

/** A builder spends energy; a finisher spends combo points too. */
export function builder(id: number, name: string, over: Partial<SpellRecord> = {}): SpellRecord {
  return spellRecord({ id, name, powerTypes: [ENERGY_TYPE], ...over });
}

export function finisher(id: number, name: string, over: Partial<SpellRecord> = {}): SpellRecord {
  return spellRecord({ id, name, powerTypes: [ENERGY_TYPE, COMBO_POINT_TYPE], ...over });
}
