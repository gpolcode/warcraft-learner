import { describe, it, expect } from 'vitest';
import { buildCdSpellIds, buildBurstSlice } from './burst-slice.ts';
import type { EncounterBench } from '../models/bench.models.ts';

describe('buildCdSpellIds', () => {
  it('maps cooldown and defensive names to spell ids, skipping missing ids', () => {
    const map = buildCdSpellIds(
      [
        { name: 'Shadow Blades', spell_id: 121471, cooldown: 90 },
        { name: 'NoId', spell_id: 0, cooldown: 60 },
      ],
      [{ name: 'Cloak of Shadows', spell_id: 31224, cooldown: 120 }],
    );
    expect(map).toEqual({ 'Shadow Blades': 121471, 'Cloak of Shadows': 31224 });
  });
});

describe('buildBurstSlice', () => {
  it('carries the bench windows through and attaches the cd spell ids', () => {
    const bench = {
      spec: 'SubtletyRogue', encounter_id: 7, encounter_name: 'Boss', sample_count: 9,
      burst_windows: [{ time_s: 1, window_length_s: 18 }],
    } as unknown as EncounterBench;

    const slice = buildBurstSlice(bench, [{ name: 'Shadow Blades', spell_id: 121471, cooldown: 90 }], []);

    expect(slice).toMatchObject({ spec: 'SubtletyRogue', encounter_id: 7, encounter_name: 'Boss', sample_count: 9 });
    expect(slice.windows).toBe(bench.burst_windows);
    expect(slice.cd_spell_ids).toEqual({ 'Shadow Blades': 121471 });
  });
});
