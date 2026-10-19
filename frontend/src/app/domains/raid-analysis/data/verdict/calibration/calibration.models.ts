import type { ToneLevel } from '../tone.models';
import type { SpecRole } from '../../analysis/spec-role-service';
import type { ParseRanking } from '../../wcl/wcl.models';
import type { RotationParseMeasures } from '../../rotation/rotation-data-source';
import type { DefensiveParseMeasures } from '../../defensive/defensive-data-source';
import type { GearParseMeasures } from '../../gear/gear-data-source';
import type { BurstParseMeasures } from '../../burst-windows/burst-data-source';

/** The invariant tally key for Bloodlust rows judged against a lust outside the bench's band, which must stay empty. */
export const OUTSIDE_BAND = 'outside-band';

/** `graded` keeps the tone calibration armed, `comparison` keeps numbers and counts without a graded color, `hidden` is a construct known invalid. */
type CalibrationStatus = 'graded' | 'comparison' | 'hidden';

/** One judged test of a family on a held-out top log, at the tone the rules gave before calibration. */
export interface HeldOutRow {
  family: string;
  level: ToneLevel;
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

/** One card's measures of the contrast logs it could read, in the order of its own `sources`. */
export interface ContrastCard<T> {
  sources: ParseRanking[];
  per_parse: T[];
}

/** Weaker ranked logs of one spec and encounter, measured by the benches' own transforms; a card none of them could be read for is null. */
export interface ContrastBench {
  spec: string;
  encounter_id: number;
  /** The ingest version and plan key the measures were baked under; another one fetches the cohort again. */
  signature: string;
  fetched_at_s: number;
  /** The cohort as picked from the rankings page, before a card dropped an unreadable log. */
  sources: ParseRanking[];
  rotation: ContrastCard<RotationParseMeasures> | null;
  defensive: ContrastCard<DefensiveParseMeasures> | null;
  gear: ContrastCard<GearParseMeasures> | null;
  burst: ContrastCard<BurstParseMeasures> | null;
}

/** One pull's tests of a family and how many of them it flagged amber or red. */
export type PullFlags = [tests: number, flagged: number];

/** A family's flags per pull on held-out top logs and on contrast logs, the unit the bootstrap resamples. */
export interface DiscriminationSample {
  top: PullFlags[];
  contrast: PullFlags[];
}

/** How much more often a family flags contrast logs than held-out top logs. */
export interface Discrimination {
  topPulls: number;
  contrastPulls: number;
  /** Flags per test, smoothed by the rule of succession, so a family that never flags a top log still has a finite lift. */
  topRate: number;
  contrastRate: number;
  lift: number;
  liftLower: number;
  /** The chance a contrast pull's flag share is above a top pull's, ties counting half. */
  auc: number;
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
  /** Contrast logs judged against the full benches; zero until the cohort is fetched. */
  contrast_pulls: number;
  discrimination: Record<string, DiscriminationSample>;
}

/** The tone a family may reach on one spec, and why. */
export interface FamilyVerdict {
  status: CalibrationStatus;
  cap: ToneLevel;
  reason: string;
}

/** One check a card shows without a color, and why. */
export interface NotGradedNote {
  label: string;
  reason: string;
}

export interface FamilyCalibration {
  tier: ToneLevel;
  pooled: FlagTally;
  /** One-sided Clopper-Pearson upper bounds of the pooled red and amber rates. */
  upper: { red: number; amber: number };
  detection: DetectionTally;
  /** Over every spec; null for a family no tone arms on, or before enough contrast pulls. */
  discrimination: Discrimination | null;
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
  contrast_pulls: number;
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
