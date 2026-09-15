import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RulebookBuildService, type RulebookSourceTexts } from './rulebook-build-service';
import type { SpecMeta } from '../data-files/spec-meta.models';
import { SHADOW_BLADES, SHADOW_DANCE, VANISH } from '../../../../../testing/spell-ids';

const builder = TestBed.inject(RulebookBuildService);

const SPEC: SpecMeta = {
  spec: 'SubtletyRogue', className: 'Rogue', specName: 'Subtlety', classLabel: 'Rogue', specLabel: 'Subtlety',
  classIcon: 'class_rogue',
};
/** A spec the exclusion overlay names, hiding the barrier of another spec. */
const EXCLUDED_SPEC: SpecMeta = { ...SPEC, spec: 'ArcaneMage', className: 'Mage', specName: 'Arcane', classLabel: 'Mage', specLabel: 'Arcane' };
const ICE_BARRIER = 11426;
const TIER = { branch: 'midnight', dir: 'MID2' };
const UNSEEN_BLADE_ENTRY = 125_700;
/** Ancient Arts is an apex talent: three entries share the name, and SimulationCraft numbers them. */
const ANCIENT_ARTS_ENTRIES = [137_062, 137_063, 137_064];
const KEY_LENGTH = 16;

/** Three cooldown lines in priority order, so severity walks critical, warning, info. */
const PROFILE = [
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
  'Charges          : 1 (20 seconds cooldown)',
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
  return { spec: SPEC, tier: TIER, profile: PROFILE, spellData: DUMP, talents: TALENTS, ...over };
}

async function build(over: Partial<RulebookSourceTexts> = {}) {
  return builder.build(await builder.prepare(texts(over)), []);
}

describe('RulebookBuildService.build', () => {
  it('carries the spec key and lists the cooldowns in APL order', async () => {
    const { rulebook } = await build();
    expect(rulebook.spec).toBe(SPEC.spec);
    expect(rulebook.major_cooldowns.map(cooldown => cooldown.spell_id)).toEqual([SHADOW_BLADES, SHADOW_DANCE, VANISH]);
    expect(rulebook.major_cooldowns[1]?.cooldown).toBe(20);
  });

  it('grades severity by the third of the priority list the rule came from', async () => {
    const { rulebook } = await build();
    const severities = rulebook.rules.map(rule => `${rule.condition?.kind}:${rule.severity}`);
    expect(severities).toEqual(['cast_without_prior:critical', 'hold_cooldown_for_anchor:warning', 'resource_at_cast:info']);
  });

  it('maps a talent gate to the group of trait entries carrying its name', async () => {
    const { rulebook, report } = await build();
    const gated = rulebook.rules.find(rule => rule.condition?.kind === 'resource_at_cast');
    expect(gated?.requires_talents).toEqual([[UNSEEN_BLADE_ENTRY]]);
    expect(report.gaps).toEqual([]);
  });

  it('reads a numbered talent token as the name it numbers when that many entries share it', async () => {
    const talents = Object.fromEntries(ANCIENT_ARTS_ENTRIES.map(id => [id, { name: 'Ancient Arts', icon: 'x' }]));
    const numbered = await build({ profile: 'actions=vanish,if=talent.ancient_arts_3&combo_points<=2', talents });
    expect(numbered.rulebook.rules[0]?.requires_talents).toEqual([ANCIENT_ARTS_ENTRIES]);
    const short = await build({ profile: 'actions=vanish,if=talent.ancient_arts_4&combo_points<=2', talents });
    expect(short.report.gaps).toEqual([{ kind: 'talent', token: 'ancient_arts_4' }]);
  });

  it('reports a talent the data does not name and leaves the rule ungated', async () => {
    const missing = await build({ talents: {} });
    expect(missing.report.gaps).toEqual([{ kind: 'talent', token: 'unseen_blade' }]);
    expect(missing.rulebook.rules.find(rule => rule.condition?.kind === 'resource_at_cast')?.requires_talents).toBeUndefined();
  });

  it('reads the worn set bonus from the tier directory', () => {
    expect(builder.setBonusToken(TIER)).toBe('midnight_season_2');
    expect(builder.setBonusToken({ branch: 'thewarwithin', dir: 'TWW3' })).toBe('thewarwithin_season_3');
  });
});

describe('RulebookBuildService.prepare', () => {
  it('keys the sources on what the rules read, so a profile edit outside the gates leaves the key alone', async () => {
    const prepared = await builder.prepare(texts());
    const reworded = await builder.prepare(texts({ profile: `rogue="MID2_Rogue_Subtlety"\n# a comment\n${PROFILE}` }));
    const regated = await builder.prepare(texts({ profile: PROFILE.replace('remains>=35', 'remains>=40') }));
    expect(prepared.key).toMatch(/^[0-9a-f]+$/);
    expect(prepared.key).toHaveLength(KEY_LENGTH);
    expect(reworded.key).toBe(prepared.key);
    expect(regated.key).not.toBe(prepared.key);
  });

  it('changes the key when a record the spec owns changes', async () => {
    const prepared = await builder.prepare(texts());
    const recharged = await builder.prepare(texts({ spellData: DUMP.replace('1 (20 seconds cooldown)', '1 (30 seconds cooldown)') }));
    expect(recharged.key).not.toBe(prepared.key);
  });

  it('leaves out the names the exclusion overlay lists for the spec, actions and records alike', async () => {
    const prepared = await builder.prepare(texts({ spec: EXCLUDED_SPEC, profile: 'actions=ice_barrier\nactions+=/vanish', spellData: `${MAGE_DUMP}\n${DUMP}` }));
    expect(prepared.apl.actions.map(action => action.action)).toEqual(['vanish']);
    expect(prepared.records.some(record => record.id === ICE_BARRIER)).toBe(false);
    expect(prepared.gaps.some(gap => gap.token === 'ice_barrier')).toBe(false);
  });

  it('collects the gaps the sources alone leave, before any parse is sampled', async () => {
    const prepared = await builder.prepare(texts({ profile: `${PROFILE}\nactions+=/goremaws_bite,if=buff.shadow_dance.brand_new_field` }));
    expect(prepared.gaps).toEqual([{ kind: 'expression', token: 'buff.*.brand_new_field' }, { kind: 'action', token: 'goremaws_bite' }]);
  });
});
