import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuraUptimeBelowCondition } from '../../../rulebook/rulebook.models';
import { RUPTURE } from '../../../../../../../testing/spell-ids';
import { applyBuff, removeBuff, applyDebuff, removeDebuff } from '../../../../../../../testing/builders/events';
import {
 RULE_FIGHT_END_S, band, judged, ruleCtx, sampleRule,
} from '../rule-fixtures';
import { AuraUptimeBelowKind } from './aura-uptime-below-kind';

const kind = TestBed.inject(AuraUptimeBelowKind);
const evaluateAuraUptimeBelow = judged(kind);

describe('evaluateAuraUptimeBelow', () => {
  const RUPTURE_MIN_PCT = 90;  // what the field holds, supplied as a measured band
  const ruptureUptime: AuraUptimeBelowCondition = {
    kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'Rupture', on: 'target',
  };
  // The context fight runs 0..120s, so a 60s span is 50% uptime.
  const halfUptime = [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, 60)];

  it('flags uptime under the field\'s floor, measured against it', () => {
    const finding = evaluateAuraUptimeBelow(ruptureUptime, ruleCtx([], { debuffs: halfUptime }), band(RUPTURE_MIN_PCT), 'warning');
    expect(finding?.measured).toEqual({ value: `50.0 / ${RUPTURE_MIN_PCT}.0`, unit: '% uptime' });
  });

  it('passes uptime at or above the floor', () => {
    const nearFull = [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, 115)];
    expect(evaluateAuraUptimeBelow(ruptureUptime, ruleCtx([], { debuffs: nearFull }), band(RUPTURE_MIN_PCT), 'warning')).toBeNull();
  });

  it('stays silent on zero uptime, which reads as a build that skips the aura', () => {
    expect(evaluateAuraUptimeBelow(ruptureUptime, ruleCtx([]), band(RUPTURE_MIN_PCT), 'warning')).toBeNull();
    expect(kind.applicable(ruptureUptime, ruleCtx([]))).toBe(false);
  });

  it('reads the self stream when on is "self"', () => {
    const selfAura: AuraUptimeBelowCondition = { ...ruptureUptime, on: 'self' };
    const ctx = ruleCtx([], { buffs: [applyBuff(RUPTURE, 0), removeBuff(RUPTURE, 60)] });
    expect(evaluateAuraUptimeBelow(selfAura, ctx, band(RUPTURE_MIN_PCT), 'warning')?.measured?.value).toBe(`50.0 / ${RUPTURE_MIN_PCT}.0`);
  });

  it('measures uptime over the whole fight, so a 30s dot on a 120s pull reads 25%', () => {
    // 30 / 120 = 25%.
    const DOT_END_S = 30;
    const ctx = ruleCtx([], { debuffs: [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, DOT_END_S)] });
    const finding = evaluateAuraUptimeBelow(ruptureUptime, ctx, band(RUPTURE_MIN_PCT), 'warning');
    expect(finding?.measured).toEqual({ value: `25.0 / ${RUPTURE_MIN_PCT}.0`, unit: '% uptime' });
  });

  it('reads a debuff applied before the pull as up from fight start, since it arrives as a lone remove', () => {
    const PRE_PULL_REMOVE_S = 20;  // fight runs 0..120s, so this back-fills to 20/120 = 16.7% uptime
    const ctx = ruleCtx([], { debuffs: [removeDebuff(RUPTURE, PRE_PULL_REMOVE_S)] });
    expect(evaluateAuraUptimeBelow(ruptureUptime, ctx, band(RUPTURE_MIN_PCT), 'warning')?.measured?.value)
      .toBe(`16.7 / ${RUPTURE_MIN_PCT}.0`);
    expect(kind.applicable(ruptureUptime, ctx)).toBe(true);
  });
});

describe('rule evaluator boundaries', () => {
  const exactly: AuraUptimeBelowCondition = {
    kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'Rupture', on: 'target',
  };

  it('passes uptime exactly at the measured bar (strict below)', () => {
    const HALF_UPTIME_PCT = 50;
    const ctx = ruleCtx([], { debuffs: [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, 60)] });
    expect(evaluateAuraUptimeBelow(exactly, ctx, band(HALF_UPTIME_PCT), 'warning')).toBeNull();
  });

  it('prints a fractional miss at the precision that judged it, never as two equal numbers', () => {
    // Up 0-117.4s of the 120s fight: 97.83%, a real miss under a 98.4 floor that whole points would print as "98 / 98".
    const UP_UNTIL_S = 117.4;
    const FRACTIONAL_FLOOR_PCT = 98.4;
    const ctx = ruleCtx([], { debuffs: [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, UP_UNTIL_S)] });
    expect(evaluateAuraUptimeBelow(exactly, ctx, band(FRACTIONAL_FLOOR_PCT), 'warning')?.measured)
      .toEqual({ value: '97.8 / 98.4', unit: '% uptime' });
  });

  it('judges the measured uptime, not the printed one, so a miss finer than the decimal still flags', () => {
    // Up 0-118.05s of the 120s fight: 98.375%, under a 98.4 floor by less than the printed decimal.
    const UP_UNTIL_S = 118.05;
    const FRACTIONAL_FLOOR_PCT = 98.4;
    const ctx = ruleCtx([], { debuffs: [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, UP_UNTIL_S)] });
    expect(evaluateAuraUptimeBelow(exactly, ctx, band(FRACTIONAL_FLOOR_PCT), 'warning')).not.toBeNull();
  });
});

describe('sampleRule', () => {
  it('samples the uptime the pull held for an aura rule', () => {
    const uptime: AuraUptimeBelowCondition = {
      kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'Rupture', on: 'target',
    };
    const ctx = ruleCtx([], { debuffs: [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, 60)] });
    expect(sampleRule(kind, uptime, ctx).values).toEqual([50]);
  });
});

describe('occurrence strips', () => {
  it('aura_uptime_below: a timeline of merged up-spans, plus a chip for each of the largest gaps', () => {
    const uptime: AuraUptimeBelowCondition = {
      kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'Rupture', on: 'target',
    };
    // Up 0-50s and 70-90s over a 120s fight: two gaps, 20s and 30s.
    const debuffs = [
      applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, 50),
      applyDebuff(RUPTURE, 70), removeDebuff(RUPTURE, 90),
    ];
    const ctx = ruleCtx([], { debuffs });
    const RUPTURE_MIN_PCT = 80;
    const finding = evaluateAuraUptimeBelow(uptime, ctx, band(RUPTURE_MIN_PCT), 'warning');
    expect(finding?.measured).toEqual({ value: '58.3 / 80.0', unit: '% uptime' });
    expect(finding?.timeline).toEqual({ segmentsS: [[0, 50], [70, 90]], fightDurationS: 120 });
    expect(finding?.occurrences).toEqual([
      { atS: 50, ok: false, label: '20s', detail: 'Rupture was down here for 20s.' },
      { atS: 90, ok: false, label: '30s', detail: 'Rupture was down here for 30s.' },
    ]);
  });

  it('aura_uptime_below: drops a sub-second gap from the chip strip, since it would render as a nonsensical "0s"', () => {
    const uptime: AuraUptimeBelowCondition = {
      kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'Rupture', on: 'target',
    };
    const FIGHT_END_S = 20;
    // Up 0.3-10s and 15-20s over a 20s fight: a 0.3s opening gap (travel-time noise, not a maintain miss) plus a real 5s gap.
    const debuffs = [applyDebuff(RUPTURE, 0.3), removeDebuff(RUPTURE, 10), applyDebuff(RUPTURE, 15)];
    const ctx = ruleCtx([], { debuffs, fightDurationS: FIGHT_END_S });
    const finding = evaluateAuraUptimeBelow(uptime, ctx, band(90), 'warning');
    expect(finding?.timeline).toEqual({ segmentsS: [[0.3, 10], [15, 20]], fightDurationS: FIGHT_END_S });
    expect(finding?.occurrences).toEqual([
      { atS: 10, ok: false, label: '5s', detail: 'Rupture was down here for 5s.' },
    ]);
  });

  it('aura_uptime_below: draws the timeline against the full fight, so a dead stretch still reads as a downtime gap', () => {
    const uptime: AuraUptimeBelowCondition = {
      kind: 'aura_uptime_below', aura_spell_id: RUPTURE, aura_spell_name: 'Rupture', on: 'target',
    };
    // Up 0-40s and 90-120s of the 120s fight: one 50s gap.
    const debuffs = [applyDebuff(RUPTURE, 0), removeDebuff(RUPTURE, 40), applyDebuff(RUPTURE, 90)];
    const ctx = ruleCtx([], { debuffs });
    const finding = evaluateAuraUptimeBelow(uptime, ctx, band(90), 'warning');
    expect(finding?.timeline).toEqual({ segmentsS: [[0, 40], [90, 120]], fightDurationS: RULE_FIGHT_END_S });
    expect(finding?.occurrences).toEqual([
      { atS: 40, ok: false, label: '50s', detail: 'Rupture was down here for 50s.' },
    ]);
  });
});
