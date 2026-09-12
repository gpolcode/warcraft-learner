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
}

/** Where a gate came from: the action's own `if=`, or a list gate it inherited from a `call_action_list` / `run_action_list`. */
export type GateProvenance = 'own' | 'context';

export interface ResolvedAction {
  action: string;
  /** The action's own gate with variables inlined and escape hatches erased; null when unconditional. */
  own: AplExpr | null;
  /** The list gates that reach this line, outermost first. */
  context: AplExpr[];
  /** Position in the flattened priority order, 0 first. */
  priority: number;
}

/** One `.simc` text split into the action lines it declares and the `actions` lines the reader could not split. */
export interface AplSource {
  lines: AplLine[];
  unparsed: string[];
}

export type RulebookGapKind =
  | 'expression' | 'option' | 'variable_op' | 'syntax' | 'line' | 'list' | 'variable'
  | 'action' | 'aura' | 'talent';

/** What the builder could not read or resolve: a token outside the inventory, a line or list it could not follow, or a name no source carries. */
export interface RulebookGap {
  kind: RulebookGapKind;
  token: string;
}

export interface ResolvedApl {
  actions: ResolvedAction[];
  gaps: RulebookGap[];
  /** Every reference head the gates touched, so a build knows which event streams the rules can need. */
  referencedHeads: string[];
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
  /** The recharge of a charged spell, the cooldown that actually gates it. */
  rechargeS: number | null;
  durationS: number | null;
  maxStacks: number | null;
  resources: SpellResource[];
  gcd: boolean;
  castTimeS: number | null;
  /** The health threshold the tooltip names for an execute, a game constant the rulebook may carry. */
  executeHealthPct: number | null;
  effects: SpellEffect[];
}
