import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AbilityIndexService } from './ability-index-service';
import { CooldownDerivationService } from './cooldown-derivation-service';
import { SimcAplService } from '../simc/simc-apl-service';
import { builder, parseSample, selfAura, spellRecord } from '../../../../../testing/builders/simc';
import { cast } from '../../../../../testing/builders/events';
import { BACKSTAB, CRIMSON_VIAL, FEINT, SHADOW_BLADES, SHADOW_DANCE, VANISH } from '../../../../../testing/spell-ids';
import type { ParseSample } from './rulebook-build.models';

const abilities = TestBed.inject(AbilityIndexService);
const cooldowns = TestBed.inject(CooldownDerivationService);
const apl = TestBed.inject(SimcAplService);

const CLASS = 'Rogue';
const SPEC = 'Subtlety';
const TIER = 'midnight_season_2';
const FIGHT_S = 200;
const VANISH_CD_S = 120;
/** Three casts in 200s against a 20s recharge is 3 of 10 possible uses: the usage floor. */
const DANCE_CASTS_AT_FLOOR = 3;
const OPENER_SAMPLES = 3;
const BERSERKER_RAGE = 18499;
const OTHER_SPEC_WALL = 871;

const KIT = [
  builder(BACKSTAB, 'Backstab', { className: CLASS }),
  spellRecord({ id: SHADOW_DANCE, name: 'Shadow Dance', className: `${SPEC} ${CLASS}`, gcd: false, cooldownS: 6, charges: { count: 1, rechargeS: 20 }, durationS: 6, effects: [selfAura('Periodic Heal%', 0)] }),
  spellRecord({ id: SHADOW_BLADES, name: 'Shadow Blades', className: `${SPEC} ${CLASS}`, gcd: false, cooldownS: 90, durationS: 20, talent: { tree: 'spec', owner: SPEC } }),
  spellRecord({ id: VANISH, name: 'Vanish', className: CLASS, gcd: false, cooldownS: VANISH_CD_S }),
  spellRecord({ id: FEINT, name: 'Feint', className: CLASS, cooldownS: 1, charges: { count: 1, rechargeS: 15 }, durationS: 6, effects: [selfAura('Modify AoE Damage Taken%', -40)] }),
  spellRecord({ id: CRIMSON_VIAL, name: 'Crimson Vial', className: CLASS, cooldownS: 30, durationS: 4, effects: [selfAura('Periodic Heal%', 10)] }),
  spellRecord({ id: BERSERKER_RAGE, name: 'Berserker Rage', className: CLASS, cooldownS: 60, effects: [selfAura('Mechanic Immunity', 100)] }),
  spellRecord({ id: OTHER_SPEC_WALL, name: 'Shield Wall', className: CLASS, cooldownS: 180, talent: { tree: 'spec', owner: 'Outlaw' }, effects: [selfAura('Modify Damage Taken%', -40)] }),
];

const PROFILE = [
  'actions=shadow_blades',
  'actions+=/shadow_dance,if=!buff.shadow_dance.up',
  'actions+=/vanish',
  'actions+=/backstab',
].join('\n');

function derive(samples: ParseSample[] = []) {
  const index = abilities.build(KIT, samples, CLASS, SPEC);
  const resolved = apl.resolve(apl.parseLines(PROFILE), TIER);
  return { index, majors: cooldowns.majorCooldowns(resolved.actions, index) };
}

function danceSamples(castsPerSample: number, firstCastS: number[]): ParseSample[] {
  return firstCastS.map((atS, position) => parseSample({
    reportCode: `r${position}`, fightDurationS: FIGHT_S,
    casts: [
      ...Array.from({ length: castsPerSample }, (_, cast_index) => cast(SHADOW_DANCE, atS + cast_index * 30)),
      cast(SHADOW_BLADES, atS + 1), cast(VANISH, 200),
    ],
  }));
}

describe('CooldownDerivationService.majorCooldowns', () => {
  it('lists the APL actions that come back in 20s or more, marking the talents', () => {
    const { majors } = derive();
    expect(majors.map(entry => entry.record.id)).toEqual([SHADOW_BLADES, SHADOW_DANCE, VANISH]);
    expect(majors.map(entry => entry.talentGated)).toEqual([true, false, false]);
  });

  it('keeps a cooldown pressed for the floor share of its possible uses and drops one under it', () => {
    const kept = derive(danceSamples(DANCE_CASTS_AT_FLOOR, [2, 3, 4]));
    const dropped = derive(danceSamples(DANCE_CASTS_AT_FLOOR - 1, [2, 3, 4]));
    expect(kept.majors.some(entry => entry.record.id === SHADOW_DANCE)).toBe(true);
    expect(dropped.majors.some(entry => entry.record.id === SHADOW_DANCE)).toBe(false);
  });

  it('orders the opener by median first cast for cooldowns pressed early in most samples', () => {
    const { majors } = derive(danceSamples(DANCE_CASTS_AT_FLOOR, [2, 3, 4]));
    const slot = (id: number) => majors.find(entry => entry.record.id === id)?.openerPriority;
    expect(slot(SHADOW_DANCE)).toBe(1);
    expect(slot(SHADOW_BLADES)).toBe(2);
    expect(slot(VANISH)).toBeNull();
  });

  it('reads no opener from fewer than three samples', () => {
    const { majors } = derive(danceSamples(DANCE_CASTS_AT_FLOOR, [2, 3]).slice(0, OPENER_SAMPLES - 1));
    expect(majors.every(entry => entry.openerPriority === null)).toBe(true);
  });
});

describe('CooldownDerivationService.openingSequence', () => {
  it('names the early cooldowns in order and nothing under two of them', () => {
    const { majors } = derive(danceSamples(DANCE_CASTS_AT_FLOOR, [2, 3, 4]));
    expect(cooldowns.openingSequence(majors)?.spell_ids).toEqual([SHADOW_DANCE, SHADOW_BLADES]);
    expect(cooldowns.openingSequence(majors.filter(entry => entry.record.id === VANISH))).toBeNull();
  });
});

describe('CooldownDerivationService.defensives', () => {
  const { index, majors } = derive();
  const defensives = cooldowns.defensives(index, new Set(majors.map(entry => entry.record.id)));

  it('keeps a damage reduction and a heal with magnitude, ordered by cooldown', () => {
    expect(defensives.map(entry => entry.record.id)).toEqual([FEINT, CRIMSON_VIAL]);
  });

  it('drops a heal at zero, a crowd-control immunity, and another spec\'s talent', () => {
    const ids = defensives.map(entry => entry.record.id);
    expect(ids).not.toContain(SHADOW_DANCE);
    expect(ids).not.toContain(BERSERKER_RAGE);
    expect(ids).not.toContain(OTHER_SPEC_WALL);
  });
});
