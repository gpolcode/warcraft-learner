import { describe, it, expect } from 'vitest';
import { buildRotationCdSpellIds, buildRotationAbilityIcons, buildRotationSlice } from './rotation-slice.ts';
import type { EncounterBench } from '../models/bench.models.ts';

describe('buildRotationCdSpellIds', () => {
  it('maps cooldown and defensive names to spell ids, skipping missing ids', () => {
    const map = buildRotationCdSpellIds(
      [
        { name: 'Shadow Blades', spell_id: 121471, cooldown: 90 },
        { name: 'NoId', spell_id: 0, cooldown: 60 },
      ],
      [{ name: 'Cloak of Shadows', spell_id: 31224, cooldown: 120 }],
    );
    expect(map).toEqual({ 'Shadow Blades': 121471, 'Cloak of Shadows': 31224 });
  });
});

describe('buildRotationAbilityIcons', () => {
  it('bakes icon + name from meta, falling back to the rulebook name', () => {
    const icons = buildRotationAbilityIcons(
      [{ name: 'Shadow Blades', spell_id: 121471, cooldown: 90 }, { name: 'Vanish', spell_id: 1856, cooldown: 120 }],
      [{ name: 'Cloak of Shadows', spell_id: 31224, cooldown: 120 }],
      {
        121471: { icon: 'ability_rogue_shadowblades', name: 'Shadow Blades' },
        1856: { icon: 'ability_vanish', name: '' },
      },
    );
    expect(icons[121471]).toEqual({ icon: 'ability_rogue_shadowblades', name: 'Shadow Blades' });
    // empty meta name falls back to the rulebook cooldown name
    expect(icons[1856]).toEqual({ icon: 'ability_vanish', name: 'Vanish' });
    // missing meta is skipped (consumer renders a generic fallback)
    expect(icons[31224]).toBeUndefined();
  });
});

describe('buildRotationSlice', () => {
  const bench = {
    spec: 'SubtletyRogue', encounter_id: 7, encounter_name: 'Boss', sample_count: 9,
    avg_duration_s: 250, downtime_threshold_ms: 1600,
    top_avg_efficiency: 88, top_efficiency_stddev: 3,
    per_cd_benchmarks: { 'Shadow Blades': { avg_first_cast_s: 5 } },
  } as unknown as EncounterBench;

  it('reshapes the bench fields and attaches cooldowns, rules, spell ids and icons', () => {
    const cooldowns = [{ name: 'Shadow Blades', spell_id: 121471, cooldown: 90 }];
    const rules = [{ description: 'r', priority: 'high', action: 'do x', condition: null }];
    const slice = buildRotationSlice(
      bench, cooldowns, rules, [{ name: 'Cloak', spell_id: 31224, cooldown: 120 }],
      { 121471: { icon: 'sb_icon', name: 'Shadow Blades' } },
    );

    expect(slice).toMatchObject({
      spec: 'SubtletyRogue', encounter_id: 7, encounter_name: 'Boss', sample_count: 9,
      avg_duration_s: 250, downtime_threshold_ms: 1600, top_avg_efficiency: 88, top_efficiency_stddev: 3,
    });
    expect(slice.per_cd_benchmarks).toBe(bench.per_cd_benchmarks);
    expect(slice.major_cooldowns).toBe(cooldowns);
    expect(slice.rules).toBe(rules);
    expect(slice.cd_spell_ids).toEqual({ 'Shadow Blades': 121471, 'Cloak': 31224 });
    expect(slice.ability_icons[121471]).toEqual({ icon: 'sb_icon', name: 'Shadow Blades' });
  });

  it('defaults to empty ability icons when no meta is supplied', () => {
    const slice = buildRotationSlice(bench, [{ name: 'Shadow Blades', spell_id: 121471, cooldown: 90 }], [], []);
    expect(slice.ability_icons).toEqual({});
  });
});
