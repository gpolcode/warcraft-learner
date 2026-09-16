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
