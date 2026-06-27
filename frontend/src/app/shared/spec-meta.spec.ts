import { describe, it, expect } from 'vitest';
import { SPEC_META, classList, specsForClass, specMetaOf, classIconUrl, specIconUrl } from './spec-meta';

/**
 * The folder keys here must stay in lock-step with `SPEC_TO_WCL` in `core/services/wcl-api.ts`
 * (that const is private, so the expected list is mirrored here). If a spec is added/removed
 * there, this list - and `SPEC_META` - must change too.
 */
const EXPECTED_SPECS = [
  'RetributionPaladin', 'HolyPaladin', 'ProtectionPaladin',
  'FireMage', 'ArcaneMage', 'FrostMage',
  'HavocDemonHunter', 'VengeanceDemonHunter',
  'FuryWarrior', 'ArmsWarrior', 'ProtectionWarrior',
  'UnholyDeathKnight', 'FrostDeathKnight', 'BloodDeathKnight',
  'BalanceDruid', 'FeralDruid', 'GuardianDruid', 'RestorationDruid',
  'BeastMasteryHunter', 'MarksmanshipHunter', 'SurvivalHunter',
  'BrewmasterMonk', 'WindwalkerMonk', 'MistweaverMonk',
  'DisciplinePriest', 'HolyPriest', 'ShadowPriest',
  'AssassinationRogue', 'OutlawRogue', 'SubtletyRogue',
  'ElementalShaman', 'EnhancementShaman', 'RestorationShaman',
  'AfflictionWarlock', 'DemonologyWarlock', 'DestructionWarlock',
  'DevastationEvoker', 'PreservationEvoker', 'AugmentationEvoker',
];

const EXPECTED_CLASSES = [
  'DeathKnight', 'DemonHunter', 'Druid', 'Evoker', 'Hunter', 'Mage', 'Monk',
  'Paladin', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior',
];

describe('SPEC_META', () => {
  it('covers exactly the expected 39 spec folders', () => {
    expect(Object.keys(SPEC_META).sort()).toEqual([...EXPECTED_SPECS].sort());
  });

  it('gives every spec a non-empty class and spec icon stem', () => {
    for (const meta of Object.values(SPEC_META)) {
      expect(meta.classIcon, meta.spec).not.toBe('');
      expect(meta.specIcon, meta.spec).not.toBe('');
    }
  });

  it('derives the class icon from the lowercased class name', () => {
    expect(SPEC_META['SubtletyRogue'].classIcon).toBe('class_rogue');
    expect(SPEC_META['BloodDeathKnight'].classIcon).toBe('class_deathknight');
  });

  it('derives readable spaced labels', () => {
    expect(SPEC_META['BloodDeathKnight'].classLabel).toBe('Death Knight');
    expect(SPEC_META['BeastMasteryHunter'].specLabel).toBe('Beast Mastery');
    expect(SPEC_META['SubtletyRogue'].specLabel).toBe('Subtlety');
  });
});

describe('classList', () => {
  it('collapses the specs to one entry per class, sorted by label', () => {
    const labels = classList().map(entry => entry.classLabel);
    expect(labels).toEqual([...EXPECTED_CLASSES].map(c => c.replace(/([A-Z])/g, ' $1').trim()).sort());
  });

  it('carries the class icon for each class', () => {
    const rogue = classList().find(entry => entry.className === 'Rogue');
    expect(rogue?.classIcon).toBe('class_rogue');
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
    expect(specsForClass('Rogue', ['NotAReal Spec', 'SubtletyRogue']).map(meta => meta.spec)).toEqual(['SubtletyRogue']);
  });
});

describe('specMetaOf', () => {
  it('looks up a known spec', () => {
    expect(specMetaOf('SubtletyRogue')?.className).toBe('Rogue');
  });

  it('returns undefined for empty or unknown specs', () => {
    expect(specMetaOf('')).toBeUndefined();
    expect(specMetaOf(null)).toBeUndefined();
    expect(specMetaOf('Bogus')).toBeUndefined();
  });
});

describe('icon URL helpers', () => {
  it('builds a class icon URL', () => {
    expect(classIconUrl('Rogue')).toBe('https://wow.zamimg.com/images/wow/icons/small/class_rogue.jpg');
  });

  it('returns empty for a missing class name', () => {
    expect(classIconUrl('')).toBe('');
  });

  it('builds a spec icon URL from the baked stem', () => {
    expect(specIconUrl('SubtletyRogue')).toBe('https://wow.zamimg.com/images/wow/icons/small/ability_stealth.jpg');
  });

  it('returns empty for an unknown spec', () => {
    expect(specIconUrl('Bogus')).toBe('');
  });
});
