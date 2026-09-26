import { assert, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RotationTransformService, CdSummary } from './rotation-transform-service';
import { SHADOW_BLADES, BLOODLUST } from '../../../../../testing/spell-ids';
import { cast, applyBuff } from '../../../../../testing/builders/events';
import { planLoader, planSpell, specPlan } from '../../../../../testing/builders/spec-plan';
import { abilityLookup, parseRankings, reportsByCode } from '../../../../../testing/builders/wcl-fixtures';
import { provideApiFakes } from '../../../../../testing/api-fakes';
import { Results } from '../../../shared/util-http/result';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { SpecPlanLoaderService } from '../simc/spec-plan-loader-service';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';

const wclProjections = TestBed.inject(WclProjectionsService);
TestBed.resetTestingModule();
TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: SpecPlanLoaderService, useValue: {} },
] });
const svc = TestBed.inject(RotationTransformService);
TestBed.resetTestingModule();

/** Fixture events build against a fight-start of 0, so stamping is a pass-through to seconds. */
const timed: WclProjectionsService['withRelativeS'] = (events, startMs) => wclProjections.withRelativeS(events, startMs);

describe('summarizeCooldownCasts', () => {
  const cooldowns = [{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }];

  it('counts casts, first cast, BL alignment and offset', () => {
    const summaries = svc['summarizeCooldownCasts'](timed([cast(SHADOW_BLADES, 32)], 0), cooldowns, 200, 30);
    expect(summaries[0]).toMatchObject({ name: 'Shadow Blades', total_uses: 1, first_cast_s: 32, bl_aligned: true, bl_offset_s: 2 });
  });

  it('flags a held second cast (>8s past the prior cast + cooldown)', () => {
    const summaries = svc['summarizeCooldownCasts'](timed([cast(SHADOW_BLADES, 0), cast(SHADOW_BLADES, 110)], 0), cooldowns, 200, null);
    assert.exists(summaries[0]);
    expect(summaries[0].cast_pattern).toBe('hold');
    // prior 0 + cd 90 = expected 90; actual 110 -> 20s hold.
    assert.exists(summaries[0]);
    expect(summaries[0].hold_windows[0]).toMatchObject({ cast_index: 2, actual_s: 110, delay_s: 20 });
  });

  it('measures each hold from the prior cast, so one hold does not cascade', () => {
    // cast 2 held (0 -> 200, well past reset); cast 3 is on cooldown after it (200 -> 290).
    const summaries = svc['summarizeCooldownCasts'](
      timed([cast(SHADOW_BLADES, 0), cast(SHADOW_BLADES, 200), cast(SHADOW_BLADES, 290)], 0), cooldowns, 400, null);
    assert.exists(summaries[0]);
    expect(summaries[0].hold_windows).toHaveLength(1);
    assert.exists(summaries[0]);
    assert.exists(summaries[0].hold_windows[0]);
    expect(summaries[0].hold_windows[0].cast_index).toBe(2);
  });

  it('does not flag a hold exactly at the threshold (strict)', () => {
    // prior 0 + cd 90 + 8s threshold = 98; a cast at 98 has delay exactly 8 -> not a hold.
    const atBoundary = svc['summarizeCooldownCasts'](timed([cast(SHADOW_BLADES, 0), cast(SHADOW_BLADES, 98)], 0), cooldowns, 200, null);
    assert.exists(atBoundary[0]);
    expect(atBoundary[0].hold_windows).toHaveLength(0);
    const past = svc['summarizeCooldownCasts'](timed([cast(SHADOW_BLADES, 0), cast(SHADOW_BLADES, 98.1)], 0), cooldowns, 200, null);
    assert.exists(past[0]);
    expect(past[0].hold_windows).toHaveLength(1);
  });
});

describe('castGapListS', () => {
  it('returns sorted inter-cast gaps in seconds', () => {
    expect(svc['castGapListS'](timed([cast(1, 0), cast(1, 3), cast(1, 1)], 0))).toEqual([1, 2]);
  });
});

describe('buildCdBenchmark', () => {
  const entry = (firstCast: number, uses: number, dur: number, blOffset: number | null, blAligned: boolean, times: number[]): CdSummary => ({
    name: 'Shadow Blades', total_uses: uses, first_cast_s: firstCast, bl_aligned: blAligned, bl_offset_s: blOffset,
    cast_times_s: times, hold_windows: [], cast_pattern: 'on_cooldown', fight_duration_s: dur,
  });
  it('rolls first cast, gaps, BL offset and uses/min across parses', () => {
    const bench = svc['buildCdBenchmark']([
      entry(5, 2, 120, 2, true, [5, 95]),
      entry(7, 2, 120, 4, true, [7, 97]),
    ], 90);
    expect(bench.sample_count).toBe(2);
    expect(bench.used_sample_count).toBe(2);
    expect(bench.avg_first_cast_s).toBe(6);
    expect(bench.avg_bl_offset_s).toBe(3);
    expect(bench.bl_pct).toBe(100);
    // 2 casts over a 120s fight -> 1.0 uses/min for both parses.
    expect(bench.uses_per_min.avg).toBe(1);
    // inter-cast gaps [95-5, 97-7] = [90, 90] -> mean 90, stddev 0.
    expect(bench.avg_gap_s).toBe(90);
    expect(bench.stddev_gap_s).toBe(0);
  });

  it('counts used_sample_count as the parses with at least one use (use-share gate)', () => {
    const TOTAL_PARSES = 2;
    const USERS = 1;  // one parse used it, one never did
    const usedParse = entry(5, 2, 120, 2, true, [5, 95]);
    const unusedParse: CdSummary = {
      name: 'Shadow Blades', total_uses: 0, first_cast_s: null, bl_aligned: false, bl_offset_s: null,
      cast_times_s: [], hold_windows: [], cast_pattern: 'on_cooldown', fight_duration_s: 120,
    };
    const bench = svc['buildCdBenchmark']([usedParse, unusedParse], 90);
    expect(bench.sample_count).toBe(TOTAL_PARSES);
    expect(bench.used_sample_count).toBe(USERS);
  });

  it('computes median_uses over only the parses that used it (mixed sample)', () => {
    const usedCounts = [1, 3, 5];  // sorted -> median 3
    const usedEntries = usedCounts.map(uses => entry(5, uses, 120, null, false, Array.from({ length: uses }, (_, i) => 5 + i * 10)));
    const unused: CdSummary = {
      name: 'Shadow Blades', total_uses: 0, first_cast_s: null, bl_aligned: false, bl_offset_s: null,
      cast_times_s: [], hold_windows: [], cast_pattern: 'on_cooldown', fight_duration_s: 120,
    };
    // Folding the two unused parses in would drag the median from 3 down to 1 ([0, 0, 1, 3, 5]).
    const bench = svc['buildCdBenchmark']([...usedEntries, unused, { ...unused }], 90);
    expect(bench.median_uses).toBe(3);
  });

  it('leaves gap + BL fields null when not applicable', () => {
    const bench = svc['buildCdBenchmark']([entry(5, 1, 120, null, false, [5])], 90);
    expect(bench.avg_gap_s).toBeNull();
    expect(bench.avg_bl_offset_s).toBeNull();
    expect(bench.bl_pct).toBe(0);
  });
});

describe('computeEfficiencyThresholds', () => {
  it('derives a p90 downtime floor and per-parse efficiency mean', () => {
    const result = svc['computeEfficiencyThresholds']([{ gapListS: [0.5, 0.6, 0.7, 5], durationS: 100 }]);
    // d3 p90 quantile of [0.5,0.6,0.7,5]: 0.7 + 0.7*(5-0.7) = 3.71s.
    expect(result.downtimeThresholdS).toBe(3.71);
    // only the 5s gap clears the floor -> 5s downtime over 100s -> (1 - 5/100)*100 = 95%.
    expect(result.topAvgEfficiency).toBe(95);
  });

  it('falls back to the default floor with no gaps', () => {
    const result = svc['computeEfficiencyThresholds']([{ gapListS: [], durationS: 100 }]);
    expect(result.downtimeThresholdS).toBe(1.5);
    expect(result.topAvgEfficiency).toBe(0);
  });
});

describe('aggregateCdBenchmarks', () => {
  it('groups per-parse summaries by cooldown name', () => {
    const summary = (name: string): CdSummary => ({
      name, total_uses: 1, first_cast_s: 5, bl_aligned: false, bl_offset_s: null,
      cast_times_s: [5], hold_windows: [], cast_pattern: 'on_cooldown', fight_duration_s: 120,
    });
    const result = svc['aggregateCdBenchmarks'](
      [[summary('Shadow Blades')], [summary('Shadow Blades')]],
      [{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }]);
    expect(Object.keys(result)).toEqual(['Shadow Blades']);
    assert.exists(result['Shadow Blades']);
    expect(result['Shadow Blades'].sample_count).toBe(2);
  });
});

const reportShape = {
  endTimeMs: 120_000,
  abilities: [{ gameID: SHADOW_BLADES, name: 'Shadow Blades', icon: 'sb' }],
};

// An id outside the plan's cooldowns; exercises the cooldown-cast filter.
const UNTRACKED_SPELL_ID = 99;

// The floor the transform benches at (MIN_PARSE_COUNT in the service, which tracks the list bench's own MIN_MEASURED_PARSES).
const MIN_SAMPLE_COUNT = 5;

const wclFake = {
  // getRankings returns the raw WCL envelope ({ rankings }); the transform unwraps it.
  getRankings: async () => ({ rankings: parseRankings(MIN_SAMPLE_COUNT) }),
  getReport: reportsByCode(reportShape),
  getAllEvents: async (_code: string, _fightId: number, dataType: string) =>
    dataType === 'Casts' ? [cast(SHADOW_BLADES, 5), cast(UNTRACKED_SPELL_ID, 8)] : [applyBuff(BLOODLUST, 6)],
  getAbilities: abilityLookup({ [SHADOW_BLADES]: { icon: 'sb', name: 'Shadow Blades' } }),
  getCombatantInfo: async () => [],
};
const COOLDOWNS = [{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }];
// Shadow Blades outside Bloodlust: every fixture log casts it at 5 s, before the lust the log applies at 6 s.
const LIST = {
  lines: [{ action: 'shadow_blades', terms: ['!buff.bloodlust.up'] }],
  variables: [],
  spells: { shadow_blades: planSpell('Shadow Blades', [SHADOW_BLADES], { cooldown: 90 }) },
  talents: {},
};

describe('RotationTransformService (live, in-browser)', () => {
  it('computes a rotation bench from the top parses', async () => {
    TestBed.configureTestingModule({ providers: provideApiFakes({ wcl: wclFake, plans: planLoader(specPlan({ cooldowns: COOLDOWNS })) }) });
    const result = await TestBed.inject(RotationTransformService).getBench('SubtletyRogue', 1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const bench = result.value;
      expect(bench.sample_count).toBe(MIN_SAMPLE_COUNT);
      expect(bench.encounter_name).toBe('Boss');
      expect(bench.cd_spell_ids).toEqual({ 'Shadow Blades': SHADOW_BLADES });
      assert.exists(bench.per_cd_benchmarks['Shadow Blades']);
      expect(bench.per_cd_benchmarks['Shadow Blades'].sample_count).toBe(MIN_SAMPLE_COUNT);
      expect(bench.ability_icons[SHADOW_BLADES]).toEqual({ icon: 'sb', name: 'Shadow Blades' });
      expect(bench.major_cooldowns).toHaveLength(1);
    }
  });

  it('carries the spec\'s list and benches each button the top logs press against its lines', async () => {
    const plan = specPlan({ cooldowns: COOLDOWNS, ...LIST });
    TestBed.configureTestingModule({ providers: provideApiFakes({ wcl: wclFake, plans: planLoader(plan) }) });
    const result = await TestBed.inject(RotationTransformService).getBench('SubtletyRogue', 1);
    assert(result.ok);
    expect(result.value.list).toEqual(LIST);
    expect(result.value.buttons.map(button => [button.action, button.spell_id, button.right])).toEqual([['shadow_blades', SHADOW_BLADES, { lo: 1, avg: 1, hi: 1 }]]);
  });

  it('propagates a missing error when the spec\'s plan has neither cooldowns nor a list', async () => {
    TestBed.configureTestingModule({ providers: provideApiFakes({ wcl: wclFake, plans: planLoader(specPlan()) }) });
    expect(await TestBed.inject(RotationTransformService).getBench('SubtletyRogue', 1))
      .toEqual(Results.missing('No cooldowns or rotation for this spec.'));
  });
});
