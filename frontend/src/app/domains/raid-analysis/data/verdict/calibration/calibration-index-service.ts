import { inject, Injectable } from '@angular/core';
import { SpecRole, SpecRoleService } from '../../analysis/spec-role-service';
import { FINDING_REGISTRY } from '../finding-registry';
import { ToneLevel } from '../tone.models';
import { VERDICT_CHOICES } from '../verdict-choices';
import { ArmingService, NOT_GRADED } from './arming-service';
import { CalibrationIndex, Discrimination, EncounterCalibration, FamilyVerdict, FlagTally, InvariantResult, OUTSIDE_BAND, PageLoad } from './calibration.models';
import { COMPARISON } from './calibration-caps-service';
import { RegistryHashService } from './registry-hash-service';
import { DEAD_IN_WINDOW_FAMILY } from '../../defensive/defensive-judge-service';

const CHOICES = VERDICT_CHOICES.calibration;
const NONE: FlagTally = { tests: 0, amber: 0, red: 0 };
/** Perturbations whose flag rate may grow by at most the chosen ratio. */
const RATE_BOUND = new Set(['truncate', 'death', 'death-rez']);
const BURST_FAMILY = 'burst.window';
/** An inserted death is the fact this family states, so a death perturbation raising its rate is the family catching it, not a confound. */
const DEATH_FACT = DEAD_IN_WINDOW_FAMILY.id;
const DEATH_INSERTIONS = new Set(['death', 'death-rez']);
/** Damage is read by no cadence check and by no coverage verdict, and burst reads it only as a ratio to the log's own average. */
type DiscriminationsByFamily = Readonly<Record<string, Discrimination | null>>;

interface Separation {
  all: DiscriminationsByFamily;
  roles: Partial<Record<SpecRole, DiscriminationsByFamily>>;
  specs: Record<string, DiscriminationsByFamily>;
}

/** A verdict lost because the contrast cohort has not filled in yet is a missing measurement, not a rule that got worse. */
const PENDING_REASONS = new Set<string>([NOT_GRADED.contrastPending]);

const DAMAGE_BLIND = new Set(FINDING_REGISTRY
  .filter(family => family.id.startsWith('rotation.') || family.id.startsWith('defensive.') || family.id === BURST_FAMILY)
  .map(family => family.id));

/** Pools the per-encounter calibration into the index the runtime reads, and answers the cap a family may reach on a page. */
@Injectable({ providedIn: 'root' })
export class CalibrationIndexService {
  private readonly arming = inject(ArmingService);
  private readonly specRoles = inject(SpecRoleService);
  private readonly hashes = inject(RegistryHashService);

  build(encounters: readonly EncounterCalibration[]): CalibrationIndex {
    const invariants = this.invariants(encounters);
    const failed = new Set(invariants.filter(result => !result.passed).map(result => result.family));
    const separation = this.separation(encounters);
    const families = this.arming.families(encounters, separation.all);
    const roles = Object.fromEntries(this.arming.roles().map(role => [
      role, this.roleVerdicts(encounters, role, failed, [separation.roles[role] ?? {}, separation.all]),
    ])) as Record<SpecRole, Record<string, FamilyVerdict>>;
    const specs = this.specVerdicts(encounters, roles, failed, separation);
    return {
      registry_hash: this.hashes.registryHash(),
      encounters: encounters.length,
      pulls: encounters.reduce((sum, encounter) => sum + encounter.pulls, 0),
      contrast_pulls: encounters.reduce((sum, encounter) => sum + encounter.contrast_pulls, 0),
      families, specs, demoted: this.demoted(encounters, specs),
      page: { measured: this.measuredPage(encounters), armed: this.armedPage(encounters, specs) },
      invariants,
      unfoldable: this.unfoldable(encounters),
    };
  }

  /** What fails a recompute: a page over budget, a failed invariant on a graded family, a family graded before and not now. */
  breaches(previous: CalibrationIndex | null, next: CalibrationIndex): string[] {
    const page = Object.entries(next.page.armed).flatMap(([role, load]) => this.arming.breach(load) ? [`Page budget: ${role} shows ${this.perPull(load)} per held-out top pull.`] : []);
    const invariants = next.invariants.filter(result => !result.passed && this.wasGraded(previous, result.family))
      .map(result => `Invariant ${result.name} fails for ${result.family}: ${result.baseRate.toFixed(3)} before, ${result.perturbedRate.toFixed(3)} after.`);
    const lost = previous ? Object.entries(previous.specs).flatMap(([spec, verdicts]) => Object.entries(verdicts)
      .filter(([family, verdict]) => verdict.status === 'graded' && this.rank(next.specs[spec]?.[family]?.cap) < this.rank(verdict.cap))
      .filter(([family]) => !PENDING_REASONS.has(next.specs[spec]?.[family]?.reason ?? ''))
      .map(([family, verdict]) => `${family} on ${spec} lost its ${verdict.cap} grade: ${next.specs[spec]?.[family]?.reason ?? COMPARISON.reason}`)) : [];
    return [...page, ...invariants, ...lost];
  }

  perPull(load: PageLoad): string {
    const per = (rows: number): string => (load.pulls ? rows / load.pulls : 0).toFixed(2);
    return `${per(load.red)} red and ${per(load.amber)} amber`;
  }

  private wasGraded(previous: CalibrationIndex | null, family: string): boolean {
    return previous?.families[family]?.verdict.status === 'graded' && this.rank(previous.families[family].verdict.cap) >= this.rank('amber');
  }

  private rank(level: ToneLevel | undefined): number {
    return ['neutral', 'blue', 'amber', 'red'].indexOf(level ?? 'neutral');
  }

  private ofRole(encounters: readonly EncounterCalibration[], role: SpecRole): EncounterCalibration[] {
    return encounters.filter(encounter => encounter.role === role);
  }

  /** Discrimination on every pool a verdict may read, each measured once: every spec, every role, and every spec together. */
  private separation(encounters: readonly EncounterCalibration[]): Separation {
    const specs = [...new Set(encounters.map(encounter => encounter.spec))];
    return {
      all: this.arming.discriminations(encounters, 'all'),
      roles: Object.fromEntries(this.arming.roles().map(role => [role, this.arming.discriminations(this.ofRole(encounters, role), role)])),
      specs: Object.fromEntries(specs.map(spec => [spec, this.arming.discriminations(encounters.filter(encounter => encounter.spec === spec), spec)])),
    };
  }

  /** The most specific pool's measurement, as a tone is decided on the most specific pool with its minimum tests. */
  private firstMeasured(pools: readonly DiscriminationsByFamily[], familyId: string): Discrimination | null {
    return pools.map(pool => pool[familyId] ?? null).find(measured => measured !== null) ?? null;
  }

  /** Role verdicts pool role then global, fit the role's page budget, and drop a family whose invariant failed. */
  private roleVerdicts(
    encounters: readonly EncounterCalibration[], role: SpecRole, failed: ReadonlySet<string>, separation: readonly DiscriminationsByFamily[],
  ): Record<string, FamilyVerdict> {
    const mine = this.ofRole(encounters, role);
    const rolePool = this.arming.pool(mine);
    const globalPool = this.arming.pool(encounters);
    const detection = this.arming.poolDetection(encounters);
    const verdicts = Object.fromEntries(FINDING_REGISTRY.map(family => {
      const verdict = this.arming.verdict(
        family, [rolePool[family.id] ?? NONE, globalPool[family.id] ?? NONE], detection[family.id] ?? { trials: 0, detected: 0 }, this.firstMeasured(separation, family.id),
      );
      return [family.id, failed.has(family.id) && verdict.status === 'graded' && this.rank(verdict.cap) >= this.rank('amber')
        ? { status: 'comparison' as const, cap: COMPARISON.cap, reason: NOT_GRADED.invariant } : verdict];
    }));
    return this.arming.fitPage(rolePool, verdicts, this.pulls(mine));
  }

  /** A spec pools its own tests first; its verdict never outranks its role's, which carries the page budget. */
  private specVerdicts(
    encounters: readonly EncounterCalibration[], roles: Record<SpecRole, Record<string, FamilyVerdict>>, failed: ReadonlySet<string>,
    separation: Separation,
  ): Record<string, Record<string, FamilyVerdict>> {
    const specs = [...new Set(encounters.map(encounter => encounter.spec))].sort();
    const globalPool = this.arming.pool(encounters);
    const detection = this.arming.poolDetection(encounters);
    return Object.fromEntries(specs.map(spec => {
      const role = this.specRoles.role(spec);
      const specPool = this.arming.pool(encounters.filter(encounter => encounter.spec === spec));
      const rolePool = this.arming.pool(this.ofRole(encounters, role));
      const pools = [separation.specs[spec] ?? {}, separation.roles[role] ?? {}, separation.all];
      return [spec, Object.fromEntries(FINDING_REGISTRY.map(family => {
        const own = this.arming.verdict(
          family, [specPool[family.id] ?? NONE, rolePool[family.id] ?? NONE, globalPool[family.id] ?? NONE], detection[family.id] ?? { trials: 0, detected: 0 },
          this.firstMeasured(pools, family.id),
        );
        const ceiling = roles[role][family.id] ?? COMPARISON;
        const lower = this.rank(own.cap) <= this.rank(ceiling.cap) ? own : ceiling;
        return [family.id, failed.has(family.id) ? ceiling : lower];
      }))];
    }));
  }

  /** A bench whose own leave-one-out rate the pooled rate would rarely give is demoted to comparison there alone. */
  private demoted(encounters: readonly EncounterCalibration[], specs: CalibrationIndex['specs']): CalibrationIndex['demoted'] {
    const pooled = this.arming.pool(encounters);
    const demoted: CalibrationIndex['demoted'] = {};
    for (const encounter of encounters) {
      const families = Object.entries(encounter.families)
        .filter(([family, tally]) => this.rank(specs[encounter.spec]?.[family]?.cap) >= this.rank('amber') && this.arming.anomalous(tally, pooled[family] ?? NONE))
        .map(([family]) => family);
      if (families.length) (demoted[encounter.spec] ??= {})[String(encounter.encounter_id)] = families;
    }
    return demoted;
  }

  private measuredPage(encounters: readonly EncounterCalibration[]): Record<SpecRole, PageLoad> {
    return Object.fromEntries(this.arming.roles().map(role => {
      const mine = this.ofRole(encounters, role);
      return [role, mine.reduce((sum, encounter) => ({
        pulls: sum.pulls + encounter.page.pulls, amber: sum.amber + encounter.page.amber, red: sum.red + encounter.page.red,
      }), { pulls: 0, amber: 0, red: 0 })];
    })) as Record<SpecRole, PageLoad>;
  }

  /** Each spec's rows under its own caps, so the budget is checked as the page shows it. */
  private armedPage(encounters: readonly EncounterCalibration[], specs: CalibrationIndex['specs']): Record<SpecRole, PageLoad> {
    return Object.fromEntries(this.arming.roles().map(role => {
      const loads = this.ofRole(encounters, role).map(encounter => this.arming.armedLoad(
        encounter.families, Object.fromEntries(Object.entries(specs[encounter.spec] ?? {}).map(([family, verdict]) => [family, verdict.cap])), encounter.page.pulls,
      ));
      return [role, loads.reduce((sum, load) => ({ pulls: sum.pulls + load.pulls, amber: sum.amber + load.amber, red: sum.red + load.red }), { pulls: 0, amber: 0, red: 0 })];
    })) as Record<SpecRole, PageLoad>;
  }

  private pulls(encounters: readonly EncounterCalibration[]): number {
    return encounters.reduce((sum, encounter) => sum + encounter.pulls, 0);
  }

  private invariants(encounters: readonly EncounterCalibration[]): InvariantResult[] {
    const names = [...new Set(encounters.flatMap(encounter => Object.keys(encounter.invariants)))];
    return names.flatMap(name => {
      const families: Record<string, { base: FlagTally; perturbed: FlagTally }> = {};
      for (const encounter of encounters) {
        for (const [family, tally] of Object.entries(encounter.invariants[name] ?? {})) {
          const sum = families[family] ??= { base: NONE, perturbed: NONE };
          sum.base = this.arming.add(sum.base, tally.base);
          sum.perturbed = this.arming.add(sum.perturbed, tally.perturbed);
        }
      }
      return Object.entries(families)
        .filter(([family]) => !(DEATH_INSERTIONS.has(name) && family === DEATH_FACT))
        .flatMap(([family, tally]) => this.invariant(name, family, tally.base, tally.perturbed));
    });
  }

  private invariant(name: string, family: string, base: FlagTally, perturbed: FlagTally): InvariantResult[] {
    const raw = (tally: FlagTally): number => tally.tests ? tally.amber / tally.tests : 0;
    const result = (passed: boolean, baseRate: number, perturbedRate: number): InvariantResult[] => [{ name, family, baseRate, perturbedRate, passed }];
    if (RATE_BOUND.has(name)) return [this.rateBound(name, family, base, perturbed)];
    if (name.startsWith('lust') && family === OUTSIDE_BAND) return result(perturbed.amber === 0, 0, raw(perturbed));
    if (name === 'jitter' && family === BURST_FAMILY) return result(Math.abs(raw(perturbed) - raw(base)) < CHOICES.jitterRateShift, raw(base), raw(perturbed));
    if (name === 'damage-scale' && DAMAGE_BLIND.has(family)) {
      return result(perturbed.amber === base.amber && perturbed.red === base.red && perturbed.tests === base.tests, raw(base), raw(perturbed));
    }
    return [];
  }

  /** Rates are smoothed by the rule of succession, so a family that never flags still has a rate the bound can scale. */
  private rateBound(name: string, family: string, base: FlagTally, perturbed: FlagTally): InvariantResult {
    const smoothed = (tally: FlagTally): number => (tally.amber + 1) / (tally.tests + 2);
    // A perturbation that leaves no test flags nothing; smoothing its empty tally would read as the 0.5 prior.
    if (!perturbed.tests) return { name, family, baseRate: smoothed(base), perturbedRate: 0, passed: true };
    // A perturbation that flags nothing cannot have raised the rate, however few tests it left.
    const passed = perturbed.amber === 0 || smoothed(perturbed) <= CHOICES.perturbedRateRatio * smoothed(base);
    return { name, family, baseRate: smoothed(base), perturbedRate: smoothed(perturbed), passed };
  }

  private unfoldable(encounters: readonly EncounterCalibration[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const bench of encounters.flatMap(encounter => encounter.unfoldable)) counts[bench] = (counts[bench] ?? 0) + 1;
    return counts;
  }
}
