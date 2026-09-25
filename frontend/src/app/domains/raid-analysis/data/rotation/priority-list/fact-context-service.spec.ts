import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyBuff, beginCast, cast, removeBuff } from '../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { BLADESTORM, BLADESTORM_HERO, BLOODLUST, SHADOW_DANCE, STARFIRE } from '../../../../../../testing/spell-ids';
import { FactContextService } from './fact-context-service';
import { factContext, priorityList } from './priority-list-harness';

const DANCE_PASSIVE = 185314;
const TIME_WARP = 80353;
const RAGE = 1;
const COMBO_POINTS = 4;
const STARFIRE_S = 2;
const list = priorityList({
  spells: {
    bladestorm: planSpell('Bladestorm', [BLADESTORM, BLADESTORM_HERO]),
    shadow_dance: planSpell('Shadow Dance', [DANCE_PASSIVE, SHADOW_DANCE]),
    starfire: planSpell('Starfire', [STARFIRE], { cast_time: STARFIRE_S }),
  },
});
const contexts = TestBed.inject(FactContextService);

describe('FactContextService', () => {
  it('counts a cast under any id the name holds as the same button', () => {
    const ctx = factContext(list, { casts: [cast(BLADESTORM, 1), cast(BLADESTORM_HERO, 2)] });
    expect(ctx.castTimes('bladestorm')).toEqual([1, 2]);
  });

  it('reads an aura under the id the log shows most, so a same-named passive never stands in for it', () => {
    const buffs = [applyBuff(DANCE_PASSIVE, 0), applyBuff(SHADOW_DANCE, 10), removeBuff(SHADOW_DANCE, 16)];
    expect(factContext(list, { buffs }).auraId('shadow_dance', 'self')).toBe(SHADOW_DANCE);
  });

  it('reads SimC\'s bloodlust as whichever haste buff the raid used', () => {
    expect(factContext(list, { buffs: [applyBuff(TIME_WARP, 5)] }).auraId('bloodlust', 'self')).toBe(TIME_WARP);
    expect(factContext(list, { buffs: [applyBuff(BLOODLUST, 5)] }).auraId('bloodlust', 'self')).toBe(BLOODLUST);
  });

  it('reads a pool kept in tenths in the game\'s units, and a small pool as logged', () => {
    const rage = contexts.pool(cast(1, 1, { resources: [{ type: RAGE, amount: 450, max: 1300, cost: 200 }] }), RAGE);
    expect(rage).toEqual({ before: 45, left: 25, max: 130 });
    expect(contexts.pool(cast(1, 1, { resources: [{ type: COMBO_POINTS, amount: 5, max: 7 }] }), COMBO_POINTS)).toEqual({ before: 5, left: 5, max: 7 });
  });

  it('reads a pool a cast does not touch as absent', () => {
    expect(contexts.pool(cast(1, 1), RAGE)).toBeNull();
  });

  it('reads haste off each hardcast as its logged time over its base time', () => {
    const ctx = factContext(list, { casts: [beginCast(STARFIRE, 10), cast(STARFIRE, 11.5)] });
    expect(ctx.hasteFactors()).toEqual([[11.5, 1.5 / STARFIRE_S]]);
  });
});
