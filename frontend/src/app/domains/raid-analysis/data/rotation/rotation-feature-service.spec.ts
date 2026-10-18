import { assert, describe, it, expect } from 'vitest';
import { PlanCooldown } from '../plan/plan.models';
import { SHADOW_BLADES, BLOODLUST } from '../../../../../testing/spell-ids';
import { cast, applyBuff, removeBuff } from '../../../../../testing/builders/events';
import { WclEvent } from '../wcl/wcl.models';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { RotationBench, RotationParseMeasures } from './rotation-data-source';
import { RotationBloodlustService } from './rotation-bloodlust-service';
import { RotationScanInput, RotationFeatureService } from './rotation-feature-service';
import { bench, cdBench } from './rotation-harness';
import { TestBed } from '@angular/core/testing';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';
import { ROTATION_DATA_SOURCE } from './rotation-data-source';
import { pullModel } from '../../../../../testing/builders/pull-model';
import { PullModel } from '../analysis/pull-model-service';
import { AnalysisFinding } from '../analysis/analysis.models';

const wclProjections = TestBed.inject(WclProjectionsService);
const bloodlust = TestBed.inject(RotationBloodlustService);
TestBed.resetTestingModule();
TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: ROTATION_DATA_SOURCE, useValue: {} },
] });
const svc = TestBed.inject(RotationFeatureService);
TestBed.resetTestingModule();

/** The pull model reads Bloodlust from the same buff stream the scan carries. */
function scan(over: {
  bench: RotationBench; fightDurationS?: number; castEvents?: WclEvent[]; buffEvents?: WclEvent[]; cooldowns?: PlanCooldown[];
  model?: Partial<PullModel>;
}): RotationScanInput {
  const fightDurationS = over.fightDurationS ?? 120;
  const buffEvents = wclProjections.withRelativeS(over.buffEvents ?? [], 0);
  return {
    bench: over.bench,
    model: pullModel({ fightDurationS, lust: bloodlust.lustSpan(buffEvents, fightDurationS), ...over.model }),
    castEvents: wclProjections.withRelativeS(over.castEvents ?? [], 0),
    buffEvents,
    cooldowns: over.cooldowns ?? over.bench.major_cooldowns,
    talents: null,
  };
}

/** One top log's measures, with only its cooldown uses and casting share set. */
function topLog(cdCastsS: Record<string, number[]>, efficiencyPct: number | null = null): RotationParseMeasures {
  return { efficiency_pct: efficiencyPct, lust_s: null, phase_starts: [], cd_casts_s: cdCastsS, buttons: {} };
}

/** Five top logs that open Shadow Blades at 5s, press it again at 95s and cast 90% of the pull; with no spread, the casting edge is 5s of idle under 90%. */
const TOP_LOGS = Array.from({ length: 5 }, () => topLog({ 'Shadow Blades': [5, 95] }, 90));
const measured = bench({ per_parse: TOP_LOGS });
/** The same top logs as the cooldown checks read them, each killing at 5:00. */
const TOP = { perParse: TOP_LOGS, killsS: TOP_LOGS.map(() => 300) };
/** On a 5:00 pull the top logs leave Shadow Blades ready 5s before the opener and 115s after its 90s cooldown runs out at 3:05; a single 5s press leaves it ready 205s, past both the spread and one cooldown. */
const ONE_PRESS = [5];

/** A killed pull of `fightS`, with a Bloodlust from `lustS` when given. */
function killed(fightS: number, lustS: number | null = null): PullModel {
  return pullModel({ fightDurationS: fightS, lust: lustS === null ? null : { startS: lustS, endS: lustS + 40 } });
}

describe('analyzeRotationFindings', () => {
  it('emits a never-used comparison when the bench carries no per-log uses', () => {
    const findings = svc['analyzeRotationFindings'](scan({ bench: bench() })).findings;
    expect(findings.find(f => f.family === 'rotation.never_used')?.severity).toBe('neutral');
  });

  it('emits a never-used amber when all 5 top logs pressed it and 2 uses were expected', () => {
    const usedByAll = bench({ per_parse: Array.from({ length: 5 }, () => topLog({ 'Shadow Blades': [5, 95] })) });
    const findings = svc['analyzeRotationFindings'](scan({ bench: usedByAll })).findings;
    expect(findings.find(f => f.family === 'rotation.never_used')).toMatchObject({ severity: 'amber', measured: { value: '0 / 2', unit: 'cast(s), 5 top logs' } });
  });

  it('counts each cooldown checked for the empty state', () => {
    expect(svc['analyzeRotationFindings'](scan({ bench: bench() })).checked).toBe(1);
  });

  it('marks a cooldown used on cooldown as on plan, with a neutral tone', () => {
    const casts = [cast(SHADOW_BLADES, 6)];
    const single = bench({ per_cd_benchmarks: { 'Shadow Blades': cdBench({ uses_per_min: { avg: 0.5, stddev: 0.1 } }) } });
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: casts, bench: single })).findings;
    expect(findings).toEqual([expect.objectContaining({ onPlan: true, severity: 'neutral', cd_name: 'Shadow Blades' })]);
  });

  it('flags ready time against the top logs\' over the same pull', () => {
    const casts = ONE_PRESS.map(atS => cast(SHADOW_BLADES, atS));
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: casts, bench: measured, fightDurationS: 300 })).findings;
    expect(findings.find(f => f.family === 'rotation.ready_time')).toMatchObject({ severity: 'red', category: 'lost_cooldown' });
  });

  it('flags no ready time on a bench that carries no per-log uses', () => {
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: ONE_PRESS.map(atS => cast(SHADOW_BLADES, atS)), bench: bench(), fightDurationS: 300 })).findings;
    expect(findings.some(f => f.family === 'rotation.ready_time')).toBe(false);
  });

  it('gives the cast-efficiency finding a label and a remedy so the row is not blank', () => {
    // A 24s idle gap on the 120s scan fight is 80% casting, under the 85.8% edge (90% less 5s of 120s).
    const FIRST_CAST_S = 6;
    const LATE_CAST_S = 30;
    const casts = [cast(SHADOW_BLADES, FIRST_CAST_S), cast(SHADOW_BLADES, LATE_CAST_S)];
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: casts, bench: measured })).findings;
    const efficiency = findings.find(f => f.category === 'cast_efficiency');
    assert.exists(efficiency);
    expect(efficiency.label).toBeTruthy();
    expect(efficiency.details?.remedy).toBeTruthy();
  });

  it('names the top logs the casting time was checked against when nothing is flagged', () => {
    const casts = [cast(SHADOW_BLADES, 0), cast(SHADOW_BLADES, 1)];
    expect(svc['analyzeRotationFindings'](scan({ castEvents: casts, bench: measured, fightDurationS: 1 })).downtimeEmpty)
      .toBe('Nothing flagged. Your casting time was checked against 5 top logs.');
  });

  it('says no casting time was judged on a pull with one cast', () => {
    expect(svc['analyzeRotationFindings'](scan({ castEvents: [cast(SHADOW_BLADES, 6)], bench: measured })).downtimeEmpty)
      .toBe('Nothing flagged. No casting time was judged in this pull.');
  });

  it('says no top log carries a casting time on a bench without per-log measures', () => {
    const casts = [cast(SHADOW_BLADES, 6), cast(SHADOW_BLADES, 30)];
    expect(svc['analyzeRotationFindings'](scan({ castEvents: casts, bench: bench() })).downtimeEmpty)
      .toBe('Nothing flagged. None of the 5 top logs carries a casting time to compare with.');
  });
});

describe('analyzeRotationFindings pre-pull use', () => {
  it('reads a use before the pull from its aura still up at it, so the cooldown never sat ready before its second press', () => {
    // Top logs press at the pull and on the 90s cooldown; the aura drops at 0:20 with no apply before it.
    const SECOND_CAST_S = 90;
    const pressedAtPull = bench({ per_parse: Array.from({ length: 5 }, () => topLog({ 'Shadow Blades': [0, SECOND_CAST_S] })) });
    const { findings } = svc['analyzeRotationFindings'](scan({
      castEvents: [cast(SHADOW_BLADES, SECOND_CAST_S)], buffEvents: [removeBuff(SHADOW_BLADES, 20)], bench: pressedAtPull,
    }));
    expect(findings.some(f => f.family === 'rotation.ready_time')).toBe(false);
    expect(findings.some(f => f.onPlan)).toBe(true);
  });

  it('reads the same press with no aura at the pull as a cooldown ready for 90s', () => {
    const SECOND_CAST_S = 90;
    const pressedAtPull = bench({ per_parse: Array.from({ length: 5 }, () => topLog({ 'Shadow Blades': [0, SECOND_CAST_S] })) });
    const { findings } = svc['analyzeRotationFindings'](scan({ castEvents: [cast(SHADOW_BLADES, SECOND_CAST_S)], bench: pressedAtPull }));
    expect(findings.some(f => f.family === 'rotation.ready_time')).toBe(true);
  });
});

describe('analyzeRotationFindings Bloodlust', () => {
  const MID_LUST_S = 120;
  const FIGHT_S = 300;
  /** Five top logs whose raid lusted at 2:00 and who pressed Shadow Blades 5s into it. */
  const lustBench = bench({ per_parse: Array.from({ length: 5 }, () => ({ ...topLog({ 'Shadow Blades': [MID_LUST_S + 5] }), lust_s: MID_LUST_S })) });
  const lustAt = (lustS: number): WclEvent[] => [applyBuff(BLOODLUST, lustS)];

  it('judges the player against their own raid\'s lust, from the same buff stream ingest reads', () => {
    const findings = svc['analyzeRotationFindings'](scan({
      castEvents: [cast(SHADOW_BLADES, 5)], buffEvents: lustAt(MID_LUST_S), bench: lustBench, fightDurationS: FIGHT_S,
    })).findings;
    expect(findings.find(f => f.family === 'rotation.bloodlust')).toMatchObject({ severity: 'amber', timestamp_s: MID_LUST_S });
  });

  it('flags no Bloodlust row for a cooldown pressed for the raid\'s lust', () => {
    const findings = svc['analyzeRotationFindings'](scan({
      castEvents: [cast(SHADOW_BLADES, MID_LUST_S + 5)], buffEvents: lustAt(MID_LUST_S), bench: lustBench, fightDurationS: FIGHT_S,
    })).findings;
    expect(findings.some(f => f.category === 'cooldown_alignment')).toBe(false);
  });

  it('agrees with the ingest bench on a lust before the pull', () => {
    const PRE_PULL_BL_S = -2;
    expect(bloodlust.detectBloodlust(wclProjections.withRelativeS(lustAt(PRE_PULL_BL_S), 0))).toBe(PRE_PULL_BL_S);
  });
});

describe('analyzeRotationFindings hold suggestions on the pull clock', () => {
  const holdBench = bench({
    per_cd_benchmarks: { 'Shadow Blades': cdBench({
      hold_targets: { '2': { target_s: 130, delay_s: 30, band_s: 5, effective_cd_s: 90, count: 4, total_samples: 5 } },
    }) },
  });
  const FIGHT_S = 300; // past the 0 + 90 + 30 hold-to, which a hold at the pull's end never suggests

  it('names a use before the band that leaves the cooldown running at the 130s target', () => {
    const casts = [cast(SHADOW_BLADES, 0), cast(SHADOW_BLADES, 100)];
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: casts, bench: holdBench, fightDurationS: FIGHT_S })).findings;
    expect(findings.some(f => f.category === 'cooldown_hold')).toBe(true);
  });

  it('does not flag a use exactly at the band edge', () => {
    const casts = [cast(SHADOW_BLADES, 0), cast(SHADOW_BLADES, 125)];
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: casts, bench: holdBench, fightDurationS: FIGHT_S })).findings;
    expect(findings.some(f => f.category === 'cooldown_hold')).toBe(false);
  });

  it('does not flag a use after the target', () => {
    const casts = [cast(SHADOW_BLADES, 0), cast(SHADOW_BLADES, 160)];
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: casts, bench: holdBench, fightDurationS: FIGHT_S })).findings;
    expect(findings.some(f => f.category === 'cooldown_hold')).toBe(false);
  });
});

describe('checkCastEfficiency', () => {
  const FIGHT_S = 100;
  // Five top logs casting 90% with no spread: the 5s floor over 100s alive puts the edge at 85%.
  const EDGE_IDLE_S = 15;
  /** A press every second, then one idle stretch of `idleS` to the pull's end. */
  const idleAtEnd = (idleS: number): number[] => [...Array.from({ length: FIGHT_S - idleS + 1 }, (_unused, i) => i), FIGHT_S];

  it('flags casting one second of idle past the edge as amber', () => {
    expect(svc['checkCastEfficiency'](idleAtEnd(EDGE_IDLE_S + 1), killed(FIGHT_S), measured).finding)
      .toMatchObject({ family: 'rotation.downtime', severity: 'amber' });
  });

  it('does not flag casting exactly at the edge', () => {
    expect(svc['checkCastEfficiency'](idleAtEnd(EDGE_IDLE_S), killed(FIGHT_S), measured).finding).toBeNull();
  });

  it('never escalates past amber, however far below', () => {
    expect(svc['checkCastEfficiency']([0, FIGHT_S], killed(FIGHT_S), measured).finding?.severity).toBe('amber');
  });

  it('returns no finding with fewer than two casts', () => {
    expect(svc['checkCastEfficiency']([0], killed(FIGHT_S), measured).finding).toBeNull();
  });
});

describe('analyzeOneCooldown', () => {
  const FIGHT_DUR_S = 120;
  const UPM = { avg: 0.5, stddev: 0.1 };  // top-parse uses-per-minute
  const cd = { name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 };
  const single = cdBench({ uses_per_min: UPM });
  // A cooldown a minority of top parses use: used/sample below MIN_USE_SHARE_FRAC (0.5).
  const TOTAL_SAMPLED = 10;
  const MINORITY_USERS = 2;  // 2/10 = 20%
  const rareUse = cdBench({ sample_count: TOTAL_SAMPLED, used_sample_count: MINORITY_USERS, uses_per_min: UPM });

  describe('a talent-gated cooldown that was never used', () => {
    const TALENT_ENTRY = 90001;
    const gated = { ...cd, talent_gated: true, talent_entries: [TALENT_ENTRY] };

    it('is flagged as never used when the player\'s talents show it', () => {
      const result = svc['analyzeOneCooldown'](gated, [], single, killed(FIGHT_DUR_S), new Map([[TALENT_ENTRY, 1]]));
      expect(result?.scan.issues[0]).toMatchObject({ category: 'never_used', measured: { value: '0 / 1' } });
    });

    it('is skipped when the player\'s talents do not show it', () => {
      expect(svc['analyzeOneCooldown'](gated, [], single, killed(FIGHT_DUR_S), new Map([[TALENT_ENTRY + 1, 1]]))).toBeNull();
    });

    it('is skipped when the pull carries no talents, or the bench names no entry to check', () => {
      expect(svc['analyzeOneCooldown'](gated, [], single, killed(FIGHT_DUR_S), null)).toBeNull();
      expect(svc['analyzeOneCooldown']({ ...cd, talent_gated: true }, [], single, killed(FIGHT_DUR_S), new Map([[TALENT_ENTRY, 1]]))).toBeNull();
    });
  });

  it('reports a cooldown used cleanly as on plan', () => {
    const result = svc['analyzeOneCooldown'](cd, [6], single, killed(120, 6), null);
    expect(result?.scan.issues).toEqual([]);
    expect(result?.onPlan).toMatchObject({ onPlan: true, cd_name: 'Shadow Blades' });
  });

  it('reports an issue and no on-plan finding when the cooldown sat ready past the top logs', () => {
    const result = svc['analyzeOneCooldown'](cd, ONE_PRESS, single, killed(300), null, TOP);
    expect(result?.onPlan).toBeNull();
    expect(result?.scan.issues.some(finding => finding.family === 'rotation.ready_time')).toBe(true);
  });

  it('does not flag an unused cooldown that only a minority of top parses use (use-share gate)', () => {
    // Matching the top parses by not pressing it is not a lost cast.
    const result = svc['analyzeOneCooldown'](cd, [], rareUse, killed(FIGHT_DUR_S), null);
    expect(result?.scan.issues).toEqual([]);
    expect(result?.onPlan).toBeNull();
  });

  it('does not judge the ready time of a minority-use cooldown (use-share gate)', () => {
    const result = svc['analyzeOneCooldown'](cd, ONE_PRESS, rareUse, killed(300), null, TOP);
    expect(result?.scan.issues.some(finding => finding.family === 'rotation.ready_time')).toBe(false);
  });
});

describe('rotation checks over the player timeline', () => {
  const FIGHT_S = 120;
  // A press every second while alive, so no gap clears the 1.5s downtime floor.
  const everySecond = (fromS: number, toS: number): number[] => Array.from({ length: toS - fromS + 1 }, (_unused, i) => fromS + i);
  const DIED_S = 10;
  const BACK_S = 95;
  const PRESSES = [...everySecond(0, DIED_S), ...everySecond(BACK_S, FIGHT_S)];

  it('reads no idle time into the stretch the player was dead', () => {
    const deadForIt = pullModel({ fightDurationS: FIGHT_S, deadSpans: [[DIED_S, BACK_S]] });
    expect(svc['checkCastEfficiency'](PRESSES, deadForIt, measured).finding).toBeNull();
  });

  it('reads the same stretch as idle when the player was alive for it', () => {
    expect(svc['checkCastEfficiency'](PRESSES, killed(FIGHT_S), measured).finding?.message).toContain('of the fight');
  });

  it('names the alive time as the base when a death shortened it', () => {
    // Alive 0..10 and 95..120; one 20s idle gap from 100 to 120 of the 35s alive.
    const deadForIt = pullModel({ fightDurationS: FIGHT_S, deadSpans: [[DIED_S, BACK_S]] });
    const { finding } = svc['checkCastEfficiency']([...everySecond(0, DIED_S), BACK_S, 100, FIGHT_S], deadForIt, measured);
    expect(finding?.message).toContain('of your alive time');
  });

  const cd = { name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 };
  const LONG_FIGHT_S = 300;

  it('mutes the use count of a player who died before top raiders open with it and never came back', () => {
    // bench: open at 5s, then 1 a minute; dead from 3s on.
    const diedEarly = pullModel({ fightDurationS: FIGHT_S, deadSpans: [[3, FIGHT_S]] });
    expect(svc['analyzeOneCooldown'](cd, [], cdBench(), diedEarly, null)?.scan.issues).toMatchObject([{ severity: 'muted', unjudged: 'dead' }]);
  });

  it('flags the same unused cooldown as never used for a player alive the whole pull', () => {
    expect(svc['analyzeOneCooldown'](cd, [], cdBench(), killed(FIGHT_S), null)?.scan.issues[0]).toMatchObject({ category: 'never_used' });
  });

  // Top logs on the 90s cadence leave it ready only for the 5s opener; pressing at 5s and 275s leaves it ready 180s between.
  const ON_CADENCE_TOP = { perParse: Array.from({ length: 5 }, () => topLog({ 'Shadow Blades': [5, 95, 185, 275] })), killsS: Array.from({ length: 5 }, () => LONG_FIGHT_S) };
  const SKIPPED_TWO = [5, 275];
  const readyOf = (model: PullModel): AnalysisFinding | undefined =>
    svc['analyzeOneCooldown'](cd, SKIPPED_TWO, cdBench(), model, null, ON_CADENCE_TOP)?.scan.issues.find(finding => finding.family === 'rotation.ready_time');

  it('leaves out a wait the player spent partly dead, so the death is the one row', () => {
    expect(readyOf(pullModel({ fightDurationS: LONG_FIGHT_S, deadSpans: [[100, 260]] }))).toBeUndefined();
  });

  it('keeps the wait when the death begins the instant the later cast lands', () => {
    expect(readyOf(pullModel({ fightDurationS: LONG_FIGHT_S, deadSpans: [[275, 290]] }))).toMatchObject({ severity: 'red' });
  });

  it('judges no cast after the called wipe', () => {
    // The wipe was called at 60s; a 70s press would otherwise open a 64s gap and a second use.
    const CALLED_S = 60;
    const { findings } = svc['analyzeRotationFindings'](scan({
      castEvents: [cast(SHADOW_BLADES, 6), cast(SHADOW_BLADES, 70)], bench: bench(),
      model: { judgedEndS: CALLED_S, judgedEndCause: 'wipe_called', aliveSpans: [[0, CALLED_S]] },
    }));
    expect(findings.some(finding => finding.onPlan)).toBe(true);
    expect(findings.every(finding => (finding.timestamp_s ?? 0) < CALLED_S)).toBe(true);
  });
});

describe('judgesButtons', () => {
  it('judges a damage spec\'s buttons against its list', () => {
    expect(svc.judgesButtons('SubtletyRogue')).toBe(true);
  });

  it('judges no button for a healer, whose top logs follow no one damage priority list', () => {
    expect(svc.judgesButtons('MistweaverMonk')).toBe(false);
  });
});
