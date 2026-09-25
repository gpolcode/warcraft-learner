import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SpellDumpService } from './spell-dump-service';

const dumps = TestBed.inject(SpellDumpService);

const record = (...fields: string[]): string => fields.join('\n');
const DUMP = [
  record(
    'Name             : Recklessness (id=1719) [Spell Family (4)] ',
    'Talent Entry     : Fury [tree=spec, row=7, col=4, max_rank=1, req_points=8]',
    'Cooldown         : 90 seconds',
    'Labels           : 16: Class Spells',
    '                 : 690: Major Cooldowns',
  ),
  record(
    'Name             : Bladestorm (id=446035) [Spell Family (4)] ',
    'Cooldown         : 60 seconds',
    'Charges          : 1 (90 seconds cooldown)',
  ),
  record(
    'Name             : Enraged Regeneration (id=184364) [Spell Family (4)] ',
    'Talent Entry     : Generic [tree=class, row=4, col=3, max_rank=1, req_points=0]',
    'Cooldown         : 120 seconds',
    'Attributes       : Important Spell (491), Big Defensive (512)',
  ),
  record('Name             : Rallying Cry (id=97462) [Spell Family (4)] ', 'Attributes       : External Defensive (499)'),
  record("Name             : Odyn's Fury (desc=Artifact) (id=205545) [Spell Family (4)] ", 'Cooldown         : 45 seconds'),
  record('Name             : Maelstrom Weapon (id=344179)', 'Stacks           : 1 initial, 10 maximum', 'Duration         : 30 seconds'),
  record(
    'Name             : Eviscerate (id=196819) [Spell Family (8)] ',
    'Resource         : 35 Energy (3) (id=10594)',
    'Resource         : 1 - 5 Combo Points (4) (id=10595)',
    'GCD              : 1 seconds',
  ),
  record('Name             : Death Coil (id=47541)', 'Resource         : -30 Runic Power (6) (id=1)', 'Resource         : 2% Base Mana (0) (id=2)', 'Cast Time        : 1.5 seconds'),
  record('Name             : Demolish (id=436358)', 'Talent Entry     : Colossus (Arms, Protection) [tree=hero, row=1, col=1]'),
  record(
    'Name             : Avatar (id=107574) [Spell Family (4)] ',
    'Talent Entry     : Fury [tree=spec, row=10, col=6, max_rank=1, req_points=20, select_idx=100]',
    '                 : Arms [tree=spec, row=10, col=6, max_rank=1, req_points=20]',
  ),
  record(
    'Name             : Scorch (id=2948) [Spell Family (3)] ',
    'Effects          :',
    '#1 (id=882)      : School Damage (2): fire',
    '                   Base Value: 0 | Scaled Value: 0 (delta=0.05) | SP Coefficient: 1',
    '#2 (id=1154626)  : Dummy (3)',
    '                   Base Value: 30 | Scaled Value: 30 | Target: Self (1)',
  ),
].join('\n\n');

const records = dumps.readDump(DUMP);
const named = (name: string) => records.find(entry => entry.name === name);

describe('SpellDumpService.readDump', () => {
  it('reads one record per Name line, with its id and cooldown', () => {
    expect(records).toHaveLength(11);
    expect(named('Recklessness')).toMatchObject({ id: 1719, token: 'recklessness', cooldown: 90 });
  });

  it('reads a charged button\'s recharge as its cooldown', () => {
    expect(named('Bladestorm')?.cooldown).toBe(90);
  });

  it('reads a charged button\'s charges, and one for a button without them', () => {
    expect(named('Bladestorm')?.charges).toBe(1);
    expect(named('Recklessness')?.charges).toBe(1);
  });

  it('reads an aura\'s duration, the global cooldown and a cast time, each 0 where the record states none', () => {
    expect(named('Maelstrom Weapon')?.duration).toBe(30);
    expect(named('Eviscerate')?.gcd).toBe(1);
    expect(named('Death Coil')?.castTime).toBe(1.5);
    expect(named('Recklessness')).toMatchObject({ duration: 0, gcd: 0, castTime: 0 });
  });

  it('reads what a button spends, a ranged cost at its minimum, and neither a gain nor a mana share', () => {
    expect(named('Eviscerate')?.costs).toEqual([{ type: 3, amount: 35 }, { type: 4, amount: 1 }]);
    expect(named('Death Coil')?.costs).toEqual([]);
  });

  it('reads Blizzard\'s Major Cooldowns label', () => {
    expect(named('Recklessness')?.major).toBe(true);
    expect(named('Bladestorm')?.major).toBe(false);
  });

  it('reads the Big Defensive and External Defensive attributes as defensive', () => {
    expect(named('Enraged Regeneration')?.defensive).toBe(true);
    expect(named('Rallying Cry')?.defensive).toBe(true);
    expect(named('Recklessness')?.defensive).toBe(false);
  });

  it('names a record as the game does, without SimC\'s desc suffix, and tokenizes it as an APL does', () => {
    expect(named("Odyn's Fury")?.token).toBe('odyns_fury');
  });

  it('reads a buff\'s stack maximum, and 0 for a record that states none', () => {
    expect(named('Maelstrom Weapon')?.maxStacks).toBe(10);
    expect(named('Recklessness')?.maxStacks).toBe(0);
  });

  it('gives a spec-tree talent its spec, a hero talent its listed specs, and a class talent none', () => {
    expect(named('Recklessness')?.specs).toEqual(['Fury']);
    expect(named('Demolish')?.specs).toEqual(['Arms', 'Protection']);
    expect(named('Enraged Regeneration')?.specs).toBeNull();
    expect(named('Enraged Regeneration')?.talented).toBe(true);
    expect(named('Bladestorm')?.talented).toBe(false);
  });

  it('gives a talent several specs share every spec its entry lists', () => {
    expect(named('Avatar')?.specs).toEqual(['Fury', 'Arms']);
  });

  it('reads a dump written with Windows line endings the same', () => {
    expect(dumps.readDump(DUMP.replace(/\n/g, '\r\n'))).toEqual(records);
  });

  it('reads each effect\'s base value under its own number', () => {
    expect(named('Scorch')?.effects).toEqual([0, 30]);
  });
});
