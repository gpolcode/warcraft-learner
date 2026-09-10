export type AplBinaryOp =
  | '&' | '|' | '^'
  | '=' | '!=' | '<' | '<=' | '>' | '>=' | '~' | '!~'
  | '+' | '-' | '*' | '%' | '%%' | '<?' | '>?';

/** `unknown` is a leaf the builder cannot know at build time (fight length, trinkets); it is the identity of both `&` and `|`. */
export type AplExpr =
  | { readonly kind: 'num'; readonly value: number }
  | { readonly kind: 'ref'; readonly path: readonly string[] }
  | { readonly kind: 'not'; readonly arg: AplExpr }
  | { readonly kind: 'neg'; readonly arg: AplExpr }
  | { readonly kind: 'abs'; readonly arg: AplExpr }
  | { readonly kind: 'call'; readonly fn: string; readonly arg: AplExpr }
  | { readonly kind: 'bin'; readonly op: AplBinaryOp; readonly left: AplExpr; readonly right: AplExpr }
  | { readonly kind: 'unknown' };

export type AplComparisonOp = '=' | '!=' | '<' | '<=' | '>' | '>=';

/** One `actions...=` line as written, before any list is resolved. */
export interface AplLine {
  /** '' for the default list; otherwise the sub-list name (`precombat`, `cds`). */
  list: string;
  action: string;
  options: Record<string, string>;
  index: number;
}

/** Where a gate came from: the action's own `if=`, or a list gate it inherited from a `call_action_list` / `run_action_list`. */
export type GateProvenance = 'own' | 'context';

export interface ResolvedAction {
  action: string;
  list: string;
  options: Record<string, string>;
  /** The action's own gate with variables inlined and escape hatches erased; null when unconditional. */
  own: AplExpr | null;
  /** The list gates that reach this line, outermost first. */
  context: AplExpr[];
  /** Position in the flattened priority order, 0 first. */
  priority: number;
}

export interface ResolvedApl {
  actions: ResolvedAction[];
  precombat: string[];
  /** Variable names whose definitions the resolver could not inline, kept for the build report. */
  unresolvedVariables: string[];
}

export interface AplLiteral {
  /** A comparison, a bare reference, or a call; never `&`, `|`, `^` or `not`. */
  atom: AplExpr;
  negated: boolean;
  provenance: GateProvenance;
}

/** One way the action can be chosen: every literal holds at once. */
export type AplTerm = AplLiteral[];

export interface SpellEffect {
  type: string;
  subtype: string | null;
  target: 'self' | 'enemy' | 'other';
  baseValue: number | null;
  triggerSpellId: number | null;
  periodic: boolean;
}

export interface SpellResource {
  /** WCL power type id, read from the dump's `(N)` marker. */
  powerType: number;
  amount: number;
}

export interface SpellTalentEntry {
  tree: 'class' | 'spec' | 'hero';
  /** The spec, `Generic` for the class tree, or the hero tree name with its specs. */
  owner: string;
}

export interface SpellRecord {
  id: number;
  name: string;
  passive: boolean;
  hidden: boolean;
  /** `Rogue` for a class-wide spell, `Subtlety Rogue` for a spec spell; null when the dump names none. */
  className: string | null;
  talent: SpellTalentEntry | null;
  cooldownS: number | null;
  charges: { count: number; rechargeS: number } | null;
  durationS: number | null;
  maxStacks: number | null;
  resources: SpellResource[];
  gcd: boolean;
  castTimeS: number | null;
  /** The health threshold the tooltip names for an execute, a game constant the rulebook may carry. */
  executeHealthPct: number | null;
  effects: SpellEffect[];
}
