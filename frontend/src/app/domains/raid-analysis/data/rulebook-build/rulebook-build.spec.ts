import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RulebookBuildService, type RulebookBuildInputs } from './rulebook-build-service';
import type { SpecMeta } from '../data-files/spec-meta.models';
import { SHADOW_BLADES, SHADOW_DANCE, VANISH } from '../../../../../testing/spell-ids';

const builder = TestBed.inject(RulebookBuildService);

const SPEC: SpecMeta = {
  spec: 'SubtletyRogue', className: 'Rogue', specName: 'Subtlety', classLabel: 'Rogue', specLabel: 'Subtlety',
  classIcon: 'class_rogue',
};
const TIER = { branch: 'midnight', dir: 'MID2' };
const UNSEEN_BLADE_ENTRY = 125_700;
const PROFILE_SHA = 'p'.repeat(64);
const DUMP_SHA = 'd'.repeat(64);

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

function build(over: Partial<RulebookBuildInputs> = {}) {
  return builder.build({
    spec: SPEC, tier: TIER, profile: { text: PROFILE, sha256: PROFILE_SHA }, spellData: { text: DUMP, sha256: DUMP_SHA },
    samples: [], talents: { [UNSEEN_BLADE_ENTRY]: { name: 'Unseen Blade', icon: 'x', spellId: 1 } }, ...over,
  });
}

describe('RulebookBuildService.build', () => {
  const { rulebook, report } = build();

  it('carries the spec key and lists the cooldowns in APL order with their full gate', () => {
    expect(rulebook.spec).toBe(SPEC.spec);
    expect(rulebook.major_cooldowns.map(cooldown => cooldown.spell_id)).toEqual([SHADOW_BLADES, SHADOW_DANCE, VANISH]);
    expect(rulebook.major_cooldowns[1]?.apl_condition).toBe('cooldown.shadow_blades.remains>=35');
    expect(rulebook.major_cooldowns[1]?.cooldown).toBe(20);
  });

  it('grades severity by the third of the priority list the rule came from', () => {
    const severities = rulebook.rules.map(rule => `${rule.condition?.kind}:${rule.severity}`);
    expect(severities).toEqual(['cast_without_prior:critical', 'hold_cooldown_for_anchor:warning', 'resource_at_cast:info']);
  });

  it('maps a talent gate to the trait entry id the dump names', () => {
    const gated = rulebook.rules.find(rule => rule.condition?.kind === 'resource_at_cast');
    expect(gated?.requires_talents).toEqual([UNSEEN_BLADE_ENTRY]);
    expect(report.unresolvedTalents).toEqual([]);
  });

  it('reports a talent the dump does not name and leaves the rule ungated', () => {
    const missing = build({ talents: {} });
    expect(missing.report.unresolvedTalents).toEqual(['unseen_blade']);
    expect(missing.rulebook.rules.find(rule => rule.condition?.kind === 'resource_at_cast')?.requires_talents).toBeUndefined();
  });

  it('reads the worn set bonus from the tier directory', () => {
    expect(builder.setBonusToken(TIER)).toBe('midnight_season_2');
    expect(builder.setBonusToken({ branch: 'thewarwithin', dir: 'TWW3' })).toBe('thewarwithin_season_3');
  });
});
