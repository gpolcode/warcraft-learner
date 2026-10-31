import { assert, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BurstWindow } from '../analysis/analysis.models';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { cast, damage } from '../../../../../testing/builders/events';
import { SHADOW_BLADES, SHADOW_BLADES_DAMAGE } from '../../../../../testing/spell-ids';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { BurstJudgeService, BurstMeasure } from './burst-judge-service';
import type { ParseRanking } from '../wcl/wcl.models';
import { benchSources } from '../../../../../testing/builders/bench-sources';
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
const FIGHT_S = 100;
const WINDOW_AT_S = 40;
const WINDOW_S = 10;
const STEADY = 10;
const SEARCH_S = VERDICT_CHOICES.effectFloors.timingS;
/** The 5s timing floor spread over the 10s window, in multiples of the log's own average. */
const FLOOR = SEARCH_S / WINDOW_S;
const TOP_AMPLIFICATION = 2;
const EDGE = TOP_AMPLIFICATION - FLOOR;

const window = (memberCount: number, timeS = WINDOW_AT_S, lengthS = WINDOW_S): BurstWindow => ({
  time_s: timeS, window_length_s: lengthS, dmg_avg: 0, dmg_min: 0, dmg_max: 0, dmg_stddev: 0,
  common_cds: [], ability_breakdown: [],
  members: Array.from({ length: memberCount }, (_unused, parse) => ({ parse, time_s: timeS, window_length_s: lengthS, damage: 0 })),
});
const WINDOW = window(VERDICT_CHOICES.minReferenceN);

/** Steady damage every second, with `extra` more on each second of the burst starting at `burstAtS`. */
function steadyWithBurst(burstAtS: number, extra: number, fightS = FIGHT_S): number[] {
  return Array.from({ length: fightS }, (_unused, second) => STEADY + (second >= burstAtS && second < burstAtS + WINDOW_S ? extra : 0));
}

const measured = (amplification: number, damage = 1000): BurstMeasure => ({ damage, amplification, startS: WINDOW_AT_S, lengthS: WINDOW_S });
const FIVE_TOP_LOGS = Array.from({ length: VERDICT_CHOICES.minReferenceN }, () => TOP_AMPLIFICATION);

describe('BurstJudgeService span damage', () => {
  it('measures the damage dealt from the window start up to, not at, its end', () => {
    const hits = projections.withRelativeS([damage(SHADOW_BLADES_DAMAGE, START_S, HIT), damage(SHADOW_BLADES_DAMAGE, END_S, HIT)], 0);

    expect(judges.spanDamage(hits, START_S, END_S, false)).toBe(HIT);
  });

  it('keeps a hit on the last instant of a window that closes the fight', () => {
    const hits = projections.withRelativeS([damage(SHADOW_BLADES_DAMAGE, START_S, HIT), damage(SHADOW_BLADES_DAMAGE, END_S, HIT)], 0);

    expect(judges.spanDamage(hits, START_S, END_S, true)).toBe(2 * HIT);
  });

  it('counts absorbed damage and skips a cast', () => {
    const ABSORBED = 40;
    const hits = projections.withRelativeS([damage(SHADOW_BLADES_DAMAGE, START_S, HIT - ABSORBED, { absorbed: ABSORBED }), cast(SHADOW_BLADES, START_S)], 0);

    expect(judges.spanDamage(hits, START_S, END_S, false)).toBe(HIT);
  });

  it('measures a top log\'s detected window the way ingest bakes it', () => {
    const steady = Array.from({ length: FIGHT_S }, (_unused, atS) => damage(SHADOW_BLADES_DAMAGE, atS, 10));
    const burst = [40, 41, 42, 43].map(atS => damage(SHADOW_BLADES_DAMAGE, atS, 1000));
    const events = projections.withRelativeS([...steady, ...burst], 0);
    const [baked] = transform['findParseWindows']({ damage: events, fightLenS: FIGHT_S, timings: [], casts: [], abilityNames: new Map() });
    assert.exists(baked);

    const endS = baked.time_s + baked.window_length_s;
    expect(baked.window_damage).toBe(judges.spanDamage(events, baked.time_s, endS, endS >= FIGHT_S));
  });
});

describe('BurstJudgeService series', () => {
  it('sums each whole second\'s hits, absorbed included, and skips a cast', () => {
    const ABSORBED = 40;
    const events = projections.withRelativeS([
      damage(SHADOW_BLADES_DAMAGE, 1.2, HIT), damage(SHADOW_BLADES_DAMAGE, 1.8, HIT - ABSORBED, { absorbed: ABSORBED }), cast(SHADOW_BLADES, 1.5),
    ], 0);

    expect(judges.series(events, 3)).toEqual([0, 2 * HIT, 0]);
  });

  it('clamps a hit before the pull into its first second and one after the kill into its last', () => {
    const events = projections.withRelativeS([damage(SHADOW_BLADES_DAMAGE, -1, HIT), damage(SHADOW_BLADES_DAMAGE, 5, HIT)], 0);

    expect(judges.series(events, 2.5)).toEqual([HIT, 0, HIT]);
  });
});

describe('BurstJudgeService measure', () => {
  const WHOLE_PULL = [[0, FIGHT_S]] as const;
  const EXTRA = 30;
  /** Ten seconds at 40 a second against a pull that averages 13 a second. */
  const AMPLIFICATION = (STEADY + EXTRA) * WINDOW_S / (WINDOW_S * (STEADY * FIGHT_S + EXTRA * WINDOW_S) / FIGHT_S);

  it('reads the window\'s damage over the log\'s own damage per alive second', () => {
    expect(judges.measure(steadyWithBurst(WINDOW_AT_S, EXTRA), WINDOW, WHOLE_PULL)).toEqual({
      damage: (STEADY + EXTRA) * WINDOW_S, amplification: AMPLIFICATION, startS: WINDOW_AT_S, lengthS: WINDOW_S,
    });
  });

  it('finds a burst as far off the window as the timing floor', () => {
    expect(judges.measure(steadyWithBurst(WINDOW_AT_S + SEARCH_S, EXTRA), WINDOW, WHOLE_PULL)?.amplification).toBe(AMPLIFICATION);
  });

  it('does not find all of a burst one second past the timing floor', () => {
    expect(judges.measure(steadyWithBurst(WINDOW_AT_S + SEARCH_S + 1, EXTRA), WINDOW, WHOLE_PULL)?.amplification).toBeLessThan(AMPLIFICATION);
  });

  it('reads the average over alive seconds only', () => {
    const ALIVE_S = 50;
    const perS = Array.from({ length: FIGHT_S }, (_unused, second) => second < ALIVE_S ? STEADY : 0);

    expect(judges.measure(perS, WINDOW, [[0, ALIVE_S]])?.amplification).toBe(1);
  });

  it('measures nothing on a log that dealt no damage while alive', () => {
    expect(judges.measure(new Array<number>(FIGHT_S).fill(0), WINDOW, WHOLE_PULL)).toBeNull();
  });

  it('measures nothing where no span of the window fits the pull', () => {
    expect(judges.measure(steadyWithBurst(0, 0, WINDOW_AT_S - SEARCH_S + WINDOW_S - 1), WINDOW, WHOLE_PULL)).toBeNull();
  });
});

describe('BurstJudgeService reference', () => {
  const sources = (durations: number[]): ParseRanking[] => benchSources(durations.length).map((source, index) => ({ ...source, duration_s: durations[index] ?? null }));

  it('measures every top log on the window, whether or not its own burst formed it', () => {
    const perParse = [{ damage_per_s: steadyWithBurst(WINDOW_AT_S, 0) }, { damage_per_s: steadyWithBurst(WINDOW_AT_S, 0) }];

    expect(judges.reference(window(0), perParse, sources([FIGHT_S, FIGHT_S]))).toEqual([1, 1]);
  });

  it('reads each top log\'s average over the player\'s alive time, so a pull cut short compares like with like', () => {
    const CUT_S = WINDOW_AT_S + WINDOW_S;
    const EXTRA = 30;
    const perParse = [{ damage_per_s: steadyWithBurst(WINDOW_AT_S, EXTRA) }];
    const cut = judges.reference(window(0), perParse, sources([FIGHT_S]), [[0, CUT_S]]);

    expect(cut).toEqual([judges.measure(steadyWithBurst(WINDOW_AT_S, EXTRA, CUT_S), WINDOW, [[0, CUT_S]])?.amplification]);
    expect(cut[0]).toBeLessThan(judges.reference(window(0), perParse, sources([FIGHT_S]))[0] ?? 0);
  });

  it('leaves out a top log whose kill ends before the window does', () => {
    const SHORT_S = WINDOW_AT_S + WINDOW_S - 1;
    const perParse = [{ damage_per_s: steadyWithBurst(WINDOW_AT_S, 0) }, { damage_per_s: steadyWithBurst(WINDOW_AT_S, 0, SHORT_S) }];

    expect(judges.reference(window(0), perParse, sources([FIGHT_S, SHORT_S]))).toEqual([1]);
  });
});

describe('BurstJudgeService verdict', () => {
  it('flags amber just under the edge, naming the top logs and the target', () => {
    expect(judges.verdict(WINDOW, measured(EDGE - 0.01, 1490), FIVE_TOP_LOGS)).toMatchObject({
      family: 'burst.window', status: 'amber', icon: 'warning_amber', n: 5,
      message: 'You dealt 1.5K here, 1.49x your pull average, less than the 5 top logs. Aim for 1.5x or more.',
    });
  });

  it('does not flag a multiple exactly at the edge', () => {
    expect(judges.verdict(WINDOW, measured(EDGE, 1500), FIVE_TOP_LOGS)).toMatchObject({
      family: 'burst.window', status: 'neutral', icon: 'compare_arrows', n: 5,
      message: 'You dealt 1.5K here, 1.5x your pull average. The 5 top logs average 2.0x here.',
    });
  });

  it('ranks a flagged window on its medium cost class and the rule\'s own evidence, above the amber its tier allows', () => {
    expect(judges.verdict(WINDOW, measured(EDGE - 0.01, 1490), FIVE_TOP_LOGS).rank).toMatchObject({ costClass: 'medium', evidence: 'red' });
  });

  it('compares without color against fewer top logs than the minimum', () => {
    const fourTopLogs = FIVE_TOP_LOGS.slice(1);

    expect(judges.verdict(WINDOW, measured(0, 0), fourTopLogs)).toMatchObject({
      status: 'neutral', n: 4, message: 'You dealt 0 here, 0.0x your pull average. Only 4 top logs reach this window, too few to judge.',
    });
  });

  it('compares without color on a bench that carries no top log damage', () => {
    expect(judges.verdict(WINDOW, measured(1), [])).toMatchObject({
      status: 'neutral', n: 0, message: 'You dealt 1K here, 1.0x your pull average. No top log carries its own damage for this window, so it is not judged.',
    });
  });

  it('compares without color when the player dealt no damage while alive', () => {
    expect(judges.verdict(WINDOW, null, FIVE_TOP_LOGS)).toMatchObject({
      status: 'neutral', message: 'You dealt no damage while alive, so this window is not judged.',
    });
  });

  it('names how many top logs formed a pre-fight window, with no color', () => {
    expect(judges.benchVerdict(WINDOW)).toEqual({
      family: 'burst.window', status: 'neutral', icon: 'insights', n: 5, message: '5 top logs had this window.',
    });
  });

  it('says nothing on a pre-fight window that carries no top log', () => {
    expect(judges.benchVerdict(window(0)).message).toBe('');
  });
});
