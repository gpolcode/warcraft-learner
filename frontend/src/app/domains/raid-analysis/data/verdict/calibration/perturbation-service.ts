import { inject, Injectable } from '@angular/core';
import { PullModel } from '../../analysis/pull-model-service';
import { VERDICT_CHOICES } from '../verdict-choices';
import { HeldOutCase } from './held-out-case-service';
import { HeldOutRowService } from './held-out-row-service';

/** The confounds top logs rarely contain, put into a held-out pull to check each rule holds its rate under them. */
export const PERTURBATIONS = ['truncate', 'death', 'death-rez', 'lust-120', 'lust-180', 'jitter', 'damage-scale'] as const;

export type Perturbation = (typeof PERTURBATIONS)[number];

const CHOICES = VERDICT_CHOICES.calibration;
const HASH_SEED = 2166136261;
const HASH_PRIME = 16777619;
const UINT32 = 2 ** 32;

type TimedCase = Extract<HeldOutCase, { card: 'rotation' | 'defensive' }>;

/** Each perturbation is drawn from a generator seeded on the log and the perturbation, so a recompute reproduces it. */
@Injectable({ providedIn: 'root' })
export class PerturbationService {
  private readonly rows = inject(HeldOutRowService);

  /** Null where the perturbation changes nothing the card reads. */
  perturb(name: Perturbation, heldOut: HeldOutCase): HeldOutCase | null {
    if (heldOut.card === 'gear') return null;
    const draw = this.generator(`${heldOut.source}|${heldOut.card}|${name}`);
    const durationS = heldOut.log.model.fightDurationS;
    const atS = durationS * (CHOICES.perturbedShare.from + draw() * (CHOICES.perturbedShare.to - CHOICES.perturbedShare.from));
    switch (name) {
      case 'truncate': return this.withModel(heldOut, this.rows.withDeaths(durationS, atS, []));
      case 'death': return this.withModel(heldOut, this.rows.withDeaths(durationS, durationS, [[atS, durationS]]));
      case 'death-rez': return this.withModel(heldOut, this.rows.withDeaths(durationS, durationS, [[atS, Math.min(durationS, atS + CHOICES.rezAfterS)]]));
      case 'lust-120': return this.withLust(heldOut, CHOICES.lustShiftsS[0]);
      case 'lust-180': return this.withLust(heldOut, CHOICES.lustShiftsS[1]);
      case 'jitter': return this.jittered(heldOut, draw);
      case 'damage-scale': return this.scaled(heldOut);
    }
  }

  /** A dead player casts nothing, so the uses inside a dead span go with the death. */
  private withModel(heldOut: TimedCase, model: PullModel): HeldOutCase {
    const alive = (castS: number): boolean => !model.deadSpans.some(([diedS, backS]) => diedS <= castS && castS < backS);
    const keep = (casts: Readonly<Record<string, readonly number[]>>): Record<string, number[]> =>
      Object.fromEntries(Object.entries(casts).map(([name, times]) => [name, times.filter(alive)]));
    if (heldOut.card === 'rotation') {
      return { ...heldOut, log: { ...heldOut.log, model, measures: { ...heldOut.log.measures, cd_casts_s: keep(heldOut.log.measures.cd_casts_s) } } };
    }
    return { ...heldOut, log: { ...heldOut.log, model, casts: keep(heldOut.log.casts) } };
  }

  private withLust(heldOut: TimedCase, lustS: number): HeldOutCase | null {
    if (heldOut.card !== 'rotation') return null;
    return { ...heldOut, log: { ...heldOut.log, measures: { ...heldOut.log.measures, lust_s: lustS } } };
  }

  private jittered(heldOut: TimedCase, draw: () => number): HeldOutCase {
    const durationS = heldOut.log.model.fightDurationS;
    const jitter = (casts: Readonly<Record<string, readonly number[]>>): Record<string, number[]> => Object.fromEntries(Object.entries(casts).map(([name, times]) => [
      name, times.map(castS => Math.min(durationS, Math.max(0, castS + (draw() * 2 - 1) * CHOICES.jitterS))).sort((a, b) => a - b),
    ]));
    if (heldOut.card === 'rotation') {
      return { ...heldOut, log: { ...heldOut.log, measures: { ...heldOut.log.measures, cd_casts_s: jitter(heldOut.log.measures.cd_casts_s) } } };
    }
    return { ...heldOut, log: { ...heldOut.log, casts: jitter(heldOut.log.casts) } };
  }

  /** Only the defensive windows read damage; every other check reads none. */
  private scaled(heldOut: TimedCase): HeldOutCase {
    if (heldOut.card === 'rotation') return heldOut;
    const covered = new Map([...heldOut.log.covered].map(([index, damage]) => [index, damage * CHOICES.damageScale]));
    return { ...heldOut, log: { ...heldOut.log, covered } };
  }

  /** FNV-1a over the key seeds a mulberry32 stream. */
  private generator(key: string): () => number {
    let state = HASH_SEED;
    for (const char of key) state = Math.imul(state ^ char.charCodeAt(0), HASH_PRIME) >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / UINT32;
    };
  }
}
