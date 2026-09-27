import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { SHADOW_DANCE, SHADOW_BLADES, SECRET_TECHNIQUE, EVISCERATE } from '../../../../../../../testing/spell-ids';
import type { WclEvent } from '../../../wcl/wcl.models';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { PriorCastFacts } from './prior-cast-facts';

const UTILITY = 999;
const list = priorityList({
  spells: {
    secret_technique: planSpell('Secret Technique', [SECRET_TECHNIQUE]),
    eviscerate: planSpell('Eviscerate', [EVISCERATE]),
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { gcd: 0 }),
    shadow_blades: planSpell('Shadow Blades', [SHADOW_BLADES], { gcd: 0 }),
  },
});
const prior = TestBed.inject(PriorCastFacts);

const read = (name: string, casts: WclEvent[], atS: number, action = 'x') => {
  const ctx = factContext(list, { casts });
  return prior.read(name, castAt(ctx, atS), action, ctx);
};

describe('PriorCastFacts', () => {
  const sequence = [cast(EVISCERATE, 1), cast(SHADOW_DANCE, 2), cast(UTILITY, 3), cast(SECRET_TECHNIQUE, 4)];

  it('reads the last cast on the global cooldown, skipping off-GCD and utility presses', () => {
    expect(read('prev_gcd.1.eviscerate', sequence, 4)).toEqual([1, 1]);
    expect(read('prev_gcd.1.shadow_dance', sequence, 4)).toEqual([0, 0]);
  });

  it('reads further back on the global cooldown', () => {
    const longer = [cast(SECRET_TECHNIQUE, 0.5), ...sequence];
    expect(read('prev_gcd.2.secret_technique', longer, 4)).toEqual([1, 1]);
  });

  it('reads the last listed cast of any kind', () => {
    expect(read('prev.shadow_dance', sequence, 4)).toEqual([1, 1]);
  });

  it('reads the off-GCD casts since the last one on it', () => {
    expect(read('prev_off_gcd.shadow_dance', sequence, 4)).toEqual([1, 1]);
    expect(read('prev_off_gcd.shadow_blades', sequence, 4)).toEqual([0, 0]);
  });

  it('reads a combo strike as a press that does not repeat the last one on the global cooldown', () => {
    expect(read('combo_strike', sequence, 4, 'secret_technique')).toEqual([1, 1]);
    expect(read('combo_strike', sequence, 4, 'eviscerate')).toEqual([0, 0]);
  });

  it('reads the seconds since a button was last pressed', () => {
    expect(read('action.eviscerate.last_used', sequence, 4)).toEqual([3, 3]);
  });
});
