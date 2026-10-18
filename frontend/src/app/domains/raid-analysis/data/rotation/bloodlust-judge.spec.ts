import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BloodlustJudgeService } from './bloodlust-judge-service';
import type { RotationParseMeasures } from './rotation-data-source';

const judge = TestBed.inject(BloodlustJudgeService);

const NAME = 'Shadow Blades';
const TOP_N = 5;
const LUST_S = 120;
const PULL_LUST_S = 1;
/** The lust window runs 30s before to 55s after a lust. */
const BEFORE_S = 30;
const AFTER_S = 55;
/** Every top log pressed it 5s into its lust, so the offsets carry no spread. */
const TOP_OFFSET_S = 5;
/** No spread leaves the 5s timing floor on each side. */
const FLOOR_S = 5;
const LATE_EDGE_S = TOP_OFFSET_S + FLOOR_S;
const EARLY_EDGE_S = TOP_OFFSET_S - FLOOR_S;
const BAND_TOP_S = LUST_S + FLOOR_S;

const topLog = (lustS: number | null, castsS: number[]): RotationParseMeasures =>
  ({ idle_s: null, lust_s: lustS, phase_starts: [], cd_casts_s: { [NAME]: castsS }, buttons: {} });
/** `pressed` of `n` top logs lusting at 2:00 pressed it 5s in; the rest pressed it a minute after the window. */
const topLogs = (pressed: number, n = TOP_N): RotationParseMeasures[] =>
  Array.from({ length: n }, (_unused, index) => topLog(LUST_S, [index < pressed ? LUST_S + TOP_OFFSET_S : LUST_S + AFTER_S + 60]));
const NOT_PRESSED: number[] = [];

describe('BloodlustJudgeService measure', () => {
  it('reads the use closest to the lust inside the window', () => {
    expect(judge.measureOffset([LUST_S - 20, LUST_S + 3, LUST_S + 40], LUST_S)).toBe(3);
  });

  it('counts a use exactly at either edge of the window', () => {
    expect(judge.measureOffset([LUST_S - BEFORE_S], LUST_S)).toBe(-BEFORE_S);
    expect(judge.measureOffset([LUST_S + AFTER_S], LUST_S)).toBe(AFTER_S);
  });

  it('reads no use just past either edge, or without a lust', () => {
    expect(judge.measureOffset([LUST_S - BEFORE_S - 0.1, LUST_S + AFTER_S + 0.1], LUST_S)).toBeNull();
    expect(judge.measureOffset([LUST_S], null)).toBeNull();
  });

  it('calls a lust mid-fight only once its window starts after the pull', () => {
    expect(judge.isMidFight(BEFORE_S + 0.1)).toBe(true);
    expect(judge.isMidFight(BEFORE_S)).toBe(false);
    expect(judge.isMidFight(null)).toBe(false);
  });
});

describe('BloodlustJudgeService reference', () => {
  it('learns only from top logs that lusted mid-fight, in source order', () => {
    const reference = judge.reference([topLog(PULL_LUST_S, [0]), topLog(LUST_S, [LUST_S + 2]), topLog(null, [0]), topLog(LUST_S + 10, [])], NAME);
    expect(reference).toEqual({ lustsS: [LUST_S, LUST_S + 10], offsetsS: [2] });
  });

  it('wants Bloodlust once half of ten mid-fight lusters pressed it for their lust', () => {
    expect(judge.wantsLust(judge.reference(topLogs(5, 10), NAME))).toBe(true);
  });

  it('does not want it at one top log short of half', () => {
    expect(judge.wantsLust(judge.reference(topLogs(4, 10), NAME))).toBe(false);
  });

  it('wants nothing from fewer than five mid-fight lusters, however many agree', () => {
    expect(judge.wantsLust(judge.reference(topLogs(TOP_N - 1, TOP_N - 1), NAME))).toBe(false);
  });

  it('wants nothing from top logs that all lusted on the pull', () => {
    const pullLusters = Array.from({ length: 10 }, () => topLog(PULL_LUST_S, [0]));
    expect(judge.wantsLust(judge.reference(pullLusters, NAME))).toBe(false);
  });
});

describe('BloodlustJudgeService alignment', () => {
  it('flags a cooldown not pressed for the raid\'s lust as amber when every top log pressed it, stating the count', () => {
    const [finding] = judge.findings(NAME, NOT_PRESSED, LUST_S, topLogs(TOP_N));
    expect(finding).toMatchObject({
      family: 'rotation.bloodlust', severity: 'amber', category: 'cooldown_alignment', cd_name: NAME, timestamp_s: LUST_S,
      span: { fromS: LUST_S - BEFORE_S, toS: LUST_S + AFTER_S },
      measured: { value: 'not pressed', unit: '5 of 5 top logs pressed it' },
      message: 'You did not press Shadow Blades from 30s before to 55s after your raid\'s Bloodlust at 02:00. 5 of 5 top raiders who lusted mid-fight pressed it for theirs.',
    });
  });

  it('never orders the raid decision: the row carries no remedy', () => {
    expect(judge.findings(NAME, NOT_PRESSED, LUST_S, topLogs(TOP_N))[0]?.details).toBeUndefined();
  });

  it('stays amber at 8 of 10, the paired share', () => {
    expect(judge.findings(NAME, NOT_PRESSED, LUST_S, topLogs(8, 10))[0]?.severity).toBe('amber');
  });

  it('is a blue count at 7 of 10, under the paired share', () => {
    expect(judge.findings(NAME, NOT_PRESSED, LUST_S, topLogs(7, 10))[0]).toMatchObject({ severity: 'blue', family: 'rotation.bloodlust' });
  });

  it('never turns red, however many top logs agree', () => {
    expect(judge.findings(NAME, NOT_PRESSED, LUST_S, topLogs(100, 100))[0]?.severity).toBe('amber');
  });

  it('flags nothing when the cooldown was pressed inside the window on time', () => {
    expect(judge.findings(NAME, [LUST_S + TOP_OFFSET_S], LUST_S, topLogs(TOP_N))).toEqual([]);
  });

  it('flags nothing without a lust on the player or a cooldown the top logs want', () => {
    expect(judge.findings(NAME, NOT_PRESSED, null, topLogs(TOP_N))).toEqual([]);
    expect(judge.findings(NAME, NOT_PRESSED, LUST_S, topLogs(2))).toEqual([]);
  });
});

describe('BloodlustJudgeService lust band', () => {
  it('judges a raid lust exactly at the band edge', () => {
    expect(judge.findings(NAME, NOT_PRESSED, BAND_TOP_S, topLogs(TOP_N))[0]?.severity).toBe('amber');
  });

  it('makes a raid lust just past the band a neutral context row, never a flag, its lust printed apart from the edge', () => {
    expect(judge.findings(NAME, NOT_PRESSED, BAND_TOP_S + 0.1, topLogs(TOP_N))[0]).toMatchObject({
      family: 'rotation.bloodlust', severity: 'neutral', measured: { value: '125.1s', unit: 'top logs 115.0s to 125.0s' },
    });
  });

  it('names the top logs\' lust band on a context row', () => {
    const LATE_LUST_S = 200;
    expect(judge.findings(NAME, NOT_PRESSED, LATE_LUST_S, topLogs(TOP_N))[0]?.message).toBe(
      'Your raid\'s Bloodlust came at 03:20. The 5 top raiders who lusted mid-fight had theirs from 01:55 to 02:05, so Shadow Blades is not judged against yours.');
  });

  it('makes a pull lust context, since its window holds the opener', () => {
    expect(judge.findings(NAME, NOT_PRESSED, PULL_LUST_S, topLogs(TOP_N))[0]?.severity).toBe('neutral');
  });

  it('shows no context row for a cooldown pressed for a lust outside the band', () => {
    expect(judge.findings(NAME, [PULL_LUST_S], PULL_LUST_S, topLogs(TOP_N))).toEqual([]);
  });
});

describe('BloodlustJudgeService timing', () => {
  it('flags a use past the late edge as amber, naming the top logs\' average offset', () => {
    const castS = LUST_S + LATE_EDGE_S + 0.1;
    const [finding] = judge.findings(NAME, [castS], LUST_S, topLogs(TOP_N));
    expect(finding).toMatchObject({
      family: 'rotation.bloodlust_timing', severity: 'amber', timestamp_s: castS, span: { fromS: LUST_S, toS: castS },
      measured: { value: '+10s', unit: 'top +5s, 5 top logs' },
      message: 'You pressed Shadow Blades 10s after your raid\'s Bloodlust at 02:00. 5 top raiders who lusted mid-fight pressed it 5s after theirs on average.',
    });
  });

  it('does not flag a use exactly at the late edge', () => {
    expect(judge.findings(NAME, [LUST_S + LATE_EDGE_S], LUST_S, topLogs(TOP_N))).toEqual([]);
  });

  it('flags a use past the early edge as amber', () => {
    expect(judge.findings(NAME, [LUST_S + EARLY_EDGE_S - 0.1], LUST_S, topLogs(TOP_N))[0]).toMatchObject({ family: 'rotation.bloodlust_timing', severity: 'amber' });
  });

  it('does not flag a use exactly at the early edge', () => {
    expect(judge.findings(NAME, [LUST_S + EARLY_EDGE_S], LUST_S, topLogs(TOP_N))).toEqual([]);
  });

  it('judges no timing for a raid lust outside the band', () => {
    expect(judge.findings(NAME, [BAND_TOP_S + 0.1 + LATE_EDGE_S + 1], BAND_TOP_S + 0.1, topLogs(TOP_N))).toEqual([]);
  });
});
