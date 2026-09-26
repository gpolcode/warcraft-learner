import { Injectable, inject } from '@angular/core';
import type jsep from 'jsep';
import type { AplNode } from '../../simc/simc-apl-service';
import { FACT_READERS } from './fact-readers';
import { UNKNOWN, CastMoment, FactContext, FactReader, Range, Truth } from './priority-list.models';
const TRUE: Range = [1, 1];
const FALSE: Range = [0, 0];
const EITHER: Range = [0, 1];

const point = ([lo, hi]: Range): boolean => lo === hi;
const equal = (a: Range, b: Range): boolean => point(a) && point(b) && a[0] === b[0];
const apart = ([a0, a1]: Range, [b0, b1]: Range): boolean => a1 < b0 || b1 < a0;
const hull = (values: number[]): Range => [Math.min(...values), Math.max(...values)];
const products = ([a0, a1]: Range, [b0, b1]: Range): number[] => [a0 * b0, a0 * b1, a1 * b0, a1 * b1];

/** `[certainly holds, certainly fails]` over every value each side may take. */
const COMPARE: Record<string, ((a: Range, b: Range) => readonly [boolean, boolean]) | undefined> = {
  '<': ([a0, a1], [b0, b1]) => [a1 < b0, a0 >= b1],
  '<=': ([a0, a1], [b0, b1]) => [a1 <= b0, a0 > b1],
  '>': ([a0, a1], [b0, b1]) => [a0 > b1, a1 <= b0],
  '>=': ([a0, a1], [b0, b1]) => [a0 >= b1, a1 < b0],
  '=': (a, b) => [equal(a, b), apart(a, b)],
  '==': (a, b) => [equal(a, b), apart(a, b)],
  '!=': (a, b) => [apart(a, b), equal(a, b)],
};

/** SimC's expression functions; each is monotonic, so it maps a range end to end. */
const FUNCTIONS: Record<string, ((value: number) => number) | undefined> = { floor: Math.floor, ceil: Math.ceil };

const ARITHMETIC: Record<string, ((a: Range, b: Range) => Range) | undefined> = {
  '+': (a, b) => [a[0] + b[0], a[1] + b[1]],
  '-': (a, b) => [a[0] - b[1], a[1] - b[0]],
  // An unknown side times zero is still zero.
  '*': (a, b) => hull(products(a, b).map(product => (Number.isNaN(product) ? 0 : product))),
  // SimC divides by zero to zero, so a divisor that may be zero settles nothing.
  '%': (a, b) => (b[0] <= 0 && b[1] >= 0 ? UNKNOWN : hull([a[0] / b[0], a[0] / b[1], a[1] / b[0], a[1] / b[1]])),
  '<?': (a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])],
  '>?': (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])],
  '%%': (a, b) => (point(a) && point(b) && b[0] !== 0 ? [a[0] % b[0], a[0] % b[0]] : UNKNOWN),
};

@Injectable({ providedIn: 'root' })
export class ConditionEvalService {
  private readonly readers = inject(FACT_READERS);

  truthOf(node: AplNode, moment: CastMoment, action: string, ctx: FactContext): Truth {
    return this.truth(this.value(node, moment, action, ctx));
  }

  /** SimC reads any non-zero value as true. */
  truth([lo, hi]: Range): Truth {
    if (lo > 0 || hi < 0) return 'true';
    return lo === 0 && hi === 0 ? 'false' : 'unknown';
  }

  and(...truths: Truth[]): Truth {
    if (truths.includes('false')) return 'false';
    return truths.includes('unknown') ? 'unknown' : 'true';
  }

  or(...truths: Truth[]): Truth {
    if (truths.includes('true')) return 'true';
    return truths.includes('unknown') ? 'unknown' : 'false';
  }

  readerFor(name: string): FactReader | null {
    return this.readers.find(reader => reader.matches(name)) ?? null;
  }

  value(node: AplNode, moment: CastMoment, action: string, ctx: FactContext): Range {
    switch (node.type) {
      case 'Literal': return this.point(Number((node as jsep.Literal).value));
      case 'Identifier': return this.identifier((node as jsep.Identifier).name, moment, action, ctx);
      case 'UnaryExpression': return this.unary(node as jsep.UnaryExpression, moment, action, ctx);
      case 'BinaryExpression': return this.binary(node as jsep.BinaryExpression, moment, action, ctx);
      case 'CallExpression': return this.call(node as jsep.CallExpression, moment, action, ctx);
      default: return UNKNOWN;
    }
  }

  private identifier(name: string, moment: CastMoment, action: string, ctx: FactContext): Range {
    const range = this.readerFor(name)?.read(name, moment, action, ctx) ?? UNKNOWN;
    return range.some(Number.isNaN) ? UNKNOWN : range;
  }

  private unary({ operator, argument }: jsep.UnaryExpression, moment: CastMoment, action: string, ctx: FactContext): Range {
    const [lo, hi] = this.value(argument, moment, action, ctx);
    return operator === '!' ? this.fromTruth(this.not(this.truth([lo, hi]))) : [-hi, -lo];
  }

  private call({ callee, arguments: [argument] }: jsep.CallExpression, moment: CastMoment, action: string, ctx: FactContext): Range {
    const fn = callee.type === 'Identifier' ? FUNCTIONS[(callee as jsep.Identifier).name] : undefined;
    if (!fn || !argument) return UNKNOWN;
    const [lo, hi] = this.value(argument, moment, action, ctx);
    return [fn(lo), fn(hi)];
  }

  private binary({ operator, left, right }: jsep.BinaryExpression, moment: CastMoment, action: string, ctx: FactContext): Range {
    const a = this.value(left, moment, action, ctx);
    if (operator === '&' || operator === '|') return this.logical(operator, this.truth(a), () => this.truth(this.value(right, moment, action, ctx)));
    const b = this.value(right, moment, action, ctx);
    return this.compare(operator, a, b) ?? this.arithmetic(operator, a, b);
  }

  private logical(operator: string, left: Truth, right: () => Truth): Range {
    if (operator === '&') return this.fromTruth(left === 'false' ? 'false' : this.and(left, right()));
    return this.fromTruth(left === 'true' ? 'true' : this.or(left, right()));
  }

  private compare(operator: string, a: Range, b: Range): Range | null {
    const settled = COMPARE[operator]?.(a, b);
    return settled ? (settled[0] ? TRUE : settled[1] ? FALSE : EITHER) : null;
  }

  arithmetic(operator: string, a: Range, b: Range): Range {
    const range = ARITHMETIC[operator]?.(a, b) ?? UNKNOWN;
    return range.some(Number.isNaN) ? this.clean(range) : range;
  }

  private not(truth: Truth): Truth {
    return truth === 'true' ? 'false' : truth === 'false' ? 'true' : 'unknown';
  }

  private fromTruth(truth: Truth): Range {
    return truth === 'true' ? TRUE : truth === 'false' ? FALSE : EITHER;
  }

  private point(value: number): Range {
    return Number.isNaN(value) ? UNKNOWN : [value, value];
  }

  /** Infinity minus infinity is an unknown bound, never a known one. */
  private clean([lo, hi]: Range): Range {
    return [Number.isNaN(lo) ? -Infinity : lo, Number.isNaN(hi) ? Infinity : hi];
  }
}
