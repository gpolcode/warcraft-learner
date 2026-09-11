import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AbilityIndexService } from './ability-index-service';
import { builder, finisher, parseSample, selfAura, spellRecord } from '../../../../../testing/builders/simc';
import { applyBuff, buffWindow, cast } from '../../../../../testing/builders/events';
import { BACKSTAB, DISPATCH, EVISCERATE, SHADOW_DANCE, SHADOW_DANCE_AURA, SHADOW_DANCE_ENERGIZE, SHADOW_BLADES, VANISH } from '../../../../../testing/spell-ids';
import type { ParseSample } from './rulebook-build.models';

const abilities = TestBed.inject(AbilityIndexService);

const CLASS = 'Rogue';
const SPEC = 'Subtlety';
const MAJOR_FLOOR_S = 20;
const FILLER_CEILING_S = 10;
const FIGHT_S = 100;
/** Vanish comes back every 120s, so one cast in a 100s fight is a full share. */
const VANISH_CD_S = 120;

const KIT = [
  builder(BACKSTAB, 'Backstab', { className: CLASS }),
  finisher(EVISCERATE, 'Eviscerate', { className: `${SPEC} ${CLASS}` }),
  spellRecord({ id: DISPATCH, name: 'Dispatch', className: `Outlaw ${CLASS}`, resources: [{ powerType: 3, amount: 35 }] }),
  spellRecord({ id: SHADOW_DANCE, name: 'Shadow Dance', className: `${SPEC} ${CLASS}`, cooldownS: 6, rechargeS: MAJOR_FLOOR_S, durationS: 6, effects: [selfAura()] }),
  spellRecord({ id: SHADOW_DANCE_AURA, name: 'Shadow Dance', className: CLASS, durationS: 6, effects: [selfAura()] }),
  spellRecord({ id: SHADOW_DANCE_ENERGIZE, name: 'Shadow Dance', className: CLASS, effects: [{ type: 'Energize Power', subtype: null, target: 'self', baseValue: 4, }] }),
  spellRecord({ id: SHADOW_BLADES, name: 'Shadow Blades', className: `${SPEC} ${CLASS}`, cooldownS: 90, durationS: 20, effects: [selfAura()] }),
  spellRecord({ id: VANISH, name: 'Vanish', className: CLASS, cooldownS: VANISH_CD_S }),
];

function index(samples: ParseSample[] = []) {
  return abilities.build(KIT, samples, CLASS, SPEC);
}

describe('AbilityIndexService.build', () => {
  it('keeps class-wide and own-spec records and drops another spec\'s', () => {
    const ids = (token: string): number[] | undefined => index().byToken.get(token)?.map(record => record.id);
    expect(ids('backstab')).toEqual([BACKSTAB]);
    expect(ids('eviscerate')).toEqual([EVISCERATE]);
    expect(ids('dispatch')).toBeUndefined();
  });
});

describe('AbilityIndexService.cast', () => {
  it('resolves a token to the castable record and never to its aura twin', () => {
    expect(abilities.cast(index(), 'shadow_dance')?.id).toBe(SHADOW_DANCE);
  });

  it('prefers the record the sampled parses cast', () => {
    const sample = parseSample({ casts: [cast(SHADOW_DANCE_ENERGIZE, 5)] });
    const twinAsCast = KIT.map(record => (record.id === SHADOW_DANCE_ENERGIZE ? { ...record, cooldownS: 1 } : record));
    const built = abilities.build(twinAsCast, [sample], CLASS, SPEC);
    expect(abilities.cast(built, 'shadow_dance')?.id).toBe(SHADOW_DANCE_ENERGIZE);
  });

  it('returns null for a token the dump does not carry', () => {
    expect(abilities.cast(index(), 'berserking')).toBeNull();
  });
});

describe('AbilityIndexService.aura', () => {
  it('prefers the id the sampled parses carry as the buff', () => {
    const sample = parseSample({ buffs: buffWindow(SHADOW_DANCE_AURA, 10, 16) });
    expect(abilities.aura(index([sample]), 'shadow_dance', 'self')?.id).toBe(SHADOW_DANCE_AURA);
  });

  it('falls back to the record whose effect faces the player when nothing was sampled', () => {
    expect(abilities.aura(index(), 'shadow_blades', 'self')?.id).toBe(SHADOW_BLADES);
  });
});

describe('AbilityIndexService.isMajorCooldown', () => {
  it('counts a charge recharge at the floor and not one just under it', () => {
    const atFloor = spellRecord({ id: 1, name: 'A', gcd: false, rechargeS: MAJOR_FLOOR_S });
    const under = spellRecord({ id: 2, name: 'B', gcd: false, rechargeS: MAJOR_FLOOR_S - 1 });
    expect(abilities.isMajorCooldown(atFloor)).toBe(true);
    expect(abilities.isMajorCooldown(under)).toBe(false);
  });
});

describe('AbilityIndexService.isFiller', () => {
  it('needs a cost and a cooldown under the ceiling', () => {
    expect(abilities.isFiller(builder(1, 'A', { cooldownS: FILLER_CEILING_S - 1 }))).toBe(true);
    expect(abilities.isFiller(builder(2, 'B', { cooldownS: FILLER_CEILING_S }))).toBe(false);
    expect(abilities.isFiller(spellRecord({ id: 3, name: 'C', cooldownS: 2 }))).toBe(false);
  });
});

describe('AbilityIndexService.sameRole', () => {
  it('pairs two builders and separates a builder from a finisher', () => {
    expect(abilities.sameRole(builder(1, 'A'), builder(2, 'B'))).toBe(true);
    expect(abilities.sameRole(builder(1, 'A'), finisher(2, 'B'))).toBe(false);
  });
});

describe('AbilityIndexService.observe', () => {
  const first = parseSample({ casts: [cast(VANISH, 3), cast(VANISH, 80)], buffs: [applyBuff(SHADOW_BLADES, 1), ...buffWindow(SHADOW_DANCE_AURA, 0, 50)], fightDurationS: FIGHT_S });
  const second = parseSample({ casts: [cast(VANISH, 7)], buffs: buffWindow(SHADOW_DANCE_AURA, 0, 100), fightDurationS: FIGHT_S });
  const observation = abilities.observe([first, second]);

  it('counts the samples an id was cast in, its casts per sample, and each first cast', () => {
    expect(observation.castParses.get(VANISH)).toBe(2);
    expect(observation.castCounts.map(counts => counts.get(VANISH) ?? 0)).toEqual([2, 1]);
    expect(observation.firstCastS.get(VANISH)).toEqual([3, 7]);
  });

  it('counts applications and reads the median uptime share of an aura', () => {
    expect(observation.applications.get(SHADOW_BLADES)).toBe(1);
    // Windows of 50 and 100 seconds over a 100s fight: shares 0.5 and 1, median 0.75.
    expect(observation.uptimeShare.get(SHADOW_DANCE_AURA)).toBe(0.75);
  });
});

describe('AbilityIndexService.usageShare', () => {
  it('is a full share without samples and the median share of possible casts with them', () => {
    const built = index([
      parseSample({ casts: [cast(VANISH, 3)], fightDurationS: FIGHT_S }),
      parseSample({ casts: [], fightDurationS: FIGHT_S }),
      parseSample({ casts: [cast(VANISH, 3)], fightDurationS: FIGHT_S }),
    ]);
    const vanish = KIT.find(record => record.id === VANISH);
    expect(vanish && abilities.usageShare(index(), vanish)).toBe(1);
    // Shares 1, 0, 1 across the three samples, median 1; a fight shorter than the cooldown counts one possible cast.
    expect(vanish && abilities.usageShare(built, vanish)).toBe(1);
  });
});

describe('AbilityIndexService.stateObserved', () => {
  it('accepts every state without samples and only a lasting one with them', () => {
    expect(abilities.stateObserved(index(), SHADOW_DANCE_AURA)).toBe(true);
    const lasting = index([parseSample({ buffs: buffWindow(SHADOW_DANCE_AURA, 0, 5), fightDurationS: FIGHT_S })]);
    const fleeting = index([parseSample({ buffs: buffWindow(SHADOW_DANCE_AURA, 0, 4), fightDurationS: FIGHT_S })]);
    expect(abilities.stateObserved(lasting, SHADOW_DANCE_AURA)).toBe(true);
    expect(abilities.stateObserved(fleeting, SHADOW_DANCE_AURA)).toBe(false);
  });
});
