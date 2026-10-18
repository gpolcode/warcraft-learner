import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BurstWindow } from '../analysis/analysis.models';
import { pullModel } from '../../../../../testing/builders/pull-model';
import { cast, damageTaken } from '../../../../../testing/builders/events';
import { CLOAK_OF_SHADOWS } from '../../../../../testing/spell-ids';
import { BOSS_HIT_SPELL_ID, defBench, timed } from './defensive-harness';
import { DEAD_IN_WINDOW_FAMILY, DEFENSIVE_WINDOW_FAMILY, DefensiveJudgeService, WindowPull } from './defensive-judge-service';

const judge = TestBed.inject(DefensiveJudgeService);

const NAME = 'Cloak of Shadows';
const TOP_N = 10;
const PULL_S = 300;
const WHOLE = pullModel({ fightDurationS: PULL_S });

describe('DefensiveJudgeService.measureUseTimes', () => {
  it('reads each use\'s start, rounded and ascending, the figure ingest bakes per top log', () => {
    expect(judge.measureUseTimes([{ start_s: 70.04, end_s: 75 }, { start_s: 10, end_s: 15 }])).toEqual([10, 70]);
  });
});

describe('DefensiveJudgeService.isExternal', () => {
  it('reads a defensive whose every use opened no self aura as an external', () => {
    expect(judge.isExternal([{ start_s: 40, end_s: 40 }])).toBe(true);
  });

  it('reads one use with a self aura, or no use at all, as the player\'s own', () => {
    expect(judge.isExternal([{ start_s: 40, end_s: 40 }, { start_s: 100, end_s: 108 }])).toBe(false);
    expect(judge.isExternal([])).toBe(false);
  });
});

describe('DefensiveJudgeService.usesFinding', () => {
  /** 1.4 a minute over the 5:00 pull, with room in the cadence for every use: 7 expected. */
  const SEVEN_EXPECTED = defBench({ sample_count: TOP_N, used_sample_count: TOP_N, uses_per_min: { avg: 1.4, stddev: 0.1 }, avg_first_cast_s: 10, avg_gap_s: 40 });
  const EXPECTED = 7;
  const topLogs = Array.from({ length: TOP_N }, () => ({ [NAME]: Array.from({ length: EXPECTED }, (_unused, use) => 10 + use * 40) }));
  const pressed = (count: number): number[] => Array.from({ length: count }, (_unused, use) => 10 + use * 40);

  it('flags 2 of 7 expected uses amber, as a Poisson count around 7 reaches 2 or fewer 3.0% of the time', () => {
    const finding = judge.usesFinding(NAME, pressed(2), SEVEN_EXPECTED, WHOLE, topLogs, false);

    expect(finding).toMatchObject({ family: 'defensive.uses', severity: 'amber', measured: { value: '2 / 7', unit: 'use(s), 10 top logs' } });
    expect(finding?.message).toBe('You pressed Cloak of Shadows 2 times on a 05:00 fight. 10 top logs average 7 in that time.');
    expect(finding?.details?.remedy).toBe('Use Cloak of Shadows 5x more.');
  });

  it('keeps 3 of 7 a comparison with no remedy, as 3 or fewer happens 8.2% of the time', () => {
    const finding = judge.usesFinding(NAME, pressed(3), SEVEN_EXPECTED, WHOLE, topLogs, false);

    expect(finding?.severity).toBe('neutral');
    expect(finding?.details).toBeUndefined();
  });

  it('holds 1 of 7 at amber, the family\'s ceiling, though the count alone reaches red', () => {
    expect(judge.usesFinding(NAME, pressed(1), SEVEN_EXPECTED, WHOLE, topLogs, false)?.severity).toBe('amber');
  });

  it('emits nothing once the pull reaches the expected uses', () => {
    expect(judge.usesFinding(NAME, pressed(EXPECTED), SEVEN_EXPECTED, WHOLE, topLogs, false)).toBeNull();
  });

  it('keeps an external a comparison, since who receives it is an assignment', () => {
    const finding = judge.usesFinding(NAME, pressed(1), SEVEN_EXPECTED, WHOLE, topLogs, true);

    expect(finding?.severity).toBe('neutral');
    expect(finding?.message).toBe('You pressed Cloak of Shadows 1 time on a 05:00 fight, each on another raider. 10 top logs average 7 in that time.');
  });

  it('keeps a bench with no per-log uses a comparison, never an unmeasured color', () => {
    expect(judge.usesFinding(NAME, pressed(1), SEVEN_EXPECTED, WHOLE, [], false)?.severity).toBe('neutral');
  });
});

describe('DefensiveJudgeService.readyTimeFinding', () => {
  // Composition only: the measure and the rule are specced on ReadyTimeJudgeService.
  /** Ten top logs press it at 10s and on its 120s cooldown after, so it sits ready only for the first 10s. */
  const CLOAK = { name: NAME, cooldown: 120 };
  const top = { perParse: Array.from({ length: TOP_N }, () => ({ [NAME]: [10, 130, 250] })), killsS: Array.from({ length: TOP_N }, () => PULL_S) };

  it('flags a defensive left ready for a whole cooldown amber, with the defensive\'s remedy', () => {
    const finding = judge.readyTimeFinding(CLOAK, [10, 250], WHOLE, top, {});

    expect(finding).toMatchObject({ family: 'defensive.ready_time', severity: 'amber', category: 'lost_cooldown', details: { remedy: 'Use Cloak of Shadows more often while it is ready.' } });
  });

  it('says nothing of a defensive pressed as the top logs press it', () => {
    expect(judge.readyTimeFinding(CLOAK, [10, 130, 250], WHOLE, top, {})).toBeNull();
  });
});

describe('DefensiveJudgeService.holdFindings', () => {
  // Composition only: the band and the blocked target are specced on CadenceJudgeService.measureHold.
  it('names the top raiders who hold the defensive as a blue count with no remedy', () => {
    const holds = { '2': { target_s: 130, delay_s: 30, band_s: 5, effective_cd_s: 120, count: 8, total_samples: TOP_N } };
    const [finding] = judge.holdFindings(NAME, [20], holds);

    expect(finding).toMatchObject({ family: 'defensive.hold', severity: 'blue', category: 'cooldown_hold' });
    expect(finding?.details?.remedy).toBeUndefined();
  });
});

describe('DefensiveJudgeService.measureDamage', () => {
  const START_S = 10, END_S = 15;

  it('sums amount and absorbed over the window, its last instant included', () => {
    const AMOUNT = 400, ABSORBED = 150, AT_END = 100;
    const hits = timed([damageTaken(BOSS_HIT_SPELL_ID, 12, AMOUNT, { absorbed: ABSORBED }), damageTaken(BOSS_HIT_SPELL_ID, END_S, AT_END)], 0);

    expect(judge.measureDamage(hits, START_S, END_S)).toBe(AMOUNT + ABSORBED + AT_END);
  });

  it('leaves out a hit just past the end and an event that is not damage', () => {
    const hits = timed([damageTaken(BOSS_HIT_SPELL_ID, END_S + 0.01, 100), cast(CLOAK_OF_SHADOWS, 12)], 0);

    expect(judge.measureDamage(hits, START_S, END_S)).toBe(0);
  });
});

describe('DefensiveJudgeService.measureCovered', () => {
  // Window 30 to 35 with 3 s of slack covers a use touching 27 to 38.
  const window = { time_s: 30, window_length_s: 5 } as BurstWindow;

  it('covers a use reaching the slack edge', () => {
    expect(judge.measureCovered(window, [{ start_s: 10, end_s: 27 }])).toBe(true);
    expect(judge.measureCovered(window, [{ start_s: 38, end_s: 45 }])).toBe(true);
  });

  it('does not cover a use ending just short of it, or no use at all', () => {
    expect(judge.measureCovered(window, [{ start_s: 10, end_s: 26.9 }])).toBe(false);
    expect(judge.measureCovered(window, [])).toBe(false);
  });
});

describe('DefensiveJudgeService.windowVerdict', () => {
  const TOP_DAMAGE = 1000;
  const windowOf = (covered: number, damage = TOP_DAMAGE): BurstWindow => ({
    time_s: 30, window_length_s: 5, dmg_avg: damage, dmg_min: damage, dmg_max: damage, dmg_stddev: 0,
    defensive_name: NAME, spell_id: CLOAK_OF_SHADOWS, common_cds: [NAME], ability_breakdown: [],
    members: Array.from({ length: covered }, (_unused, parse) => ({ parse, time_s: 30, window_length_s: 5, damage })),
  });
  const uncovered = (damage: number, tank = false): WindowPull => ({ damage, covered: false, tank });

  it('flags amber when uncovered, 10 of 10 top logs covered it and the damage is above their median', () => {
    const verdict = judge.windowVerdict(windowOf(TOP_N), uncovered(TOP_DAMAGE + 1), TOP_N);

    expect(verdict).toMatchObject({ family: DEFENSIVE_WINDOW_FAMILY.id, status: 'amber', n: TOP_N });
    expect(verdict.message).toBe('You did not have Cloak of Shadows up. You took more damage here than half of the 10 top raiders who had it up. 10 of 10 top raiders had it up here.');
  });

  it('keeps a blue count at the top logs\' median damage, as damage at the median is no difference', () => {
    const verdict = judge.windowVerdict(windowOf(TOP_N), uncovered(TOP_DAMAGE), TOP_N);

    expect(verdict.status).toBe('blue');
    expect(verdict.message).toBe('You did not have Cloak of Shadows up. 10 of 10 top raiders had it up here.');
  });

  it('flags amber at 8 of 10 covered, and keeps 7 of 10 a blue count', () => {
    expect(judge.windowVerdict(windowOf(8), uncovered(TOP_DAMAGE + 1), TOP_N).status).toBe('amber');
    expect(judge.windowVerdict(windowOf(7), uncovered(TOP_DAMAGE + 1), TOP_N).status).toBe('blue');
  });

  it('judges a tank on coverage alone, so the window stays a blue count', () => {
    expect(judge.windowVerdict(windowOf(TOP_N), uncovered(TOP_DAMAGE * 3, true), TOP_N).status).toBe('blue');
  });

  it('judges an immunity window on coverage alone, as the top logs took no damage there', () => {
    expect(judge.windowVerdict(windowOf(TOP_N, 0), uncovered(TOP_DAMAGE), TOP_N).status).toBe('blue');
  });

  it('reports a covered window as a comparison', () => {
    const verdict = judge.windowVerdict(windowOf(TOP_N), { damage: TOP_DAMAGE * 3, covered: true, tank: false }, TOP_N);

    expect(verdict.status).toBe('neutral');
    expect(verdict.message).toBe('You had Cloak of Shadows up. 10 of 10 top raiders had it up here.');
  });

  it('keeps a window under 5 top logs, or with no member uses baked, a comparison that says why', () => {
    const FEW = 4;
    expect(judge.windowVerdict(windowOf(FEW), uncovered(TOP_DAMAGE + 1), FEW)).toMatchObject({
      status: 'neutral', message: 'Only 4 top logs back this window, too few to judge.',
    });
    expect(judge.windowVerdict(windowOf(0), uncovered(TOP_DAMAGE + 1), TOP_N)).toMatchObject({
      status: 'neutral', message: 'No top log carries its own use for this window, so it is not judged.',
    });
  });
});

describe('DefensiveJudgeService.deathHomes', () => {
  const at = (timeS: number) => ({ time_s: timeS, window_length_s: 5 } as BurstWindow);

  it('gives a death inside a window to that window', () => {
    expect(judge.deathHomes([at(10), at(30)], [[32, PULL_S]])).toEqual(new Map([[1, 32]]));
  });

  it('gives no window a death on its first instant, which the player was never alive into', () => {
    expect(judge.deathHomes([at(30)], [[30, PULL_S]])).toEqual(new Map());
  });

  it('gives a death two windows hold to the first only', () => {
    expect(judge.deathHomes([at(30), at(31)], [[33, PULL_S]])).toEqual(new Map([[0, 33]]));
  });
});

describe('DefensiveJudgeService.deathVerdict', () => {
  it('states the death as a red fact backed by the game', () => {
    expect(judge.deathVerdict(207)).toMatchObject({ family: DEAD_IN_WINDOW_FAMILY.id, status: 'red', message: 'You died at 03:27 in this window.' });
  });
});
