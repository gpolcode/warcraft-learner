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
/** Five global cooldowns of 1.5s each, as a share of the 300s pull. */
const IDLE_PCT = 100 * 5 * 1.5 / FIGHT_S;

type RotationCase = Extract<HeldOutCase, { card: 'rotation' }>;
type DefensiveCase = Extract<HeldOutCase, { card: 'defensive' }>;

const rotationCase = (held = rotationLog()): RotationCase => {
  const full = bench({ sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: [held, ...Array.from({ length: TOP_N - 1 }, () => rotationLog())] });
  return { card: 'rotation', source: 'r1:1', fold: folds.foldRotation(full, 0), log: { measures: held, model: heldOutRows.wholePull(FIGHT_S), talents: null } };
};
const defensiveCase = (): DefensiveCase => {
  const full = benchWith({
    sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: Array.from({ length: TOP_N }, () => defensiveLog()),
    defensives: [CLOAK_META], per_defensive_benchmarks: { [CLOAK]: defBench() }, defensive_windows: [defensiveWindow([0, 1, 2, 3])],
  });
  return {
    card: 'defensive', source: 'r1:1', fold: folds.foldDefensive(full, 0),
    log: { casts: defensiveLog().def_casts_s, model: heldOutRows.wholePull(FIGHT_S), talents: null, covered: defensive(full), tank: false },
  };
};
const defensive = (full: ReturnType<typeof benchWith>) => new Map(full.defensive_windows.flatMap((window, index) =>
  window.members.some(member => member.parse === 0) ? [[index, 1000] as const] : []));
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

  it('takes five global cooldowns of casting off the pull\'s share', () => {
    const [variant] = mistakes.variants('idle-5-gcds', rotationCase());

    expect(variant?.card === 'rotation' && variant.log.measures.efficiency_pct).toBeCloseTo(80 - IDLE_PCT);
  });

  it('moves every use inside the lust window past its end', () => {
    const [variant] = mistakes.variants('move-cooldown-out-of-lust', rotationCase(rotationLog({ lust_s: LUST_S })));
    const { beforeS, afterS } = VERDICT_CHOICES.lustWindow;

    expect(castsOf(variant).some(castS => LUST_S - beforeS <= castS && castS <= LUST_S + afterS)).toBe(false);
  });

  it('has nothing to move without a lust', () => {
    expect(mistakes.variants('move-cooldown-out-of-lust', rotationCase())).toEqual([]);
  });

  it('strips a defensive of its uses and its covered windows', () => {
    const [variant] = mistakes.variants('strip-defensive', defensiveCase());

    expect(variant?.card === 'defensive' && variant.log.casts[CLOAK]).toEqual([]);
    expect(variant?.card === 'defensive' && variant.log.covered.size).toBe(0);
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

  it('scales the damage a defensive log took in its windows', () => {
    const scaled = perturbations.perturb('damage-scale', defensiveCase());

    expect(scaled?.card === 'defensive' && [...scaled.log.covered.values()]).toEqual([1000 * CHOICES.damageScale]);
  });

  it('leaves a gear log alone', () => {
    const picks = gearLog();

    expect(perturbations.perturb('truncate', { card: 'gear', source: 'r1:1', fold: gearBench([picks]), picks })).toBeNull();
  });
});
