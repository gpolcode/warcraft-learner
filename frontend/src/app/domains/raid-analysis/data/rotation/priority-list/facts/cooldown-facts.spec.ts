import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { SHADOW_BLADES, SHADOW_DANCE } from '../../../../../../../testing/spell-ids';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { UNKNOWN } from '../priority-list.models';
import { CooldownFacts } from './cooldown-facts';

const BLADES_CD_S = 90;
const DANCE_RECHARGE_S = 60;
const DANCE_CHARGES = 2;
const PROBE = 999;
const list = priorityList({
  spells: {
    shadow_blades: planSpell('Shadow Blades', [SHADOW_BLADES], { cooldown: BLADES_CD_S }),
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { cooldown: DANCE_RECHARGE_S, charges: DANCE_CHARGES }),
  },
});
const cooldowns = TestBed.inject(CooldownFacts);

/** A probe cast at `atS` after the button's own casts, so the read sees every cast before it. */
const read = (name: string, spellId: number, casts: number[], atS: number) => {
  const ctx = factContext(list, { casts: [...casts.map(castS => cast(spellId, castS)), cast(PROBE, atS)] });
  return cooldowns.read(name, castAt(ctx, atS), 'x', ctx);
};

describe('CooldownFacts', () => {
  it('reads a cooldown off the spell data\'s recharge when the log never shows it back sooner', () => {
    expect(read('cooldown.shadow_blades.remains', SHADOW_BLADES, [10], 40)).toEqual([BLADES_CD_S - 30, BLADES_CD_S - 30]);
  });

  it('reads it ready once the recharge has run, and not a moment before', () => {
    expect(read('cooldown.shadow_blades.ready', SHADOW_BLADES, [10], 10 + BLADES_CD_S)).toEqual([1, 1]);
    expect(read('cooldown.shadow_blades.ready', SHADOW_BLADES, [10], 10 + BLADES_CD_S - 1)).toEqual([0, 0]);
  });

  it('bounds the time left from below by the fastest recast the log shows, which reductions made possible', () => {
    const FASTEST_S = 60;
    expect(read('cooldown.shadow_blades.remains', SHADOW_BLADES, [0, FASTEST_S, 200], FASTEST_S + 20)).toEqual([FASTEST_S - 20, BLADES_CD_S - 20]);
  });

  it('reads a ready that only the faster recharge allows as unknown', () => {
    // Back at 120 s at the fastest recharge the log shows, at 150 s at the spell data's.
    expect(read('cooldown.shadow_blades.ready', SHADOW_BLADES, [0, 60, 200], 130)).toEqual([0, 1]);
  });

  it('counts charges back one recharge at a time, starting full', () => {
    expect(read('cooldown.shadow_dance.charges', SHADOW_DANCE, [0, 1], 30)).toEqual([0, 0]);
    expect(read('cooldown.shadow_dance.charges_fractional', SHADOW_DANCE, [0, 1], 30)).toEqual([0.5, 0.5]);
    expect(read('cooldown.shadow_dance.charges', SHADOW_DANCE, [0], 30)).toEqual([1, 1]);
  });

  it('reads the time to full charges across every missing charge', () => {
    expect(read('cooldown.shadow_dance.full_recharge_time', SHADOW_DANCE, [0, 1], 30)).toEqual([DANCE_RECHARGE_S * DANCE_CHARGES - 30, DANCE_RECHARGE_S * DANCE_CHARGES - 30]);
  });

  it('reads a button the spell data does not name as unknown', () => {
    expect(read('cooldown.adrenaline_rush.ready', SHADOW_BLADES, [], 30)).toEqual(UNKNOWN);
  });
});
