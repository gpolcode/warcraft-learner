import { assert, describe, it, expect } from 'vitest';
import { PlayerDefensive } from '../analysis/analysis.models';
import { PerDefensiveBenchmark } from '../encounter/encounter.models';
import { DefensiveFeatureService } from './defensive-feature-service';
import { applyBuff, removeBuff, cast } from '../../../../../testing/builders/events';
import { BLUR, BLUR_BUFF, CLOAK_OF_SHADOWS } from '../../../../../testing/spell-ids';
import { CLOAK_META, defBench, timed } from './defensive-harness';
import { HOLD_BAND_MIN_S } from '../analysis/hold-targets-service';
import { TestBed } from '@angular/core/testing';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';
import { DEFENSIVE_DATA_SOURCE } from './defensive-data-source';

TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: DEFENSIVE_DATA_SOURCE, useValue: {} },
] });
const svc = TestBed.inject(DefensiveFeatureService);
TestBed.resetTestingModule();

describe('analyzeDefensives', () => {
  // Composition only: which presses and auras make a use is specced on DefensiveUsesService.uses.
  it('reads a press that opens its self aura as one use over the aura', () => {
    const PRESS_S = 10, AURA_END_S = 15;
    const out = svc['analyzeDefensives'](
      [CLOAK_META],
      timed([cast(CLOAK_OF_SHADOWS, PRESS_S)], 0), timed([applyBuff(CLOAK_OF_SHADOWS, PRESS_S), removeBuff(CLOAK_OF_SHADOWS, AURA_END_S)], 0),
      300, [], null,
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ name: 'Cloak of Shadows', uses: 1, cast_times_s: [PRESS_S] });
    assert.exists(out[0]);
    expect(out[0].windows[0]).toMatchObject({ start_s: PRESS_S, end_s: AURA_END_S });
  });

  // Composition only: back-fill semantics are specced on buildAuraWindows.
  it('reads a bare removeBuff with no preceding apply as one use starting at 0:00', () => {
    const REMOVE_S = 15;
    const out = svc['analyzeDefensives'](
      [CLOAK_META],
      [], timed([removeBuff(CLOAK_OF_SHADOWS, REMOVE_S)], 0),
      300, [], null,
    );
    expect(out[0]).toMatchObject({ uses: 1, cast_times_s: [0] });
    assert.exists(out[0]);
    expect(out[0].windows[0]).toMatchObject({ start_s: 0, end_s: REMOVE_S });
  });
  it('counts a use from a buff the log carries under another id of the defensive\'s name', () => {
    const BUFF_START_S = 40, BUFF_END_S = 50;
    const blur = { name: 'Blur', spell_id: BLUR, cooldown: 60, talent_gated: false };
    const abilities = [{ gameID: BLUR, name: 'Blur', icon: '' }, { gameID: BLUR_BUFF, name: 'Blur', icon: '' }];
    const out = svc['analyzeDefensives'](
      [blur], timed([cast(BLUR, BUFF_START_S)], 0), timed([applyBuff(BLUR_BUFF, BUFF_START_S), removeBuff(BLUR_BUFF, BUFF_END_S)], 0), 300, abilities, null,
    );
    expect(out[0]?.windows).toEqual([{ start_s: BUFF_START_S, end_s: BUFF_END_S }]);
  });
});

describe('analyzeDefensives talent gate', () => {
  const TALENT_ENTRY = 90002;
  const gatedCloak = { ...CLOAK_META, talent_gated: true, talent_entries: [TALENT_ENTRY] };
  const gatedFor = (talents: ReadonlyMap<number, number> | null) => svc['analyzeDefensives']([gatedCloak], [], [], 300, [], talents)[0]?.talent_gated;

  it('leaves a talent-gated defensive the player\'s talents show open to judging', () => {
    expect(gatedFor(new Map([[TALENT_ENTRY, 1]]))).toBeUndefined();
  });

  it('marks it gated when the talents do not show it, or the pull carries none', () => {
    expect(gatedFor(new Map([[TALENT_ENTRY + 1, 1]]))).toBe(true);
    expect(gatedFor(null)).toBe(true);
  });
});

describe('analyzeOneDefensive', () => {
  // Full use-share bench (10/10 top parses used it), so no check is use-share gated.
  const bench = defBench({ sample_count: 10, used_sample_count: 10 });
  const player = (overrides: Partial<PlayerDefensive>): PlayerDefensive =>
    ({ name: 'Cloak of Shadows', uses: 0, cast_times_s: [], windows: [], ...overrides });
  const FIGHT_DUR_S = 300;

  it('flags a never-used defensive as a critical lost cooldown', () => {
    const out = svc['analyzeOneDefensive'](player({ uses: 0, cast_times_s: [] }), bench, 300);
    expect(out[0]).toMatchObject({ severity: 'critical', category: 'lost_cooldown' });
  });

  it('flags a late first use as a warning', () => {
    // First use is well past avg 10 + 2*stddev 2 = 14s -> a first-cast delay warning.
    const LATE_FIRST_S = 40;
    const out = svc['analyzeOneDefensive'](player({ uses: 1, cast_times_s: [LATE_FIRST_S] }), bench, FIGHT_DUR_S);
    expect(out.some(finding => finding.severity === 'warning' && finding.category === 'cooldown_delay')).toBe(true);
  });

  // used_sample_count / sample_count below MIN_USE_SHARE_FRAC (0.5) -> a situational defensive.
  const TOTAL_SAMPLED = 10;
  const MINORITY_USERS = 3;       // 3/10 = 30% < 50%
  const minorityUse: PerDefensiveBenchmark = { ...bench, sample_count: TOTAL_SAMPLED, used_sample_count: MINORITY_USERS };

  it('does not flag an unused defensive that only a minority of top parses use (use-share gate)', () => {
    // The player matching the top parses by not pressing it is not a lost cast.
    expect(svc['analyzeOneDefensive'](player({ uses: 0, cast_times_s: [] }), minorityUse, FIGHT_DUR_S)).toEqual([]);
  });

  it('does not flag a late first use of a minority-use defensive (use-share gate)', () => {
    // First use is well past avg 10 + 2*stddev 2 = 14s, but the first-cast check is gated off.
    const LATE_FIRST_S = 40;
    const out = svc['analyzeOneDefensive'](player({ uses: 1, cast_times_s: [LATE_FIRST_S] }), minorityUse, FIGHT_DUR_S);
    expect(out.some(finding => finding.category === 'cooldown_delay')).toBe(false);
  });

  it('returns a success (no issues) when usage matches', () => {
    const out = svc['analyzeOneDefensive'](player({ uses: 2, cast_times_s: [10, 70] }), bench, 300);
    expect(out.some(finding => finding.severity === 'success')).toBe(true);
  });

  // Composition only: the band and the blocked slot are specced on holdSuggestionFindings.
  it('suggests a hold on a used defensive pressed before the top raiders\' wait', () => {
    const TOP_WAIT_S = 30;
    const FIRST_S = 10;
    const ON_COOLDOWN_S = FIRST_S + CLOAK_META.cooldown;  // back at 250, past the 10 + 120 + 30 = 160 slot
    const heldSecond: PerDefensiveBenchmark = { ...bench, hold_targets: { '2': {
      target_s: ON_COOLDOWN_S + TOP_WAIT_S, delay_s: TOP_WAIT_S, band_s: HOLD_BAND_MIN_S, effective_cd_s: CLOAK_META.cooldown,
      count: bench.sample_count, total_samples: bench.sample_count,
    } } };
    const out = svc['analyzeOneDefensive'](player({ uses: 2, cast_times_s: [FIRST_S, ON_COOLDOWN_S] }), heldSecond, FIGHT_DUR_S);
    expect(out.some(finding => finding.category === 'hold_suggestion')).toBe(true);
  });

  it('skips a talent-gated defensive that was never used', () => {
    expect(svc['analyzeOneDefensive'](player({ uses: 0, talent_gated: true }), bench, 300)).toEqual([]);
  });

  it('records a no-bench success only when used', () => {
    expect(svc['analyzeOneDefensive'](player({ uses: 1, cast_times_s: [10] }), undefined, 300)[0]).toMatchObject({ severity: 'success' });
    expect(svc['analyzeOneDefensive'](player({ uses: 0 }), undefined, 300)).toEqual([]);
  });
});

describe('analyzeDefensiveFindings', () => {
  // Composition only: per-defensive checks are specced on analyzeOneDefensive.
  const bench: Record<string, PerDefensiveBenchmark> = { 'Cloak of Shadows': defBench({ sample_count: 10, used_sample_count: 10 }) };

  it('flags a never-used defensive as a critical lost cooldown', () => {
    const findings = svc['analyzeDefensiveFindings'](
      [{ name: 'Cloak of Shadows', uses: 0, cast_times_s: [], windows: [] }],
      bench, 300,
    );
    expect(findings[0]).toMatchObject({ severity: 'critical', category: 'lost_cooldown', cd_name: 'Cloak of Shadows' });
  });
});
