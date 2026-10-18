import { assert, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BurstWindow } from '../analysis/analysis.models';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { cast, damage } from '../../../../../testing/builders/events';
import { SHADOW_BLADES, SHADOW_BLADES_DAMAGE } from '../../../../../testing/spell-ids';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { BurstJudgeService } from './burst-judge-service';
import { BurstTransformService } from './burst-transform-service';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';

const judges = TestBed.inject(BurstJudgeService);
const projections = TestBed.inject(WclProjectionsService);
TestBed.resetTestingModule();
TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
] });
const transform = TestBed.inject(BurstTransformService);
TestBed.resetTestingModule();

const START_S = 10;
const END_S = 30;
const HIT = 100;
/** Five top logs that each dealt the same damage: with no spread, the edge is the floor under it. */
const TOP_DAMAGE = 1000;
const RATE_PER_S = 10;
/** The 5s timing floor at 10 damage a second. */
const FLOOR = VERDICT_CHOICES.effectFloors.timingS * RATE_PER_S;
const EDGE = TOP_DAMAGE - FLOOR;

const window = (memberDamage: readonly number[]): BurstWindow => ({
  time_s: START_S, window_length_s: END_S - START_S, dmg_avg: 0, dmg_min: 0, dmg_max: 0, dmg_stddev: 0,
  common_cds: [], ability_breakdown: [],
  members: memberDamage.map((value, parse) => ({ parse, time_s: START_S, window_length_s: END_S - START_S, damage: value })),
});
const FIVE_TOP_LOGS = window(Array.from({ length: VERDICT_CHOICES.minReferenceN }, () => TOP_DAMAGE));

describe('BurstJudgeService', () => {
  it('measures the damage dealt from the window start up to, not at, its end', () => {
    const hits = projections.withRelativeS([damage(SHADOW_BLADES_DAMAGE, START_S, HIT), damage(SHADOW_BLADES_DAMAGE, END_S, HIT)], 0);

    expect(judges.measure(hits, START_S, END_S, false)).toBe(HIT);
  });

  it('keeps a hit on the last instant of a window that closes the fight', () => {
    const hits = projections.withRelativeS([damage(SHADOW_BLADES_DAMAGE, START_S, HIT), damage(SHADOW_BLADES_DAMAGE, END_S, HIT)], 0);

    expect(judges.measure(hits, START_S, END_S, true)).toBe(2 * HIT);
  });

  it('counts absorbed damage and skips a cast', () => {
    const ABSORBED = 40;
    const hits = projections.withRelativeS([damage(SHADOW_BLADES_DAMAGE, START_S, HIT - ABSORBED, { absorbed: ABSORBED }), cast(SHADOW_BLADES, START_S)], 0);

    expect(judges.measure(hits, START_S, END_S, false)).toBe(HIT);
  });

  it('measures a top log\'s window the way ingest bakes it', () => {
    const FIGHT_S = 100;
    const steady = Array.from({ length: FIGHT_S }, (_unused, atS) => damage(SHADOW_BLADES_DAMAGE, atS, 10));
    const burst = [40, 41, 42, 43].map(atS => damage(SHADOW_BLADES_DAMAGE, atS, 1000));
    const events = projections.withRelativeS([...steady, ...burst], 0);
    const [baked] = transform['findParseWindows']({ damage: events, fightLenS: FIGHT_S, timings: [], casts: [], abilityNames: new Map() });
    assert.exists(baked);

    const endS = baked.time_s + baked.window_length_s;
    expect(baked.window_damage).toBe(judges.measure(events, baked.time_s, endS, endS >= FIGHT_S));
  });

  it('reads the damage rate over alive time only', () => {
    const ALIVE_S = 20;
    const hits = projections.withRelativeS([damage(SHADOW_BLADES_DAMAGE, 5, HIT), damage(SHADOW_BLADES_DAMAGE, 50, HIT)], 0);

    expect(judges.aliveRate(hits, [[0, ALIVE_S]])).toBe(HIT / ALIVE_S);
  });

  it('reads one damage figure per top log that formed the window', () => {
    expect(judges.reference(window([TOP_DAMAGE, EDGE]))).toEqual([TOP_DAMAGE, EDGE]);
  });

  it('flags amber one point under the edge, naming the top logs and the target', () => {
    expect(judges.verdict(FIVE_TOP_LOGS, EDGE - 1, RATE_PER_S)).toEqual({
      family: 'burst.window', status: 'amber', icon: 'warning_amber', n: 5,
      message: 'You dealt 949 here, less than the 5 top logs that had this window. Aim for 950 or more.',
    });
  });

  it('does not flag damage exactly at the edge', () => {
    expect(judges.verdict(FIVE_TOP_LOGS, EDGE, RATE_PER_S)).toEqual({
      family: 'burst.window', status: 'neutral', icon: 'compare_arrows', n: 5,
      message: 'You dealt 950 here. 5 top logs had this window.',
    });
  });

  it('prints a flagged amount and its target apart', () => {
    const MILLION_RATE = 10_000;
    const topLogs = window(Array.from({ length: 5 }, () => 1_290_000));

    expect(judges.verdict(topLogs, 1_230_000, MILLION_RATE).message)
      .toBe('You dealt 1.23M here, less than the 5 top logs that had this window. Aim for 1.24M or more.');
  });

  it('compares without color against fewer top logs than the minimum', () => {
    const fourTopLogs = window(Array.from({ length: VERDICT_CHOICES.minReferenceN - 1 }, () => TOP_DAMAGE));

    expect(judges.verdict(fourTopLogs, 0, RATE_PER_S)).toMatchObject({
      status: 'neutral', n: 4, message: 'You dealt 0 here. Only 4 top logs had this window, too few to judge.',
    });
  });

  it('compares without color on a window that carries no top log damage', () => {
    expect(judges.verdict(window([]), 0, RATE_PER_S)).toMatchObject({
      status: 'neutral', n: 0, message: 'You dealt 0 here. No top log carries its own damage for this window, so it is not judged.',
    });
  });

  it('names how many top logs formed a pre-fight window, with no color', () => {
    expect(judges.benchVerdict(FIVE_TOP_LOGS)).toEqual({
      family: 'burst.window', status: 'neutral', icon: 'insights', n: 5, message: '5 top logs had this window.',
    });
  });

  it('says nothing on a pre-fight window that carries no top log', () => {
    expect(judges.benchVerdict(window([])).message).toBe('');
  });
});
