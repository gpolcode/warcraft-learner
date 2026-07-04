import { describe, it, expect, beforeEach } from 'vitest';
import {
  hydrateSpecMeta, classList, specsForClass, specMetaOf, classIconUrl, specIconUrl,
} from './spec-meta';
import type { SpecMeta } from './models/spec-meta.models';

/**
 * The spec universe is hydrated at runtime from the WCL-derived `spec-meta.json`, so these
 * tests seed a small fixture and assert the helpers behave over it (no hardcoded spec count).
 * The fixture mixes a multi-spec class (Rogue), a spaced class label (Death Knight), and a
 * spec with no baked icon (Beast Mastery) to cover the label and icon-degrade paths.
 */
const FIXTURE: SpecMeta[] = [
  { spec: 'SubtletyRogue', className: 'Rogue', specName: 'Subtlety', classLabel: 'Rogue', specLabel: 'Subtlety', classIcon: 'class_rogue', specIcon: 'ability_stealth' },
  { spec: 'OutlawRogue', className: 'Rogue', specName: 'Outlaw', classLabel: 'Rogue', specLabel: 'Outlaw', classIcon: 'class_rogue', specIcon: 'inv_sword_30' },
  { spec: 'AssassinationRogue', className: 'Rogue', specName: 'Assassination', classLabel: 'Rogue', specLabel: 'Assassination', classIcon: 'class_rogue', specIcon: 'ability_rogue_deadlybrew' },
  { spec: 'BloodDeathKnight', className: 'DeathKnight', specName: 'Blood', classLabel: 'Death Knight', specLabel: 'Blood', classIcon: 'class_deathknight', specIcon: 'spell_deathknight_bloodpresence' },
  { spec: 'BeastMasteryHunter', className: 'Hunter', specName: 'BeastMastery', classLabel: 'Hunter', specLabel: 'Beast Mastery', classIcon: 'class_hunter', specIcon: '' },
  { spec: 'FireMage', className: 'Mage', specName: 'Fire', classLabel: 'Mage', specLabel: 'Fire', classIcon: 'class_mage', specIcon: 'spell_fire_firebolt02' },
];

beforeEach(() => hydrateSpecMeta(FIXTURE));

describe('specMetaOf', () => {
  it('resolves the WCL className/specName slugs a rankings query needs', () => {
    expect(specMetaOf('BeastMasteryHunter')?.className).toBe('Hunter');
    expect(specMetaOf('BeastMasteryHunter')?.specName).toBe('BeastMastery');
    expect(specMetaOf('SubtletyRogue')?.specName).toBe('Subtlety');
  });

  it('returns undefined for empty or unknown specs', () => {
    expect(specMetaOf('')).toBeUndefined();
    expect(specMetaOf(null)).toBeUndefined();
    expect(specMetaOf('Bogus')).toBeUndefined();
  });
});

describe('classList', () => {
  it('collapses to one entry per class, sorted by label', () => {
    expect(classList().map(entry => entry.classLabel)).toEqual(['Death Knight', 'Hunter', 'Mage', 'Rogue']);
  });

  it('carries the class icon for each class', () => {
    expect(classList().find(entry => entry.className === 'Rogue')?.classIcon).toBe('class_rogue');
  });
});

describe('specsForClass', () => {
  it('returns only the available specs for a class, sorted by spec label', () => {
    const available = ['SubtletyRogue', 'OutlawRogue', 'FireMage', 'AssassinationRogue'];
    expect(specsForClass('Rogue', available).map(meta => meta.specLabel)).toEqual(['Assassination', 'Outlaw', 'Subtlety']);
  });

  it('returns nothing when the class has no available specs', () => {
    expect(specsForClass('Rogue', ['FireMage'])).toEqual([]);
  });

  it('ignores unknown folder keys in the available list', () => {
    expect(specsForClass('Rogue', ['NotARealSpec', 'SubtletyRogue']).map(meta => meta.spec)).toEqual(['SubtletyRogue']);
  });
});

describe('classIconUrl', () => {
  it('builds a class icon URL', () => {
    expect(classIconUrl('Rogue')).toBe('https://wow.zamimg.com/images/wow/icons/small/class_rogue.jpg');
  });

  it('accepts a spaced class name (the player fallback uses subType like "Death Knight")', () => {
    expect(classIconUrl('Death Knight')).toBe('https://wow.zamimg.com/images/wow/icons/small/class_deathknight.jpg');
  });

  it('returns empty for an unknown or missing class name', () => {
    expect(classIconUrl('')).toBe('');
    expect(classIconUrl('Unknown')).toBe('');
  });
});

describe('specIconUrl', () => {
  it('builds a spec icon URL from the baked stem', () => {
    expect(specIconUrl('SubtletyRogue')).toBe('https://wow.zamimg.com/images/wow/icons/small/ability_stealth.jpg');
  });

  it('returns empty when the spec has no baked stem', () => {
    expect(specIconUrl('BeastMasteryHunter')).toBe('');
  });

  it('returns empty for an unknown spec', () => {
    expect(specIconUrl('Bogus')).toBe('');
  });
});
