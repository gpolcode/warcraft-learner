import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyDebuff, cast, refreshDebuff, removeDebuff } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { RUPTURE } from '../../../../../../../testing/spell-ids';
import type { WclEvent } from '../../../wcl/wcl.models';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { UNKNOWN } from '../priority-list.models';
import { DebuffFacts } from './debuff-facts';

const RUPTURE_S = 20;
/** The pandemic window: the last 30% of the duration. */
const PANDEMIC_S = (RUPTURE_S * 30) / 100;
const BOSS = 1;
const ADD = 2;
const BOSS_KEY = `${BOSS}:0`;
const list = priorityList({ spells: { rupture: planSpell('Rupture', [RUPTURE], { duration: RUPTURE_S }) } });
const debuffs = TestBed.inject(DebuffFacts);

const read = (name: string, events: WclEvent[], atS: number, target: string | null = BOSS_KEY) => {
  const ctx = factContext(list, { casts: [cast(1, atS)], debuffs: events });
  return debuffs.read(name, castAt(ctx, atS, target), 'rupture', ctx);
};

describe('DebuffFacts', () => {
  const onBoss = [applyDebuff(RUPTURE, 0, { target: BOSS }), removeDebuff(RUPTURE, RUPTURE_S, { target: BOSS })];

  it('reads a dot ticking on the cast\'s target, and not on another enemy', () => {
    expect(read('dot.rupture.ticking', onBoss, 5)).toEqual([1, 1]);
    expect(read('dot.rupture.ticking', onBoss, 5, `${ADD}:0`)).toEqual([0, 0]);
  });

  it('reads a dot as refreshable inside its last 30%, and not at the window\'s edge', () => {
    expect(read('refreshable', onBoss, RUPTURE_S - PANDEMIC_S + 0.1)).toEqual([1, 1]);
    expect(read('refreshable', onBoss, RUPTURE_S - PANDEMIC_S)).toEqual([0, 0]);
  });

  it('reads a missing dot as refreshable', () => {
    expect(read('dot.rupture.refreshable', onBoss, RUPTURE_S + 1)).toEqual([1, 1]);
  });

  it('reads the time left through a refresh to the final drop', () => {
    const refreshed = [applyDebuff(RUPTURE, 0, { target: BOSS }), refreshDebuff(RUPTURE, 10, { target: BOSS }), removeDebuff(RUPTURE, 10 + RUPTURE_S, { target: BOSS })];
    expect(read('dot.rupture.remains', refreshed, 15)).toEqual([RUPTURE_S - 5, RUPTURE_S - 5]);
  });

  it('counts the enemies the dot is on', () => {
    const spread = [...onBoss, applyDebuff(RUPTURE, 1, { target: ADD })];
    expect(read('active_dot.rupture', spread, 5, null)).toEqual([2, 2]);
  });

  it('reads a per-target fact as unknown when the cast aims at no known enemy', () => {
    expect(read('dot.rupture.ticking', onBoss, 5, null)).toEqual(UNKNOWN);
  });

  it('reads a dot the log never shows as unknown', () => {
    expect(read('dot.rupture.ticking', [], 5)).toEqual(UNKNOWN);
  });
});
