import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { beginCast, cast } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { WRATH, STARFIRE } from '../../../../../../../testing/spell-ids';
import type { WclEvent } from '../../../wcl/wcl.models';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { TimingFacts } from './timing-facts';

const BASE_GCD_S = 1.5;
const STARFIRE_S = 2;
/** A hardcast logged in 1.5 s of its 2 s base: the player cast at 0.75 of base time. */
const HASTE_FACTOR = 0.75;
const OFF_GCD = 777;
const list = (gcd = BASE_GCD_S) => priorityList({
  lines: [{ action: 'wrath', terms: [] }],
  spells: {
    wrath: planSpell('Wrath', [WRATH], { gcd }),
    starfire: planSpell('Starfire', [STARFIRE], { gcd, cast_time: STARFIRE_S }),
    trinket: planSpell('Trinket', [OFF_GCD], { gcd: 0 }),
  },
});
const timing = TestBed.inject(TimingFacts);

const read = (name: string, casts: WclEvent[], atS: number, gcd?: number) => {
  const ctx = factContext(list(gcd), { casts });
  return timing.read(name, castAt(ctx, atS), 'starfire', ctx);
};
const hardcast = (atS: number) => [beginCast(STARFIRE, atS), cast(STARFIRE, atS + STARFIRE_S * HASTE_FACTOR)];

describe('TimingFacts', () => {
  it('hastes a hasted global cooldown by the factor the log\'s hardcasts show', () => {
    expect(read('gcd.max', [...hardcast(0), cast(WRATH, 5)], 5)).toEqual([BASE_GCD_S * HASTE_FACTOR, BASE_GCD_S * HASTE_FACTOR]);
  });

  it('keeps a one second global cooldown flat', () => {
    expect(read('gcd.max', [cast(WRATH, 5)], 5, 1)).toEqual([1, 1]);
  });

  it('bounds the global cooldown by its floor and base when no hardcast narrows it', () => {
    expect(read('gcd.max', [cast(WRATH, 5)], 5)).toEqual([0.75, BASE_GCD_S]);
  });

  it('reads a cast time hasted by the same factor', () => {
    expect(read('cast_time', [...hardcast(0), cast(WRATH, 5)], 5)).toEqual([STARFIRE_S * HASTE_FACTOR, STARFIRE_S * HASTE_FACTOR]);
  });

  it('reads an off-GCD cast as waiting on the last cast that spent the global cooldown', () => {
    expect(read('gcd.remains', [cast(WRATH, 5), cast(OFF_GCD, 5.5)], 5.5, 1)).toEqual([0.5, 0.5]);
    expect(read('gcd.remains', [cast(WRATH, 5)], 5, 1)).toEqual([0, 0]);
  });

  it('reads a cast made while another is still being cast', () => {
    const casts = [beginCast(STARFIRE, 10), cast(OFF_GCD, 11), cast(STARFIRE, 11.5)];
    expect(read('action.starfire.executing', casts, 11)).toEqual([1, 1]);
    expect(read('action.starfire.execute_remains', casts, 11)).toEqual([0.5, 0.5]);
  });
});
