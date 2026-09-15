import type { ResolvedAction, SpellRecord } from '../simc/simc.models';
import type { RuleCondition } from '../rulebook/rulebook.models';
import type { Fact } from './apl-literal-service';

export interface ActionLine {
  resolved: ResolvedAction;
  record: SpellRecord;
  terms: Fact[][];
  /** Facts that hold in every term, keyed by identity and direction. */
  lineFacts: Map<string, Fact>;
  requires: Set<string>;
  excludes: Set<string>;
}

export interface ActionGroup {
  token: string;
  record: SpellRecord;
  lines: ActionLine[];
}

/** Talent tokens, `hero:` prefixed for a hero tree pick. */
export interface TalentGate {
  requires: Set<string>;
  excludes: Set<string>;
}

export interface DraftSeed {
  key: string;
  condition: RuleCondition;
  type: string;
  priority: number;
  gate: TalentGate;
}

export type AuraLookup = (token: string, scope: 'self' | 'target') => SpellRecord | null;

export interface TermSite {
  line: ActionLine;
  term: Fact[];
}

export interface FactSite extends TermSite {
  fact: Fact;
}
