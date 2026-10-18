import type { ToneLevel } from '../tone.models';
import type { SpecRole } from '../../analysis/spec-role-service';

/** `graded` keeps the tone calibration armed, `comparison` keeps numbers and counts without a graded color, `hidden` is a construct known invalid. */
export type CalibrationStatus = 'graded' | 'comparison' | 'hidden';

/** One judged test of a family on a held-out top log, at the tone the rules gave before calibration. */
export interface HeldOutRow {
  family: string;
  level: ToneLevel;
}

/** One held-out top log's rows across every bench of its encounter, keyed by its ranking. */
export interface HeldOutPull {
  source: string;
  rows: HeldOutRow[];
}

/** `amber` counts tests flagged amber or red, `red` those flagged red. */
export interface FlagTally {
  tests: number;
  amber: number;
  red: number;
}

/** Colored rows per held-out top pull. */
export interface PageLoad {
  pulls: number;
  amber: number;
  red: number;
}

export interface DetectionTally {
  trials: number;
  detected: number;
}

/** A family's flags with and without one perturbation, over the same held-out tests. */
export interface InvariantTally {
  base: FlagTally;
  perturbed: FlagTally;
}

/** What the harness measured on one spec and encounter, written beside its benches. */
export interface EncounterCalibration {
  spec: string;
  encounter_id: number;
  role: SpecRole;
  /** The benches' top logs and the registry hash; a change re-runs calibration only. */
  signature: string;
  pulls: number;
  families: Record<string, FlagTally>;
  page: PageLoad;
  detection: Record<string, DetectionTally>;
  /** Invariant name to family to its tallies. */
  invariants: Record<string, Record<string, InvariantTally>>;
  /** Benches without per-log measures, which the harness cannot fold. */
  unfoldable: string[];
}

/** The tone a family may reach on one spec, and why. */
export interface FamilyVerdict {
  status: CalibrationStatus;
  cap: ToneLevel;
  reason: string;
}

export interface FamilyCalibration {
  tier: ToneLevel;
  pooled: FlagTally;
  /** One-sided Clopper-Pearson upper bounds of the pooled red and amber rates. */
  upper: { red: number; amber: number };
  detection: DetectionTally;
  verdict: FamilyVerdict;
}

export interface InvariantResult {
  name: string;
  family: string;
  baseRate: number;
  perturbedRate: number;
  passed: boolean;
}

/** The pooled calibration the runtime reads; any mismatch with the running registry fails closed to comparison. */
export interface CalibrationIndex {
  registry_hash: string;
  encounters: number;
  pulls: number;
  /** Pooled over every spec. */
  families: Record<string, FamilyCalibration>;
  /** Spec to family to its verdict, from the most specific pool with enough tests. */
  specs: Record<string, Record<string, FamilyVerdict>>;
  /** Spec to encounter id to the families its own leave-one-out rate demotes there. */
  demoted: Record<string, Record<string, string[]>>;
  /** Colored rows per held-out top pull per role, before calibration and under the armed caps. */
  page: { measured: Record<SpecRole, PageLoad>; armed: Record<SpecRole, PageLoad> };
  invariants: InvariantResult[];
  /** Benches the harness could not fold, by bench name. */
  unfoldable: Record<string, number>;
}
