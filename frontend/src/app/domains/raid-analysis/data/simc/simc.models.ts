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

/** Where a gate came from: the action's own `if=`, or a list gate it inherited from a `call_action_list` / `run_action_list`. */
export type GateProvenance = 'own' | 'context';

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
