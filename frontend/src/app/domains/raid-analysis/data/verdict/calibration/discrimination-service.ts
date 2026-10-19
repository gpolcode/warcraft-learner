import { inject, Injectable } from '@angular/core';
import { quantileSorted } from 'd3-array';
import { DistributionService } from '../distribution-service';
import { VERDICT_CHOICES } from '../verdict-choices';
import { Discrimination, DiscriminationSample, EncounterCalibration, HeldOutRow, PullFlags } from './calibration.models';

const CHOICES = VERDICT_CHOICES.discrimination;

/** Measures how much more often a family flags weaker logs than held-out top logs, resampling whole pulls. */
@Injectable({ providedIn: 'root' })
export class DiscriminationService {
  private readonly distribution = inject(DistributionService);

  /** Per family, each pull's tests and amber or red flags; a pull without a test of the family adds nothing to it. */
  flagsByPull(pulls: readonly (readonly HeldOutRow[])[]): Record<string, PullFlags[]> {
    const byFamily: Record<string, PullFlags[]> = {};
    for (const rows of pulls) {
      const mine = new Map<string, PullFlags>();
      for (const row of rows) {
        const flags = mine.get(row.family) ?? [0, 0];
        mine.set(row.family, [flags[0] + 1, flags[1] + (row.level === 'amber' || row.level === 'red' ? 1 : 0)]);
      }
      for (const [family, flags] of mine) (byFamily[family] ??= []).push(flags);
    }
    return byFamily;
  }

  /** The top and contrast pulls of every encounter, for one family. */
  pool(encounters: readonly EncounterCalibration[], familyId: string): DiscriminationSample {
    const samples = encounters.map(encounter => encounter.discrimination[familyId]);
    return {
      top: samples.flatMap(sample => sample?.top ?? []),
      contrast: samples.flatMap(sample => sample?.contrast ?? []),
    };
  }

  /** Null until the pool holds the minimum contrast pulls and a top pull to compare them with. `seed` names the pool, so a recompute draws the same resamples. */
  measure(sample: DiscriminationSample, seed: string): Discrimination | null {
    const { top, contrast } = sample;
    if (contrast.length < CHOICES.minContrastPulls || !top.length) return null;
    const topRate = this.rate(top);
    const contrastRate = this.rate(contrast);
    return {
      topPulls: top.length, contrastPulls: contrast.length, topRate, contrastRate,
      lift: contrastRate / topRate,
      liftLower: this.liftLower(sample, seed),
      auc: this.auc(top.map(flags => this.share(flags)), contrast.map(flags => this.share(flags))),
    };
  }

  separates(discrimination: Discrimination): boolean {
    return discrimination.lift >= CHOICES.minLift && discrimination.liftLower >= CHOICES.minLiftLowerBound && discrimination.auc >= CHOICES.minAuc;
  }

  /** Smoothed flags per test over the pulls. */
  private rate(pulls: readonly PullFlags[]): number {
    let tests = 0;
    let flagged = 0;
    for (const [pullTests, pullFlagged] of pulls) { tests += pullTests; flagged += pullFlagged; }
    return (flagged + 1) / (tests + 2);
  }

  private share([tests, flagged]: PullFlags): number {
    return tests ? flagged / tests : 0;
  }

  /** Each group's pulls are resampled with replacement on their own, so a resample keeps both groups' sizes. */
  private liftLower({ top, contrast }: DiscriminationSample, seed: string): number {
    const draw = this.distribution.seededStream(seed);
    const resample = (pulls: readonly PullFlags[]): PullFlags[] => pulls.map(() => pulls[Math.floor(draw() * pulls.length)] ?? [0, 0]);
    const lifts = Array.from({ length: CHOICES.bootstrapResamples }, () => this.rate(resample(contrast)) / this.rate(resample(top)));
    return quantileSorted(lifts.sort((a, b) => a - b), CHOICES.liftBoundQuantile) ?? 0;
  }

  /** The Mann-Whitney statistic from midranks, which counts a tie as half. */
  private auc(top: readonly number[], contrast: readonly number[]): number {
    const all = [...top.map(value => ({ value, contrast: false })), ...contrast.map(value => ({ value, contrast: true }))].sort((a, b) => a.value - b.value);
    let contrastRanks = 0;
    for (let from = 0; from < all.length;) {
      let to = from;
      while (to + 1 < all.length && all[to + 1]?.value === all[from]?.value) to += 1;
      const midrank = (from + to) / 2 + 1;
      for (let at = from; at <= to; at += 1) if (all[at]?.contrast) contrastRanks += midrank;
      from = to + 1;
    }
    return (contrastRanks - contrast.length * (contrast.length + 1) / 2) / (contrast.length * top.length);
  }
}
