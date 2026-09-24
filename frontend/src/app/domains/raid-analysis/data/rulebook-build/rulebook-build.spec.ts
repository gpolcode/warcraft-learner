import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RulebookBuildService, type RulebookSourceTexts } from './rulebook-build-service';
import type { SpecMeta } from '../data-files/spec-meta.models';
import { ANCIENT_ARTS_ENTRIES, ICE_BARRIER, SHADOW_BLADES, SHADOW_DANCE, UNSEEN_BLADE_ENTRY, VANISH } from '../../../../../testing/spell-ids';

const builder = TestBed.inject(RulebookBuildService);

const SPEC: SpecMeta = {
  spec: 'SubtletyRogue', className: 'Rogue', specName: 'Subtlety', classLabel: 'Rogue', specLabel: 'Subtlety',
  classIcon: 'class_rogue',
};
/** A spec the exclusion overlay names, hiding the barrier of another spec. */
const EXCLUDED_SPEC: SpecMeta = { ...SPEC, spec: 'ArcaneMage', className: 'Mage', specName: 'Arcane', classLabel: 'Mage', specLabel: 'Arcane' };
const TIER = { branch: 'midnight', dir: 'MID2' };
const KEY_LENGTH = 16;
/** Shadow Dance is a charged spell: the recharge in its dump record, not the 6s cooldown, is what gates it. */
const SHADOW_DANCE_RECHARGE_S = 20;

/** Three cooldown lines in priority order, so severity walks critical, warning, info. */
const APL = [
  'actions=shadow_blades,if=cooldown.shadow_dance.ready',
  'actions+=/shadow_dance,if=cooldown.shadow_blades.remains>=35',
  'actions+=/vanish,if=talent.unseen_blade&combo_points<=2',
].join('\n');

const DUMP = [
  'SimulationCraft 1210-01 for World of Warcraft 12.1.0.69587 Live',
  `Name             : Shadow Blades (id=${SHADOW_BLADES}) [Spell Family (8)] `,
  'Class            : Subtlety Rogue',
  'Duration         : 20 seconds',
  'Cooldown         : 90 seconds',
  'Effects          :',
  '#1 (id=1)        : Apply Aura (6) | Dummy (4)',
  '                   Base Value: 1 | Target: Self (1)',
  '',
  `Name             : Shadow Dance (id=${SHADOW_DANCE}) [Spell Family (8)] `,
  'Class            : Subtlety Rogue',
  'Duration         : 6 seconds',
  'Cooldown         : 6 seconds',
  `Charges          : 1 (${SHADOW_DANCE_RECHARGE_S} seconds cooldown)`,
  'Effects          :',
  '#1 (id=2)        : Apply Aura (6) | Dummy (4)',
  '                   Base Value: 1 | Target: Self (1)',
  '',
  `Name             : Vanish (id=${VANISH}) [Spell Family (8)] `,
  'Class            : Rogue',
  'Cooldown         : 120 seconds',
  'Effects          :',
  '#1 (id=3)        : Dummy (3)',
  '                   Base Value: 0 | Target: Self (1)',
].join('\r\n');

const MAGE_DUMP = [
  `Name             : Ice Barrier (id=${ICE_BARRIER}) [Spell Family (3)] `,
  'Class            : Mage',
  'Cooldown         : 25 seconds',
  'Duration         : 60 seconds',
  'Effects          :',
  '#1 (id=4)        : Apply Aura (6) | Absorb Damage (69)',
  '                   Base Value: 100 | Target: Self (1)',
].join('\n');

const TALENTS = { [UNSEEN_BLADE_ENTRY]: { name: 'Unseen Blade', icon: 'x', spellId: 1 } };

function texts(over: Partial<RulebookSourceTexts> = {}): RulebookSourceTexts {
  return { spec: SPEC, tier: TIER, apl: APL, spellData: DUMP, talents: TALENTS, ...over };
}

function build(over: Partial<RulebookSourceTexts> = {}) {
  return builder.build(builder.prepare(texts(over)), []);
}

describe('RulebookBuildService.build', () => {
  it('carries the spec key and lists the cooldowns in APL order', () => {
    const { rulebook } = build();
    expect(rulebook.spec).toBe(SPEC.spec);
    expect(rulebook.major_cooldowns.map(cooldown => cooldown.spell_id)).toEqual([SHADOW_BLADES, SHADOW_DANCE, VANISH]);
    expect(rulebook.major_cooldowns[1]?.cooldown).toBe(SHADOW_DANCE_RECHARGE_S);
  });

  it('grades severity by the third of the priority list the rule came from', () => {
    const { rulebook } = build();
    const severities = rulebook.rules.map(rule => `${rule.condition?.kind}:${rule.severity}`);
    expect(severities).toEqual(['cast_without_prior:critical', 'hold_cooldown_for_anchor:warning', 'resource_at_cast:info']);
  });

  it('maps a talent gate to the group of trait entries carrying its name', () => {
    const { rulebook, gaps } = build();
    const gated = rulebook.rules.find(rule => rule.condition?.kind === 'resource_at_cast');
    expect(gated?.requires_talents).toEqual([[UNSEEN_BLADE_ENTRY]]);
    expect(gaps).toEqual([]);
  });

  it('reads a numbered talent token as the name it numbers when that many entries share it', () => {
    const talents = Object.fromEntries(ANCIENT_ARTS_ENTRIES.map(id => [id, { name: 'Ancient Arts', icon: 'x' }]));
    const numbered = build({ apl: 'actions=vanish,if=talent.ancient_arts_3&combo_points<=2', talents });
    expect(numbered.rulebook.rules[0]?.requires_talents).toEqual([ANCIENT_ARTS_ENTRIES]);
    const short = build({ apl: 'actions=vanish,if=talent.ancient_arts_4&combo_points<=2', talents });
    expect(short.gaps).toEqual([{ kind: 'talent', token: 'ancient_arts_4' }]);
  });

  it('reports a talent the data does not name and leaves the rule ungated', () => {
    const missing = build({ talents: {} });
    expect(missing.gaps).toEqual([{ kind: 'talent', token: 'unseen_blade' }]);
    expect(missing.rulebook.rules.find(rule => rule.condition?.kind === 'resource_at_cast')?.requires_talents).toBeUndefined();
  });

  it('reads the worn set bonus from the tier directory', () => {
    expect(builder['setBonusToken'](TIER)).toBe('midnight_season_2');
    expect(builder['setBonusToken']({ branch: 'thewarwithin', dir: 'TWW3' })).toBe('thewarwithin_season_3');
  });
});

describe('RulebookBuildService.parseTier', () => {
  it('splits branch and directory and rejects anything else', () => {
    expect(builder.parseTier('midnight/MID2')).toEqual(TIER);
    expect(builder.parseTier('MID2')).toBeNull();
    expect(builder.parseTier('a/b/c')).toBeNull();
    expect(builder.parseTier(null)).toBeNull();
  });
});

describe('RulebookBuildService.sourceKey', () => {
  it('keys the sources on what the rules read, so an edit outside the gates leaves the key alone', async () => {
    const prepared = await builder.sourceKey(builder.prepare(texts()));
    const reworded = await builder.sourceKey(builder.prepare(texts({ apl: `# Subtlety APL can be found at https://example.invalid/subtlety.txt\n${APL}` })));
    const regated = await builder.sourceKey(builder.prepare(texts({ apl: APL.replace('remains>=35', 'remains>=40') })));
    expect(prepared).toMatch(/^[0-9a-f]+$/);
    expect(prepared).toHaveLength(KEY_LENGTH);
    expect(reworded).toBe(prepared);
    expect(regated).not.toBe(prepared);
  });

  it('changes the key when a record the spec owns changes', async () => {
    const prepared = await builder.sourceKey(builder.prepare(texts()));
    const recharged = await builder.sourceKey(builder.prepare(texts({ spellData: DUMP.replace(`1 (${SHADOW_DANCE_RECHARGE_S} seconds cooldown)`, `1 (${SHADOW_DANCE_RECHARGE_S + 10} seconds cooldown)`) })));
    expect(recharged).not.toBe(prepared);
  });
});

describe('RulebookBuildService.prepare', () => {
  it('leaves out the names the exclusion overlay lists for the spec, actions and records alike', () => {
    const prepared = builder.prepare(texts({ spec: EXCLUDED_SPEC, apl: 'actions=ice_barrier\nactions+=/vanish', spellData: `${MAGE_DUMP}\n${DUMP}` }));
    expect(prepared.apl.actions.map(action => action.action)).toEqual(['vanish']);
    expect(prepared.records.some(record => record.id === ICE_BARRIER)).toBe(false);
    expect(prepared.gaps.some(gap => gap.token === 'ice_barrier')).toBe(false);
  });

  it('collects the gaps the sources alone leave, before any parse is sampled', () => {
    const prepared = builder.prepare(texts({ apl: `${APL}\nactions+=/goremaws_bite,if=buff.shadow_dance.brand_new_field` }));
    expect(prepared.gaps).toEqual([{ kind: 'expression', token: 'buff.*.brand_new_field' }, { kind: 'action', token: 'goremaws_bite' }]);
  });
});
