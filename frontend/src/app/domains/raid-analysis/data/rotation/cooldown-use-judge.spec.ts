import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SHADOW_BLADES, SECRET_TECHNIQUE } from '../../../../../testing/spell-ids';
import { cast, applyBuff } from '../../../../../testing/builders/events';
import { pullModel } from '../../../../../testing/builders/pull-model';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { CooldownUseJudgeService } from './cooldown-use-judge-service';
import { cdBench } from './rotation-harness';
import type { RotationParseMeasures } from './rotation-data-source';

const judges = TestBed.inject(CooldownUseJudgeService);
const projections = TestBed.inject(WclProjectionsService);

const NAME = 'Shadow Blades';
const TOP_N = 10;
/** 8 of 10 is the paired consensus share. */
const AGREEING_USERS = 8;
const TOP_FIRST_S = 5;
const COOLDOWN_S = 90;
const WHOLE_PULL: [number, number][] = [[0, 300]];
/** `users` of 10 top logs first pressed it at 5s, the rest never. */
const firstUses = (users: number, n = TOP_N): (number | null)[] => Array.from({ length: n }, (_, at) => (at < users ? TOP_FIRST_S : null));
const ALL_USED = firstUses(TOP_N);
/** The bench opens at 5s and gaps 90s at 1 use a minute: a 300s pull fits 1 + floor(295 / 90) = 4 uses, under the 5 its rate gives. */
const EXPECTED_ON_A_FULL_PULL = 4;
const topLog = (cdCastsS: Record<string, number[]>): RotationParseMeasures =>
  ({ idle_s: null, lust_s: null, phase_starts: [], cd_casts_s: cdCastsS, buttons: {} });

describe('CooldownUseJudgeService.castTimesS', () => {
  const events = projections.withRelativeS([cast(SHADOW_BLADES, 30), cast(SECRET_TECHNIQUE, 40), cast(SHADOW_BLADES, 10), cast(SHADOW_BLADES, 61)], 0);

  it('takes the cooldown\'s casts at or before the end, ascending', () => {
    expect(judges.castTimesS(events, SHADOW_BLADES, new Set(), 60)).toEqual([10, 30]);
  });

  it('counts an aura already up at the pull as a use at 0', () => {
    expect(judges.castTimesS(events, SHADOW_BLADES, new Set([SHADOW_BLADES]), 60)).toEqual([0, 10, 30]);
  });

  it('keeps a cast that lands exactly at the end', () => {
    expect(judges.castTimesS(events, SHADOW_BLADES, new Set(), 61)).toEqual([10, 30, 61]);
  });

  it('ignores an aura event of the cooldown', () => {
    const auras = projections.withRelativeS([applyBuff(SHADOW_BLADES, 20)], 0);
    expect(judges.castTimesS(auras, SHADOW_BLADES, new Set(), 60)).toEqual([]);
  });
});

describe('CooldownUseJudgeService.referenceFirstUses', () => {
  it('reads each top log\'s first use in source order, and null for a log without the cooldown', () => {
    expect(judges.referenceFirstUses([topLog({ [NAME]: [5, 95] }).cd_casts_s, topLog({}).cd_casts_s], NAME)).toEqual([5, null]);
  });
});

describe('CooldownUseJudgeService.judge', () => {
  const due = { taken: true, cooldownS: COOLDOWN_S };

  it('says nothing of a cooldown the pull used, which ready time judges', () => {
    expect(judges.judge({ uses: 1, expected: 4 }, ALL_USED, WHOLE_PULL, due)).toBeNull();
  });

  it('judges a cooldown never pressed as a consensus against the top logs that pressed it', () => {
    expect(judges.judge({ uses: 0, expected: 1 }, ALL_USED, WHOLE_PULL, due)).toMatchObject({ level: 'amber', observed: TOP_N });
    expect(judges.judge({ uses: 0, expected: 1 }, firstUses(TOP_N - 1), WHOLE_PULL, due)?.level).toBe('blue');
  });

  it('pairs the consensus with the talent taken and 2 expected uses, so 8 of 10 is amber and 7 of 10 blue', () => {
    expect(judges.judge({ uses: 0, expected: 2 }, firstUses(AGREEING_USERS), WHOLE_PULL, due)?.level).toBe('amber');
    expect(judges.judge({ uses: 0, expected: 2 }, firstUses(AGREEING_USERS - 1), WHOLE_PULL, due)?.level).toBe('blue');
  });

  it('does not pair the consensus when the talent is not known to be taken', () => {
    expect(judges.judge({ uses: 0, expected: 2 }, firstUses(AGREEING_USERS), WHOLE_PULL, { ...due, taken: false })?.level).toBe('blue');
  });

  it('judges a pull whose alive time runs exactly one cooldown past the last top log\'s first use, and not one a second shorter', () => {
    const dueAtS = TOP_FIRST_S + COOLDOWN_S;

    expect(judges.judge({ uses: 0, expected: 1 }, ALL_USED, [[0, dueAtS]], due)).not.toBeNull();
    expect(judges.judge({ uses: 0, expected: 1 }, ALL_USED, [[0, dueAtS - 1]], due)).toBeNull();
  });

  it('judges nothing against fewer than 5 top logs', () => {
    expect(judges.judge({ uses: 0, expected: 4 }, firstUses(4, 4), WHOLE_PULL, due)?.level).toBe('neutral');
  });
});

describe('CooldownUseJudgeService.finding', () => {
  const model = pullModel();
  const SHADOW_BLADES_PLAN = { name: NAME, cooldown: COOLDOWN_S };
  const topLogs = (users: number) => firstUses(users).map(firstS => topLog(firstS === null ? {} : { [NAME]: [firstS] }).cd_casts_s);

  it('says nothing of a cooldown the pull used', () => {
    expect(judges.finding(SHADOW_BLADES_PLAN, [5], cdBench(), model, topLogs(TOP_N), true)).toBeNull();
  });

  it('names how many top logs pressed a cooldown never used, with a remedy once graded', () => {
    const finding = judges.finding(SHADOW_BLADES_PLAN, [], cdBench(), model, topLogs(AGREEING_USERS), true);

    expect(finding).toMatchObject({
      family: 'rotation.never_used', category: 'never_used', severity: 'amber',
      measured: { value: `0 / ${EXPECTED_ON_A_FULL_PULL}`, unit: 'cast(s), 10 top logs' },
      message: 'You never pressed Shadow Blades on a 05:00 fight. 8 of 10 top logs did.',
      details: { remedy: `Press Shadow Blades ${EXPECTED_ON_A_FULL_PULL}x.` },
    });
  });

  it('gives a count row no remedy', () => {
    const finding = judges.finding(SHADOW_BLADES_PLAN, [], cdBench(), model, topLogs(AGREEING_USERS - 1), true);

    expect(finding?.severity).toBe('blue');
    expect(finding?.details).toBeUndefined();
  });

  it('mutes the check when the wipe came before the first expected use', () => {
    const wipedEarly = pullModel({ judgedEndS: 3, judgedEndCause: 'wipe_called' });
    expect(judges.finding(SHADOW_BLADES_PLAN, [], cdBench(), wipedEarly, topLogs(TOP_N), true)).toMatchObject({
      severity: 'muted', unjudged: 'after_wipe', measured: { value: 'After the wipe' },
      message: 'The pull wiped before Shadow Blades was due, so it is not judged.',
    });
  });

  it('mutes the check when the wipe came before the top logs\' first use was a cooldown old', () => {
    const wipedBeforeDue = pullModel({ judgedEndS: TOP_FIRST_S + COOLDOWN_S - 1, judgedEndCause: 'wipe_called' });

    expect(judges.finding(SHADOW_BLADES_PLAN, [], cdBench(), wipedBeforeDue, topLogs(TOP_N), true)?.severity).toBe('muted');
  });

  it('says nothing about a pull too short for any use, even over the whole fight', () => {
    expect(judges.finding(SHADOW_BLADES_PLAN, [], cdBench(), pullModel({ fightDurationS: 3 }), topLogs(TOP_N), true)).toBeNull();
  });
});
