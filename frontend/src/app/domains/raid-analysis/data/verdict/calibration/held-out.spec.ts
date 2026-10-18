import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LeaveOneOutService } from './leave-one-out-service';
import { HeldOutRowService } from './held-out-row-service';
import { RotationHeldOutService } from './rotation-held-out-service';
import { DefensiveHeldOutService } from './defensive-held-out-service';
import { GearHeldOutService } from './gear-held-out-service';
import { HeldOutCaseService } from './held-out-case-service';
import { HeldOutRow } from './calibration.models';
import { bench } from '../../rotation/rotation-harness';
import { benchWith, CLOAK_META, defBench } from '../../defensive/defensive-harness';
import { benchSources } from '../../../../../../testing/builders/bench-sources';
import {
  BURST_AT_S, BURST_S, burstBench, burstLog, burstWindow, CLOAK, defensiveLog, defensiveWindow, FIGHT_S, gearBench, gearLog, ON_CADENCE, rotationLog, SB,
} from './calibration-harness';
import { BurstHeldOutService } from './burst-held-out-service';

const folds = TestBed.inject(LeaveOneOutService);
const heldOutRows = TestBed.inject(HeldOutRowService);
const rotation = TestBed.inject(RotationHeldOutService);
const defensive = TestBed.inject(DefensiveHeldOutService);
const gear = TestBed.inject(GearHeldOutService);
const cases = TestBed.inject(HeldOutCaseService);
const burst = TestBed.inject(BurstHeldOutService);

/** Five other top logs is the fewest a fold can grade against. */
const TOP_N = 6;
const UNDER_N = 5;
const HELD_OUT = 0;
/** Thirty seconds past the others' shared opener is well beyond the 2s floor of an interval with no spread. */
const LATE_OPENER = [35, 125, 215];
const ACTION = 'eviscerate';
const BUTTON = { right: 18, moments: 20 };

const levelsOf = (rows: readonly HeldOutRow[], family: string) => rows.filter(row => row.family === family).map(row => row.level);
const rotationBench = (held = rotationLog(), n = TOP_N) => {
  const logs = [held, ...Array.from({ length: n - 1 }, () => rotationLog({ buttons: { [ACTION]: BUTTON } }))];
  return bench({
    sources: benchSources(n), sample_count: n, per_parse: logs,
    buttons: [{ action: ACTION, spell_id: 1, right: { lo: 0.9, avg: 0.9, hi: 0.9 } }],
  });
};
const judgeRotation = (held = rotationLog(), n = TOP_N, model = heldOutRows.wholePull(FIGHT_S)) =>
  rotation.judge(folds.foldRotation(rotationBench(held, n), HELD_OUT), { measures: held, model, talents: null });

describe('RotationHeldOutService', () => {
  it('flags nothing on a top log that plays like the others', () => {
    const rows = judgeRotation(rotationLog({ buttons: { [ACTION]: BUTTON } }));

    expect(rows.filter(row => row.level === 'amber' || row.level === 'red')).toEqual([]);
    expect(levelsOf(rows, 'rotation.late_opener')).toEqual(['neutral']);
    expect(levelsOf(rows, 'rotation.lost_cast')).toEqual(['neutral']);
    expect(levelsOf(rows, 'rotation.downtime')).toEqual(['neutral']);
    expect(levelsOf(rows, 'rotation.button')).toEqual(['neutral']);
  });

  it('flags a top log that opens half a minute late', () => {
    expect(levelsOf(judgeRotation(rotationLog({ cd_casts_s: { [SB]: LATE_OPENER } })), 'rotation.late_opener')).toEqual(['amber']);
  });

  it('counts no test against fewer than five other top logs', () => {
    expect(judgeRotation(rotationLog(), UNDER_N)).toEqual([]);
  });

  it('leaves the whole-pull casting share unjudged once the pull is cut short', () => {
    const cut = heldOutRows.withDeaths(FIGHT_S, FIGHT_S / 2, []);

    expect(levelsOf(judgeRotation(rotationLog(), TOP_N, cut), 'rotation.downtime')).toEqual([]);
  });

  it('drops an opener test a death explains', () => {
    const diedBeforeOpener = heldOutRows.withDeaths(FIGHT_S, FIGHT_S, [[1, 2]]);

    expect(levelsOf(judgeRotation(rotationLog({ cd_casts_s: { [SB]: ON_CADENCE } }), TOP_N, diedBeforeOpener), 'rotation.late_opener')).toEqual([]);
  });
});

describe('DefensiveHeldOutService', () => {
  const defensiveBench = (windowParses: number[]) => benchWith({
    sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: Array.from({ length: TOP_N }, () => defensiveLog()),
    defensives: [CLOAK_META], per_defensive_benchmarks: { [CLOAK]: defBench() }, defensive_windows: [defensiveWindow(windowParses)],
  });
  const judgeDefensive = (windowParses: number[], tank = false) => {
    const full = defensiveBench(windowParses);
    return defensive.judge(folds.foldDefensive(full, HELD_OUT), {
      casts: defensiveLog().def_casts_s, model: heldOutRows.wholePull(FIGHT_S), talents: null,
      covered: defensive.coveredBy(full, HELD_OUT), tank,
    });
  };
  const EVERY_OTHER_LOG = [1, 2, 3, 4, 5];

  it('reads the windows the held-out log formed, with its damage there', () => {
    expect([...defensive.coveredBy(defensiveBench([HELD_OUT, 1, 2]), HELD_OUT)]).toEqual([[0, 1000]]);
  });

  it('counts an uncovered log as taking more than the median, so every other log covering it flags amber', () => {
    expect(levelsOf(judgeDefensive(EVERY_OTHER_LOG), 'defensive.window')).toEqual(['amber']);
  });

  it('keeps a covered log neutral', () => {
    expect(levelsOf(judgeDefensive([HELD_OUT, ...EVERY_OTHER_LOG]), 'defensive.window')).toEqual(['neutral']);
  });

  it('judges a tank on coverage alone, a count', () => {
    expect(levelsOf(judgeDefensive(EVERY_OTHER_LOG, true), 'defensive.window')).toEqual(['blue']);
  });
});

describe('GearHeldOutService', () => {
  const others = Array.from({ length: UNDER_N }, () => gearLog());
  const judgeGear = (picks: ReturnType<typeof gearLog>) => gear.judge(folds.foldGear(gearBench([picks, ...others]), HELD_OUT), picks);

  it('flags a missing enchant every other top log applies', () => {
    const rows = judgeGear(gearLog({ enchant_ids: {} }));

    expect(levelsOf(rows, 'gear.enchant_missing')).toEqual(['amber']);
    expect(levelsOf(rows, 'gear.enchant')).toEqual(['neutral']);
  });

  it('keeps a log with the others\' picks neutral on every check', () => {
    const rows = judgeGear(gearLog());

    expect(rows.every(row => row.level === 'neutral')).toBe(true);
    expect(levelsOf(rows, 'gear.talent_build')).toEqual(['neutral']);
  });

  it('counts another build as a blue count of top raiders', () => {
    expect(levelsOf(judgeGear(gearLog({ talent_key: 'v3:3.1' })), 'gear.talent_build')).toEqual(['blue']);
  });
});

describe('BurstHeldOutService', () => {
  const FAMILY = 'burst.window';
  /** Every top log bursts on the window; a held-out log fifteen seconds late misses all of it but the timing floor's reach. */
  const LATE_S = BURST_AT_S + 15;
  const judgeBurst = (held = burstLog(), model = heldOutRows.wholePull(FIGHT_S)) => {
    const logs = [held, ...Array.from({ length: TOP_N - 1 }, () => burstLog())];
    const fold = folds.foldBurst(burstBench(logs, [burstWindow([1, 2, 3, 4, 5])]), HELD_OUT);
    return burst.judge(fold, { damagePerS: held.damage_per_s, model });
  };

  it('flags nothing on a top log that bursts with the others', () => {
    expect(levelsOf(judgeBurst(), FAMILY)).toEqual(['neutral']);
  });

  it('flags a top log whose burst comes fifteen seconds late, though its own burst did not form the window', () => {
    expect(levelsOf(judgeBurst(burstLog(LATE_S)), FAMILY)).toEqual(['amber']);
  });

  it('makes no test on a window a death explains', () => {
    const deadInIt = heldOutRows.withDeaths(FIGHT_S, FIGHT_S, [[BURST_AT_S + BURST_S / 2, FIGHT_S]]);

    expect(judgeBurst(burstLog(), deadInIt)).toEqual([]);
  });
});

describe('HeldOutCaseService', () => {
  const benches = { rotation: rotationBench(), defensive: null, gear: gearBench(Array.from({ length: TOP_N }, () => gearLog())), burst: null };

  it('makes one case per top log of each bench with per-log measures', () => {
    const made = cases.cases(benches, 'SubtletyRogue');

    expect(made.filter(entry => entry.card === 'rotation')).toHaveLength(TOP_N);
    expect(made.filter(entry => entry.card === 'gear')).toHaveLength(TOP_N);
  });

  it('names a bench without per-log measures as one it cannot fold', () => {
    const { per_parse: _dropped, ...older } = rotationBench();

    expect(cases.unfoldable({ ...benches, rotation: older as never })).toEqual(['rotation']);
  });

  it('makes a burst case per top log of a damage spec, and none for a healer', () => {
    const withBurst = { ...benches, burst: burstBench(Array.from({ length: TOP_N }, () => burstLog()), [burstWindow([0, 1, 2])]) };

    expect(cases.cases(withBurst, 'SubtletyRogue').filter(entry => entry.card === 'burst')).toHaveLength(TOP_N);
    expect(cases.cases(withBurst, 'HolyPaladin').filter(entry => entry.card === 'burst')).toEqual([]);
  });

  it('names a burst bench without per-log damage as one it cannot fold', () => {
    const { per_parse: _dropped, ...older } = burstBench([burstLog()], []);

    expect(cases.unfoldable({ ...benches, burst: older })).toEqual(['burst']);
  });

  it('keys a top log by its report and fight, the same across benches', () => {
    const [first] = cases.cases(benches, 'SubtletyRogue');

    expect(first?.source).toBe('r1:1');
  });
});
