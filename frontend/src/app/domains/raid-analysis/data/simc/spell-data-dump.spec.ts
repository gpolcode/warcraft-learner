import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SpellDataDumpService } from './spell-data-dump-service';
import { DOUBLE_DANCE, FEINT, RUPTURE, SHADOW_DANCE_AURA } from '../../../../../testing/spell-ids';

const dump = TestBed.inject(SpellDataDumpService);

const DUMP = [
  'SimulationCraft 1210-01 for World of Warcraft 12.1.0.69587 Live',
  'Name             : Feint (id=1966) [Spell Family (8)] ',
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
  'Name             : Shadow Dance (id=185422) [Spell Family (8)] ',
  'Class            : Rogue',
  'Duration         : 6 seconds',
  'Stacks           : 1 initial, 1 maximum',
  'Attributes       : Is Ability (4), No Cast Log (128)',
  'Effects          :',
  '#1 (id=1)        : Apply Aura (6) | Dummy (4)',
  '                   Base Value: 1 | Target: Self (1)',
  '',
  'Name             : Double Dance (id=394930) [Spell Family (8), Passive] ',
  'Talent Entry     : Subtlety [tree=spec, row=6, col=3, max_rank=1, req_points=8]',
  'Class            : Rogue',
  'Attributes       : Passive (6), Not In Spellbook (143)',
  'Effects          :',
  '#1 (id=1034993)  : Apply Aura (6) | Modify Cooldown Charge (Category) (411)',
  '                   Base Value: 1 | Scaled Value: 1 | Misc Value: 1615 (Category) | Target: Self (1)',
  '',
  'Name             : Rupture (id=1943) [Spell Family (8)] ',
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
    expect(feint?.resources).toEqual([{ amount: 35, powerType: 3 }]);
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
    expect(aura?.resources).toEqual([]);
  });

  it('reads an enemy-facing effect and a ranged combo point cost', () => {
    const rupture = byId(RUPTURE);
    expect(rupture?.effects[0]).toMatchObject({ subtype: 'Periodic Damage', target: 'enemy' });
    expect(rupture?.resources.map(resource => resource.powerType)).toEqual([3, 4]);
  });

  it('parses four records and no more from trailing tooltip text', () => {
    expect(dump.parse(DUMP)).toHaveLength(4);
  });
});

describe('SpellDataDumpService.token', () => {
  it('drops apostrophes and turns every other separator into one underscore', () => {
    expect(dump.token("Goremaw's Bite")).toBe('goremaws_bite');
    expect(dump.token('Incarnation: Chosen of Elune')).toBe('incarnation_chosen_of_elune');
  });
});
