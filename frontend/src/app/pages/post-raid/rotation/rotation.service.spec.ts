import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclApiService } from '../../../core/services/wcl-api';
import { WclTransportError } from '../../../core/services/wcl-transport';
import { Result, LoadError, ok, missing, transient } from '../../../core/result';
import { AnalysisFinding } from '../../../core/models/analysis.models';
import { PerCdBenchmark } from '../../../core/models/encounter.models';
import {
  RulebookRule, CastWithoutPriorCondition, HoldCooldownForAnchorCondition, CastOutsideBuffCondition,
  AuraUptimeBelowCondition, OpeningSequenceCondition,
  CastAtTargetCountCondition, ResourceAtCastCondition, ProcWastedCondition,
} from '../../../core/models/rulebook.models';
import {
  SHADOW_BLADES, SHADOW_DANCE, SECRET_TECHNIQUE, VANISH, BLOODLUST, RUPTURE, EVISCERATE, BLACK_POWDER,
} from '../../../../testing/spell-ids';
import {
  cast, applyBuff, removeBuff, buffWindow, applyDebuff, removeDebuff, damage,
} from '../../../../testing/builders/events';
import { WclEvent } from '../../../core/models/wcl.models';
import { ROTATION_DATA_SOURCE, RotationBench } from './rotation-data-source';
import { DataSource } from '../../../core/data-source/data-source';
import {
  RotationFeatureService,
  evaluateCastWithoutPrior, evaluateHoldForAnchor, evaluateRules,
  buildRuleContext, RuleContext, RuleInputs, ruleApplicable,
  evaluateCastOutsideBuff, evaluateAuraUptimeBelow, evaluateOpeningSequence,
  evaluateCastAtTargetCount, evaluateResourceAtCast, evaluateProcWasted,
  rulesNeed, judgeableRules, benchedRules, measureRule, ruleThreshold,
  BenchedRule, RuleThreshold,
  analyzeRotationFindings, RotationScanInput, bucketRotationFindings, buildCdPlan,
  ruleLabel, rulesFollowed, ruleSeverity,
  checkLostUses, checkFirstCastDelay, checkBloodlustAlignment, checkGaps,
  checkCastEfficiency, analyzeOneCooldown,
  partitionRotationFindings, buildRuleRows, buildOffensiveRows, buildOnPlanChips,
} from './rotation.service';

// The check* and analyzeOneCooldown functions take cast times in ms.
const ONE_SEC_MS = 1000;

// Magnitudes the rulebook used to carry; a zero band keeps the fixture arithmetic exact.
const PAIR_WINDOW_S = 5, HOLD_WINDOW_S = 15;
function thr(value: number, band = 0): RuleThreshold {
  return { value, band };
}

// A rule whose magnitude this encounter measured, so fixtures about something else are not gated on it.
function benched(rule: RulebookRule, threshold: RuleThreshold | null = thr(PAIR_WINDOW_S)): BenchedRule {
  return { rule, threshold, sample_count: threshold == null ? 0 : 10 };
}

// Build a RuleContext for a 0..120s fight from just the casts - keeps the rule call sites terse.
const RULE_FIGHT_END_MS = 120_000;
function ruleCtx(casts: WclEvent[], over: Partial<RuleInputs> = {}): RuleContext {
  return buildRuleContext({
    casts, buffs: [], debuffs: [], damage: [], fStart: 0, fEnd: RULE_FIGHT_END_MS,
    ...over,
  });
}

// Build a RotationScanInput for a 0..120s fight - keeps the call sites terse.
function scan(over: Partial<RotationScanInput> & { bench: RotationBench }): RotationScanInput {
  return {
    fStart: 0, fEnd: 120_000, castEvents: [], buffEvents: [],
    cooldowns: over.bench.major_cooldowns,
    ...over,
  };
}

function cdBench(over: Partial<PerCdBenchmark> = {}): PerCdBenchmark {
  return {
    avg_first_cast_s: 5, stddev_first_cast_s: 2,
    avg_gap_s: 90, stddev_gap_s: 5,
    avg_bl_offset_s: 0, stddev_bl_offset_s: 2,
    avg_uses: 2, avg_uses_per_min: 1,
    uses_per_min: { avg: 1, stddev: 0.1, min: 0.9, max: 1.1 },
    bl_pct: 100, majority_hold: false, hold_targets: {}, sample_count: 5, used_sample_count: 5,
    ...over,
  };
}

function bench(over: Partial<RotationBench> = {}): RotationBench {
  return {
    spec: 'SubtletyRogue', encounter_id: 1, encounter_name: 'Boss', sample_count: 5,
    avg_duration_s: 120, downtime_threshold_ms: 1500, top_avg_efficiency: 90, top_efficiency_stddev: 3,
    per_cd_benchmarks: { 'Shadow Blades': cdBench() },
    major_cooldowns: [{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90, align_with_bloodlust: true }],
    rules: [],
    cd_spell_ids: { 'Shadow Blades': SHADOW_BLADES },
    ability_icons: { [SHADOW_BLADES]: { icon: 'sb', name: 'Shadow Blades' } },
    ...over,
  };
}

// Two real Subtlety rules reused across the rule-engine and rules-followed specs.
const SECRET_TECH_NEEDS_DANCE: CastWithoutPriorCondition = {
  kind: 'cast_without_prior',
  spell_id: SECRET_TECHNIQUE, spell_name: 'Secret Technique',
  required_spell_id: SHADOW_DANCE, required_spell_name: 'Shadow Dance',
};
const HOLD_DANCE_FOR_BLADES: HoldCooldownForAnchorCondition = {
  kind: 'hold_cooldown_for_anchor',
  spell_ids: [SHADOW_DANCE], spell_names: ['Shadow Dance'],
  anchor_spell_id: SHADOW_BLADES, anchor_spell_name: 'Shadow Blades',
};

describe('rule engine', () => {
  it('flags Secret Technique cast with no Shadow Dance in window', () => {
    const castTimes = ruleCtx([cast(SHADOW_DANCE, 10), cast(SECRET_TECHNIQUE, 30)]);
    const finding = evaluateCastWithoutPrior(SECRET_TECH_NEEDS_DANCE, castTimes, thr(PAIR_WINDOW_S), 'warning', 'do x');
    expect(finding).not.toBeNull();
    expect(finding!.measured).toEqual({ value: '1 / 1', unit: 'cast(s)' });
    expect(finding!.details?.remedy).toBe('do x');
  });

  it('passes when Shadow Dance precedes Secret Technique inside the window', () => {
    const castTimes = ruleCtx([cast(SHADOW_DANCE, 10), cast(SECRET_TECHNIQUE, 12)]);
    expect(evaluateCastWithoutPrior(SECRET_TECH_NEEDS_DANCE, castTimes, thr(PAIR_WINDOW_S), 'warning')).toBeNull();
  });

  it('flags Shadow Dance spent in the hold window before Shadow Blades', () => {
    // Shadow Blades at 10 and 120; the second (120) is the one evaluated; Shadow Dance at 110 is within 15s.
    const castTimes = ruleCtx([cast(SHADOW_BLADES, 10), cast(SHADOW_BLADES, 120), cast(SHADOW_DANCE, 110)]);
    const finding = evaluateHoldForAnchor(HOLD_DANCE_FOR_BLADES, castTimes, thr(HOLD_WINDOW_S), 'critical');
    expect(finding).not.toBeNull();
    expect(finding!.measured).toEqual({ value: '1', unit: 'charge(s)' });
  });

  it('flags a required cast that only follows the judged one, because position defaults to before', () => {
    const castTimes = ruleCtx([cast(SECRET_TECHNIQUE, 10), cast(SHADOW_DANCE, 12)]);
    expect(evaluateCastWithoutPrior(SECRET_TECH_NEEDS_DANCE, castTimes, thr(PAIR_WINDOW_S), 'warning')).not.toBeNull();
  });

  it('accepts a required cast on either side when position is either', () => {
    const paired: CastWithoutPriorCondition = { ...SECRET_TECH_NEEDS_DANCE, position: 'either' };
    const danceAfter = ruleCtx([cast(SECRET_TECHNIQUE, 10), cast(SHADOW_DANCE, 12)]);
    const danceBefore = ruleCtx([cast(SHADOW_DANCE, 8), cast(SECRET_TECHNIQUE, 10)]);
    expect(evaluateCastWithoutPrior(paired, danceAfter, thr(PAIR_WINDOW_S), 'warning')).toBeNull();
    expect(evaluateCastWithoutPrior(paired, danceBefore, thr(PAIR_WINDOW_S), 'warning')).toBeNull();
  });

  it('requires the companion to follow when position is after', () => {
    const followUp: CastWithoutPriorCondition = { ...SECRET_TECH_NEEDS_DANCE, position: 'after' };
    const danceAfter = ruleCtx([cast(SECRET_TECHNIQUE, 10), cast(SHADOW_DANCE, 12)]);
    const danceBefore = ruleCtx([cast(SHADOW_DANCE, 8), cast(SECRET_TECHNIQUE, 10)]);
    expect(evaluateCastWithoutPrior(followUp, danceAfter, thr(PAIR_WINDOW_S), 'warning')).toBeNull();
    expect(evaluateCastWithoutPrior(followUp, danceBefore, thr(PAIR_WINDOW_S), 'warning')).not.toBeNull();
  });

  it('accepts a companion exactly on the window edge but not past it', () => {
    // window_s is 5, so a Shadow Dance at 5 covers a Secret Technique at 10 and one at 4.9 does not.
    const onEdge = ruleCtx([cast(SHADOW_DANCE, 5), cast(SECRET_TECHNIQUE, 10)]);
    const pastEdge = ruleCtx([cast(SHADOW_DANCE, 4.9), cast(SECRET_TECHNIQUE, 10)]);
    expect(evaluateCastWithoutPrior(SECRET_TECH_NEEDS_DANCE, onEdge, thr(PAIR_WINDOW_S), 'warning')).toBeNull();
    expect(evaluateCastWithoutPrior(SECRET_TECH_NEEDS_DANCE, pastEdge, thr(PAIR_WINDOW_S), 'warning')).not.toBeNull();
  });

  it('evaluateRules names a violated rule by its description, matching how rulesFollowed names it', () => {
    const description = 'Secret Technique always inside Shadow Dance';
    const rule: RulebookRule = { description, condition: SECRET_TECH_NEEDS_DANCE };
    const violated = evaluateRules([benched(rule)], ruleCtx([cast(SECRET_TECHNIQUE, 10)]));
    expect(violated[0].label).toBe(description);
    expect(rulesFollowed([benched(rule)], ruleCtx([cast(SHADOW_DANCE, 8), cast(SECRET_TECHNIQUE, 10)]))).toEqual([description]);
  });

  it('evaluateRules falls back to the synthesized label when a rule has no description', () => {
    const rule: RulebookRule = { condition: SECRET_TECH_NEEDS_DANCE };
    expect(evaluateRules([benched(rule)], ruleCtx([cast(SECRET_TECHNIQUE, 10)]))[0].label)
      .toBe('Secret Technique without Shadow Dance');
  });

  it('evaluateRules carries the rule type onto the finding', () => {
    const rule: RulebookRule = { type: 'cooldown_pairing', priority: 'high', condition: SECRET_TECH_NEEDS_DANCE };
    const findings = evaluateRules([benched(rule)], ruleCtx([cast(SECRET_TECHNIQUE, 10)]));
    expect(findings[0].rule_type).toBe('cooldown_pairing');
  });
});

describe('ruleSeverity', () => {
  it('maps critical to the critical tier', () => {
    expect(ruleSeverity('critical')).toBe('critical');
  });

  it('maps high to the warning tier', () => {
    expect(ruleSeverity('high')).toBe('warning');
  });

  it('maps medium and low to the info tier', () => {
    expect(ruleSeverity('medium')).toBe('info');
    expect(ruleSeverity('low')).toBe('info');
  });

  it('falls back to warning for a missing or unknown priority', () => {
    expect(ruleSeverity(undefined)).toBe('warning');
    expect(ruleSeverity('urgent')).toBe('warning');
  });

  it('drives the severity of an evaluated rule finding', () => {
    const rule: RulebookRule = { priority: 'medium', condition: SECRET_TECH_NEEDS_DANCE };
    expect(evaluateRules([benched(rule)], ruleCtx([cast(SECRET_TECHNIQUE, 10)]))[0].severity).toBe('info');
  });
});

describe('ruleLabel', () => {
  it('prefers the rule description when present', () => {
    expect(ruleLabel(SECRET_TECH_NEEDS_DANCE, 'Pair Shadow Dance with Secret Technique'))
      .toBe('Pair Shadow Dance with Secret Technique');
  });

  it('describes a paired-cast rule as "<spell> with <required>"', () => {
    expect(ruleLabel(SECRET_TECH_NEEDS_DANCE)).toBe('Secret Technique with Shadow Dance');
  });

  it('describes a hold rule as "<spells> held for <anchor>"', () => {
    expect(ruleLabel(HOLD_DANCE_FOR_BLADES)).toBe('Shadow Dance held for Shadow Blades');
  });
});

// Fight-relative seconds shared by the new-kind fixtures.
const DANCE_START_S = 20, DANCE_END_S = 28;
const COMBO_POINT_TYPE = 4;  // WCL power-type id for combo points
const MAX_COMBO_POINTS = 5;

describe('evaluateCastOutsideBuff', () => {
  const insideDance: CastOutsideBuffCondition = {
    kind: 'cast_outside_buff', spell_id: SECRET_TECHNIQUE, spell_name: 'Secret Technique',
    buff_spell_id: SHADOW_DANCE, buff_spell_name: 'Shadow Dance', require: 'inside',
  };
  const dance = buffWindow(SHADOW_DANCE, DANCE_START_S, DANCE_END_S);

  it('flags a cast made while the buff was down', () => {
    const ctx = ruleCtx([cast(SECRET_TECHNIQUE, DANCE_END_S + 5)], { buffs: dance });
    expect(evaluateCastOutsideBuff(insideDance, ctx, 'warning')?.measured?.value).toBe('1 / 1');
  });

  it('passes a cast made inside the buff span', () => {
    const ctx = ruleCtx([cast(SECRET_TECHNIQUE, DANCE_START_S + 2)], { buffs: dance });
    expect(evaluateCastOutsideBuff(insideDance, ctx, 'warning')).toBeNull();
  });

  it('inverts for require "outside", flagging the cast made while the buff was up', () => {
    const outsideDance: CastOutsideBuffCondition = { ...insideDance, require: 'outside' };
    const ctx = ruleCtx([cast(SECRET_TECHNIQUE, DANCE_START_S + 2)], { buffs: dance });
    expect(evaluateCastOutsideBuff(outsideDance, ctx, 'warning')?.measured?.value).toBe('1 / 1');
  });

  it('is not applicable when the judged spell was never cast', () => {
    expect(ruleApplicable(insideDance, ruleCtx([], { buffs: dance }))).toBe(false);
  });
});

describe('evaluateAuraUptimeBelow', () => {
  const RUPTURE_MIN_PCT = 90;  // what the top parses hold, supplied as a measured threshold
  const ruptureUptime: AuraUptimeBelowCondition = {
    kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'Rupture', on: 'target',
  };
  // The context fight runs 0..120s, so a 60s span is 50% uptime.
  const halfUptime = [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, 60)];

  it('flags uptime under the authored threshold, measured against it', () => {
    const finding = evaluateAuraUptimeBelow(ruptureUptime, ruleCtx([], { debuffs: halfUptime }), thr(RUPTURE_MIN_PCT), 'warning');
    expect(finding?.measured).toEqual({ value: `50 / ${RUPTURE_MIN_PCT}`, unit: '% uptime' });
  });

  it('passes uptime at or above the threshold', () => {
    const nearFull = [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, 115)];
    expect(evaluateAuraUptimeBelow(ruptureUptime, ruleCtx([], { debuffs: nearFull }), thr(RUPTURE_MIN_PCT), 'warning')).toBeNull();
  });

  it('stays silent on zero uptime, which reads as a build that skips the aura', () => {
    expect(evaluateAuraUptimeBelow(ruptureUptime, ruleCtx([]), thr(RUPTURE_MIN_PCT), 'warning')).toBeNull();
    expect(ruleApplicable(ruptureUptime, ruleCtx([]))).toBe(false);
  });

  it('reads the self stream when on is "self"', () => {
    const selfAura: AuraUptimeBelowCondition = { ...ruptureUptime, on: 'self' };
    const ctx = ruleCtx([], { buffs: [applyBuff(RUPTURE, 0), removeBuff(RUPTURE, 60)] });
    expect(evaluateAuraUptimeBelow(selfAura, ctx, thr(RUPTURE_MIN_PCT), 'warning')?.measured?.value).toBe(`50 / ${RUPTURE_MIN_PCT}`);
  });
});

describe('rule evaluator boundaries', () => {
  const dance = buffWindow(SHADOW_DANCE, DANCE_START_S, DANCE_END_S);

  // Measured on a real pull: 75 of 197 Hot Streak removals share the exact millisecond of the
  // consuming cast, so both kinds must read that cast as inside the buff or perfect play is flagged twice.
  it('reads a cast on the removal instant as inside the buff', () => {
    const insideDance: CastOutsideBuffCondition = {
      kind: 'cast_outside_buff', spell_id: SECRET_TECHNIQUE, spell_name: 'Secret Technique',
      buff_spell_id: SHADOW_DANCE, buff_spell_name: 'Shadow Dance', require: 'inside',
    };
    const ctx = ruleCtx([cast(SECRET_TECHNIQUE, DANCE_END_S)], { buffs: dance });
    expect(evaluateCastOutsideBuff(insideDance, ctx, 'warning')).toBeNull();
  });

  it('reads that same cast as having consumed the proc', () => {
    const spendDance: ProcWastedCondition = {
      kind: 'proc_wasted', buff_spell_id: SHADOW_DANCE, buff_spell_name: 'Shadow Dance',
      spend_spell_ids: [SECRET_TECHNIQUE], spend_spell_names: ['Secret Technique'],
    };
    const ctx = ruleCtx([cast(SECRET_TECHNIQUE, DANCE_END_S)], { buffs: dance });
    expect(evaluateProcWasted(spendDance, ctx, 'warning')).toBeNull();
  });

  it('passes uptime exactly at the measured bar (strict below)', () => {
    const HALF_UPTIME_PCT = 50;
    const exactly: AuraUptimeBelowCondition = {
      kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'Rupture', on: 'target',
    };
    const ctx = ruleCtx([], { debuffs: [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, 60)] });
    expect(evaluateAuraUptimeBelow(exactly, ctx, thr(HALF_UPTIME_PCT), 'warning')).toBeNull();
  });

  it('accepts an opener step landing exactly on window_s', () => {
    const OPENER_WINDOW_S = 12;
    const opener: OpeningSequenceCondition = {
      kind: 'opening_sequence', spell_ids: [SHADOW_BLADES, SECRET_TECHNIQUE],
      spell_names: ['Shadow Blades', 'Secret Technique'],
    };
    const ctx = ruleCtx([cast(SHADOW_BLADES, 0), cast(SECRET_TECHNIQUE, OPENER_WINDOW_S)]);
    expect(evaluateOpeningSequence(opener, ctx, thr(OPENER_WINDOW_S), 'warning')).toBeNull();
  });
});

describe('evaluateOpeningSequence', () => {
  const OPENER_WINDOW_S = 12;
  const opener: OpeningSequenceCondition = {
    kind: 'opening_sequence',
    spell_ids: [SHADOW_BLADES, SHADOW_DANCE, SECRET_TECHNIQUE],
    spell_names: ['Shadow Blades', 'Shadow Dance', 'Secret Technique'],
  };

  it('passes the sequence cast in order inside the window', () => {
    const ctx = ruleCtx([cast(SHADOW_BLADES, 1), cast(SHADOW_DANCE, 3), cast(SECRET_TECHNIQUE, 5)]);
    expect(evaluateOpeningSequence(opener, ctx, thr(OPENER_WINDOW_S), 'warning')).toBeNull();
  });

  it('flags a sequence cast out of order, reporting the steps reached', () => {
    const ctx = ruleCtx([cast(SHADOW_BLADES, 1), cast(SECRET_TECHNIQUE, 3), cast(SHADOW_DANCE, 5)]);
    expect(evaluateOpeningSequence(opener, ctx, thr(OPENER_WINDOW_S), 'warning')?.measured).toEqual({ value: '2 / 3', unit: 'step(s)' });
  });

  it('flags a step that lands past the opener window', () => {
    const ctx = ruleCtx([cast(SHADOW_BLADES, 1), cast(SHADOW_DANCE, 3), cast(SECRET_TECHNIQUE, OPENER_WINDOW_S + 5)]);
    expect(evaluateOpeningSequence(opener, ctx, thr(OPENER_WINDOW_S), 'warning')?.measured?.value).toBe('2 / 3');
  });

  it('tolerates unrelated casts between the steps', () => {
    const ctx = ruleCtx([cast(SHADOW_BLADES, 1), cast(EVISCERATE, 2), cast(SHADOW_DANCE, 3), cast(SECRET_TECHNIQUE, 5)]);
    expect(evaluateOpeningSequence(opener, ctx, thr(OPENER_WINDOW_S), 'warning')).toBeNull();
  });

  it('is not applicable on a pull with none of the sequence spells', () => {
    expect(ruleApplicable(opener, ruleCtx([cast(EVISCERATE, 1)]))).toBe(false);
  });
});

describe('evaluateCastAtTargetCount', () => {
  const MIN_AOE_TARGETS = 3;
  const TARGET_FLOOR = MIN_AOE_TARGETS;  // the count the field uses it at, measured
  const CAST_S = 10;
  const blackPowder: CastAtTargetCountCondition = {
    kind: 'cast_at_target_count', spell_id: BLACK_POWDER, spell_name: 'Black Powder', bound: 'min',
  };
  const hits = (targets: number[]) => targets.map(id => damage(BLACK_POWDER, CAST_S + 1, 100, { target: id }));

  it('flags an AoE finisher pressed under the target floor', () => {
    const ctx = ruleCtx([cast(BLACK_POWDER, CAST_S)], { damage: hits([1, 2]) });
    expect(evaluateCastAtTargetCount(blackPowder, ctx, thr(TARGET_FLOOR), 'warning')?.measured?.value).toBe('1 / 1');
  });

  it('passes the same cast once enough enemies are hit', () => {
    const ctx = ruleCtx([cast(BLACK_POWDER, CAST_S)], { damage: hits([1, 2, 3]) });
    expect(evaluateCastAtTargetCount(blackPowder, ctx, thr(TARGET_FLOOR), 'warning')).toBeNull();
  });

  it('flags a single-target ability pressed over its ceiling', () => {
    const FIELD_CEILING = 2;  // the field stops using it above this, measured
    const capped: CastAtTargetCountCondition = {
      kind: 'cast_at_target_count', spell_id: EVISCERATE, spell_name: 'Eviscerate', bound: 'max',
    };
    const ctx = ruleCtx([cast(EVISCERATE, CAST_S)],
      { damage: [1, 2, 3].map(id => damage(EVISCERATE, CAST_S + 1, 100, { target: id })) });
    expect(evaluateCastAtTargetCount(capped, ctx, thr(FIELD_CEILING), 'warning')?.measured?.value).toBe('1 / 1');
  });

  it('counts copies of one add separately, since they share a targetID and differ only by instance', () => {
    const ADD_ID = 7;
    const copies = [1, 2, 3].map(instance =>
      ({ ...damage(BLACK_POWDER, CAST_S + 1, 100, { target: ADD_ID }), targetInstance: instance }));
    const ctx = ruleCtx([cast(BLACK_POWDER, CAST_S)], { damage: copies });
    expect(evaluateCastAtTargetCount(blackPowder, ctx, thr(TARGET_FLOOR), 'warning')).toBeNull();
  });

  it('ignores a cast with no damage recorded near it, rather than reading it as zero targets', () => {
    const ctx = ruleCtx([cast(BLACK_POWDER, CAST_S)], { damage: hits([1, 2]).map(e => ({ ...e, timestamp: 90_000 })) });
    expect(evaluateCastAtTargetCount(blackPowder, ctx, thr(TARGET_FLOOR), 'warning')).toBeNull();
  });
});

describe('evaluateResourceAtCast', () => {
  const RESOURCE_FLOOR = 1;  // the field spends at a full pool, measured as a share of cap
  const finisherAtMax: ResourceAtCastCondition = {
    kind: 'resource_at_cast', spell_id: EVISCERATE, spell_name: 'Eviscerate',
    resource_type: COMBO_POINT_TYPE, resource_name: 'combo points', bound: 'min',
  };
  const atCombo = (atS: number, amount: number) =>
    cast(EVISCERATE, atS, { resources: [{ amount, max: MAX_COMBO_POINTS, type: COMBO_POINT_TYPE }] });

  it('flags a finisher spent below the authored threshold', () => {
    const ctx = ruleCtx([atCombo(10, 3), atCombo(20, MAX_COMBO_POINTS)]);
    expect(evaluateResourceAtCast(finisherAtMax, ctx, thr(RESOURCE_FLOOR), 'warning')?.measured).toEqual({ value: '1 / 2', unit: 'cast(s)' });
  });

  it('passes finishers spent at the threshold', () => {
    expect(evaluateResourceAtCast(finisherAtMax, ruleCtx([atCombo(10, MAX_COMBO_POINTS)]), thr(RESOURCE_FLOOR), 'warning')).toBeNull();
  });

  it('flags a generator pressed above its ceiling', () => {
    const FIELD_CEILING_FRAC = 0.8;  // the field generates below four fifths of the cap, measured
    const noOvercap: ResourceAtCastCondition = {
      kind: 'resource_at_cast', spell_id: BLACK_POWDER, spell_name: 'Black Powder',
      resource_type: COMBO_POINT_TYPE, resource_name: 'combo points', bound: 'max',
    };
    const ctx = ruleCtx([cast(BLACK_POWDER, 10,
      { resources: [{ amount: MAX_COMBO_POINTS, max: MAX_COMBO_POINTS, type: COMBO_POINT_TYPE }] })]);
    expect(evaluateResourceAtCast(noOvercap, ctx, thr(FIELD_CEILING_FRAC), 'warning')?.measured?.value).toBe('1 / 1');
  });

  it('is not applicable when the casts carry no resource snapshot', () => {
    expect(evaluateResourceAtCast(finisherAtMax, ruleCtx([cast(EVISCERATE, 10)]), thr(RESOURCE_FLOOR), 'warning')).toBeNull();
    expect(ruleApplicable(finisherAtMax, ruleCtx([cast(EVISCERATE, 10)]))).toBe(false);
  });
});

describe('evaluateProcWasted', () => {
  const spendDance: ProcWastedCondition = {
    kind: 'proc_wasted', buff_spell_id: SHADOW_DANCE, buff_spell_name: 'Shadow Dance',
    spend_spell_ids: [SECRET_TECHNIQUE], spend_spell_names: ['Secret Technique'],
  };
  const dance = buffWindow(SHADOW_DANCE, DANCE_START_S, DANCE_END_S);

  it('flags a proc that expired with nothing spent into it', () => {
    const ctx = ruleCtx([cast(SECRET_TECHNIQUE, DANCE_END_S + 5)], { buffs: dance });
    expect(evaluateProcWasted(spendDance, ctx, 'warning')?.measured).toEqual({ value: '1 / 1', unit: 'proc(s)' });
  });

  it('passes a proc consumed inside its span', () => {
    const ctx = ruleCtx([cast(SECRET_TECHNIQUE, DANCE_START_S + 2)], { buffs: dance });
    expect(evaluateProcWasted(spendDance, ctx, 'warning')).toBeNull();
  });

  it('ignores a span still open at the end of the pull', () => {
    const ctx = ruleCtx([], { buffs: [applyBuff(SHADOW_DANCE, DANCE_START_S)] });
    expect(evaluateProcWasted(spendDance, ctx, 'warning')).toBeNull();
    expect(ruleApplicable(spendDance, ctx)).toBe(false);
  });
});

describe('rulesFollowed', () => {
  const pairDanceWithSecretTech: RulebookRule = {
    priority: 'warning', description: 'Pair Shadow Dance with Secret Technique', condition: SECRET_TECH_NEEDS_DANCE,
  };
  const holdDanceForBlades: RulebookRule = {
    priority: 'critical', description: 'Hold Shadow Dance for Shadow Blades', condition: HOLD_DANCE_FOR_BLADES,
  };

  it('lists the rule when Shadow Dance is paired with Secret Technique', () => {
    expect(rulesFollowed([benched(pairDanceWithSecretTech)], ruleCtx([cast(SHADOW_DANCE, 10), cast(SECRET_TECHNIQUE, 12)])))
      .toEqual(['Pair Shadow Dance with Secret Technique']);
  });

  it('omits the rule when Shadow Dance is cast without Secret Technique', () => {
    expect(rulesFollowed([benched(pairDanceWithSecretTech)], ruleCtx([cast(SHADOW_DANCE, 10), cast(SECRET_TECHNIQUE, 30)]))).toEqual([]);
  });

  it('omits the rule when Secret Technique was never cast', () => {
    expect(rulesFollowed([benched(pairDanceWithSecretTech)], ruleCtx([cast(SHADOW_DANCE, 12)]))).toEqual([]);
  });

  it('lists the rule when Shadow Dance is held clear of Shadow Blades', () => {
    // Shadow Blades at 10 and 120; the held Shadow Dance at 50 is outside [105,120).
    expect(rulesFollowed([benched(holdDanceForBlades, thr(HOLD_WINDOW_S))], ruleCtx([cast(SHADOW_BLADES, 10), cast(SHADOW_BLADES, 120), cast(SHADOW_DANCE, 50)])))
      .toEqual(['Hold Shadow Dance for Shadow Blades']);
  });

  it('omits the rule when Shadow Dance is spent in the hold window before Shadow Blades', () => {
    expect(rulesFollowed([benched(holdDanceForBlades, thr(HOLD_WINDOW_S))], ruleCtx([cast(SHADOW_BLADES, 10), cast(SHADOW_BLADES, 120), cast(SHADOW_DANCE, 110)]))).toEqual([]);
  });

  it('omits the rule when the held cooldown was never cast', () => {
    expect(rulesFollowed([benched(holdDanceForBlades, thr(HOLD_WINDOW_S))], ruleCtx([cast(SHADOW_BLADES, 10), cast(SHADOW_BLADES, 120)]))).toEqual([]);
  });

  it('omits the rule with only a single Shadow Blades cast', () => {
    expect(rulesFollowed([benched(holdDanceForBlades, thr(HOLD_WINDOW_S))], ruleCtx([cast(SHADOW_BLADES, 10), cast(SHADOW_DANCE, 5)]))).toEqual([]);
  });

});

describe('analyzeRotationFindings', () => {
  it('emits a lost-cooldown critical when never used and expected', () => {
    const findings = analyzeRotationFindings(scan({ bench: bench() }));
    const lost = findings.find(f => f.category === 'lost_cooldown');
    expect(lost?.severity).toBe('critical');
  });

  it('emits a success when used on cd and BL-aligned', () => {
    const casts = [cast(SHADOW_BLADES, 6)];
    const buffs = [applyBuff(BLOODLUST, 6)];
    const single = bench({ per_cd_benchmarks: { 'Shadow Blades': cdBench({ uses_per_min: { avg: 0.5, stddev: 0.1, min: 0.4, max: 0.6 } }) } });
    const findings = analyzeRotationFindings(scan({ castEvents: casts, buffEvents: buffs, bench: single }));
    const success = findings.find(f => f.category === 'cooldown_usage' && f.severity === 'success');
    expect(success).toBeDefined();
    expect(success!.message).toContain('BL-aligned');
  });

  it('flags a late opener', () => {
    const casts = [cast(SHADOW_BLADES, 40)];
    const buffs = [applyBuff(BLOODLUST, 38)];
    const findings = analyzeRotationFindings(scan({ castEvents: casts, buffEvents: buffs, bench: bench() }));
    expect(findings.some(f => f.category === 'cooldown_delay')).toBe(true);
  });

  it('gives the cast-efficiency finding a label and a remedy so the row is not blank', () => {
    // A 24s idle gap on the 120s scan fight = 80% efficiency, below the 87% (top avg 90 minus
    // 1 sigma) warn threshold.
    const FIRST_CAST_S = 6;
    const LATE_CAST_S = 30;
    const casts = [cast(SHADOW_BLADES, FIRST_CAST_S), cast(SHADOW_BLADES, LATE_CAST_S)];
    const findings = analyzeRotationFindings(scan({ castEvents: casts, bench: bench() }));
    const efficiency = findings.find(f => f.category === 'cast_efficiency');
    expect(efficiency).toBeDefined();
    expect(efficiency!.label).toBeTruthy();
    expect(efficiency!.details?.remedy).toBeTruthy();
  });
});

describe('analyzeRotationFindings hold suggestions (prior-relative)', () => {
  const holdBench = bench({
    per_cd_benchmarks: { 'Shadow Blades': cdBench({
      hold_targets: { '2': { target_s: 130, stddev_s: 5, delay_s: 30, delay_stddev_s: 3, band_s: 5, effective_cd_s: 90, count: 4, total_samples: 5 } },
    }) },
  });

  it('flags an under-hold below the consensus band', () => {
    // gap 100, effective_cd 90 -> playerDelay 10 < (delay 30 - band 5 = 25).
    const casts = [cast(SHADOW_BLADES, 0), cast(SHADOW_BLADES, 100)];
    const findings = analyzeRotationFindings(scan({ castEvents: casts, bench: holdBench }));
    expect(findings.some(f => f.category === 'hold_suggestion')).toBe(true);
  });

  it('does not flag a player exactly at the band edge (strict)', () => {
    // gap 115 -> playerDelay 25, exactly delay - band; strict < so not flagged.
    const casts = [cast(SHADOW_BLADES, 0), cast(SHADOW_BLADES, 115)];
    const findings = analyzeRotationFindings(scan({ castEvents: casts, bench: holdBench }));
    expect(findings.some(f => f.category === 'hold_suggestion')).toBe(false);
  });

  it('does not flag an over-hold', () => {
    const casts = [cast(SHADOW_BLADES, 0), cast(SHADOW_BLADES, 160)];
    const findings = analyzeRotationFindings(scan({ castEvents: casts, bench: holdBench }));
    expect(findings.some(f => f.category === 'hold_suggestion')).toBe(false);
  });
});

describe('checkLostUses', () => {
  const FIGHT_S = 120;

  it('flags a critical when a cooldown is never used but expected', () => {
    // 0 casts, expected 2 -> lost.
    const finding = checkLostUses('Shadow Blades', 0, 2, 2, FIGHT_S);
    expect(finding?.severity).toBe('critical');
  });

  it('flags a critical when used below the floor', () => {
    // 1 cast, floor 2 -> 1 lost.
    expect(checkLostUses('Shadow Blades', 1, 2, 2, FIGHT_S)?.category).toBe('lost_cooldown');
  });

  it('does not flag a cast exactly at the floor (strict)', () => {
    // 2 casts, floor 2 -> actual < floor is false.
    expect(checkLostUses('Shadow Blades', 2, 2, 2, FIGHT_S)).toBeNull();
  });
});

describe('checkFirstCastDelay', () => {
  // cdBench: avg_first_cast_s 5, stddev 2 -> outlier above 5 + 2*2 = 9s.

  it('flags a first cast more than 2 sigma past the top open', () => {
    // first cast at 10s > 9s threshold.
    expect(checkFirstCastDelay('Shadow Blades', [10 * ONE_SEC_MS], cdBench())?.category).toBe('cooldown_delay');
  });

  it('does not flag a first cast exactly at the 2-sigma boundary (strict)', () => {
    // first cast at 9s == threshold; strict > so not flagged.
    expect(checkFirstCastDelay('Shadow Blades', [9 * ONE_SEC_MS], cdBench())).toBeNull();
  });

  it('returns null with no casts', () => {
    expect(checkFirstCastDelay('Shadow Blades', [], cdBench())).toBeNull();
  });
});

describe('checkBloodlustAlignment', () => {
  const BL_AT_S = 10;
  // BL window: 30s before BL to 40s duration + 15s trail -> [-30, +55] around BL_AT_S = [-20, 65].

  it('flags a BL miss when the cooldown lands outside the window and parsers align it', () => {
    // cast at 100s is outside [-20, 65]; wantsBL true.
    const out = checkBloodlustAlignment('Shadow Blades', [100 * ONE_SEC_MS], cdBench(), BL_AT_S, true);
    expect(out.blAligned).toBe(false);
    expect(out.findings[0]?.measured).toEqual({ value: 'missed', unit: 'BL' });
  });

  it('does not flag a miss when parsers do not align it', () => {
    const out = checkBloodlustAlignment('Shadow Blades', [100 * ONE_SEC_MS], cdBench(), BL_AT_S, false);
    expect(out.blAligned).toBe(false);
    expect(out.findings).toEqual([]);
  });

  it('flags an in-window offset more than 2 sigma off the top offset', () => {
    // avg_bl_offset 0, stddev 2 -> outlier beyond |offset| > 4. Cast at BL+5s -> offset 5.
    const out = checkBloodlustAlignment('Shadow Blades', [(BL_AT_S + 5) * ONE_SEC_MS], cdBench(), BL_AT_S, true);
    expect(out.blAligned).toBe(true);
    expect(out.findings[0]?.measured).toEqual({ value: 'late', unit: 'in BL' });
  });

  it('does not flag an in-window offset exactly at the 2-sigma boundary (strict)', () => {
    // offset exactly 4 == 2*stddev; strict so not flagged.
    const out = checkBloodlustAlignment('Shadow Blades', [(BL_AT_S + 4) * ONE_SEC_MS], cdBench(), BL_AT_S, true);
    expect(out.blAligned).toBe(true);
    expect(out.findings).toEqual([]);
  });

  it('stamps the judged cast, not the earliest in-window cast', () => {
    // avg_bl_offset -8, stddev 2 -> in-band [-12, -4]. Two in-window casts: an early one at
    // offset -8 (in-band) and a later one at offset -2 (closest to zero, so judged, and a late
    // outlier). The finding must anchor the judged late cast, not the earlier in-band one.
    const EARLY_IN_BAND_MS = (BL_AT_S - 8) * ONE_SEC_MS;
    const LATE_JUDGED_MS = (BL_AT_S - 2) * ONE_SEC_MS;
    const out = checkBloodlustAlignment(
      'Shadow Blades', [EARLY_IN_BAND_MS, LATE_JUDGED_MS],
      cdBench({ avg_bl_offset_s: -8, stddev_bl_offset_s: 2 }), BL_AT_S, true);
    expect(out.findings[0]?.measured).toEqual({ value: 'late', unit: 'in BL' });
    expect(out.findings[0]?.timestamp_ms).toBe(LATE_JUDGED_MS);
  });

  it('returns not-aligned with no BL', () => {
    expect(checkBloodlustAlignment('Shadow Blades', [5 * ONE_SEC_MS], cdBench(), null, true))
      .toEqual({ blAligned: false, findings: [] });
  });
});

describe('checkGaps', () => {
  // cdBench: avg_gap_s 90, stddev 5 -> outlier above 90 + 2*5 = 100s.

  it('flags a gap more than 2 sigma above the top gap', () => {
    // gap 0 -> 110 == 110s > 100s.
    expect(checkGaps('Shadow Blades', [0, 110 * ONE_SEC_MS], cdBench())).toHaveLength(1);
  });

  it('does not flag a gap exactly at the 2-sigma boundary (strict)', () => {
    // gap 0 -> 100 == 100s threshold; strict > so not flagged.
    expect(checkGaps('Shadow Blades', [0, 100 * ONE_SEC_MS], cdBench())).toEqual([]);
  });

  it('returns nothing when the bench has no gap stats', () => {
    expect(checkGaps('Shadow Blades', [0, 200 * ONE_SEC_MS], cdBench({ avg_gap_s: null, stddev_gap_s: null }))).toEqual([]);
  });
});

describe('checkCastEfficiency', () => {
  const FIGHT_DUR_S = 120;
  // bench(): top_avg_efficiency 90%, top_efficiency_stddev 3% -> warn strictly below 87% (top - 1 sigma).
  // efficiency% = (1 - idleS / FIGHT_DUR_S) * 100. Each idle span is a single gap > the 1.5s downtime floor.
  const IDLE_BELOW_BAND_S = 20;   // -> 83.3%, below the 87% warn threshold
  const IDLE_FAR_BELOW_S = 60;    // -> 50%, far below the band
  const IDLE_ABOVE_AVG_MS = 1600; // just over the 1.5s downtime floor -> 98.7%, above top avg

  it('flags low cast efficiency more than 1 sigma below the top parses', () => {
    const finding = checkCastEfficiency([0, IDLE_BELOW_BAND_S * ONE_SEC_MS], FIGHT_DUR_S, bench());
    expect(finding?.category).toBe('cast_efficiency');
    expect(finding?.severity).toBe('warning');
    expect(finding?.details?.remedy).toBeTruthy();
  });

  it('never escalates to critical, however far below', () => {
    expect(checkCastEfficiency([0, IDLE_FAR_BELOW_S * ONE_SEC_MS], FIGHT_DUR_S, bench())?.severity).toBe('warning');
  });

  it('does not flag efficiency exactly at the 1-sigma boundary (strict), but flags one bin below', () => {
    // Binary-exact bench: top avg 80%, stddev 5% -> warn strictly below 75%.
    const boundaryBench = bench({ top_avg_efficiency: 80, top_efficiency_stddev: 5 });
    const BOUNDARY_FIGHT_S = 128;
    // 32s idle -> exactly 75% = top - 1 sigma: strict boundary, no finding.
    expect(checkCastEfficiency([0, 32 * ONE_SEC_MS], BOUNDARY_FIGHT_S, boundaryBench)).toBeNull();
    // 33s idle -> 74.21875% < 75%: one bin below the boundary, warns.
    expect(checkCastEfficiency([0, 33 * ONE_SEC_MS], BOUNDARY_FIGHT_S, boundaryBench)?.severity).toBe('warning');
  });

  it('does not flag when the player beats the top parses', () => {
    expect(checkCastEfficiency([0, IDLE_ABOVE_AVG_MS], FIGHT_DUR_S, bench())).toBeNull();
  });

  it('returns null with fewer than two casts', () => {
    expect(checkCastEfficiency([0], FIGHT_DUR_S, bench())).toBeNull();
  });
});

describe('analyzeOneCooldown', () => {
  const FIGHT_DUR_S = 120;
  const UPM = { avg: 0.5, stddev: 0.1, min: 0.4, max: 0.6 };  // top-parse uses-per-minute
  const cd = { name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90, align_with_bloodlust: true };
  const single = cdBench({ uses_per_min: UPM });
  // A cooldown a minority of top parses use: used/sample below MIN_USE_SHARE_FRAC (0.5).
  const TOTAL_SAMPLED = 10;
  const MINORITY_USERS = 2;  // 2/10 = 20%
  const rareUse = cdBench({ sample_count: TOTAL_SAMPLED, used_sample_count: MINORITY_USERS, uses_per_min: UPM });

  it('skips a talent-gated cooldown that was never used', () => {
    expect(analyzeOneCooldown({ ...cd, talent_gated: true }, [], single, 120, null)).toBeNull();
  });

  it('reports success when a cooldown is used cleanly and BL-aligned', () => {
    // first cast 6s (under 9s open threshold), BL at 6s -> aligned.
    const result = analyzeOneCooldown(cd, [6 * ONE_SEC_MS], single, 120, 6);
    expect(result?.scan.issues).toEqual([]);
    expect(result?.success?.message).toContain('BL-aligned');
  });

  it('reports an issue (no success) when the opener is late', () => {
    const result = analyzeOneCooldown(cd, [40 * ONE_SEC_MS], single, 120, 38);
    expect(result?.success).toBeNull();
    expect(result?.scan.issues.some(finding => finding.category === 'cooldown_delay')).toBe(true);
  });

  it('does not flag an unused cooldown that only a minority of top parses use (use-share gate)', () => {
    // Matching the top parses by not pressing it is not a lost cast.
    const result = analyzeOneCooldown(cd, [], rareUse, FIGHT_DUR_S, null);
    expect(result?.scan.issues).toEqual([]);
    expect(result?.success).toBeNull();
  });

  it('does not flag a late opener of a minority-use cooldown (use-share gate)', () => {
    // Opened well past 2 sigma over the 5s top first cast, but the first-cast check is gated off.
    const LATE_OPENER_S = 40;
    const result = analyzeOneCooldown(cd, [LATE_OPENER_S * ONE_SEC_MS], rareUse, FIGHT_DUR_S, null);
    expect(result?.scan.issues.some(finding => finding.category === 'cooldown_delay')).toBe(false);
  });
});

describe('bucketRotationFindings', () => {
  const abilities = { [SHADOW_BLADES]: { icon: 'sb', name: 'Shadow Blades' }, [VANISH]: { icon: 'vanish', name: 'Vanish' } };
  it('splits rule rows, cd issue rows and on-plan chips', () => {
    const findings: AnalysisFinding[] = [
      { severity: 'critical', category: 'rule_violation', label: 'Shadow Dance without Secret Technique', message: '', measured: { value: '1 / 1' }, details: { remedy: 'fix' } },
      { severity: 'warning', category: 'cooldown_delay', cd_name: 'Shadow Blades', message: '', measured: { value: '+3s' }, timestamp_ms: 4000 },
      { severity: 'success', category: 'cooldown_usage', cd_name: 'Vanish', message: '' },
    ];
    const out = bucketRotationFindings(findings, { 'Shadow Blades': SHADOW_BLADES, 'Vanish': VANISH }, abilities);
    expect(out.ruleRows).toHaveLength(1);
    expect(out.ruleRows[0].what).toBe('Shadow Dance without Secret Technique');
    expect(out.offensiveRows).toHaveLength(1);
    expect(out.offensiveRows[0]).toMatchObject({ name: 'Shadow Blades', spellId: SHADOW_BLADES, icon: 'sb', chip: 'held' });
    expect(out.onPlan).toEqual([{ name: 'Vanish', spellId: VANISH, icon: 'vanish' }]);
  });
});

describe('rotation finding partition and row builders', () => {
  const abilities = { [SHADOW_BLADES]: { icon: 'sb', name: 'Shadow Blades' }, [VANISH]: { icon: 'vanish', name: 'Vanish' } };
  const ruleFinding: AnalysisFinding = { severity: 'critical', category: 'rule_violation', label: 'Dance without Secret Technique', message: '', measured: { value: '1 / 1' }, details: { remedy: 'fix' } };
  const issueFinding: AnalysisFinding = { severity: 'warning', category: 'cooldown_delay', cd_name: 'Shadow Blades', message: '', measured: { value: '+3s' }, timestamp_ms: 4000 };
  const holdFinding: AnalysisFinding = { severity: 'info', category: 'hold_suggestion', message: '', measured: { value: '1:00' }, details: { cd_name: 'Shadow Blades', remedy: 'hold' } };
  const successFinding: AnalysisFinding = { severity: 'success', category: 'cooldown_usage', cd_name: 'Vanish', message: '' };

  it('partitions rule findings, per-cd buckets, and success names', () => {
    const partition = partitionRotationFindings([ruleFinding, issueFinding, holdFinding, successFinding]);
    expect(partition.ruleFindings).toEqual([ruleFinding]);
    expect(partition.byName['Shadow Blades'].issues).toEqual([issueFinding]);
    expect(partition.byName['Shadow Blades'].holds).toEqual([holdFinding]);
    expect([...partition.successNames]).toEqual(['Vanish']);
  });

  it('builds a rule row carrying the finding label and remedy', () => {
    const rows = buildRuleRows([ruleFinding]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ what: 'Dance without Secret Technique', fix: 'fix' });
  });

  it('chips a rule row with its rule type and keeps the info tier', () => {
    const medium: AnalysisFinding = { ...ruleFinding, severity: 'info', rule_type: 'cooldown_pairing' };
    expect(buildRuleRows([medium])[0]).toMatchObject({ severity: 'info', chip: 'pairing' });
  });

  it('builds offensive rows with resolved icon + chip per finding', () => {
    const rows = buildOffensiveRows({ 'Shadow Blades': { issues: [issueFinding], holds: [] } }, { 'Shadow Blades': SHADOW_BLADES }, abilities);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'Shadow Blades', spellId: SHADOW_BLADES, icon: 'sb', chip: 'held' });
  });

  it('builds on-plan chips only for clean successes', () => {
    const clean = partitionRotationFindings([successFinding]);
    expect(buildOnPlanChips(clean, { 'Vanish': VANISH }, abilities)).toEqual([{ name: 'Vanish', spellId: VANISH, icon: 'vanish' }]);
    // A success that also has an issue is not on plan.
    const dirty = partitionRotationFindings([successFinding, { ...issueFinding, cd_name: 'Vanish' }]);
    expect(buildOnPlanChips(dirty, { 'Vanish': VANISH }, abilities)).toEqual([]);
  });
});

describe('buildCdPlan', () => {
  const abilities = { [VANISH]: { icon: 'vanish', name: 'Vanish' }, [SHADOW_BLADES]: { icon: 'sb', name: 'Shadow Blades' } };
  it('orders by opener priority and surfaces holds for majority-hold cds', () => {
    const cooldowns = [
      { name: 'Vanish', spell_id: VANISH, cooldown: 120, opener_priority: 2, usage_rule: 'late' },
      { name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90, opener_priority: 1, align_with_bloodlust: true, usage_rule: 'open' },
    ];
    const benchmarks = {
      'Shadow Blades': cdBench({ majority_hold: true, hold_targets: { '2': { target_s: 100, stddev_s: 5, delay_s: 10, delay_stddev_s: 2, band_s: 5, effective_cd_s: 90, count: 4, total_samples: 5 } } }),
      'Vanish': cdBench({ avg_first_cast_s: 20 }),
    };
    const plan = buildCdPlan(cooldowns, benchmarks, abilities);
    expect(plan.map(p => p.name)).toEqual(['Shadow Blades', 'Vanish']);
    expect(plan[0].holds).toEqual([{ castIndex: 2, targetS: 100 }]);
    expect(plan[0].bloodlust).toBe(true);
    expect(plan[0].bloodlustPct).toBe(100);
  });

  it('drives the Bloodlust badge from bl_pct, not the rulebook flag', () => {
    const cooldowns = [
      { name: 'Aligned', spell_id: SHADOW_BLADES, cooldown: 90, align_with_bloodlust: false },
      { name: 'Unaligned', spell_id: VANISH, cooldown: 120, align_with_bloodlust: true },
    ];
    const benchmarks = {
      Aligned: cdBench({ bl_pct: 50 }),    // flag false, but data says aligned -> badge on (50 boundary)
      Unaligned: cdBench({ bl_pct: 49 }),  // flag true, but data says not -> badge off
    };
    const plan = buildCdPlan(cooldowns, benchmarks, abilities);
    const aligned = plan.find(p => p.name === 'Aligned')!;
    const unaligned = plan.find(p => p.name === 'Unaligned')!;
    expect(aligned.bloodlust).toBe(true);
    expect(aligned.bloodlustPct).toBe(50);
    expect(unaligned.bloodlust).toBe(false);
    expect(unaligned.bloodlustPct).toBeNull();
  });

  it('falls back to an empty icon for a cooldown whose spell id is not in the ability map', () => {
    // SECRET_TECHNIQUE is deliberately absent from `abilities`, so the guarded lookup must not throw.
    const UNMAPPED_SPELL_ID = SECRET_TECHNIQUE;
    const plan = buildCdPlan([{ name: 'Unmapped', spell_id: UNMAPPED_SPELL_ID, cooldown: 60 }], {}, abilities);
    expect(plan[0].spellId).toBe(UNMAPPED_SPELL_ID);
    expect(plan[0].icon).toBe('');
  });

  it('nulls the per-use first-cast and uses/min for a cd no top parse used (use-share gate)', () => {
    // used_sample_count 0 -> the transform emits avg_first_cast_s 0, a no-data sentinel, not a 0:00 open.
    const unused = cdBench({ used_sample_count: 0, avg_first_cast_s: 0, avg_uses: 0, uses_per_min: { avg: 0, stddev: 0, min: 0, max: 0 } });
    const plan = buildCdPlan([{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }], { 'Shadow Blades': unused }, abilities);
    expect(plan[0].firstCastS).toBeNull();
    expect(plan[0].usesPerMin).toBeNull();
    // avg_uses is a population average over all parses, so it stays truthful and is not gated.
    expect(plan[0].uses).toBe(0);
  });

  it('nulls the per-use fields when only a minority of top parses use the cd (use-share gate)', () => {
    // 2/10 = 20%, below the majority gate, so even a real avg_first_cast_s is unrepresentative of the plan.
    const TOTAL_SAMPLED = 10;
    const MINORITY_USERS = 2;
    const rare = cdBench({ sample_count: TOTAL_SAMPLED, used_sample_count: MINORITY_USERS, avg_first_cast_s: 20 });
    const plan = buildCdPlan([{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }], { 'Shadow Blades': rare }, abilities);
    expect(plan[0].firstCastS).toBeNull();
    expect(plan[0].usesPerMin).toBeNull();
  });

  it('keeps the per-use fields when a majority of top parses use the cd', () => {
    // Default cdBench: used_sample_count 5 of sample_count 5 -> full use share, so the gate passes.
    const FIRST_CAST_S = 8;
    const USES_PER_MIN = 1.2;
    const used = cdBench({ avg_first_cast_s: FIRST_CAST_S, uses_per_min: { avg: USES_PER_MIN, stddev: 0.1, min: 1, max: 1.4 } });
    const plan = buildCdPlan([{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }], { 'Shadow Blades': used }, abilities);
    expect(plan[0].firstCastS).toBe(FIRST_CAST_S);
    expect(plan[0].usesPerMin).toBe(USES_PER_MIN);
  });
});

// A WCL fake that resolves a valid (empty) player log, so a test's outcome is driven by the
// bench Result rather than an incidental transport throw.
const WORKING_WCL = {
  getReport: async () => ({
    title: 't', fights: [{ id: 1, name: 'Boss', startTime: 0, endTime: 120_000 }],
    masterData: { actors: [], abilities: [] },
  }),
  getAllEvents: async () => [],
};

// Status a 5xx WCL outage raises; `toLoadError` maps it to a transient error.
const WCL_UNAVAILABLE_STATUS = 503;

function withSource(bench: Result<RotationBench, LoadError>, wcl: unknown = WORKING_WCL): RotationFeatureService {
  const source: DataSource<RotationBench> = { getBench: () => Promise.resolve(bench) };
  TestBed.configureTestingModule({
    providers: [
      { provide: ROTATION_DATA_SOURCE, useValue: source },
      { provide: WclApiService, useValue: wcl as WclApiService },
    ],
  });
  return TestBed.inject(RotationFeatureService);
}

describe('RotationFeatureService', () => {
  it('surfaces a missing bench so the offensives waiting state shows', async () => {
    // A working WCL fake proves the missing comes from the bench read, not a player-log failure.
    const service = withSource(missing('Not yet ingested.'));
    const result = await service.loadPlayerView('SubtletyRogue', 1, 'rX', 1, 10);
    expect(result).toEqual(missing('Not yet ingested.'));
  });

  it('surfaces a WCL failure as a transient error instead of a silent empty view', async () => {
    const failingWcl = { getReport: async () => { throw new WclTransportError('WCL down', WCL_UNAVAILABLE_STATUS); } };
    const service = withSource(ok(bench()), failingWcl);
    const result = await service.loadPlayerView('SubtletyRogue', 1, 'rX', 1, 10);
    expect(result).toEqual(transient('WCL is unreachable right now.'));
  });

  it('evaluates the rotation rules baked into the bench', async () => {
    const wcl = {
      getReport: async () => ({ title: 't', fights: [{ id: 1, name: 'Boss', startTime: 0, endTime: 120_000 }], masterData: { actors: [], abilities: [] } }),
      getAllEvents: async (_c: string, _f: number, dataType: string) =>
        dataType === 'Casts' ? [cast(SHADOW_DANCE, 10), cast(SECRET_TECHNIQUE, 30)] : [],
    };
    const rule: RulebookRule = { priority: 'critical', condition: SECRET_TECH_NEEDS_DANCE };
    const service = withSource(ok(bench({ rules: [benched(rule)] })), wcl);
    const result = await service.loadPlayerView('SubtletyRogue', 1, 'rX', 1, 10);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // The baked rule is evaluated exactly once into a rule row (the sparse cast fixture also
      // yields a separate cast-efficiency row, so assert on the rule row rather than the count).
      const ruleRows = result.value.ruleRows.filter(row => row.what === 'Secret Technique without Shadow Dance');
      expect(ruleRows).toHaveLength(1);
    }
  });

  it('computes player findings from the player log', async () => {
    const wcl = {
      getReport: async () => ({
        title: 't', fights: [{ id: 1, name: 'Boss', startTime: 0, endTime: 120_000 }],
        masterData: { actors: [], abilities: [{ gameID: SHADOW_BLADES, name: 'Shadow Blades', icon: 'sb' }] },
      }),
      getAllEvents: async (_c: string, _f: number, dataType: string) =>
        dataType === 'Casts' ? [cast(SHADOW_BLADES, 6)] : [applyBuff(BLOODLUST, 6)],
    };
    const single = bench({ per_cd_benchmarks: { 'Shadow Blades': cdBench({ uses_per_min: { avg: 0.5, stddev: 0.1, min: 0.4, max: 0.6 } }) } });
    const service = withSource(ok(single), wcl);
    const result = await service.loadPlayerView('SubtletyRogue', 1, 'rX', 1, 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.onPlan).toEqual([{ name: 'Shadow Blades', spellId: SHADOW_BLADES, icon: 'sb' }]);
  });

  it('returns bench-only plan rows for the pre-fight view', async () => {
    const service = withSource(ok(bench({
      per_cd_benchmarks: { 'Shadow Blades': cdBench() },
    })));
    const result = await service.loadPlanView('SubtletyRogue', 1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.rows).toHaveLength(1);
      expect(result.value.rows[0].name).toBe('Shadow Blades');
      expect(result.value.rows[0].icon).toBe('sb');
    }
  });

  it('propagates a missing bench so the pre-fight plan waiting state shows', async () => {
    const service = withSource(missing('Not yet ingested.'));
    expect(await service.loadPlanView('SubtletyRogue', 1)).toEqual(missing('Not yet ingested.'));
  });

  it('propagates a transient bench outage so the pre-fight plan surfaces a retry error', async () => {
    const service = withSource(transient('WCL is unreachable right now.'));
    expect(await service.loadPlanView('SubtletyRogue', 1)).toEqual(transient('WCL is unreachable right now.'));
  });
});

describe('RotationFeatureService fetch shape', () => {
  const REPORT = { title: 't', fights: [{ id: 1, name: 'Boss', startTime: 0, endTime: 120_000 }], masterData: { actors: [], abilities: [] } };
  const PLAYER_ID = 10;
  const dotUptime: RulebookRule = {
    condition: { kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'Rupture', on: 'target' },
  };
  const aoeSwitch: RulebookRule = {
    condition: { kind: 'cast_at_target_count', spell_id: BLACK_POWDER, spell_name: 'Black Powder', bound: 'min' },
  };

  function recording(events: WclEvent[] = []) {
    const calls: { dataType: string; sourceId?: number; includeResources: boolean; hostilityType?: string }[] = [];
    return {
      calls,
      api: {
        getReport: async () => REPORT,
        getAllEvents: async (
          _c: string, _f: number, dataType: string, _s: number, _e: number,
          sourceId?: number, includeResources = false, hostilityType?: string,
        ) => {
          calls.push({ dataType, sourceId, includeResources, hostilityType });
          return events;
        },
      },
    };
  }

  it('requests player casts with resources on, which resource_at_cast depends on', async () => {
    const { calls, api } = recording();
    await withSource(ok(bench()), api).loadPlayerView('SubtletyRogue', 1, 'rX', 1, PLAYER_ID);
    expect(calls).toContainEqual({ dataType: 'Casts', sourceId: PLAYER_ID, includeResources: true, hostilityType: undefined });
  });

  it('skips the enemy-aura and damage fetches when no rule reads them', async () => {
    const { calls, api } = recording();
    await withSource(ok(bench()), api).loadPlayerView('SubtletyRogue', 1, 'rX', 1, PLAYER_ID);
    expect(calls.some(call => call.dataType === 'Debuffs')).toBe(false);
    expect(calls.some(call => call.dataType === 'DamageDone')).toBe(false);
  });

  it('fetches enemy auras with Enemies hostility and no source, the only shape WCL answers', async () => {
    const { calls, api } = recording();
    await withSource(ok(bench({ rules: [benched(dotUptime)] })), api).loadPlayerView('SubtletyRogue', 1, 'rX', 1, PLAYER_ID);
    expect(calls).toContainEqual({ dataType: 'Debuffs', sourceId: undefined, includeResources: false, hostilityType: 'Enemies' });
  });

  it('keeps only the auras the player applied out of the raid-wide enemy stream', async () => {
    const OTHER_RAIDER = 99;
    // Partial uptime, so leaving these in would produce a violation row rather than silence.
    const raidWide = [
      { ...applyDebuff(RUPTURE, 0), sourceID: OTHER_RAIDER },
      { ...removeDebuff(RUPTURE, 40), sourceID: OTHER_RAIDER },
    ];
    const { api } = recording(raidWide);
    const result = await withSource(ok(bench({ rules: [benched(dotUptime)] })), api).loadPlayerView('SubtletyRogue', 1, 'rX', 1, PLAYER_ID);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.ruleRows.some(row => row.what?.includes('Rupture'))).toBe(false);
  });

  it('fetches the player damage only when a target-count rule needs it', async () => {
    const { calls, api } = recording();
    await withSource(ok(bench({ rules: [benched(aoeSwitch)] })), api).loadPlayerView('SubtletyRogue', 1, 'rX', 1, PLAYER_ID);
    expect(calls).toContainEqual({ dataType: 'DamageDone', sourceId: PLAYER_ID, includeResources: false, hostilityType: undefined });
  });
});

describe('judgeableRules', () => {
  // A rulebook file that predates the schema's condition requirement, which the types alone cannot rule out.
  const unconformed = [{ description: 'no condition' }, { description: 'null condition', condition: null }] as unknown as RulebookRule[];

  it('drops rules the engine cannot judge, so a non-conforming file cannot crash it', () => {
    expect(judgeableRules(unconformed)).toEqual([]);
  });

  it('keeps every rule that carries a condition', () => {
    const rule: RulebookRule = { description: 'real', condition: SECRET_TECH_NEEDS_DANCE };
    expect(judgeableRules([...unconformed, rule])).toEqual([rule]);
  });
});

describe('measureRule', () => {
  it('measures the widest lead a paired cast needed, so the window covers how loosely the field pairs', () => {
    const TIGHT_LEAD_S = 2, LOOSE_LEAD_S = 6;
    const ctx = ruleCtx([
      cast(SHADOW_DANCE, 10), cast(SECRET_TECHNIQUE, 10 + TIGHT_LEAD_S),
      cast(SHADOW_DANCE, 40), cast(SECRET_TECHNIQUE, 40 + LOOSE_LEAD_S),
    ]);
    expect(measureRule(SECRET_TECH_NEEDS_DANCE, ctx)).toBe(LOOSE_LEAD_S);
  });

  it('measures nothing from a pull where the cast never paired at all', () => {
    expect(measureRule(SECRET_TECH_NEEDS_DANCE, ruleCtx([cast(SECRET_TECHNIQUE, 10)]))).toBeNull();
  });

  it('measures the gap a hold rule keeps clear before a non-opener anchor', () => {
    const CLEAR_GAP_S = 30;
    const ctx = ruleCtx([
      cast(SHADOW_BLADES, 10), cast(SHADOW_DANCE, 90), cast(SHADOW_BLADES, 90 + CLEAR_GAP_S),
    ]);
    expect(measureRule(HOLD_DANCE_FOR_BLADES, ctx)).toBe(CLEAR_GAP_S);
  });

  it('measures the uptime the pull held for an aura rule', () => {
    const uptime: AuraUptimeBelowCondition = {
      kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'Rupture', on: 'target',
    };
    const ctx = ruleCtx([], { debuffs: [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, 60)] });
    expect(measureRule(uptime, ctx)).toBe(50);
  });

  it('measures nothing for the kinds that need no magnitude', () => {
    const proc: ProcWastedCondition = {
      kind: 'proc_wasted', buff_spell_id: SHADOW_DANCE, buff_spell_name: 'Shadow Dance',
      spend_spell_ids: [SECRET_TECHNIQUE], spend_spell_names: ['Secret Technique'],
    };
    expect(measureRule(proc, ruleCtx([], { buffs: buffWindow(SHADOW_DANCE, 10, 20) }))).toBeNull();
  });
});

describe('ruleThreshold', () => {
  const PARSES = 4;

  it('takes the median of what the parses measured and a band no tighter than a tenth of it', () => {
    const { threshold, sample_count } = ruleThreshold([4, 5, 6, 5], PARSES);
    expect(sample_count).toBe(PARSES);
    expect(threshold?.value).toBe(5);
    expect(threshold?.band).toBeGreaterThanOrEqual(0.5);
  });

  it('refuses a threshold when fewer than half the parses could supply one', () => {
    expect(ruleThreshold([5, null, null, null], PARSES).threshold).toBeNull();
  });

  it('refuses a threshold when no parse could supply one', () => {
    expect(ruleThreshold([null, null], 2)).toEqual({ threshold: null, sample_count: 0 });
  });
});

describe('benchedRules', () => {
  const needsMagnitude: RulebookRule = { description: 'pair', condition: SECRET_TECH_NEEDS_DANCE };
  const needsNone: RulebookRule = {
    description: 'proc',
    condition: {
      kind: 'proc_wasted', buff_spell_id: SHADOW_DANCE, buff_spell_name: 'Shadow Dance',
      spend_spell_ids: [SECRET_TECHNIQUE], spend_spell_names: ['Secret Technique'],
    },
  };

  it('keeps a rule whose magnitude this encounter measured', () => {
    expect(benchedRules([benched(needsMagnitude)]).map(entry => entry.rule)).toEqual([needsMagnitude]);
  });

  it('drops a rule whose magnitude the encounter could not measure, rather than inventing one', () => {
    expect(benchedRules([benched(needsMagnitude, null)])).toEqual([]);
  });

  it('keeps a rule that needs no magnitude, whatever the encounter measured', () => {
    expect(benchedRules([benched(needsNone, null)]).map(entry => entry.rule)).toEqual([needsNone]);
  });

  it('drops a rule with no condition before a magnitude is even considered', () => {
    const unconformed = { rule: { description: 'none' }, threshold: null, sample_count: 0 } as unknown as BenchedRule;
    expect(benchedRules([unconformed])).toEqual([]);
  });
});

describe('rulesNeed', () => {
  it('reads enemy auras only for an on-target uptime rule', () => {
    const onSelf: RulebookRule = { condition: { kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'R', on: 'self' } };
    const onTarget: RulebookRule = { condition: { kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'R', on: 'target' } };
    expect(rulesNeed([onSelf], 'enemyAuras')).toBe(false);
    expect(rulesNeed([onTarget], 'enemyAuras')).toBe(true);
  });

  it('reads damage only for a target-count rule', () => {
    const rule: RulebookRule = { condition: { kind: 'cast_at_target_count', spell_id: BLACK_POWDER, spell_name: 'BP', bound: 'min' } };
    expect(rulesNeed([], 'damage')).toBe(false);
    expect(rulesNeed([rule], 'damage')).toBe(true);
  });
});
