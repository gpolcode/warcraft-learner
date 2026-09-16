import { Injectable } from '@angular/core';
import type { AplBinaryOp, AplComparisonOp, AplExpr, AplFunction, AplLiteral, AplTerm, GateProvenance } from './simc.models';

type Token =
  | { type: 'num'; value: number }
  | { type: 'id'; value: string }
  | { type: 'op'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' };

/** Longest first, so `<?` and `<=` win over `<`. */
const OPERATORS = ['<?', '>?', '<=', '>=', '!=', '!~', '%%', '<', '>', '=', '~', '&', '|', '^', '!', '+', '-', '*', '%', '@'];

const COMPARISON_OPS: readonly AplComparisonOp[] = ['=', '!=', '<', '<=', '>', '>='];
const FUNCTIONS: readonly AplFunction[] = ['floor', 'ceil'];

/** Higher binds tighter, matching SimC's own table. */
const PRECEDENCE: Record<AplBinaryOp, number> = {
  '|': 1, '^': 2, '&': 3,
  '=': 4, '!=': 4, '<': 4, '<=': 4, '>': 4, '>=': 4, '~': 4, '!~': 4,
  '<?': 5, '>?': 5,
  '+': 6, '-': 6,
  '*': 7, '%': 7, '%%': 7,
};
const UNARY_PRECEDENCE = 8;

const FLIPPED: Record<AplComparisonOp, AplComparisonOp> = {
  '=': '!=', '!=': '=', '<': '>=', '<=': '>', '>': '<=', '>=': '<',
};

const truth = (value: boolean): number => (value ? 1 : 0);

/** SimC's `%` is division; `~` and `!~` are string membership the builder never needs. */
const ARITHMETIC: Record<AplBinaryOp, (left: number, right: number) => number> = {
  '+': (left, right) => left + right,
  '-': (left, right) => left - right,
  '*': (left, right) => left * right,
  '%': (left, right) => (right === 0 ? 0 : left / right),
  '%%': (left, right) => (right === 0 ? 0 : left % right),
  '<?': Math.min,
  '>?': Math.max,
  '=': (left, right) => truth(left === right),
  '!=': (left, right) => truth(left !== right),
  '<': (left, right) => truth(left < right),
  '<=': (left, right) => truth(left <= right),
  '>': (left, right) => truth(left > right),
  '>=': (left, right) => truth(left >= right),
  '&': (left, right) => truth(left !== 0 && right !== 0),
  '|': (left, right) => truth(left !== 0 || right !== 0),
  '^': (left, right) => truth((left !== 0) !== (right !== 0)),
  '~': () => 0,
  '!~': () => 0,
};

/** Past this many terms a gate is a sim heuristic, not a rule, and the caller falls back to its top-level conjunction. */
const MAX_DNF_TERMS = 64;

export const UNKNOWN: AplExpr = { kind: 'unknown' };
export const TRUE: AplExpr = { kind: 'num', value: 1 };
export const FALSE: AplExpr = { kind: 'num', value: 0 };

/** Resolves a reference at simplification time: a constant, `unknown`, a replacement expression, or null to keep it symbolic. */
export type AplResolver = (path: readonly string[]) => AplExpr | null;

class TokenStream {
  private position = 0;

  constructor(private readonly tokens: Token[]) {}

  peek(): Token | undefined {
    return this.tokens[this.position];
  }

  take(): Token | undefined {
    const token = this.tokens[this.position];
    if (token) this.position += 1;
    return token;
  }

  takeOp(...ops: string[]): string | null {
    const token = this.peek();
    if (token?.type !== 'op' || !ops.includes(token.value)) return null;
    this.position += 1;
    return token.value;
  }

  takeClose(): boolean {
    return this.take()?.type === 'rparen';
  }

  done(): boolean {
    return this.position === this.tokens.length;
  }
}

@Injectable({ providedIn: 'root' })
export class SimcExpressionService {

  /** The expression tree, or null for text outside the grammar. */
  parse(source: string): AplExpr | null {
    const tokens = this.tokenize(source);
    if (!tokens) return null;
    const stream = new TokenStream(tokens);
    const result = this.binary(stream, 1);
    return result && stream.done() ? result : null;
  }

  private tokenize(source: string): Token[] | null {
    const tokens: Token[] = [];
    let index = 0;
    while (index < source.length) {
      if (source[index] === ' ') { index += 1; continue; }
      const token = this.tokenAt(source.slice(index));
      if (!token) return null;
      tokens.push(token.token);
      index += token.length;
    }
    return tokens;
  }

  private tokenAt(rest: string): { token: Token; length: number } | null {
    if (rest.startsWith('(')) return { token: { type: 'lparen' }, length: 1 };
    if (rest.startsWith(')')) return { token: { type: 'rparen' }, length: 1 };
    const number = /^\d+(?:\.\d+)?/.exec(rest);
    if (number) return { token: { type: 'num', value: Number(number[0]) }, length: number[0].length };
    const identifier = /^[a-z_][a-z0-9_.]*/i.exec(rest);
    if (identifier) return { token: { type: 'id', value: identifier[0] }, length: identifier[0].length };
    const op = OPERATORS.find(candidate => rest.startsWith(candidate));
    return op ? { token: { type: 'op', value: op }, length: op.length } : null;
  }

  private primary(stream: TokenStream): AplExpr | null {
    const token = stream.take();
    if (!token) return null;
    if (token.type === 'num') return { kind: 'num', value: token.value };
    if (token.type === 'lparen') {
      const inner = this.binary(stream, 1);
      return inner && stream.takeClose() ? inner : null;
    }
    return token.type === 'id' ? this.reference(stream, token.value) : null;
  }

  private reference(stream: TokenStream, name: string): AplExpr | null {
    if (stream.peek()?.type !== 'lparen') return { kind: 'ref', path: name.split('.') };
    const fn = FUNCTIONS.find(candidate => candidate === name);
    if (!fn) return null;
    stream.take();
    const arg = this.binary(stream, 1);
    return arg && stream.takeClose() ? { kind: 'call', fn, arg } : null;
  }

  private unary(stream: TokenStream): AplExpr | null {
    const op = stream.takeOp('!', '-', '@', '+');
    if (op === null) return this.primary(stream);
    const arg = this.unary(stream);
    if (!arg) return null;
    if (op === '!') return { kind: 'not', arg };
    if (op === '-') return { kind: 'neg', arg };
    return op === '@' ? { kind: 'abs', arg } : arg;
  }

  private binary(stream: TokenStream, minPrecedence: number): AplExpr | null {
    let left = this.unary(stream);
    while (left) {
      const token = stream.peek();
      if (token?.type !== 'op' || token.value === '!' || token.value === '@') return left;
      const op = token.value as AplBinaryOp;
      const precedence = PRECEDENCE[op];
      if (precedence < minPrecedence) return left;
      stream.take();
      const right = this.binary(stream, precedence + 1);
      left = right && { kind: 'bin', op, left, right };
    }
    return left;
  }

  /** SimC syntax back out, parenthesised only where precedence needs it, so a stamped condition re-parses to the same tree. */
  print(expr: AplExpr): string {
    return this.printAt(expr, 0);
  }

  private printAt(expr: AplExpr, parentPrecedence: number): string {
    switch (expr.kind) {
      case 'num': return String(expr.value);
      case 'ref': return expr.path.join('.');
      case 'unknown': return 'unknown';
      case 'call': return `${expr.fn}(${this.printAt(expr.arg, 0)})`;
      case 'not': return `!${this.printAt(expr.arg, UNARY_PRECEDENCE)}`;
      case 'neg': return `-${this.printAt(expr.arg, UNARY_PRECEDENCE)}`;
      case 'abs': return `@${this.printAt(expr.arg, UNARY_PRECEDENCE)}`;
      case 'bin': {
        const precedence = PRECEDENCE[expr.op];
        const text = `${this.printAt(expr.left, precedence)}${expr.op}${this.printAt(expr.right, precedence + 1)}`;
        return precedence < parentPrecedence ? `(${text})` : text;
      }
    }
  }

  isComparison(op: AplBinaryOp): op is AplComparisonOp {
    return (COMPARISON_OPS as readonly string[]).includes(op);
  }

  private constant(expr: AplExpr): number | null {
    return expr.kind === 'num' ? expr.value : null;
  }

  /** Folds constants, inlines what the resolver knows, and drops `unknown` leaves as the identity of the operator they sit under. */
  simplify(expr: AplExpr, resolve: AplResolver): AplExpr {
    switch (expr.kind) {
      case 'num': case 'unknown': return expr;
      case 'ref': return this.simplifyRef(expr, resolve);
      case 'call': case 'abs': case 'neg': return this.simplifyUnary(expr, this.simplify(expr.arg, resolve));
      case 'not': return this.simplifyNot(this.simplify(expr.arg, resolve));
      case 'bin': return this.simplifyBinary(expr.op, this.simplify(expr.left, resolve), this.simplify(expr.right, resolve));
    }
  }

  // A resolver answers a bare field with the reference it stands for, already in its final form; anything else it answers with is an expression to fold.
  private simplifyRef(expr: AplExpr & { kind: 'ref' }, resolve: AplResolver): AplExpr {
    const replacement = resolve(expr.path);
    if (replacement === null) return expr;
    return replacement.kind === 'ref' ? replacement : this.simplify(replacement, resolve);
  }

  private simplifyUnary(expr: AplExpr & { kind: 'call' | 'abs' | 'neg' }, arg: AplExpr): AplExpr {
    const value = this.constant(arg);
    if (value !== null) return { kind: 'num', value: this.unaryValue(expr, value) };
    return arg.kind === 'unknown' ? UNKNOWN : { ...expr, arg };
  }

  private unaryValue(expr: AplExpr & { kind: 'call' | 'abs' | 'neg' }, value: number): number {
    if (expr.kind === 'abs') return Math.abs(value);
    if (expr.kind === 'neg') return -value;
    return expr.fn === 'ceil' ? Math.ceil(value) : Math.floor(value);
  }

  private simplifyNot(arg: AplExpr): AplExpr {
    const value = this.constant(arg);
    if (value !== null) return value === 0 ? TRUE : FALSE;
    if (arg.kind === 'unknown') return UNKNOWN;
    if (arg.kind === 'not') return arg.arg;
    return { kind: 'not', arg };
  }

  private simplifyBinary(op: AplBinaryOp, left: AplExpr, right: AplExpr): AplExpr {
    const leftValue = this.constant(left);
    const rightValue = this.constant(right);
    if (leftValue !== null && rightValue !== null) return { kind: 'num', value: ARITHMETIC[op](leftValue, rightValue) };
    if (op === '&' || op === '|') return this.simplifyLogical(op, left, right);
    if (left.kind === 'unknown' || right.kind === 'unknown') return UNKNOWN;
    return { kind: 'bin', op, left, right };
  }

  /** A constant that decides the operator wins outright; a constant or unknown that does not decide it vanishes. */
  private simplifyLogical(op: '&' | '|', left: AplExpr, right: AplExpr): AplExpr {
    const decisive = op === '&' ? 0 : 1;
    const decides = (side: AplExpr): boolean => side.kind === 'num' && (side.value !== 0) === (decisive !== 0);
    if (decides(left) || decides(right)) return { kind: 'num', value: decisive };
    const vanishes = (side: AplExpr): boolean => side.kind === 'num' || side.kind === 'unknown';
    if (vanishes(left)) return right;
    if (vanishes(right)) return left;
    return { kind: 'bin', op, left, right };
  }

  /** Disjunctive normal form over literals, or null past MAX_DNF_TERMS. A constant-true gate yields one empty term; a constant-false one yields no terms. */
  protected dnf(expr: AplExpr, provenance: GateProvenance): AplTerm[] | null {
    const terms = this.dnfOf(this.negationsInward(expr, false), provenance);
    return terms !== null && terms.length > MAX_DNF_TERMS ? null : terms;
  }

  private negationsInward(expr: AplExpr, negate: boolean): AplExpr {
    if (expr.kind === 'not') return this.negationsInward(expr.arg, !negate);
    if (expr.kind === 'bin' && (expr.op === '&' || expr.op === '|')) {
      const op = negate ? (expr.op === '&' ? '|' : '&') : expr.op;
      return { kind: 'bin', op, left: this.negationsInward(expr.left, negate), right: this.negationsInward(expr.right, negate) };
    }
    if (expr.kind === 'bin' && expr.op === '^') return this.negationsInward(this.xorAsOr(expr.left, expr.right), negate);
    return this.negateLeaf(expr, negate);
  }

  private xorAsOr(a: AplExpr, b: AplExpr): AplExpr {
    return {
      kind: 'bin', op: '|',
      left: { kind: 'bin', op: '&', left: a, right: { kind: 'not', arg: b } },
      right: { kind: 'bin', op: '&', left: { kind: 'not', arg: a }, right: b },
    };
  }

  private negateLeaf(expr: AplExpr, negate: boolean): AplExpr {
    if (!negate) return expr;
    if (expr.kind === 'bin' && this.isComparison(expr.op)) return { ...expr, op: FLIPPED[expr.op] };
    if (expr.kind === 'num') return expr.value === 0 ? TRUE : FALSE;
    return { kind: 'not', arg: expr };
  }

  private dnfOf(expr: AplExpr, provenance: GateProvenance): AplTerm[] | null {
    if (expr.kind === 'num') return expr.value !== 0 ? [[]] : [];
    if (expr.kind === 'unknown') return [[]];
    if (expr.kind === 'bin' && (expr.op === '|' || expr.op === '&')) return this.dnfBinary(expr.op, expr.left, expr.right, provenance);
    if (expr.kind === 'not') return [[{ atom: expr.arg, negated: true, provenance }]];
    return [[{ atom: expr, negated: false, provenance }]];
  }

  private dnfBinary(op: '|' | '&', leftExpr: AplExpr, rightExpr: AplExpr, provenance: GateProvenance): AplTerm[] | null {
    const left = this.dnfOf(leftExpr, provenance);
    const right = this.dnfOf(rightExpr, provenance);
    if (left === null || right === null) return null;
    if (op === '|') return [...left, ...right];
    return this.cross(left, right);
  }

  private cross(left: AplTerm[], right: AplTerm[]): AplTerm[] | null {
    if (left.length * right.length > MAX_DNF_TERMS) return null;
    return left.flatMap(a => right.map(b => [...a, ...b]));
  }

  /** Every literal on the spine of top-level `&`s, the fallback when a gate is too wide for DNF. */
  conjunction(expr: AplExpr, provenance: GateProvenance): AplLiteral[] {
    const spine = this.negationsInward(expr, false);
    if (spine.kind === 'bin' && spine.op === '&') {
      return [...this.conjunction(spine.left, provenance), ...this.conjunction(spine.right, provenance)];
    }
    if (spine.kind === 'not') return [{ atom: spine.arg, negated: true, provenance }];
    if (spine.kind === 'num' || spine.kind === 'unknown' || (spine.kind === 'bin' && spine.op === '|')) return [];
    return [{ atom: spine, negated: false, provenance }];
  }

  /** Terms of `own & context...`, one literal set per way the line can be chosen; null when any part is too wide. */
  termsOf(own: AplExpr | null, context: readonly AplExpr[]): AplTerm[] | null {
    let terms: AplTerm[] | null = own ? (this.dnf(own, 'own') ?? [this.conjunction(own, 'own')]) : [[]];
    for (const gate of context) {
      if (terms === null) return null;
      terms = this.cross(terms, this.dnf(gate, 'context') ?? [this.conjunction(gate, 'context')]);
    }
    return terms;
  }
}
