import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SpellDataDumpService } from './spell-data-dump-service';
import { DOUBLE_DANCE, FEINT, GOREMAWS_BITE, RUPTURE, SHADOW_DANCE, SHADOW_DANCE_AURA } from '../../../../../testing/spell-ids';
import { COMBO_POINT_TYPE, ENERGY_TYPE } from '../rotation/rotation-rules/rule-fixtures';

const dump = TestBed.inject(SpellDataDumpService);

const DUMP = [
  'SimulationCraft 1210-01 for World of Warcraft 12.1.0.69587 Live',
  `Name             : Feint (id=${FEINT}) [Spell Family (8)] `,
  'Class            : Rogue',
  'Resource         : 35 Energy (3) (id=148)',
  'Duration         : 6 seconds',
  'Cooldown         : 1 seconds',
  'Charges          : 1 (15 seconds cooldown)',
  'Effects          :',
  '#1 (id=595)      : Apply Aura (6) | Modify AoE Damage Taken% (229)',
  '                   Base Value: -40 | Scaled Value: -40 | Misc Value: 127 | Target: Self (1)',
  '#3 (id=1135544)  : Energize Power (30)',
  '                   Base Value: 0 | Scaled Value: 0 | Resource: combo_points | Target: Self (1)',
  'Description      : Reduces damage taken.',
  '',
  `Name             : Shadow Dance (id=${SHADOW_DANCE_AURA}) [Spell Family (8)] `,
  'Class            : Rogue',
  'Duration         : 6 seconds',
  'Stacks           : 1 initial, 1 maximum',
  'Attributes       : Is Ability (4), No Cast Log (128)',
  'Effects          :',
  '#1 (id=1)        : Apply Aura (6) | Dummy (4)',
  '                   Base Value: 1 | Target: Self (1)',
  '',
  `Name             : Double Dance (id=${DOUBLE_DANCE}) [Spell Family (8), Passive] `,
  'Talent Entry     : Subtlety [tree=spec, row=6, col=3, max_rank=1, req_points=8]',
  'Class            : Rogue',
  'Attributes       : Passive (6), Not In Spellbook (143)',
  'Effects          :',
  '#1 (id=1034993)  : Apply Aura (6) | Modify Cooldown Charge (Category) (411)',
  '                   Base Value: 1 | Scaled Value: 1 | Misc Value: 1615 (Category) | Target: Self (1)',
  '',
  `Name             : Rupture (id=${RUPTURE}) [Spell Family (8)] `,
  'Class            : Rogue',
  'Resource         : 25 Energy (3) (id=8)',
  'Resource         : 1 - 5 Combo Points (4) (id=10582)',
  'Duration         : 4 seconds',
  'Effects          :',
  '#1 (id=1)        : Apply Aura (6) | Periodic Damage (3): physical every 2 seconds',
  '                   Base Value: 0 | AP Coefficient: 0.2 | Target: Targeted Enemy (6)',
  'Some trailing tooltip text with a colon: not a field',
].join('\n');

const byId = (id: number) => dump.parse(DUMP).find(record => record.id === id);

describe('SpellDataDumpService.parse', () => {
  it('reads the id, class, cost, duration, cooldown and recharge of a cast', () => {
    const feint = byId(FEINT);
    expect(feint?.name).toBe('Feint');
    expect(feint?.className).toBe('Rogue');
    expect(feint?.powerTypes).toEqual([ENERGY_TYPE]);
    expect(feint?.durationS).toBe(6);
    expect(feint?.cooldownS).toBe(1);
    expect(feint?.rechargeS).toBe(15);
  });

  it('reads each effect with its subtype, target and base value', () => {
    const [reduction, energize] = byId(FEINT)?.effects ?? [];
    expect(reduction).toEqual({ type: 'Apply Aura', subtype: 'Modify AoE Damage Taken%', target: 'self', baseValue: -40 });
    expect(energize?.type).toBe('Energize Power');
    expect(energize?.subtype).toBeNull();
  });

  it('marks a passive talent from its name flags and its talent entry', () => {
    const doubleDance = byId(DOUBLE_DANCE);
    expect(doubleDance?.passive).toBe(true);
    expect(doubleDance?.talent).toEqual({ tree: 'spec', owner: 'Subtlety' });
  });

  it('reads the stack cap and keeps an aura-only record castless', () => {
    const aura = byId(SHADOW_DANCE_AURA);
    expect(aura?.maxStacks).toBe(1);
    expect(aura?.cooldownS).toBeNull();
    expect(aura?.powerTypes).toEqual([]);
  });

  it('reads an enemy-facing effect and a ranged combo point cost', () => {
    const rupture = byId(RUPTURE);
    expect(rupture?.effects[0]).toMatchObject({ subtype: 'Periodic Damage', target: 'enemy' });
    expect(rupture?.powerTypes).toEqual([ENERGY_TYPE, COMBO_POINT_TYPE]);
  });

  it('parses four records and no more from trailing tooltip text', () => {
    expect(dump.parse(DUMP)).toHaveLength(4);
  });
});

/** Lines copied from the live rogue dump, with the long description fields left out; the tooltip's own line breaks leave stray lines behind. */
const LIVE_EXCERPT = [
  `Name             : Shadow Dance (id=${SHADOW_DANCE}) [Spell Family (8)] `,
  'Class            : Subtlety Rogue',
  'Duration         : 6 seconds',
  'Cooldown         : 6 seconds',
  'Charges          : 1 (20 seconds cooldown)',
  'Aura Interrupt   : Change Specialization (38), Change Talent (46)',
  'Effects          :',
  '#1 (id=269037)   : Apply Aura (6) | Temporary Threat Reduction (103)',
  '                   Base Value: -10000000 | Scaled Value: -1e+07 | Target: Self (1)',
  '#2 (id=317950)   : Apply Aura (6) | Add Percent Modifier (108): Spell Direct Amount (0)',
  '                   Base Value: 0 | Scaled Value: 0 | Target: Self (1)',
  '                   Affected Spells: Kidney Shot (408), Eviscerate (196819), Secret Technique (280719)',
  '                   Family Flags: 17, 21, 32, 44, 92',
  '                   Modified By: Death Perception (469642 effect#2)',
  '#3 (id=334762)   : Apply Aura (6) | Periodic Heal% (20): every 1 seconds',
  '                   Base Value: 0 | Scaled Value: 0 | Target: Self (1)',
  `Name             : Shadow Dance (id=${SHADOW_DANCE_AURA}) [Spell Family (8)] `,
  'Class            : Rogue',
  'Duration         : 6 seconds',
  'Aura Interrupt   : Change Specialization (38), Change Talent (46)',
  'Effects          :',
  '#1 (id=269222)   : Apply Aura (6) | Modify Leech% (443)',
  '                   Base Value: 0 | Scaled Value: 0 | Misc Value: 30 | Misc Value 2: 2 | Target: Self (1)',
  '#2 (id=269223)   : Apply Aura (6) | Dummy (4)',
  '                   Base Value: 40 | Scaled Value: 465 | Points Per Level: 5 | Target: Self (1)',
  'Movement speed increased by $w3%.][]$?$w4!=0[',
  'Damage increased by $w4%.][]',
  `Name             : Feint (id=${FEINT}) [Spell Family (8)] `,
  'Class            : Rogue',
  'Resource         : 35 Energy (3) (id=148)',
  'Duration         : 6 seconds',
  'Cooldown         : 1 seconds',
  'Charges          : 1 (15 seconds cooldown)',
  'Effects          :',
  '#1 (id=595)      : Apply Aura (6) | Modify AoE Damage Taken% (229)',
  '                   Base Value: -40 | Scaled Value: -40 | Misc Value: 127 | Target: Self (1)',
  '                   Modified By: Mirrors (441250 effect#1)',
  '#3 (id=1135544)  : Energize Power (30)',
  '                   Base Value: 0 | Scaled Value: 0 | Resource: combo_points | Target: Self (1)',
  '][.]',
  `Name             : Goremaw's Bite (id=${GOREMAWS_BITE}) [Spell Family (8)] `,
  'Talent Entry     : Subtlety [tree=spec, row=7, col=4, max_rank=1, req_points=8]',
  'Class            : Rogue',
  'Resource         : 25 Energy (3) (id=305640)',
  'GCD              : 1 seconds',
  'Cooldown         : 45 seconds',
  'Effects          :',
  "#1 (id=1105220)  : Trigger Spell (64): Goremaw's Bite",
  '                   Base Value: 2 | Scaled Value: 2 | Trigger Spell: 426592 | Target: Targeted Enemy (6)',
  '$1309274s2% of all damage from Finishing Moves is repeated as Shadow, split evenly among affected enemies.',
].join('\r\n');

const live = (id: number) => dump.parse(LIVE_EXCERPT).find(record => record.id === id);

describe('SpellDataDumpService.parse on the live dump format', () => {
  it('reads four records and every timing field of the charged cast', () => {
    expect(dump.parse(LIVE_EXCERPT)).toHaveLength(4);
    const cast = live(SHADOW_DANCE);
    expect(cast?.className).toBe('Subtlety Rogue');
    expect(cast?.cooldownS).toBe(6);
    expect(cast?.rechargeS).toBe(20);
    expect(cast?.durationS).toBe(6);
    expect(cast?.effects[2]).toEqual({ type: 'Apply Aura', subtype: 'Periodic Heal%', target: 'self', baseValue: 0 });
  });

  it('keeps the aura twin castless and reads its effects past the tooltip\'s stray lines', () => {
    const aura = live(SHADOW_DANCE_AURA);
    expect(aura?.cooldownS).toBeNull();
    expect(aura?.powerTypes).toEqual([]);
    expect(aura?.effects.map(effect => effect.subtype)).toEqual(['Modify Leech%', 'Dummy']);
  });

  it('reads the cost, recharge, talent entry and global cooldown of the two casts', () => {
    expect(live(FEINT)?.rechargeS).toBe(15);
    expect(live(FEINT)?.effects[0]?.baseValue).toBe(-40);
    const bite = live(GOREMAWS_BITE);
    expect(bite?.talent).toEqual({ tree: 'spec', owner: 'Subtlety' });
    expect(bite?.powerTypes).toEqual([ENERGY_TYPE]);
    expect(bite?.gcd).toBe(true);
    expect(bite?.cooldownS).toBe(45);
  });

  it('reads an effect detail at any indent', () => {
    const narrow = LIVE_EXCERPT.replace('                   Base Value: -40', '    Base Value: -40');
    expect(dump.parse(narrow).find(record => record.id === FEINT)?.effects[0]?.baseValue).toBe(-40);
  });
});

describe('SpellDataDumpService.token', () => {
  it('lower-cases, turns a space into an underscore and drops every other separator, as SimulationCraft does', () => {
    expect(dump.token("Goremaw's Bite")).toBe('goremaws_bite');
    expect(dump.token('Incarnation: Chosen of Elune')).toBe('incarnation_chosen_of_elune');
    expect(dump.token('Anti-Magic Shell')).toBe('antimagic_shell');
    expect(dump.token('Multi-Shot')).toBe('multishot');
    expect(dump.token("San'layn")).toBe('sanlayn');
  });
});
