import { assert, describe, it, expect } from 'vitest';
import { SHADOW_BLADES, SECRET_TECHNIQUE, VANISH } from '../../../../../testing/spell-ids';
import { RotationFeatureService } from './rotation-feature-service';
import { cdBench } from './rotation-harness';
import { TestBed } from '@angular/core/testing';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';
import { ROTATION_DATA_SOURCE, RotationParseMeasures } from './rotation-data-source';

TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: ROTATION_DATA_SOURCE, useValue: {} },
] });
const svc = TestBed.inject(RotationFeatureService);
TestBed.resetTestingModule();

describe('buildCdPlan', () => {
  const abilities = { [VANISH]: { icon: 'vanish', name: 'Vanish' }, [SHADOW_BLADES]: { icon: 'sb', name: 'Shadow Blades' } };
  it('orders by opener priority and surfaces holds for majority-hold cds', () => {
    const cooldowns = [
      { name: 'Vanish', spell_id: VANISH, cooldown: 120, opener_priority: 2 },
      { name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90, opener_priority: 1 },
    ];
    const benchmarks = {
      'Shadow Blades': cdBench({ majority_hold: true, hold_targets: { '2': { target_s: 100, delay_s: 10, band_s: 5, effective_cd_s: 90, count: 4, total_samples: 5 } } }),
      'Vanish': cdBench({ avg_first_cast_s: 20 }),
    };
    const plan = svc['buildCdPlan'](cooldowns, benchmarks, abilities);
    expect(plan.map(p => p.name)).toEqual(['Shadow Blades', 'Vanish']);
    assert.exists(plan[0]);
    expect(plan[0].holds).toEqual([{ castIndex: 2, targetS: 100 }]);
  });

  describe('the Bloodlust badge', () => {
    const MID_LUST_S = 120;
    const PULL_LUST_S = 1;
    const IN_LUST_OFFSET_S = 5;
    /** Past the window's 55s trail. */
    const OUT_OF_LUST_OFFSET_S = 120;
    const TOP_LOGS = 10;
    /** `pressed` of ten top logs lusting at `lustS` pressed Shadow Blades for it; the rest pressed it a minute after the lust window. */
    const lusting = (lustS: number, pressed: number): RotationParseMeasures[] => Array.from({ length: TOP_LOGS }, (_unused, index) => ({
      idle_s: null, lust_s: lustS, phase_starts: [], buttons: {},
      cd_casts_s: { 'Shadow Blades': [index < pressed ? lustS + IN_LUST_OFFSET_S : lustS + OUT_OF_LUST_OFFSET_S] },
    }));
    const badge = (perParse: RotationParseMeasures[]): boolean | undefined =>
      svc['buildCdPlan']([{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }], { 'Shadow Blades': cdBench({ bl_pct: 100 }) }, abilities, perParse)[0]?.bloodlust;

    it('shows once half of the top logs that lusted mid-fight pressed it for their lust', () => {
      expect(badge(lusting(MID_LUST_S, TOP_LOGS / 2))).toBe(true);
    });

    it('does not show at one top log short of half', () => {
      expect(badge(lusting(MID_LUST_S, TOP_LOGS / 2 - 1))).toBe(false);
    });

    it('learns nothing from top logs that lusted on the pull, whatever the baked share says', () => {
      expect(badge(lusting(PULL_LUST_S, TOP_LOGS))).toBe(false);
    });
  });

  it('falls back to an empty icon for a cooldown whose spell id is not in the ability map', () => {
    // SECRET_TECHNIQUE is deliberately absent from `abilities`, so the guarded lookup must not throw.
    const UNMAPPED_SPELL_ID = SECRET_TECHNIQUE;
    const plan = svc['buildCdPlan']([{ name: 'Unmapped', spell_id: UNMAPPED_SPELL_ID, cooldown: 60 }], {}, abilities);
    assert.exists(plan[0]);
    expect(plan[0].spellId).toBe(UNMAPPED_SPELL_ID);
    assert.exists(plan[0]);
    expect(plan[0].icon).toBe('');
  });

  it('renders the empty state for typical uses when no top parse ever used the cd', () => {
    // used_sample_count 0 -> the transform emits avg_first_cast_s 0, a no-data sentinel, not a 0:00 open.
    const TOTAL_SAMPLED = 5;
    const unused = cdBench({
      sample_count: TOTAL_SAMPLED, used_sample_count: 0, avg_first_cast_s: 0, median_uses: 0,
      uses_per_min: { avg: 0, stddev: 0 },
    });
    const plan = svc['buildCdPlan']([{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }], { 'Shadow Blades': unused }, abilities);
    assert.exists(plan[0]);
    expect(plan[0].firstCastS).toBeNull();
    assert.exists(plan[0]);
    expect(plan[0].usesPerMin).toBeNull();
    // No sampled parse ever used it, so the row renders the honest empty state rather than a 0.
    assert.exists(plan[0]);
    expect(plan[0].typicalUses).toBeNull();
    // The adoption counts reaching the template are the raw sample counts, not a precomputed "0/5" string.
    assert.exists(plan[0]);
    expect(plan[0].usedSampleCount).toBe(0);
    assert.exists(plan[0]);
    expect(plan[0].sampleCount).toBe(TOTAL_SAMPLED);
  });

  it('nulls the per-use fields when only a minority of top parses use the cd (use-share gate)', () => {
    // 2/10 = 20%, below the majority gate, so even a real avg_first_cast_s is unrepresentative of the plan.
    const TOTAL_SAMPLED = 10;
    const MINORITY_USERS = 2;
    const MEDIAN_USES = 3;
    const rare = cdBench({ sample_count: TOTAL_SAMPLED, used_sample_count: MINORITY_USERS, avg_first_cast_s: 20, median_uses: MEDIAN_USES });
    const plan = svc['buildCdPlan']([{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }], { 'Shadow Blades': rare }, abilities);
    assert.exists(plan[0]);
    expect(plan[0].firstCastS).toBeNull();
    assert.exists(plan[0]);
    expect(plan[0].usesPerMin).toBeNull();
    // Typical uses only gates on any adoption at all, not the majority share, so a minority still surfaces it.
    assert.exists(plan[0]);
    expect(plan[0].typicalUses).toBe(MEDIAN_USES);
    assert.exists(plan[0]);
    expect(plan[0].usedSampleCount).toBe(MINORITY_USERS);
    assert.exists(plan[0]);
    expect(plan[0].sampleCount).toBe(TOTAL_SAMPLED);
  });

  it('keeps the per-use fields when a majority of top parses use the cd', () => {
    // Default cdBench: used_sample_count 5 of sample_count 5 -> full use share, so the gate passes.
    const FIRST_CAST_S = 8;
    const USES_PER_MIN = 1.2;
    const used = cdBench({ avg_first_cast_s: FIRST_CAST_S, uses_per_min: { avg: USES_PER_MIN, stddev: 0.1 } });
    const plan = svc['buildCdPlan']([{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }], { 'Shadow Blades': used }, abilities);
    assert.exists(plan[0]);
    expect(plan[0].firstCastS).toBe(FIRST_CAST_S);
    assert.exists(plan[0]);
    expect(plan[0].usesPerMin).toBe(USES_PER_MIN);
  });
});
