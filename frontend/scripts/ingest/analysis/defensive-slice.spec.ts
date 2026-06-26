import { describe, it, expect } from 'vitest';
import {
  buildDefensiveSpellIds, buildDefensivePlanMeta, buildAbilityIcons, buildDefensiveSlice,
} from './defensive-slice.ts';
import type { EncounterBench, ClusteredDefensiveWindow } from '../models/bench.models.ts';

describe('buildDefensiveSpellIds', () => {
  it('maps defensive names to spell ids, skipping missing ids', () => {
    expect(buildDefensiveSpellIds([
      { name: 'Cloak of Shadows', spell_id: 31224, cooldown: 120 },
      { name: 'NoId', spell_id: 0, cooldown: 60 },
    ])).toEqual({ 'Cloak of Shadows': 31224 });
  });
});

describe('buildDefensivePlanMeta', () => {
  it('carries name / cooldown / duration / rule / talent flag with nullable defaults', () => {
    expect(buildDefensivePlanMeta([
      { name: 'Cloak of Shadows', spell_id: 31224, cooldown: 120, duration: 5, usage_rule: 'Use on big hits', talent_gated: true },
      { name: 'Evasion', spell_id: 5277, cooldown: 120 },
    ])).toEqual([
      { name: 'Cloak of Shadows', spell_id: 31224, cooldown: 120, duration: 5, usage_rule: 'Use on big hits', talent_gated: true },
      { name: 'Evasion', spell_id: 5277, cooldown: 120, duration: null, usage_rule: null, talent_gated: false },
    ]);
  });
});

describe('buildAbilityIcons', () => {
  const windows = [
    { ability_breakdown: [{ spell_id: 999 }, { spell_id: 888 }] },
  ] as unknown as ClusteredDefensiveWindow[];

  it('bakes icon/name for defensive spells + window abilities, dropping .jpg', () => {
    const icons = buildAbilityIcons(
      [{ name: 'Cloak of Shadows', spell_id: 31224, cooldown: 120 }],
      windows,
      [
        { gameID: 31224, name: 'Cloak of Shadows', icon: 'spell_shadow.jpg' },
        { gameID: 999, name: 'Boss Hit', icon: 'ability_boss' },
        // 888 has no meta -> skipped
      ],
    );
    expect(icons).toEqual({
      31224: { icon: 'spell_shadow', name: 'Cloak of Shadows' },
      999: { icon: 'ability_boss', name: 'Boss Hit' },
    });
  });
});

describe('buildDefensiveSlice', () => {
  it('carries bench fields through and bakes defensive metadata + icons', () => {
    const bench = {
      spec: 'SubtletyRogue', encounter_id: 7, encounter_name: 'Boss', sample_count: 9,
      per_defensive_benchmarks: { 'Cloak of Shadows': { avg_uses: 2 } },
      defensive_windows: [{ time_s: 30, ability_breakdown: [{ spell_id: 555 }] }],
      top_defensives_summary: [{ name: 'Cloak of Shadows', spell_id: 31224, avg_uses: 2, min_uses: 1, max_uses: 3, sample_count: 9 }],
    } as unknown as EncounterBench;

    const slice = buildDefensiveSlice(
      bench,
      [{ name: 'Cloak of Shadows', spell_id: 31224, cooldown: 120, duration: 5 }],
      [{ gameID: 31224, name: 'Cloak of Shadows', icon: 'spell_shadow' }, { gameID: 555, name: 'Big Hit', icon: 'hit' }],
    );

    expect(slice).toMatchObject({ spec: 'SubtletyRogue', encounter_id: 7, encounter_name: 'Boss', sample_count: 9 });
    expect(slice.per_defensive_benchmarks).toBe(bench.per_defensive_benchmarks);
    expect(slice.defensive_windows).toBe(bench.defensive_windows);
    expect(slice.top_defensives_summary).toBe(bench.top_defensives_summary);
    expect(slice.cd_spell_ids).toEqual({ 'Cloak of Shadows': 31224 });
    expect(slice.defensives[0]).toMatchObject({ name: 'Cloak of Shadows', spell_id: 31224, duration: 5 });
    expect(slice.ability_icons).toEqual({
      31224: { icon: 'spell_shadow', name: 'Cloak of Shadows' },
      555: { icon: 'hit', name: 'Big Hit' },
    });
  });
});
