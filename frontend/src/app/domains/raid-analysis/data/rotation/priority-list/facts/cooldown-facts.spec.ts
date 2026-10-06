import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { SHADOW_BLADES, SHADOW_DANCE } from '../../../../../../../testing/spell-ids';
import { ConditionEvalService } from '../condition-eval-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { Range, UNKNOWN } from '../priority-list.models';

const BLADES_CD_S = 90;
const DANCE_RECHARGE_S = 60;
const DANCE_CHARGES = 2;
/** The log shows Shadow Blades back after this, which reductions made possible. */
const FASTEST_S = 60;
const PROBE = 999;
const list = priorityList({
  spells: {
    shadow_blades: planSpell('Shadow Blades', [SHADOW_BLADES], { cooldown: BLADES_CD_S }),
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { cooldown: DANCE_RECHARGE_S, charges: DANCE_CHARGES }),
  },
});
const evaluator = TestBed.inject(ConditionEvalService);

interface Read {
  reads: string;
  name: string;
  spellId: number;
  casts: number[];
  atS: number;
  expected: Range;
}

/** A probe cast at `atS` after the button's own casts, so the read sees every cast before it. */
const read = ({ name, spellId, casts, atS }: Read): Range => {
  const ctx = factContext(list, { casts: [...casts.map(castS => cast(spellId, castS)), cast(PROBE, atS)] });
  return evaluator.read(name, castAt(ctx, atS), 'x', ctx);
};

describe('CooldownFacts', () => {
  it.each<Read>([
    { reads: 'a cooldown off the spell data\'s recharge when the log never shows it back sooner', name: 'cooldown.shadow_blades.remains', spellId: SHADOW_BLADES, casts: [10], atS: 40, expected: [BLADES_CD_S - 30, BLADES_CD_S - 30] },
    { reads: 'it ready once the recharge has run', name: 'cooldown.shadow_blades.ready', spellId: SHADOW_BLADES, casts: [10], atS: 10 + BLADES_CD_S, expected: [1, 1] },
    { reads: 'it on cooldown a moment before', name: 'cooldown.shadow_blades.ready', spellId: SHADOW_BLADES, casts: [10], atS: 10 + BLADES_CD_S - 1, expected: [0, 0] },
    { reads: 'the time left bounded below by the fastest recast the log shows', name: 'cooldown.shadow_blades.remains', spellId: SHADOW_BLADES, casts: [0, FASTEST_S, 200], atS: FASTEST_S + 20, expected: [FASTEST_S - 20, BLADES_CD_S - 20] },
    { reads: 'a ready that only the faster recharge allows as unknown', name: 'cooldown.shadow_blades.ready', spellId: SHADOW_BLADES, casts: [0, FASTEST_S, 200], atS: 130, expected: [0, 1] },
    { reads: 'the recharge between the fastest the log shows and the spell data\'s', name: 'cooldown.shadow_blades.duration', spellId: SHADOW_BLADES, casts: [0, FASTEST_S, 200], atS: 130, expected: [FASTEST_S, BLADES_CD_S] },
    { reads: 'charges back one recharge at a time, starting full', name: 'cooldown.shadow_dance.charges', spellId: SHADOW_DANCE, casts: [0, 1], atS: 30, expected: [0, 0] },
    { reads: 'the charge coming back as a fraction', name: 'cooldown.shadow_dance.charges_fractional', spellId: SHADOW_DANCE, casts: [0, 1], atS: 30, expected: [0.5, 0.5] },
    { reads: 'one charge left after one cast', name: 'cooldown.shadow_dance.charges', spellId: SHADOW_DANCE, casts: [0], atS: 30, expected: [1, 1] },
    { reads: 'the spell data\'s charge count', name: 'cooldown.shadow_dance.max_charges', spellId: SHADOW_DANCE, casts: [], atS: 30, expected: [DANCE_CHARGES, DANCE_CHARGES] },
    { reads: 'the time to full charges across every missing charge', name: 'cooldown.shadow_dance.full_recharge_time', spellId: SHADOW_DANCE, casts: [0, 1], atS: 30, expected: [DANCE_RECHARGE_S * DANCE_CHARGES - 30, DANCE_RECHARGE_S * DANCE_CHARGES - 30] },
    { reads: 'a button the spell data does not name as unknown', name: 'cooldown.adrenaline_rush.remains', spellId: SHADOW_BLADES, casts: [], atS: 30, expected: UNKNOWN },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});
