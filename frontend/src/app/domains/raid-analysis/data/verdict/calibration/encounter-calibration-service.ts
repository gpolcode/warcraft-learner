import { inject, Injectable } from '@angular/core';
import { SpecRoleService } from '../../analysis/spec-role-service';
import { FINDING_REGISTRY } from '../finding-registry';
import { InjectedMistake } from '../finding-family.models';
import { ToneLevel } from '../tone.models';
import { BloodlustJudgeService } from '../../rotation/bloodlust-judge-service';
import { DetectionTally, EncounterCalibration, FlagTally, HeldOutRow, InvariantTally, OUTSIDE_BAND, PageLoad } from './calibration.models';
import { EncounterBenches, HeldOutCase, HeldOutCaseService } from './held-out-case-service';
import { InjectedMistakeService } from './injected-mistake-service';
import { Perturbation, PERTURBATIONS, PerturbationService } from './perturbation-service';
import { RotationHeldOutService } from './rotation-held-out-service';

const FAMILY_BY_ID = new Map(FINDING_REGISTRY.map(family => [family.id, family]));

/** Runs every held-out top log of one spec and encounter through the judges, plain, with each injected mistake and under each perturbation. */
@Injectable({ providedIn: 'root' })
export class EncounterCalibrationService {
  private readonly cases = inject(HeldOutCaseService);
  private readonly mistakes = inject(InjectedMistakeService);
  private readonly perturbations = inject(PerturbationService);
  private readonly rotation = inject(RotationHeldOutService);
  private readonly lust = inject(BloodlustJudgeService);
  private readonly specRoles = inject(SpecRoleService);

  calibrate(spec: string, encounterId: number, benches: EncounterBenches, signature: string): EncounterCalibration {
    const heldOut = this.cases.cases(benches, spec);
    const base = heldOut.map(entry => this.cases.judge(entry));
    return {
      spec, encounter_id: encounterId, role: this.specRoles.role(spec), signature,
      pulls: new Set(heldOut.map(entry => entry.source)).size,
      families: this.tally(base.flat()),
      page: this.page(heldOut, base),
      detection: this.detection(heldOut, base),
      invariants: Object.fromEntries(PERTURBATIONS.map(name => [name, this.invariant(name, heldOut, base)])),
      unfoldable: this.cases.unfoldable(benches),
    };
  }

  /** `amber` counts every row flagged amber or red, `red` the red ones. */
  tally(rows: readonly HeldOutRow[]): Record<string, FlagTally> {
    const tallies: Record<string, FlagTally> = {};
    for (const row of rows) {
      const tally = tallies[row.family] ??= { tests: 0, amber: 0, red: 0 };
      tally.tests += 1;
      if (row.level === 'amber' || row.level === 'red') tally.amber += 1;
      if (row.level === 'red') tally.red += 1;
    }
    return tallies;
  }

  /** Rows of one held-out pull add up across its benches; a page counts each tone once. */
  private page(heldOut: readonly HeldOutCase[], base: readonly HeldOutRow[][]): PageLoad {
    const rows = base.flat();
    return {
      pulls: new Set(heldOut.map(entry => entry.source)).size,
      amber: rows.filter(row => row.level === 'amber').length,
      red: rows.filter(row => row.level === 'red').length,
    };
  }

  /** A trial is a variant the family still judges; it detects the mistake when it flags more than the plain log. */
  private detection(heldOut: readonly HeldOutCase[], base: readonly HeldOutRow[][]): Record<string, DetectionTally> {
    const detection: Record<string, DetectionTally> = {};
    const mistakes = new Set<InjectedMistake>(FINDING_REGISTRY.flatMap(family => family.injectedMistakes));
    heldOut.forEach((entry, index) => {
      for (const mistake of mistakes) {
        for (const variant of this.mistakes.variants(mistake, entry)) {
          this.addTrials(detection, mistake, base[index] ?? [], this.cases.judge(variant));
        }
      }
    });
    return detection;
  }

  private addTrials(detection: Record<string, DetectionTally>, mistake: InjectedMistake, before: readonly HeldOutRow[], after: readonly HeldOutRow[]): void {
    for (const family of FINDING_REGISTRY.filter(entry => entry.injectedMistakes.includes(mistake))) {
      if (!after.some(row => row.family === family.id)) continue;
      const tally = detection[family.id] ??= { trials: 0, detected: 0 };
      tally.trials += 1;
      if (this.flagged(after, family.id) > this.flagged(before, family.id)) tally.detected += 1;
    }
  }

  /** A blue family's claim is its count, so blue detects it; every other family must reach amber. */
  private flagged(rows: readonly HeldOutRow[], familyId: string): number {
    const least: ToneLevel = FAMILY_BY_ID.get(familyId)?.tier === 'blue' ? 'blue' : 'amber';
    const levels: ToneLevel[] = least === 'blue' ? ['blue', 'amber', 'red'] : ['amber', 'red'];
    return rows.filter(row => row.family === familyId && levels.includes(row.level)).length;
  }

  /** Compares each family's flags on the logs the perturbation changes, before and after. */
  private invariant(name: Perturbation, heldOut: readonly HeldOutCase[], base: readonly HeldOutRow[][]): Record<string, InvariantTally> {
    const before: HeldOutRow[] = [];
    const after: HeldOutRow[] = [];
    const outside: HeldOutRow[] = [];
    heldOut.forEach((entry, index) => {
      const perturbed = this.perturbations.perturb(name, entry);
      if (!perturbed) return;
      before.push(...base[index] ?? []);
      after.push(...this.cases.judge(perturbed));
      if (perturbed.card === 'rotation' && name.startsWith('lust')) outside.push(...this.outsideBand(perturbed));
    });
    const baseTally = this.tally(before);
    const perturbedTally = this.tally(after);
    const none: FlagTally = { tests: 0, amber: 0, red: 0 };
    const families = new Set([...Object.keys(baseTally), ...Object.keys(perturbedTally)]);
    const tallies: Record<string, InvariantTally> = Object.fromEntries([...families].map(family => [
      family, { base: baseTally[family] ?? none, perturbed: perturbedTally[family] ?? none },
    ]));
    if (name.startsWith('lust')) tallies[OUTSIDE_BAND] = { base: none, perturbed: this.tally(outside)[OUTSIDE_BAND] ?? none };
    return tallies;
  }

  /** Every Bloodlust row a cooldown gets while the shifted lust sits outside its band, each counted as a test under one key. */
  private outsideBand(heldOut: Extract<HeldOutCase, { card: 'rotation' }>): HeldOutRow[] {
    const lustS = heldOut.log.measures.lust_s;
    if (lustS === null) return [];
    return heldOut.fold.major_cooldowns.flatMap(cooldown => {
      const reference = this.lust.reference(heldOut.fold.per_parse, heldOut.fold.sources.map(source => source.duration_s), cooldown.name);
      if (!this.lust.wantsLust(reference) || this.lust.judgeBand(lustS, reference).inside) return [];
      const rows = this.rotation.lustRows(heldOut.fold, heldOut.log, cooldown.name);
      return [{ family: OUTSIDE_BAND, level: rows.length ? 'amber' : 'neutral' }];
    });
  }
}
