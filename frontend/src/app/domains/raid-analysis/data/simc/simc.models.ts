/** `midnight/MID2`: the SimC branch the action lists and class dumps are read from, and the tier directory whose digits name the season of the worn set bonus. */
export interface SimcTier {
  branch: string;
  dir: string;
}

export type AplBinaryOp =
  | '&' | '|' | '^'
  | '=' | '!=' | '<' | '<=' | '>' | '>=' | '~' | '!~'
  | '+' | '-' | '*' | '%' | '%%' | '<?' | '>?';

/** The two functions SimulationCraft's grammar knows. */
export type AplFunction = 'floor' | 'ceil';

/** `unknown` is a leaf the builder cannot know at build time (fight length, trinkets); it is the identity of both `&` and `|`. */
export type AplExpr =
  | { kind: 'num'; value: number }
  | { kind: 'ref'; path: string[] }
  | { kind: 'not'; arg: AplExpr }
  | { kind: 'neg'; arg: AplExpr }
  | { kind: 'abs'; arg: AplExpr }
  | { kind: 'call'; fn: AplFunction; arg: AplExpr }
  | { kind: 'bin'; op: AplBinaryOp; left: AplExpr; right: AplExpr }
  | { kind: 'unknown' };

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

export type AplGapKind = 'expression' | 'option' | 'variable_op' | 'syntax' | 'line' | 'list' | 'variable';

/** What the reader could not read: a token outside the inventory, or a line, list or variable it could not follow. */
export interface AplGap {
  kind: AplGapKind;
  token: string;
}

export interface ResolvedApl {
  actions: ResolvedAction[];
  gaps: AplGap[];
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
  /** The WCL power type ids of the pools the cast spends, read from the dump's `(N)` markers. */
  powerTypes: number[];
  gcd: boolean;
  castTimeS: number | null;
  /** The health threshold the tooltip names for an execute, a game constant the rulebook may carry. */
  executeHealthPct: number | null;
  effects: SpellEffect[];
}
