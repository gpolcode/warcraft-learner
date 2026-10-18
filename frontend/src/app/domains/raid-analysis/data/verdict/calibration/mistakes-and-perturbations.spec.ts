import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LeaveOneOutService } from './leave-one-out-service';
import { HeldOutRowService } from './held-out-row-service';
import { InjectedMistakeService } from './injected-mistake-service';
import { PerturbationService } from './perturbation-service';
import { HeldOutCase } from './held-out-case-service';
import { bench } from '../../rotation/rotation-harness';
import { benchWith, CLOAK_META, defBench } from '../../defensive/defensive-harness';
import { benchSources } from '../../../../../../testing/builders/bench-sources';
import {
  BURST_AT_S, BURST_S, burstBench, burstLog, burstWindow, CLOAK, defensiveLog, defensiveWindow, FIGHT_S, gearBench, gearLog, ON_CADENCE, rotationLog, SB,
  WINDOW_AT_S, WINDOW_DAMAGE,
} from './calibration-harness';
import { VERDICT_CHOICES } from '../verdict-choices';

const folds = TestBed.inject(LeaveOneOutService);
const heldOutRows = TestBed.inject(HeldOutRowService);
const mistakes = TestBed.inject(InjectedMistakeService);
const perturbations = TestBed.inject(PerturbationService);

const TOP_N = 6;
const LUST_S = 100;
const CHOICES = VERDICT_CHOICES.calibration;
/** The 5s opener, and then the 95s use, thirty seconds later. */
const FIRST_DELAYED = [35, 95, 185, 275];
const SECOND_DELAYED = [5, 125, 185, 275];
/** The defensive's 10s and 130s uses, each thirty seconds later in turn. */
const DEFENSIVE_FIRST_DELAYED = [40, 130];
const DEFENSIVE_SECOND_DELAYED = [10, 160];
/** Five global cooldowns of 1.5s each. */
const PAUSE_S = 5 * 1.5;
/** Stretches every thirty seconds, three seconds each. */
const SPREAD_IDLE: [number, number][] = Array.from({ length: 10 }, (_unused, index) => [index * 30, index * 30 + 3]);

type RotationCase = Extract<HeldOutCase, { card: 'rotation' }>;
type DefensiveCase = Extract<HeldOutCase, { card: 'defensive' }>;

const rotationCase = (held = rotationLog()): RotationCase => {
  const full = bench({ sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: [held, ...Array.from({ length: TOP_N - 1 }, () => rotationLog())] });
  return { card: 'rotation', source: 'r1:1', fold: folds.foldRotation(full, 0), log: { measures: held, model: heldOutRows.wholePull(FIGHT_S), talents: null } };
};
const defensiveCase = (held = defensiveLog()): DefensiveCase => {
  const full = benchWith({
    sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: [held, ...Array.from({ length: TOP_N - 1 }, () => defensiveLog())],
    defensives: [CLOAK_META], per_defensive_benchmarks: { [CLOAK]: defBench() }, defensive_windows: [defensiveWindow([0, 1, 2, 3])],
  });
  return {
    card: 'defensive', source: 'r1:1', fold: folds.foldDefensive(full, 0),
    log: {
      casts: held.def_casts_s, model: heldOutRows.withDeaths(FIGHT_S, FIGHT_S, held.dead_s ?? []), talents: null,
      up: held.def_up_s ?? null, takenPerS: held.taken_per_s ?? null, tank: false,
    },
  };
};
const upOf = (heldOut: HeldOutCase | null | undefined) => heldOut?.card === 'defensive' ? heldOut.log.up : null;
const deadOf = (heldOut: HeldOutCase | null | undefined) => heldOut?.card === 'defensive' ? heldOut.log.model.deadSpans : [];
const castsOf = (heldOut: HeldOutCase | null | undefined): number[] =>
  heldOut?.card === 'rotation' ? heldOut.log.measures.cd_casts_s[SB] ?? [] : [];

describe('InjectedMistakeService', () => {
  it('drops the last use of the first cooldown most top logs use', () => {
    const [variant] = mistakes.variants('drop-major-cooldown-cast', rotationCase());

    expect(castsOf(variant)).toEqual(ON_CADENCE.slice(0, -1));
  });

  it('delays the first use, and separately the second, by thirty seconds', () => {
    const variants = mistakes.variants('delay-cooldown-30s', rotationCase());

    expect(variants.map(castsOf)).toEqual([FIRST_DELAYED, SECOND_DELAYED]);
  });

  it('lengthens the stretch idle at mid-pull by five global cooldowns', () => {
    const [variant] = mistakes.variants('idle-5-gcds', rotationCase());

    expect(variant?.card === 'rotation' && variant.log.measures.idle_s).toEqual([[100, 160 + PAUSE_S]]);
  });

  it('plays the rest of the pull five global cooldowns later, cutting the tail at the kill', () => {
    const [variant] = mistakes.variants('idle-5-gcds', rotationCase(rotationLog({ idle_s: SPREAD_IDLE })));
    const idle = variant?.card === 'rotation' ? variant.log.measures.idle_s : null;

    expect(idle?.slice(4)).toEqual([[120, 123], [150, 153 + PAUSE_S], [187.5, 190.5], [217.5, 220.5], [247.5, 250.5], [277.5, 280.5]]);
  });

  it('moves every use inside the lust window past its end', () => {
    const [variant] = mistakes.variants('move-cooldown-out-of-lust', rotationCase(rotationLog({ lust_s: LUST_S })));
    const { beforeS, afterS } = VERDICT_CHOICES.lustWindow;

    expect(castsOf(variant).some(castS => LUST_S - beforeS <= castS && castS <= LUST_S + afterS)).toBe(false);
  });

  it('has nothing to move without a lust', () => {
    expect(mistakes.variants('move-cooldown-out-of-lust', rotationCase())).toEqual([]);
  });

  it('strips a defensive of its uses and its auras', () => {
    const [variant] = mistakes.variants('strip-defensive', defensiveCase());

    expect(variant?.card === 'defensive' && variant.log.casts[CLOAK]).toEqual([]);
    expect(upOf(variant)).toEqual({ [CLOAK]: [] });
  });

  it('takes every aura up at a covered window away from it, one variant per window, and keeps the damage', () => {
    const LATER: [number, number] = [200, 210];
    const held = defensiveLog();
    const [variant, ...rest] = mistakes.variants('uncover-window', defensiveCase({ ...held, def_up_s: { [CLOAK]: [...held.def_up_s?.[CLOAK] ?? [], LATER] } }));

    expect(rest).toEqual([]);
    expect(upOf(variant)).toEqual({ [CLOAK]: [LATER] });
    expect(variant?.card === 'defensive' && variant.log.takenPerS).toEqual(held.taken_per_s);
  });

  it('has no window to uncover where no defensive was up', () => {
    expect(mistakes.variants('uncover-window', defensiveCase(defensiveLog(undefined, { covered: false })))).toEqual([]);
  });

  it('kills the log halfway into each window it was alive through, with no rez', () => {
    const [variant] = mistakes.variants('die-in-window', defensiveCase());
    const HALFWAY_S = WINDOW_AT_S + 2.5;

    expect(deadOf(variant)).toEqual([[HALFWAY_S, FIGHT_S]]);
  });

  it('has no window to die in that the log was already dead for', () => {
    expect(mistakes.variants('die-in-window', defensiveCase(defensiveLog(undefined, { dead: [[WINDOW_AT_S - 5, FIGHT_S]] })))).toEqual([]);
  });

  it('delays a defensive\'s first use, and separately its second, by thirty seconds', () => {
    const variants = mistakes.variants('delay-cooldown-30s', defensiveCase());

    expect(variants.map(variant => variant.card === 'defensive' ? variant.log.casts[CLOAK] : [])).toEqual([DEFENSIVE_FIRST_DELAYED, DEFENSIVE_SECOND_DELAYED]);
  });

  it('has no defensive to delay when the held-out log never pressed one', () => {
    const unpressed = defensiveCase();
    const variants = mistakes.variants('delay-cooldown-30s', { ...unpressed, log: { ...unpressed.log, casts: { [CLOAK]: [] } } });

    expect(variants).toEqual([]);
  });

  it('swaps a talent and removes an enchant from a gear log', () => {
    const picks = gearLog();
    const gearCase: HeldOutCase = { card: 'gear', source: 'r1:1', fold: gearBench([picks]), picks };

    expect(mistakes.variants('swap-talent-node', gearCase).map(variant => variant.card === 'gear' && variant.picks.talent_key)).not.toEqual([picks.talent_key]);
    expect(mistakes.variants('remove-enchant', gearCase).map(variant => variant.card === 'gear' && variant.picks.enchant_ids)).toEqual([{}]);
  });
});

const burstCase = (): HeldOutCase => {
  const logs = Array.from({ length: TOP_N }, () => burstLog());
  return {
    card: 'burst', source: 'r1:1', fold: folds.foldBurst(burstBench(logs, [burstWindow([1, 2, 3])]), 0),
    log: { damagePerS: burstLog().damage_per_s, model: heldOutRows.wholePull(FIGHT_S) },
  };
};
const damageOf = (heldOut: HeldOutCase | null | undefined): number[] => heldOut?.card === 'burst' ? heldOut.log.damagePerS : [];
const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);

describe('InjectedMistakeService on a burst', () => {
  it('moves the log\'s burst fifteen seconds later and keeps the pull\'s total', () => {
    const [shifted] = mistakes.variants('shift-burst-15s', burstCase());
    const perS = damageOf(shifted);

    expect(perS.slice(BURST_AT_S + CHOICES.burstShiftS, BURST_AT_S + CHOICES.burstShiftS + BURST_S)).toEqual(burstLog().damage_per_s.slice(BURST_AT_S, BURST_AT_S + BURST_S));
    expect(sum(perS)).toBe(sum(damageOf(burstCase())));
  });

  it('has nothing to shift a burst that would leave the pull', () => {
    const lateWindow = { ...burstWindow([1, 2, 3]), time_s: FIGHT_S - BURST_S };
    const heldOut = burstCase();
    const late = heldOut.card === 'burst' ? { ...heldOut, fold: { ...heldOut.fold, windows: [{ ...lateWindow, index: 0 }] } } : heldOut;

    expect(mistakes.variants('shift-burst-15s', late)).toEqual([]);
  });

  it('makes no burst variant for a mistake that is not a burst\'s', () => {
    expect(mistakes.variants('drop-major-cooldown-cast', burstCase())).toEqual([]);
  });
});

describe('PerturbationService on a burst', () => {
  it('deals no damage past a wipe', () => {
    const cut = perturbations.perturb('truncate', burstCase());
    const endS = cut?.card === 'burst' ? cut.log.model.judgedEndS : 0;

    expect(damageOf(cut).slice(Math.ceil(endS)).every(value => value === 0)).toBe(true);
  });

  it('deals no damage while dead', () => {
    const died = perturbations.perturb('death', burstCase());
    const [[diedS] = [0]] = died?.card === 'burst' ? died.log.model.deadSpans : [];

    expect(damageOf(died).slice(Math.ceil(diedS)).every(value => value === 0)).toBe(true);
  });

  it('moves each second\'s damage at most two seconds and keeps the total, the same way on every run', () => {
    const once = damageOf(perturbations.perturb('jitter', burstCase()));

    expect(sum(once)).toBe(sum(damageOf(burstCase())));
    expect(once).not.toEqual(damageOf(burstCase()));
    expect(damageOf(perturbations.perturb('jitter', burstCase()))).toEqual(once);
  });

  it('scales every second\'s damage', () => {
    expect(damageOf(perturbations.perturb('damage-scale', burstCase()))[0]).toBe((burstLog().damage_per_s[0] ?? 0) * CHOICES.damageScale);
  });

  it('leaves the lust to the rotation card', () => {
    expect(perturbations.perturb('lust-120', burstCase())).toBeNull();
  });
});

describe('PerturbationService', () => {
  const { from, to } = CHOICES.perturbedShare;

  it('cuts the pull as a wipe somewhere in the perturbed share of it', () => {
    const cut = perturbations.perturb('truncate', rotationCase());
    const endS = cut?.card === 'rotation' ? cut.log.model.judgedEndS : 0;

    expect(endS).toBeGreaterThanOrEqual(FIGHT_S * from);
    expect(endS).toBeLessThanOrEqual(FIGHT_S * to);
    expect(cut?.card === 'rotation' && cut.log.model.judgedEndCause).toBe('wipe');
  });

  it('removes the uses a death without a rez leaves no time for', () => {
    const died = perturbations.perturb('death', rotationCase());
    const [[diedS] = [0]] = died?.card === 'rotation' ? died.log.model.deadSpans : [];

    expect(castsOf(died).every(castS => castS < diedS)).toBe(true);
  });

  it('keeps no idle stretch past the cut of a truncated pull', () => {
    const cut = perturbations.perturb('truncate', rotationCase(rotationLog({ idle_s: SPREAD_IDLE })));
    const endS = cut?.card === 'rotation' ? cut.log.model.judgedEndS : 0;
    const idle = cut?.card === 'rotation' ? cut.log.measures.idle_s ?? [] : [];

    expect(idle.length).toBeGreaterThan(0);
    expect(idle.every(([, toS]) => toS <= endS)).toBe(true);
  });

  it('joins the idle stretches around a rezzed death into one', () => {
    const rezzed = perturbations.perturb('death-rez', rotationCase(rotationLog({ idle_s: SPREAD_IDLE })));
    const [[diedS, backS] = [0, 0]] = rezzed?.card === 'rotation' ? rezzed.log.model.deadSpans : [];
    const idle = rezzed?.card === 'rotation' ? rezzed.log.measures.idle_s ?? [] : [];

    expect(idle.some(([fromS, toS]) => fromS <= diedS && toS >= backS)).toBe(true);
  });

  it('brings a rezzed player back thirty seconds after the death', () => {
    const rezzed = perturbations.perturb('death-rez', rotationCase());
    const [[diedS, backS] = [0, 0]] = rezzed?.card === 'rotation' ? rezzed.log.model.deadSpans : [];

    expect(backS - diedS).toBe(CHOICES.rezAfterS);
  });

  it('moves the lust to two and three minutes', () => {
    const lustOf = (heldOut: HeldOutCase | null) => heldOut?.card === 'rotation' ? heldOut.log.measures.lust_s : null;

    expect(lustOf(perturbations.perturb('lust-120', rotationCase()))).toBe(CHOICES.lustShiftsS[0]);
    expect(lustOf(perturbations.perturb('lust-180', rotationCase()))).toBe(CHOICES.lustShiftsS[1]);
  });

  it('jitters every use by at most two seconds, the same way on every run', () => {
    const once = castsOf(perturbations.perturb('jitter', rotationCase()));

    expect(once.every((castS, index) => Math.abs(castS - (ON_CADENCE[index] ?? 0)) <= CHOICES.jitterS)).toBe(true);
    expect(castsOf(perturbations.perturb('jitter', rotationCase()))).toEqual(once);
  });

  it('scales the damage a defensive log took', () => {
    const scaled = perturbations.perturb('damage-scale', defensiveCase());

    expect(scaled?.card === 'defensive' && scaled.log.takenPerS?.[WINDOW_AT_S]).toBe(WINDOW_DAMAGE * CHOICES.damageScale);
  });

  it('keeps a defensive log\'s own death beside the inserted one', () => {
    const OWN_DEATH: [number, number] = [10, 20];
    const died = perturbations.perturb('death', defensiveCase(defensiveLog(undefined, { dead: [OWN_DEATH] })));

    expect(deadOf(died)[0]).toEqual(OWN_DEATH);
    expect(deadOf(died)).toHaveLength(2);
  });

  it('drops a defensive log\'s auras and damage taken once it dies', () => {
    const held = defensiveLog(undefined, { dead: [], damage: WINDOW_DAMAGE });
    const died = perturbations.perturb('death', defensiveCase({ ...held, taken_per_s: held.taken_per_s?.map(() => 1), def_up_s: { [CLOAK]: [[0, FIGHT_S]] } }));
    const [[diedS] = [0]] = deadOf(died);

    expect(upOf(died)).toEqual({ [CLOAK]: [[0, diedS]] });
    expect(died?.card === 'defensive' && died.log.takenPerS?.slice(Math.ceil(diedS)).every(value => value === 0)).toBe(true);
  });

  it('leaves a gear log alone', () => {
    const picks = gearLog();

    expect(perturbations.perturb('truncate', { card: 'gear', source: 'r1:1', fold: gearBench([picks]), picks })).toBeNull();
  });
});
