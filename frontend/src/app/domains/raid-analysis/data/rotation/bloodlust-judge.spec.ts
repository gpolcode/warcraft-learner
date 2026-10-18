import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BloodlustJudgeService, LUST_DURATION_S } from './bloodlust-judge-service';
import type { RotationParseMeasures } from './rotation-data-source';
import type { AuraSpan } from '../defensive/defensive-data-source';

const judge = TestBed.inject(BloodlustJudgeService);

const NAME = 'Shadow Blades';
const TOP_N = 5;
const LUST_S = 120;
const PULL_LUST_S = 1;
/** A lust later than 30s is mid-fight. */
const MID_FIGHT_S = 30;
const FIGHT_END_S = 300;
/** The cooldown's stated duration, read when a press opens no aura of its own. */
const DURATION_S = 20;
/** Every top log lusting at 2:00 leaves the 5s timing floor on each side of the band. */
const BAND_TOP_S = LUST_S + 5;
/** Up from 5s into the lust; the other effect starts 20s after the 40s lust ends. */
const DURING: AuraSpan = [LUST_S + 5, LUST_S + 25];
const AFTER: AuraSpan = [LUST_S + LUST_DURATION_S + 20, LUST_S + LUST_DURATION_S + 40];
const NOT_UP: AuraSpan[] = [];
const NO_KILLS: (number | null)[] = [];

const topLog = (lustS: number | null, upS?: AuraSpan[]): RotationParseMeasures =>
  ({ idle_s: null, lust_s: lustS, phase_starts: [], cd_casts_s: {}, ...(upS ? { cd_up_s: { [NAME]: upS } } : {}), buttons: {} });
/** `up` of `n` top logs lusting at 2:00 had it up during their lust; the rest pressed it after. */
const topLogs = (up: number, n = TOP_N): RotationParseMeasures[] =>
  Array.from({ length: n }, (_unused, index) => topLog(LUST_S, [index < up ? DURING : AFTER]));
const top = (perParse: RotationParseMeasures[]): { perParse: RotationParseMeasures[]; killsS: (number | null)[] } => ({ perParse, killsS: NO_KILLS });
const lustAt = (lustS: number): ReturnType<BloodlustJudgeService['lustSpan']> => judge.lustSpan(lustS, null);

describe('BloodlustJudgeService effect spans', () => {
  it('reads a press that opens its own aura as that aura', () => {
    const AURA_ENDS_S = 150;
    expect(judge.effectSpans([[LUST_S, AURA_ENDS_S]], [LUST_S], DURATION_S, FIGHT_END_S)).toEqual([[LUST_S, AURA_ENDS_S]]);
  });

  it('reads a press that opens no aura as its stated duration from the press, cut at the end of the pull', () => {
    const LATE_S = FIGHT_END_S - 5;
    expect(judge.effectSpans([], [LUST_S, LATE_S], DURATION_S, FIGHT_END_S)).toEqual([[LUST_S, LUST_S + DURATION_S], [LATE_S, FIGHT_END_S]]);
  });

  it('joins two effects that overlap into one span', () => {
    const SECOND_S = LUST_S + 10;
    expect(judge.effectSpans([], [LUST_S, SECOND_S], DURATION_S, FIGHT_END_S)).toEqual([[LUST_S, SECOND_S + DURATION_S]]);
  });
});

describe('BloodlustJudgeService overlap', () => {
  it('measures the seconds an effect is up inside the lust', () => {
    expect(judge.measureOverlap([[LUST_S - 10, LUST_S + 15]], lustAt(LUST_S))).toEqual({ upS: 15, up: true });
  });

  it('counts an effect that ends exactly at the lust\'s start as up, and not one that ends just before it', () => {
    expect(judge.measureOverlap([[LUST_S - 20, LUST_S]], lustAt(LUST_S)).up).toBe(true);
    expect(judge.measureOverlap([[LUST_S - 20, LUST_S - 0.1]], lustAt(LUST_S)).up).toBe(false);
  });

  it('counts a press with no length inside the lust as up for 0s', () => {
    expect(judge.measureOverlap([[LUST_S + 3, LUST_S + 3]], lustAt(LUST_S))).toEqual({ upS: 0, up: true });
  });

  it('reads the raid\'s lust for 40s, or to the kill when the kill comes first', () => {
    const KILL_S = LUST_S + 10;
    expect(judge.lustSpan(LUST_S, null)).toEqual({ fromS: LUST_S, toS: LUST_S + LUST_DURATION_S });
    expect(judge.lustSpan(LUST_S, KILL_S)).toEqual({ fromS: LUST_S, toS: KILL_S });
  });

  it('cuts the player\'s lust only at a kill, leaving a wipe inside it to the fold', () => {
    const END_S = LUST_S + 10;
    expect(judge.lustOf(LUST_S, { judgedEndS: END_S, judgedEndCause: 'kill' })?.toS).toBe(END_S);
    expect(judge.lustOf(LUST_S, { judgedEndS: END_S, judgedEndCause: 'wipe_called' })?.toS).toBe(LUST_S + LUST_DURATION_S);
    expect(judge.lustOf(null, { judgedEndS: END_S, judgedEndCause: 'kill' })).toBeNull();
  });

  it('calls a lust mid-fight only past 30s', () => {
    expect(judge.isMidFight(MID_FIGHT_S + 0.1)).toBe(true);
    expect(judge.isMidFight(MID_FIGHT_S)).toBe(false);
    expect(judge.isMidFight(null)).toBe(false);
  });
});

describe('BloodlustJudgeService reference', () => {
  it('learns only from top logs that lusted mid-fight and carry their auras, in source order', () => {
    const reference = judge.reference([topLog(PULL_LUST_S, [DURING]), topLog(LUST_S, [DURING]), topLog(null, [DURING]), topLog(LUST_S + 10), topLog(LUST_S, [AFTER])], NO_KILLS, NAME);
    expect(reference).toEqual({ lustsS: [LUST_S, LUST_S], overlaps: [{ upS: 20, up: true }, { upS: 0, up: false }] });
  });

  it('reads each top log\'s lust to its own kill', () => {
    const KILL_S = LUST_S + 10;
    expect(judge.reference([topLog(LUST_S, [DURING])], [KILL_S], NAME).overlaps).toEqual([{ upS: 5, up: true }]);
  });

  it('wants Bloodlust once half of ten mid-fight lusters had it up during their lust', () => {
    expect(judge.wantsLust(judge.reference(topLogs(5, 10), NO_KILLS, NAME))).toBe(true);
  });

  it('does not want it at one top log short of half', () => {
    expect(judge.wantsLust(judge.reference(topLogs(4, 10), NO_KILLS, NAME))).toBe(false);
  });

  it('wants nothing from fewer than five mid-fight lusters, however many agree', () => {
    expect(judge.wantsLust(judge.reference(topLogs(TOP_N - 1, TOP_N - 1), NO_KILLS, NAME))).toBe(false);
  });

  it('wants nothing from top logs that all lusted on the pull', () => {
    const pullLusters = Array.from({ length: 10 }, () => topLog(PULL_LUST_S, [[0, DURATION_S]]));
    expect(judge.wantsLust(judge.reference(pullLusters, NO_KILLS, NAME))).toBe(false);
  });

  it('wants nothing from a bench that carries no aura spans', () => {
    const unbaked = Array.from({ length: 10 }, () => topLog(LUST_S));
    expect(judge.wantsLust(judge.reference(unbaked, NO_KILLS, NAME))).toBe(false);
  });
});

describe('BloodlustJudgeService overlap check', () => {
  it('flags a cooldown not up during the raid\'s lust as amber when every top log had it up, stating the count', () => {
    const [finding] = judge.findings(NAME, NOT_UP, lustAt(LUST_S), top(topLogs(TOP_N)));
    expect(finding).toMatchObject({
      family: 'rotation.bloodlust', severity: 'amber', category: 'cooldown_alignment', cd_name: NAME, timestamp_s: LUST_S,
      span: { fromS: LUST_S, toS: LUST_S + LUST_DURATION_S },
      measured: { value: '0s of 40s', unit: 'in Bloodlust, 5 of 5 top logs had it up' },
      message: 'Shadow Blades was up for 0s of your raid\'s 40s Bloodlust at 02:00. 5 of 5 top raiders who lusted mid-fight had it up for theirs.',
    });
  });

  it('never orders the raid decision: the row carries no remedy', () => {
    expect(judge.findings(NAME, NOT_UP, lustAt(LUST_S), top(topLogs(TOP_N)))[0]?.details).toBeUndefined();
  });

  it('stays amber at 8 of 10, the paired share', () => {
    expect(judge.findings(NAME, NOT_UP, lustAt(LUST_S), top(topLogs(8, 10)))[0]?.severity).toBe('amber');
  });

  it('is a blue count at 7 of 10, under the paired share', () => {
    expect(judge.findings(NAME, NOT_UP, lustAt(LUST_S), top(topLogs(7, 10)))[0]).toMatchObject({ severity: 'blue', family: 'rotation.bloodlust' });
  });

  it('never turns red, however many top logs agree', () => {
    expect(judge.findings(NAME, NOT_UP, lustAt(LUST_S), top(topLogs(100, 100)))[0]?.severity).toBe('amber');
  });

  it('flags nothing when the cooldown was up during the lust, however briefly', () => {
    expect(judge.findings(NAME, [[LUST_S + LUST_DURATION_S - 1, LUST_S + LUST_DURATION_S + 19]], lustAt(LUST_S), top(topLogs(TOP_N)))).toEqual([]);
  });

  it('flags nothing without a lust on the player or a cooldown the top logs want', () => {
    expect(judge.findings(NAME, NOT_UP, null, top(topLogs(TOP_N)))).toEqual([]);
    expect(judge.findings(NAME, NOT_UP, lustAt(LUST_S), top(topLogs(2)))).toEqual([]);
  });

  it('prints the lust\'s length to a kill that cut it', () => {
    const KILL_S = LUST_S + 25;
    expect(judge.findings(NAME, NOT_UP, judge.lustSpan(LUST_S, KILL_S), top(topLogs(TOP_N)))[0]?.measured?.value).toBe('0s of 25s');
  });
});

describe('BloodlustJudgeService lust band', () => {
  it('judges a raid lust exactly at the band edge', () => {
    expect(judge.findings(NAME, NOT_UP, lustAt(BAND_TOP_S), top(topLogs(TOP_N)))[0]?.severity).toBe('amber');
  });

  it('makes a raid lust just past the band a neutral context row, never a flag, its lust printed apart from the edge', () => {
    expect(judge.findings(NAME, NOT_UP, lustAt(BAND_TOP_S + 0.1), top(topLogs(TOP_N)))[0]).toMatchObject({
      family: 'rotation.bloodlust', severity: 'neutral', measured: { value: '125.1s', unit: 'top logs 115.0s to 125.0s' },
    });
  });

  it('names the top logs\' lust band on a context row', () => {
    const LATE_LUST_S = 200;
    expect(judge.findings(NAME, NOT_UP, lustAt(LATE_LUST_S), top(topLogs(TOP_N)))[0]?.message).toBe(
      'Your raid\'s Bloodlust came at 03:20. The 5 top raiders who lusted mid-fight had theirs from 01:55 to 02:05, so Shadow Blades is not judged against yours.');
  });

  it('makes a pull lust context, since the opener overlaps it', () => {
    expect(judge.findings(NAME, NOT_UP, lustAt(PULL_LUST_S), top(topLogs(TOP_N)))[0]?.severity).toBe('neutral');
  });

  it('shows no context row for a cooldown up during a lust outside the band', () => {
    expect(judge.findings(NAME, [[PULL_LUST_S, PULL_LUST_S + DURATION_S]], lustAt(PULL_LUST_S), top(topLogs(TOP_N)))).toEqual([]);
  });
});
