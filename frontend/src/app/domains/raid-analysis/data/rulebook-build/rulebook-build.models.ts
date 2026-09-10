import type { TimedEvent } from '../analysis/wcl-projections-service';
import type { SpellRecord } from '../simc/simc.models';
import type { RuleCondition } from '../rulebook/rulebook.models';

export interface ParseSample {
  reportCode: string;
  fightId: number;
  encounterId: number;
  fightDurationS: number;
  casts: TimedEvent[];
  buffs: TimedEvent[];
  debuffs: TimedEvent[];
}

/** What the sampled top parses say about each id, so a name shared by a cast and an aura resolves to the one the logs carry. */
export interface ParseObservation {
  sampleCount: number;
  /** Samples in which the id was cast at least once. */
  castParses: Map<number, number>;
  /** Samples in which the id appeared in the player's own buff stream. */
  buffParses: Map<number, number>;
  /** Samples in which the id appeared in the player-sourced debuff stream. */
  debuffParses: Map<number, number>;
  /** Apply events per aura id over every sample. */
  applications: Map<number, number>;
  /** Median uptime share over the samples that saw the aura, keyed by aura id. */
  uptimeShare: Map<number, number>;
  /** Each sample's first cast time of the id, fight-relative seconds. */
  firstCastS: Map<number, number[]>;
  /** One map per sample, in sample order: how often each id was cast in it. */
  castCounts: Map<number, number>[];
  sampleDurationsS: number[];
}

export interface AbilityIndex {
  classLabel: string;
  specLabel: string;
  byToken: Map<string, SpellRecord[]>;
  byId: Map<number, SpellRecord>;
  observation: ParseObservation;
}

/** A rule before copy and talent ids: the gates are still SimC talent tokens. */
export interface RuleDraft {
  condition: RuleCondition;
  type: string;
  /** The priority of the highest APL line that produced it, 0 first. */
  priority: number;
  requires: Set<string>;
  excludes: Set<string>;
}

export interface RulebookBuildReport {
  unresolvedActions: string[];
  unresolvedAuras: string[];
  unresolvedTalents: string[];
  unresolvedVariables: string[];
}
