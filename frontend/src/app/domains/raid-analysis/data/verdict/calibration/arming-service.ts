import { inject, Injectable } from '@angular/core';
import { SpecRole } from '../../analysis/spec-role-service';
import { DistributionService } from '../distribution-service';
import { FindingFamily } from '../finding-family.models';
import { FINDING_REGISTRY } from '../finding-registry';
import { ToneLevel } from '../tone.models';
import { VERDICT_CHOICES } from '../verdict-choices';
import { DetectionTally, EncounterCalibration, FamilyCalibration, FamilyVerdict, FlagTally, PageLoad } from './calibration.models';

const ROLES: readonly SpecRole[] = ['dps', 'tank', 'healer'];
const CHOICES = VERDICT_CHOICES.calibration;
const NONE: FlagTally = { tests: 0, amber: 0, red: 0 };

export const NOT_GRADED = {
  tooOften: 'Not graded: this check flags top raiders too often.',
  tooFew: 'Not graded: too few held-out top logs to measure how often it flags them.',
  weak: 'Not graded: it misses the mistakes it claims to catch.',
  page: 'Not graded: the page would flag top raiders too often with it.',
  invariant: 'Not graded: it flags more often when the pull is cut short, the player dies or the lust moves.',
} as const;

/** A tone-level tally: how many tests, and how many flagged at that tone. */
interface ToneEvidence {
  upper: number;
  tests: number;
}

/** Pools held-out tallies and decides, per family, the tone calibration lets it reach. */
@Injectable({ providedIn: 'root' })
export class ArmingService {
  private readonly distribution = inject(DistributionService);

  add(a: FlagTally, b: FlagTally | undefined): FlagTally {
    return b ? { tests: a.tests + b.tests, amber: a.amber + b.amber, red: a.red + b.red } : a;
  }

  /** Sums each family's tallies over the encounters. */
  pool(encounters: readonly EncounterCalibration[]): Record<string, FlagTally> {
    const pooled: Record<string, FlagTally> = {};
    for (const encounter of encounters) {
      for (const [family, tally] of Object.entries(encounter.families)) pooled[family] = this.add(pooled[family] ?? NONE, tally);
    }
    return pooled;
  }

  poolDetection(encounters: readonly EncounterCalibration[]): Record<string, DetectionTally> {
    const pooled: Record<string, DetectionTally> = {};
    for (const encounter of encounters) {
      for (const [family, tally] of Object.entries(encounter.detection)) {
        const sum = pooled[family] ??= { trials: 0, detected: 0 };
        sum.trials += tally.trials;
        sum.detected += tally.detected;
      }
    }
    return pooled;
  }

  /** The pooled figures of every family over every spec. */
  families(encounters: readonly EncounterCalibration[]): Record<string, FamilyCalibration> {
    const pooled = this.pool(encounters);
    const detection = this.poolDetection(encounters);
    return Object.fromEntries(FINDING_REGISTRY.map(family => {
      const tally = pooled[family.id] ?? NONE;
      const found = detection[family.id] ?? { trials: 0, detected: 0 };
      return [family.id, {
        tier: family.tier, pooled: tally, detection: found,
        upper: { red: this.upper(tally.red, tally.tests), amber: this.upper(tally.amber, tally.tests) },
        verdict: this.verdict(family, [tally], found),
      }];
    }));
  }

  /** `pools` run from the most specific to the global one; each tone is decided on the first pool with its minimum tests. */
  verdict(family: FindingFamily, pools: readonly FlagTally[], detection: DetectionTally): FamilyVerdict {
    if (family.tier === 'blue' || family.tier === 'neutral') return { status: 'graded', cap: family.tier, reason: 'Claims a count of top raiders, not a mistake.' };
    const amber = this.evidence(pools, 'amber');
    const red = this.evidence(pools, 'red');
    const amberArms = this.arms(amber, 'amber') && this.powered(family, detection, 'amber');
    if (!amberArms) return { status: 'comparison', cap: 'neutral', reason: this.whyNot(family, amber, 'amber', detection) };
    const redArms = family.tier === 'red' && this.arms(red, 'red') && this.powered(family, detection, 'red');
    return { status: 'graded', cap: redArms ? 'red' : 'amber', reason: redArms ? 'Graded red.' : 'Graded amber.' };
  }

  /** Lowers a verdict by one tone, as the page budget or an invariant demands. */
  demote(verdict: FamilyVerdict, reason: string): FamilyVerdict {
    if (verdict.cap === 'red') return { status: 'graded', cap: 'amber', reason };
    return { status: 'comparison', cap: 'neutral', reason };
  }

  /** Colored rows per pull under the given caps: a family capped at amber shows its red rows as amber. */
  armedLoad(tallies: Readonly<Record<string, FlagTally>>, caps: Readonly<Record<string, ToneLevel>>, pulls: number): PageLoad {
    let amber = 0;
    let red = 0;
    for (const [family, tally] of Object.entries(tallies)) {
      const cap = caps[family] ?? 'neutral';
      if (cap === 'red') { red += tally.red; amber += tally.amber - tally.red; }
      if (cap === 'amber') amber += tally.amber;
    }
    return { pulls, amber, red };
  }

  /** Demotes the family that adds the most to whichever tone breaks the budget, until the role's page fits it. */
  fitPage(tallies: Readonly<Record<string, FlagTally>>, verdicts: Record<string, FamilyVerdict>, pulls: number): Record<string, FamilyVerdict> {
    const fitted = { ...verdicts };
    for (;;) {
      const caps = Object.fromEntries(Object.entries(fitted).map(([family, verdict]) => [family, verdict.cap]));
      const load = this.armedLoad(tallies, caps, pulls);
      const breach = this.breach(load);
      if (!breach) return fitted;
      const [worst] = Object.entries(fitted)
        .filter(([, verdict]) => breach === 'red' ? verdict.cap === 'red' : verdict.cap === 'red' || verdict.cap === 'amber')
        .sort((a, b) => this.weight(tallies[b[0]], b[1].cap, breach) - this.weight(tallies[a[0]], a[1].cap, breach));
      if (!worst) return fitted;
      fitted[worst[0]] = this.demote(worst[1], NOT_GRADED.page);
    }
  }

  /** Null within the per-role page budget, else the tone over it. */
  breach(load: PageLoad): Extract<ToneLevel, 'red' | 'amber'> | null {
    if (!load.pulls) return null;
    if (load.red / load.pulls > VERDICT_CHOICES.pageBudget.red) return 'red';
    return load.amber / load.pulls > VERDICT_CHOICES.pageBudget.amber ? 'amber' : null;
  }

  /** True when this bench's own rate is too high to be the pooled rate, at the anomaly p. */
  anomalous(bench: FlagTally, pooled: FlagTally): boolean {
    if (!bench.amber || !pooled.tests) return false;
    return this.distribution.binomialUpperTail(bench.amber, bench.tests, pooled.amber / pooled.tests) < CHOICES.anomalyP;
  }

  upper(flags: number, tests: number): number {
    return this.distribution.clopperPearsonUpper(flags, tests, CHOICES.armingConfidence);
  }

  roles(): readonly SpecRole[] {
    return ROLES;
  }

  private weight(tally: FlagTally | undefined, cap: ToneLevel, breach: 'red' | 'amber'): number {
    if (!tally) return 0;
    if (breach === 'red') return tally.red;
    return cap === 'red' ? tally.amber - tally.red : tally.amber;
  }

  private evidence(pools: readonly FlagTally[], tone: 'red' | 'amber'): ToneEvidence | null {
    const pool = pools.find(entry => entry.tests >= VERDICT_CHOICES.arming[tone].minPooledTests);
    return pool ? { upper: this.upper(pool[tone], pool.tests), tests: pool.tests } : null;
  }

  private arms(evidence: ToneEvidence | null, tone: 'red' | 'amber'): boolean {
    return evidence !== null && evidence.upper <= VERDICT_CHOICES.arming[tone].bound;
  }

  /** A family that names mistakes must catch its floor's share of them; with no trial it has shown no power. */
  private powered(family: FindingFamily, detection: DetectionTally, tone: 'red' | 'amber'): boolean {
    if (!family.injectedMistakes.length) return true;
    return detection.trials > 0 && detection.detected / detection.trials >= CHOICES.detectionFloor[tone];
  }

  private whyNot(family: FindingFamily, amber: ToneEvidence | null, tone: 'amber', detection: DetectionTally): string {
    if (!amber) return NOT_GRADED.tooFew;
    if (!this.arms(amber, tone)) return NOT_GRADED.tooOften;
    return this.powered(family, detection, tone) ? NOT_GRADED.tooOften : NOT_GRADED.weak;
  }
}
