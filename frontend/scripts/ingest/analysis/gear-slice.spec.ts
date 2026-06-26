import { describe, it, expect } from 'vitest';
import { buildGearSlice } from './gear-slice.ts';
import type { EncounterBench, GearStats } from '../models/bench.models.ts';

function benchWith(gear: GearStats): EncounterBench {
  return {
    spec: 'SubtletyRogue', encounter_id: 3144, encounter_name: 'Boss', sample_count: 10,
    avg_duration_s: 300, downtime_threshold_ms: 1500, top_avg_efficiency: 90, top_efficiency_stddev: 2,
    per_cd_benchmarks: {}, burst_windows: [], gear,
    top_defensives_summary: [], per_defensive_benchmarks: {}, defensive_windows: [],
  };
}

describe('buildGearSlice', () => {
  it('reshapes the bench gear block, dropping bookkeeping and coercing ids to numbers', () => {
    const gear: GearStats = {
      sample_count: 10,
      talent_builds: [
        { key: 'v2:1,2,3', count: 7, pct: 70, report_code: 'abc', fight_id: 4, player_name: 'Top' },
      ],
      trinkets: {
        12: [{ id: 193701, name: 'Guidon', count: 6, pct: 60 }],
        13: [{ id: '249343', name: 'Gaze', count: 4, pct: 40 }],
      },
      enchants: {
        15: [{ id: 8041, name: 'Sophic Devotion', count: 9, pct: 90 }],
      },
    };
    const slice = buildGearSlice(benchWith(gear));

    expect(slice).toMatchObject({
      spec: 'SubtletyRogue', encounter_id: 3144, encounter_name: 'Boss', sample_count: 10,
    });
    expect(slice.talent_builds[0]).toEqual({ key: 'v2:1,2,3', pct: 70, report_code: 'abc', fight_id: 4, player_name: 'Top' });
    expect(slice.trinkets[12]).toEqual([{ id: 193701, name: 'Guidon', pct: 60 }]);
    // string id coerced to number
    expect(slice.trinkets[13]).toEqual([{ id: 249343, name: 'Gaze', pct: 40 }]);
    expect(slice.enchants[15]).toEqual([{ id: 8041, name: 'Sophic Devotion', pct: 90 }]);
  });

  it('handles empty gear aggregates', () => {
    const slice = buildGearSlice(benchWith({ sample_count: 0, talent_builds: [], trinkets: {}, enchants: {} }));
    expect(slice.talent_builds).toEqual([]);
    expect(slice.trinkets).toEqual({});
    expect(slice.enchants).toEqual({});
  });
});
