import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BurstWindow } from '../../analysis/analysis.models';
import { WclProjectionsService } from '../../analysis/wcl-projections-service';
import { cast, damage } from '../../../../../../testing/builders/events';
import { SHADOW_BLADES, SHADOW_BLADES_DAMAGE } from '../../../../../../testing/spell-ids';
import { VERDICT_CHOICES } from '../verdict-choices';
import { BurstJudgeService } from '../../burst-windows/burst-judge-service';
import { CooldownUseJudgeService } from '../../rotation/cooldown-use-judge-service';
import { CadenceJudgeService } from '../../rotation/cadence-judge-service';
import { BloodlustJudgeService } from '../../rotation/bloodlust-judge-service';
import { cdBench } from '../../rotation/rotation-harness';
import { rotationLog, SB } from './calibration-harness';
import { WclEvent } from '../../wcl/wcl.models';

const projections = TestBed.inject(WclProjectionsService);
const uses = TestBed.inject(CooldownUseJudgeService);
const cadence = TestBed.inject(CadenceJudgeService);
const lust = TestBed.inject(BloodlustJudgeService);
const burst = TestBed.inject(BurstJudgeService);

const CHOICES = VERDICT_CHOICES.calibration;
const FIGHT_S = 300;
const TOP_N = 6;
/** On a 90s cadence from a 5s opener; the 90s cooldown's top logs average about one use a minute. */
const ON_CADENCE = [5, 95, 185, 275];
const timed = (events: WclEvent[]) => projections.withRelativeS(events, 0);
const casts = timed(ON_CADENCE.map(atS => cast(SHADOW_BLADES, atS)));
const reference = Array.from({ length: TOP_N }, () => ON_CADENCE.length);
const NOTHING_UP: ReadonlySet<number> = new Set();

describe('A wipe cut into a top pull', () => {
  const wipeS = FIGHT_S * CHOICES.perturbedShare.from;

  it('drops the uses after the wipe and expects fewer, so a top cadence stays unflagged', () => {
    const judgedS = uses.castTimesS(casts, SHADOW_BLADES, NOTHING_UP, wipeS);
    const measured = uses.measure(judgedS, [[0, wipeS]], cdBench({ uses_per_min: { avg: 0.8, stddev: 0.05 } }));

    expect(judgedS.every(castS => castS <= wipeS)).toBe(true);
    expect(uses.judge(measured, reference, true)).toBeNull();
  });
});

describe('A death inserted into a top pull', () => {
  const diedS = ON_CADENCE[1] ?? 0;
  const backS = diedS + CHOICES.rezAfterS;

  it('never turns the stretch the death spans into a gap', () => {
    const alive = ON_CADENCE.filter(castS => castS < diedS || castS >= backS);

    expect(cadence.measureGap(alive, [[0, diedS], [backS, FIGHT_S]], {})?.gapS).toBe((ON_CADENCE[3] ?? 0) - (ON_CADENCE[2] ?? 0));
  });
});

describe('A lust moved outside the top logs\' band', () => {
  /** Every other top log lusted at 1:00 and pressed it 5s in. */
  const LUST_S = 60;
  const perParse = Array.from({ length: TOP_N }, () => rotationLog({ lust_s: LUST_S, cd_casts_s: { [SB]: [LUST_S + 5] } }));

  for (const shiftedS of CHOICES.lustShiftsS) {
    it(`produces no judged row for a lust at ${shiftedS}s`, () => {
      const rows = lust.findings(SB, [], shiftedS, perParse);

      expect(rows.every(row => row.severity === 'neutral')).toBe(true);
    });
  }
});

describe('Two seconds of jitter in a top pull', () => {
  const START_S = 10;
  const END_S = 30;
  const HIT = 100;
  const STEADY_HIT = 10;
  const HITS_AT = [14, 18, 22, 26];
  const window: BurstWindow = {
    time_s: START_S, window_length_s: END_S - START_S, dmg_avg: 0, dmg_min: 0, dmg_max: 0, dmg_stddev: 0, common_cds: [], ability_breakdown: [],
    members: [],
  };
  const pull = (shiftS: number) => burst.series(timed([
    ...Array.from({ length: FIGHT_S }, (_unused, atS) => damage(SHADOW_BLADES_DAMAGE, atS, STEADY_HIT)),
    ...HITS_AT.map(atS => damage(SHADOW_BLADES_DAMAGE, atS + shiftS, HIT)),
  ]), FIGHT_S);
  const measuredAt = (shiftS: number) => burst.measure(pull(shiftS), window, [[0, FIGHT_S]]);
  const topLogs = Array.from({ length: TOP_N }, () => measuredAt(0)?.amplification ?? 0);

  it('leaves the window\'s measure, and so its verdict, where it was', () => {
    for (const shiftS of [-CHOICES.jitterS, CHOICES.jitterS]) {
      expect(measuredAt(shiftS)?.amplification).toBe(measuredAt(0)?.amplification);
      expect(burst.verdict(window, measuredAt(shiftS), topLogs).status).toBe(burst.verdict(window, measuredAt(0), topLogs).status);
    }
  });
});

describe('Damage scaled in a top pull', () => {
  it('leaves a burst window\'s multiple unchanged, since it reads damage only against the pull\'s own average', () => {
    const window: BurstWindow = { time_s: 40, window_length_s: 10, dmg_avg: 0, dmg_min: 0, dmg_max: 0, dmg_stddev: 0, common_cds: [], ability_breakdown: [], members: [] };
    const perS = Array.from({ length: FIGHT_S }, (_unused, second) => second >= 40 && second < 50 ? 40 : 10);

    expect(burst.measure(perS.map(value => value * CHOICES.damageScale), window, [[0, FIGHT_S]])?.amplification)
      .toBeCloseTo(burst.measure(perS, window, [[0, FIGHT_S]])?.amplification ?? 0);
  });

  it('leaves every cadence measure unchanged, since none reads damage', () => {
    const withDamage = (scale: number) => timed([...ON_CADENCE.map(atS => cast(SHADOW_BLADES, atS)), damage(SHADOW_BLADES_DAMAGE, 50, 1000 * scale)]);

    expect(uses.castTimesS(withDamage(CHOICES.damageScale), SHADOW_BLADES, NOTHING_UP, FIGHT_S))
      .toEqual(uses.castTimesS(withDamage(1), SHADOW_BLADES, NOTHING_UP, FIGHT_S));
  });
});
