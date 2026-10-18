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

const TOP_N = 10;
/** 8 of 10 is the paired consensus share. */
const AGREEING_USERS = 8;
/** `users` of 10 top logs pressed it at least once. */
const reference = (users: number, n = TOP_N): number[] => Array.from({ length: n }, (_, at) => (at < users ? 4 : 0));
const ALL_USED = reference(TOP_N);
/** The bench opens at 5s and gaps 90s at 1 use a minute: a 300s pull fits 1 + floor(295 / 90) = 4 uses, under the 5 its rate gives. */
const EXPECTED_ON_A_FULL_PULL = 4;
const LONG_PULL_S = 600;
/** 1 + floor(595 / 90) = 7 fit, under the 10 the rate gives; Poisson(7) puts P(X <= 2) at 3.0%, inside the amber budget. */
const EXPECTED_ON_A_LONG_PULL = 7;
const topLog = (cdCastsS: Record<string, number[]>): RotationParseMeasures =>
  ({ efficiency_pct: null, lust_s: null, phase_starts: [], cd_casts_s: cdCastsS, buttons: {} });

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

describe('CooldownUseJudgeService.referenceUses', () => {
  it('reads each top log\'s uses in source order, and 0 for a log without the cooldown', () => {
    expect(judges.referenceUses([topLog({ 'Shadow Blades': [5, 95] }), topLog({})], 'Shadow Blades')).toEqual([2, 0]);
  });
});

describe('CooldownUseJudgeService.judge', () => {
  it('says nothing once the pull reached the expected uses', () => {
    expect(judges.judge({ uses: 10, expected: 10 }, ALL_USED, true)).toBeNull();
  });

  it('flags amber at 4 of 10 expected uses, and stays a comparison at 5', () => {
    expect(judges.judge({ uses: 4, expected: 10 }, ALL_USED, true)?.evidence.level).toBe('amber');
    expect(judges.judge({ uses: 5, expected: 10 }, ALL_USED, true)?.evidence.level).toBe('neutral');
  });

  it('flags red at 2 of 10 when 8 of 10 top logs used it, and only amber when 7 did', () => {
    expect(judges.judge({ uses: 2, expected: 10 }, reference(AGREEING_USERS), true)?.evidence.level).toBe('red');
    expect(judges.judge({ uses: 2, expected: 10 }, reference(AGREEING_USERS - 1), true)?.evidence.level).toBe('amber');
  });

  it('reads one use short as a comparison', () => {
    expect(judges.judge({ uses: 9, expected: 10 }, ALL_USED, true)).toMatchObject({ family: { id: 'rotation.lost_cast' }, evidence: { level: 'neutral' } });
  });

  it('judges a cooldown never pressed as a consensus against the top logs that pressed it', () => {
    expect(judges.judge({ uses: 0, expected: 1 }, ALL_USED, true)).toMatchObject({ family: { id: 'rotation.never_used' }, evidence: { level: 'amber', observed: TOP_N } });
    expect(judges.judge({ uses: 0, expected: 1 }, reference(TOP_N - 1), true)?.evidence.level).toBe('blue');
  });

  it('pairs the consensus with the talent taken and 2 expected uses, so 8 of 10 is amber and 7 of 10 blue', () => {
    expect(judges.judge({ uses: 0, expected: 2 }, reference(AGREEING_USERS), true)?.evidence.level).toBe('amber');
    expect(judges.judge({ uses: 0, expected: 2 }, reference(AGREEING_USERS - 1), true)?.evidence.level).toBe('blue');
  });

  it('does not pair the consensus when the talent is not known to be taken', () => {
    expect(judges.judge({ uses: 0, expected: 2 }, reference(AGREEING_USERS), false)?.evidence.level).toBe('blue');
  });

  it('judges nothing against fewer than 5 top logs', () => {
    expect(judges.judge({ uses: 0, expected: 4 }, reference(4, 4), true)?.evidence.level).toBe('neutral');
  });
});

describe('CooldownUseJudgeService.finding', () => {
  const model = pullModel();

  it('counts uses over alive time against the expected uses, naming the top logs on the row', () => {
    const finding = judges.finding('Shadow Blades', [5, 95], cdBench(), pullModel({ fightDurationS: LONG_PULL_S }), ALL_USED, true);
    expect(finding).toMatchObject({
      family: 'rotation.lost_cast', category: 'lost_cooldown', severity: 'amber',
      measured: { value: `2 / ${EXPECTED_ON_A_LONG_PULL}`, unit: 'cast(s), 10 top logs' },
      message: `You pressed Shadow Blades 2 times on a 10:00 fight. 10 top logs average ${EXPECTED_ON_A_LONG_PULL} in that time.`,
      details: { remedy: 'Press Shadow Blades 5x more, sooner off cooldown.' },
    });
  });

  it('gives a comparison row no remedy', () => {
    const finding = judges.finding('Shadow Blades', [5, 95, 185], cdBench(), model, ALL_USED, true);
    expect(finding?.measured?.value).toBe(`3 / ${EXPECTED_ON_A_FULL_PULL}`);
    expect(finding?.severity).toBe('neutral');
    expect(finding?.details).toBeUndefined();
  });

  it('names how many top logs pressed a cooldown never used', () => {
    const finding = judges.finding('Shadow Blades', [], cdBench(), model, reference(AGREEING_USERS), true);
    expect(finding?.message).toBe('You never pressed Shadow Blades on a 05:00 fight. 8 of 10 top logs did.');
  });

  it('mutes the check when the wipe came before the first expected use', () => {
    const wipedEarly = pullModel({ judgedEndS: 3, judgedEndCause: 'wipe_called' });
    expect(judges.finding('Shadow Blades', [], cdBench(), wipedEarly, ALL_USED, true)).toMatchObject({
      severity: 'muted', unjudged: 'after_wipe', measured: { value: 'After the wipe' },
      message: 'The pull wiped before Shadow Blades was due, so it is not judged.',
    });
  });

  it('says nothing about a pull too short for any use, even over the whole fight', () => {
    expect(judges.finding('Shadow Blades', [], cdBench(), pullModel({ fightDurationS: 3 }), ALL_USED, true)).toBeNull();
  });
});
