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
  record('Name             : Maelstrom Weapon (id=344179)', 'Stacks           : 1 initial, 10 maximum'),
  record('Name             : Demolish (id=436358)', 'Talent Entry     : Colossus (Arms, Protection) [tree=hero, row=1, col=1]'),
].join('\n\n');

const records = dumps.readDump(DUMP);
const named = (name: string) => records.find(entry => entry.name === name);

describe('SpellDumpService.readDump', () => {
  it('reads one record per Name line, with its id and cooldown', () => {
    expect(records).toHaveLength(7);
    expect(named('Recklessness')).toMatchObject({ id: 1719, token: 'recklessness', cooldown: 90 });
  });

  it('reads a charged button\'s recharge as its cooldown', () => {
    expect(named('Bladestorm')?.cooldown).toBe(90);
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
});
