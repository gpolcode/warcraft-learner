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

/** Five top logs that open Shadow Blades at 5s, press it again at 95s and cast 90% of the pull; with no spread, the opener edge is 7s, the gap edge 95s and the casting edge 5s of idle under 90%. */
const TOP_LOGS = Array.from({ length: 5 }, () => topLog({ 'Shadow Blades': [5, 95] }, 90));
const measured = bench({ per_parse: TOP_LOGS });

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

  it('emits a success when used on cd and BL-aligned', () => {
    const casts = [cast(SHADOW_BLADES, 6)];
    const buffs = [applyBuff(BLOODLUST, 6)];
    const single = bench({ per_cd_benchmarks: { 'Shadow Blades': cdBench({ uses_per_min: { avg: 0.5, stddev: 0.1 } }) } });
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: casts, buffEvents: buffs, bench: single })).findings;
    const success = findings.find(f => f.category === 'cooldown_usage' && f.severity === 'success');
    expect(success).toBeDefined();
    assert.exists(success);
    expect(success.message).toContain('aligned with Bloodlust');
  });

  it('flags a late opener against the top logs\' first uses', () => {
    const casts = [cast(SHADOW_BLADES, 40)];
    const buffs = [applyBuff(BLOODLUST, 38)];
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: casts, buffEvents: buffs, bench: measured })).findings;
    expect(findings.find(f => f.category === 'cooldown_delay')).toMatchObject({ family: 'rotation.late_opener', severity: 'amber' });
  });

  it('flags no opener on a bench that carries no per-log uses', () => {
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: [cast(SHADOW_BLADES, 40)], bench: bench() })).findings;
    expect(findings.some(f => f.category === 'cooldown_delay')).toBe(false);
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
  it('reads a use before the pull from its aura still up at it, so the opener is not late', () => {
    // bench(): first cast 5s give or take 2, 1 use a minute; the aura drops at 0:20 with no apply before it.
    const SECOND_CAST_S = 90;
    const { findings } = svc['analyzeRotationFindings'](scan({
      castEvents: [cast(SHADOW_BLADES, SECOND_CAST_S)], buffEvents: [removeBuff(SHADOW_BLADES, 20)], bench: bench(),
    }));
    expect(findings.filter(f => f.category === 'cooldown_delay')).toEqual([]);
    expect(findings.find(f => f.severity === 'success')?.message).toBe('Shadow Blades - 2/2 casts.');
  });
});

describe('analyzeRotationFindings Bloodlust detection', () => {
  // Aligned window [blTimeS-30, blTimeS+55]; offset from blTimeS must stay within 4s (2*stddev) to avoid an alignment warning.
  const LOW_UPM = { avg: 0.5, stddev: 0.1, min: 0.4, max: 0.6 };
  const single = bench({ per_cd_benchmarks: { 'Shadow Blades': cdBench({ uses_per_min: LOW_UPM }) } });
  // Casts stay >= 0 (still bounded by fight start), so it opens right on the pull.
  const OPEN_CAST_S = 0;

  it('drives BL-aligned coaching from a Bloodlust popped before the pull (negative atS)', () => {
    // WCL's fight start is the first damage event, so a pre-cast Lust lands at a negative atS.
    const PRE_PULL_BL_S = -2;
    const casts = [cast(SHADOW_BLADES, OPEN_CAST_S)];
    const buffs = [applyBuff(BLOODLUST, PRE_PULL_BL_S)];
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: casts, buffEvents: buffs, bench: single })).findings;
    const success = findings.find(f => f.category === 'cooldown_usage' && f.severity === 'success');
    expect(success?.message).toContain('aligned with Bloodlust');
  });

  it('drives BL-aligned coaching from a Bloodlust popped exactly at fight start (boundary)', () => {
    const FIGHT_START_S = 0;
    const casts = [cast(SHADOW_BLADES, OPEN_CAST_S)];
    const buffs = [applyBuff(BLOODLUST, FIGHT_START_S)];
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: casts, buffEvents: buffs, bench: single })).findings;
    const success = findings.find(f => f.category === 'cooldown_usage' && f.severity === 'success');
    expect(success?.message).toContain('aligned with Bloodlust');
  });

  it('agrees with the ingest bench on the same buff stream, so neither path can diverge', () => {
    const PRE_PULL_BL_S = -2;
    const buffs = [applyBuff(BLOODLUST, PRE_PULL_BL_S)];
    // RotationTransformService's ingest bench calls this same function on the same buff stream.
    expect(bloodlust.detectBloodlust(wclProjections.withRelativeS(buffs, 0))).toBe(PRE_PULL_BL_S);
    const casts = [cast(SHADOW_BLADES, OPEN_CAST_S)];
    const findings = svc['analyzeRotationFindings'](scan({ castEvents: casts, buffEvents: buffs, bench: single })).findings;
    const success = findings.find(f => f.category === 'cooldown_usage' && f.severity === 'success');
    expect(success?.message).toContain('aligned with Bloodlust');
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

describe('checkBloodlustAlignment', () => {
  const BL_AT_S = 10;
  // BL window: 30s before BL to 40s duration + 15s trail -> [-30, +55] around BL_AT_S = [-20, 65].

  it('flags a BL miss when the cooldown lands outside the window and parsers align it', () => {
    // cast at 100s is outside [-20, 65]; wantsBL true.
    const out = svc['checkBloodlustAlignment']('Shadow Blades', [100], cdBench(), BL_AT_S, true);
    expect(out.blAligned).toBe(false);
    expect(out.findings[0]?.measured).toEqual({ value: 'missed', unit: 'Bloodlust' });
  });

  it('does not flag a miss when parsers do not align it', () => {
    const out = svc['checkBloodlustAlignment']('Shadow Blades', [100], cdBench(), BL_AT_S, false);
    expect(out.blAligned).toBe(false);
    expect(out.findings).toEqual([]);
  });

  it('flags an in-window offset more than 2 sigma off the top offset', () => {
    // avg_bl_offset 0, stddev 2 -> outlier beyond |offset| > 4. Cast at BL+5s -> offset 5.
    const out = svc['checkBloodlustAlignment']('Shadow Blades', [(BL_AT_S + 5)], cdBench(), BL_AT_S, true);
    expect(out.blAligned).toBe(true);
    expect(out.findings[0]?.measured).toEqual({ value: 'late', unit: 'in Bloodlust' });
  });

  it('does not flag an in-window offset exactly at the 2-sigma boundary (strict)', () => {
    // offset exactly 4 == 2*stddev; strict so not flagged.
    const out = svc['checkBloodlustAlignment']('Shadow Blades', [(BL_AT_S + 4)], cdBench(), BL_AT_S, true);
    expect(out.blAligned).toBe(true);
    expect(out.findings).toEqual([]);
  });

  it('gives top logs that agree to the second on their Bloodlust offset a 2s band, flagging only past it', () => {
    const agreed = cdBench({ avg_bl_offset_s: 0, stddev_bl_offset_s: 0 });
    expect(svc['checkBloodlustAlignment']('Shadow Blades', [BL_AT_S + 2], agreed, BL_AT_S, true).findings).toEqual([]);
    const late = svc['checkBloodlustAlignment']('Shadow Blades', [BL_AT_S + 2.1], agreed, BL_AT_S, true);
    expect(late.findings[0]?.measured).toEqual({ value: 'late', unit: 'in Bloodlust' });
  });

  it('stamps the judged cast, not the earliest in-window cast', () => {
    // avg_bl_offset -8, stddev 2 -> in-band [-12, -4]; the later cast (closest to zero) is judged, not the earlier in-band one.
    const EARLY_IN_BAND_S = BL_AT_S - 8;
    const LATE_JUDGED_S = BL_AT_S - 2;
    const out = svc['checkBloodlustAlignment'](
      'Shadow Blades', [EARLY_IN_BAND_S, LATE_JUDGED_S],
      cdBench({ avg_bl_offset_s: -8, stddev_bl_offset_s: 2 }), BL_AT_S, true);
    expect(out.findings[0]?.measured).toEqual({ value: 'late', unit: 'in Bloodlust' });
    expect(out.findings[0]?.timestamp_s).toBe(LATE_JUDGED_S);
  });

  it('returns not-aligned with no BL', () => {
    expect(svc['checkBloodlustAlignment']('Shadow Blades', [5], cdBench(), null, true))
      .toEqual({ blAligned: false, findings: [] });
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

  it('reports success when a cooldown is used cleanly and BL-aligned', () => {
    // first cast 6s (under 9s open threshold), BL at 6s -> aligned.
    const result = svc['analyzeOneCooldown'](cd, [6], single, killed(120, 6), null);
    expect(result?.scan.issues).toEqual([]);
    expect(result?.success?.message).toContain('aligned with Bloodlust');
  });

  it('reports an issue (no success) when the opener is late', () => {
    const result = svc['analyzeOneCooldown'](cd, [40], single, killed(120, 38), null, TOP_LOGS);
    expect(result?.success).toBeNull();
    expect(result?.scan.issues.some(finding => finding.category === 'cooldown_delay')).toBe(true);
  });

  it('does not flag an unused cooldown that only a minority of top parses use (use-share gate)', () => {
    // Matching the top parses by not pressing it is not a lost cast.
    const result = svc['analyzeOneCooldown'](cd, [], rareUse, killed(FIGHT_DUR_S), null);
    expect(result?.scan.issues).toEqual([]);
    expect(result?.success).toBeNull();
  });

  it('does not flag a late opener of a minority-use cooldown (use-share gate)', () => {
    // Opened well past 2 sigma over the 5s top first cast, but the first-cast check is gated off.
    const LATE_OPENER_S = 40;
    const result = svc['analyzeOneCooldown'](cd, [LATE_OPENER_S], rareUse, killed(FIGHT_DUR_S), null, TOP_LOGS);
    expect(result?.scan.issues.some(finding => finding.category === 'cooldown_delay')).toBe(false);
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

  it('mutes the use count of a player who died before top raiders open with it and never came back', () => {
    // bench: open at 5s, then 1 a minute; dead from 3s on.
    const diedEarly = pullModel({ fightDurationS: FIGHT_S, deadSpans: [[3, FIGHT_S]] });
    expect(svc['analyzeOneCooldown'](cd, [], cdBench(), diedEarly, null)?.scan.issues).toMatchObject([{ severity: 'muted', unjudged: 'dead' }]);
  });

  it('flags the same unused cooldown as never used for a player alive the whole pull', () => {
    expect(svc['analyzeOneCooldown'](cd, [], cdBench(), killed(FIGHT_S), null)?.scan.issues[0]).toMatchObject({ category: 'never_used' });
  });

  // The top logs wait 90s, so a wait past 95s flags; this one runs 6s to 150s.
  const GAP_CASTS = [6, 150];
  const LONG_FIGHT_S = 300;
  const gapOf = (model: PullModel): AnalysisFinding | undefined =>
    svc['analyzeOneCooldown'](cd, GAP_CASTS, cdBench(), model, null, TOP_LOGS)?.scan.issues.find(finding => finding.family === 'rotation.cooldown_gap');

  it('judges no wait the player spent partly dead, so the death is the one row', () => {
    expect(gapOf(pullModel({ fightDurationS: LONG_FIGHT_S, deadSpans: [[20, 140]] }))).toBeUndefined();
  });

  it('keeps the wait when the death begins the instant the later cast lands', () => {
    expect(gapOf(pullModel({ fightDurationS: LONG_FIGHT_S, deadSpans: [[150, 200]] }))).toMatchObject({ severity: 'amber' });
  });

  it('folds a late opener the player spent dead under the death', () => {
    const deadBeforeIt = pullModel({ fightDurationS: LONG_FIGHT_S, deadSpans: [[2, 30]] });
    const result = svc['analyzeOneCooldown'](cd, [40], cdBench(), deadBeforeIt, null, TOP_LOGS);
    expect(result?.scan.issues.some(finding => finding.family === 'rotation.late_opener')).toBe(false);
    expect(result?.scan.folded.dead).toBe(1);
  });

  it('judges no cast after the called wipe', () => {
    // The wipe was called at 60s; a 70s press would otherwise open a 64s gap and a second use.
    const CALLED_S = 60;
    const { findings } = svc['analyzeRotationFindings'](scan({
      castEvents: [cast(SHADOW_BLADES, 6), cast(SHADOW_BLADES, 70)], bench: bench(),
      model: { judgedEndS: CALLED_S, judgedEndCause: 'wipe_called', aliveSpans: [[0, CALLED_S]] },
    }));
    expect(findings.find(finding => finding.severity === 'success')?.message).toBe('Shadow Blades - 1/1 casts.');
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
