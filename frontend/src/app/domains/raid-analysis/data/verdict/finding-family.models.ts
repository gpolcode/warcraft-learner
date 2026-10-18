import { CostClass, ToneLevel } from './tone.models';

type DecisionRuleKind = 'interval' | 'excess-rate' | 'count' | 'mechanistic' | 'consensus' | 'fact';

/** The mistakes the harness injects into a held-out top log; a family names the ones it must catch. */
export type InjectedMistake =
  | 'drop-major-cooldown-cast'
  | 'delay-cooldown-30s'
  | 'idle-5-gcds'
  | 'shift-burst-15s'
  | 'strip-defensive'
  | 'die-in-window'
  | 'swap-talent-node'
  | 'remove-enchant'
  | 'press-off-list'
  | 'move-cooldown-out-of-lust';

/** How a raid decision enters the check: relative to the pull's own decision, gated on it matching the reference, or left out. */
interface RaidDecisions {
  relative: readonly string[];
  gated: readonly string[];
  excluded: readonly string[];
}

/** One finding family's verdict contract, declared beside its producer and listed in FINDING_REGISTRY. */
export interface FindingFamily {
  /** The id every finding of the family carries in `AnalysisFinding.family`. */
  id: string;
  /** Bumped on any change to the measure, the rule or its parameters, so calibration re-runs. */
  version: number;
  /** The highest tone the family may reach; calibration and the cost class only lower it. */
  tier: ToneLevel;
  /** The difference the family claims, against a named, counted reference, never an intent. */
  claim: string;
  /** What is measured, in which unit, over which time. */
  construct: string;
  /** The construct that replaces this one once it is built; null when the construct is final. */
  pendingRebuild: string | null;
  reference: { population: string; minN: number };
  /** How the player's pull and each top log line up: pull clock, alive time, phase, window. */
  alignment: string;
  /** What must be present in the pull for the check to run at all, such as the talent taken. */
  availability: readonly string[];
  raidDecisions: RaidDecisions;
  rule: DecisionRuleKind;
  costClass: CostClass;
  /** How the row prints its uncertainty, such as "8 of 10 top logs". */
  uncertaintyShown: string;
  copy: { message: string; remedy: string | null };
  injectedMistakes: readonly InjectedMistake[];
  /** What the card cannot see, printed in its "not judged" footer. */
  limits: readonly string[];
}
