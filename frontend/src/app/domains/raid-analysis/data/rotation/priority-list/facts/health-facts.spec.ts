import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast, damage } from '../../../../../../../testing/builders/events';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { UNKNOWN } from '../priority-list.models';
import { HealthFacts } from './health-facts';

const BOSS = 1;
const BOSS_KEY = `${BOSS}:0`;
const HEALTH_PCT = 18;
const OWN_PCT = 60;
const health = TestBed.inject(HealthFacts);

const read = (name: string, target: string | null) => {
  const ctx = factContext(priorityList(), {
    casts: [cast(1, 10, { healthPct: OWN_PCT })],
    damage: [damage(1, 9, 1, { target: BOSS, targetHealthPct: HEALTH_PCT }), damage(1, 11, 1, { target: BOSS, targetHealthPct: 5 })],
  });
  return health.read(name, castAt(ctx, 10, target), 'x', ctx);
};

describe('HealthFacts', () => {
  it('reads the target\'s health at its last reading before the cast', () => {
    expect(read('target.health.pct', BOSS_KEY)).toEqual([HEALTH_PCT, HEALTH_PCT]);
  });

  it('reads the player\'s own health off the cast', () => {
    expect(read('health.pct', null)).toEqual([OWN_PCT, OWN_PCT]);
  });

  it('reads a target\'s health as unknown when the cast aims at no known enemy', () => {
    expect(read('target.health.pct', null)).toEqual(UNKNOWN);
  });
});
