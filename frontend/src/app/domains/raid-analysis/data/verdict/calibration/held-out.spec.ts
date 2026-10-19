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
  BURST_AT_S, BURST_S, burstBench, burstLog, burstWindow, CLOAK, defensiveLog, defensiveWindow, FIGHT_S, gearBench, gearLog, rotationLog, SB,
  WINDOW_AT_S, WINDOW_DAMAGE,
} from './calibration-harness';
import { BurstHeldOutService } from './burst-held-out-service';
import { DefensiveParseMeasures } from '../../defensive/defensive-data-source';
import { RotationParseMeasures } from '../../rotation/rotation-data-source';

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
/** The shared cadence with its 95s use skipped: ready from 95s to 185s, one whole cooldown past the others' 5s. */
const SKIPPED = [5, 185, 275];
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
    expect(levelsOf(rows, 'rotation.ready_time')).toEqual(['neutral']);
    expect(levelsOf(rows, 'rotation.downtime')).toEqual(['neutral']);
    expect(levelsOf(rows, 'rotation.button')).toEqual(['neutral']);
  });

  it('flags a top log that leaves its cooldown ready for a whole cooldown', () => {
    expect(levelsOf(judgeRotation(rotationLog({ cd_casts_s: { [SB]: SKIPPED } })), 'rotation.ready_time')).toEqual(['red']);
  });

  it('counts no test against fewer than five other top logs', () => {
    expect(judgeRotation(rotationLog(), UNDER_N)).toEqual([]);
  });

  it('judges the idle time of a pull cut short over its alive time', () => {
    // 30s idle of the 150s before the cut is the top logs' fifth.
    const cut = heldOutRows.withDeaths(FIGHT_S, FIGHT_S / 2, []);

    expect(levelsOf(judgeRotation(rotationLog({ idle_s: [[20, 50]] }), TOP_N, cut), 'rotation.downtime')).toEqual(['neutral']);
  });

  it('leaves out the ready time a death crosses', () => {
    const diedInTheWait = heldOutRows.withDeaths(FIGHT_S, FIGHT_S, [[100, 150]]);

    expect(levelsOf(judgeRotation(rotationLog({ cd_casts_s: { [SB]: SKIPPED } }), TOP_N, diedInTheWait), 'rotation.ready_time')).toEqual(['neutral']);
  });
});

describe('RotationHeldOutService Bloodlust', () => {
  /** Every top log lusted at 1:40, which the 95s press's 20s effect overlaps. */
  const LUST_S = 100;
  const lusting = (over: Partial<RotationParseMeasures> = {}): RotationParseMeasures => rotationLog({ lust_s: LUST_S, ...over });
  const NOT_UP = { [SB]: [[5, 25], [185, 205], [275, 295]] as [number, number][] };
  const judgeLust = (held: RotationParseMeasures, others = lusting(), model = heldOutRows.wholePull(FIGHT_S)) => {
    const full = bench({ sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: [held, ...Array.from({ length: TOP_N - 1 }, () => others)] });
    return levelsOf(rotation.judge(folds.foldRotation(full, HELD_OUT), { measures: held, model, talents: null }), 'rotation.bloodlust');
  };

  it('makes one neutral test of a top log that had the cooldown up during its lust like the others', () => {
    expect(judgeLust(lusting())).toEqual(['neutral']);
  });

  it('flags a top log whose cooldown was not up during its lust while every other one had it up', () => {
    expect(judgeLust(lusting({ cd_up_s: NOT_UP }))).toEqual(['amber']);
  });

  it('counts no test on a log, or against a fold, without the effects baked', () => {
    expect(judgeLust(lusting({ cd_up_s: undefined }))).toEqual([]);
    expect(judgeLust(lusting({ cd_up_s: NOT_UP }), lusting({ cd_up_s: undefined }))).toEqual([]);
  });

  it('counts no test when the log died during its lust', () => {
    const diedInLust = heldOutRows.withDeaths(FIGHT_S, FIGHT_S, [[LUST_S + 10, LUST_S + 60]]);

    expect(judgeLust(lusting({ cd_up_s: NOT_UP }), lusting(), diedInLust)).toEqual([]);
  });
});

describe('DefensiveHeldOutService', () => {
  const others = Array.from({ length: TOP_N - 1 }, () => defensiveLog());
  const judgeDefensive = (held: DefensiveParseMeasures, tank = false) => {
    const full = benchWith({
      sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: [held, ...others],
      defensives: [CLOAK_META], per_defensive_benchmarks: { [CLOAK]: defBench() }, defensive_windows: [defensiveWindow([1, 2, 3])],
    });
    const model = heldOutRows.withDeaths(FIGHT_S, FIGHT_S, held.dead_s ?? []);
    return defensive.judge(folds.foldDefensive(full, HELD_OUT), {
      casts: held.def_casts_s, model, talents: null, up: held.def_up_s ?? null, takenPerS: held.taken_per_s ?? null, tank,
    });
  };
  const uncovered = (damage: number) => defensiveLog(undefined, { covered: false, damage });

  it('flags amber where no defensive was up, every other log had one up and the damage is above their median', () => {
    expect(levelsOf(judgeDefensive(uncovered(WINDOW_DAMAGE + 1)), 'defensive.window')).toEqual(['amber']);
  });

  it('keeps an uncovered log at the others\' median damage a blue count', () => {
    expect(levelsOf(judgeDefensive(uncovered(WINDOW_DAMAGE)), 'defensive.window')).toEqual(['blue']);
  });

  it('keeps a covered log neutral', () => {
    expect(levelsOf(judgeDefensive(defensiveLog()), 'defensive.window')).toEqual(['neutral']);
  });

  it('judges a tank on coverage alone, a count', () => {
    expect(levelsOf(judgeDefensive(uncovered(WINDOW_DAMAGE * 3), true), 'defensive.window')).toEqual(['blue']);
  });

  it('counts a window the log was alive through as a death test that holds no death', () => {
    expect(levelsOf(judgeDefensive(defensiveLog()), 'defensive.dead_in_window')).toEqual(['neutral']);
  });

  it('gives a death inside the window its red fact in place of the coverage test', () => {
    const rows = judgeDefensive(defensiveLog(undefined, { dead: [[WINDOW_AT_S + 2, FIGHT_S]] }));

    expect(levelsOf(rows, 'defensive.dead_in_window')).toEqual(['red']);
    expect(levelsOf(rows, 'defensive.window')).toEqual([]);
  });

  it('counts no window test on a log baked before coverage', () => {
    const rows = judgeDefensive({ def_casts_s: defensiveLog().def_casts_s });

    expect(levelsOf(rows, 'defensive.window')).toEqual([]);
    expect(levelsOf(rows, 'defensive.dead_in_window')).toEqual([]);
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
    expect(levelsOf(rows, 'gear.talent_build')).toEqual(['neutral', 'neutral']);
  });

  it('makes each talent the others share one test, blue where the log takes another', () => {
    expect(levelsOf(judgeGear(gearLog({ talent_key: 'v3:1.1,3.1' })), 'gear.talent_build')).toEqual(['neutral', 'blue']);
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
