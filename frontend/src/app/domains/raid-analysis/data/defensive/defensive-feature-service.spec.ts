import { assert, describe, it, expect } from 'vitest';
import { PlayerDefensive } from '../analysis/analysis.models';
import { PerDefensiveBenchmark } from '../encounter/encounter.models';
import { DefensiveFeatureService } from './defensive-feature-service';
import { applyBuff, removeBuff, cast } from '../../../../../testing/builders/events';
import { BLUR, BLUR_BUFF, CLOAK_OF_SHADOWS } from '../../../../../testing/spell-ids';
import { CLOAK_META, defBench, timed } from './defensive-harness';
import { TestBed } from '@angular/core/testing';
import { pullModel } from '../../../../../testing/builders/pull-model';
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
  // Composition only: each check is specced on DefensiveJudgeService.
  const bench = defBench({ sample_count: 10, used_sample_count: 10 });
  const TOP_LOGS = Array.from({ length: 10 }, () => ({ def_casts_s: { 'Cloak of Shadows': [10, 70] } }));
  const player = (overrides: Partial<PlayerDefensive>): PlayerDefensive =>
    ({ name: 'Cloak of Shadows', uses: 0, cast_times_s: [], windows: [], ...overrides });
  const FIGHT_DUR_S = 300;
  const WHOLE = pullModel({ fightDurationS: FIGHT_DUR_S });

  it('judges the use count on the contract, naming the family', () => {
    const out = svc['analyzeOneDefensive'](player({}), bench, WHOLE, TOP_LOGS).findings;
    expect(out[0]).toMatchObject({ family: 'defensive.uses', category: 'lost_cooldown' });
  });

  it('flags a late first use on the contract', () => {
    const LATE_FIRST_S = 40;
    const out = svc['analyzeOneDefensive'](player({ uses: 2, cast_times_s: [LATE_FIRST_S, 100], windows: [{ start_s: LATE_FIRST_S, end_s: 45 }] }), bench, WHOLE, TOP_LOGS).findings;
    expect(out.some(finding => finding.family === 'defensive.first_use' && finding.severity === 'amber')).toBe(true);
  });

  // used_sample_count / sample_count below the 0.5 use share: a situational defensive.
  const minorityUse: PerDefensiveBenchmark = { ...bench, used_sample_count: 3 };

  it('does not judge the count or the first use of a defensive only a minority of top logs use', () => {
    const LATE_FIRST_S = 40;
    expect(svc['analyzeOneDefensive'](player({}), minorityUse, WHOLE, TOP_LOGS).findings).toEqual([]);
    const late = svc['analyzeOneDefensive'](player({ uses: 1, cast_times_s: [LATE_FIRST_S] }), minorityUse, WHOLE, TOP_LOGS).findings;
    expect(late.some(finding => finding.category === 'cooldown_delay')).toBe(false);
  });

  it('shows only the count of an external, since its timing is an assignment', () => {
    const LATE_FIRST_S = 40;
    const external = player({ uses: 1, cast_times_s: [LATE_FIRST_S], windows: [{ start_s: LATE_FIRST_S, end_s: LATE_FIRST_S }] });
    const out = svc['analyzeOneDefensive'](external, bench, WHOLE, TOP_LOGS).findings;
    expect(out.map(finding => [finding.family, finding.severity])).toEqual([['defensive.uses', 'neutral']]);
  });

  it('puts a defensive used as often as the top logs on plan', () => {
    const out = svc['analyzeOneDefensive'](player({ uses: 2, cast_times_s: [10, 70] }), bench, WHOLE, TOP_LOGS).findings;
    expect(out).toEqual([expect.objectContaining({ severity: 'success', cd_name: 'Cloak of Shadows' })]);
  });

  it('skips a talent-gated defensive that was never used, and counts it unchecked', () => {
    expect(svc['analyzeOneDefensive'](player({ uses: 0, talent_gated: true }), bench, WHOLE, TOP_LOGS)).toMatchObject({ findings: [], checked: 0 });
  });

  it('puts a used defensive with no bench on plan, and counts it unchecked', () => {
    expect(svc['analyzeOneDefensive'](player({ uses: 1, cast_times_s: [10] }), undefined, WHOLE)).toMatchObject({
      findings: [expect.objectContaining({ severity: 'success' })], checked: 0,
    });
    expect(svc['analyzeOneDefensive'](player({ uses: 0 }), undefined, WHOLE).findings).toEqual([]);
  });
});

describe('analyzeOneDefensive across a death', () => {
  const bench = defBench({ sample_count: 10, used_sample_count: 10 });
  const TOP_LOGS = Array.from({ length: 10 }, () => ({ def_casts_s: { 'Cloak of Shadows': [10, 70, 130] } }));
  const used = (castTimesS: number[]): PlayerDefensive =>
    ({ name: 'Cloak of Shadows', uses: castTimesS.length, cast_times_s: castTimesS, windows: [] });
  const DIED_S = 20;

  it('folds a late first use the player spent dead under the death, instead of flagging it', () => {
    const scan = svc['analyzeOneDefensive'](used([200]), bench, pullModel({ deadSpans: [[DIED_S, 190]] }), TOP_LOGS);
    expect(scan.findings.some(finding => finding.category === 'cooldown_delay')).toBe(false);
    expect(scan.folded.dead).toBe(1);
  });

  it('counts the expected uses over the alive time only, so a death costs no lost use', () => {
    // Alive 0..20 and 280..300: 40s at 0.4 a minute rounds to 0 uses expected.
    const scan = svc['analyzeOneDefensive'](used([]), bench, pullModel({ deadSpans: [[DIED_S, 280]] }), TOP_LOGS);
    expect(scan.findings.some(finding => finding.category === 'lost_cooldown')).toBe(false);
  });
});

describe('analyzeDefensiveFindings', () => {
  // Composition only: per-defensive checks are specced on analyzeOneDefensive.
  it('judges every defensive against the bench\'s per-log uses and counts the ones checked', () => {
    const scan = svc['analyzeDefensiveFindings'](
      [{ name: 'Cloak of Shadows', uses: 0, cast_times_s: [], windows: [] }],
      { per_defensive_benchmarks: { 'Cloak of Shadows': defBench({ sample_count: 10, used_sample_count: 10 }) }, per_parse: [] },
      pullModel(),
    );
    expect(scan.findings[0]).toMatchObject({ family: 'defensive.uses', cd_name: 'Cloak of Shadows' });
    expect(scan.checked).toBe(1);
  });
});
