import { Injectable, Type, inject } from '@angular/core';
import type jsep from 'jsep';
import { getOrInsert } from '../../analysis/analysis-math';
import { AplNode, SimcAplService } from '../../simc/simc-apl-service';
import { FactPaths } from './fact-path';
import { AuraFacts } from './facts/aura-facts';
import { BuildFacts } from './facts/build-facts';
import { CooldownFacts } from './facts/cooldown-facts';
import { FightFacts } from './facts/fight-facts';
import { PoolFacts } from './facts/pool-facts';
import { PressFacts } from './facts/press-facts';
import { UNKNOWN, CastMoment, FactContext, FactKind, FactPath, FactReader, FactStream, Range, Truth } from './priority-list.models';

const TRUE: Range = [1, 1];
const FALSE: Range = [0, 0];
const EITHER: Range = [0, 1];
const READERS: Type<FactReader>[] = [AuraFacts, CooldownFacts, PoolFacts, PressFacts, FightFacts, BuildFacts];

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
  private readonly apl = inject(SimcAplService);
  private readonly readers = new Map<FactKind, FactReader>(READERS.map(reader => inject(reader)).map(reader => [reader.kind, reader]));
  private readonly derived = new Map<string, AplNode | null>();

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

  /** The streams of the log a name's reader needs. */
  streams(name: string): readonly FactStream[] {
    const path = FactPaths.path(name, '');
    return this.readers.get(path.kind)?.streams(path) ?? [];
  }

  /** One name's value at a cast, `action` being the line's button, which a bare name reads; a derived field evaluates its SimC text with its own subject bound. */
  read(name: string, moment: CastMoment, action: string, ctx: FactContext, bound?: FactPath): Range {
    const path = FactPaths.path(name, action, bound);
    const is = FactPaths.row(path)?.[2];
    if (typeof is === 'number') return [is, is];
    if (is === undefined) return this.clean(this.readers.get(path.kind)?.read(path, moment, ctx) ?? UNKNOWN);
    const node = getOrInsert(this.derived, is, () => this.apl.parse(is));
    return node ? this.value(node, moment, action, ctx, path) : UNKNOWN;
  }

  value(node: AplNode, moment: CastMoment, action: string, ctx: FactContext, bound?: FactPath): Range {
    switch (node.type) {
      case 'Literal': return this.point(Number((node as jsep.Literal).value));
      case 'Identifier': return this.read((node as jsep.Identifier).name, moment, action, ctx, bound);
      case 'UnaryExpression': return this.unary(node as jsep.UnaryExpression, moment, action, ctx, bound);
      case 'BinaryExpression': return this.binary(node as jsep.BinaryExpression, moment, action, ctx, bound);
      case 'CallExpression': return this.call(node as jsep.CallExpression, moment, action, ctx, bound);
      default: return UNKNOWN;
    }
  }

  private unary({ operator, argument }: jsep.UnaryExpression, moment: CastMoment, action: string, ctx: FactContext, bound?: FactPath): Range {
    const [lo, hi] = this.value(argument, moment, action, ctx, bound);
    if (operator === '!') return this.fromTruth(this.not(this.truth([lo, hi])));
    if (operator === '@') return lo >= 0 ? [lo, hi] : hi <= 0 ? [-hi, -lo] : [0, Math.max(-lo, hi)];
    return [-hi, -lo];
  }

  private call({ callee, arguments: [argument] }: jsep.CallExpression, moment: CastMoment, action: string, ctx: FactContext, bound?: FactPath): Range {
    const fn = callee.type === 'Identifier' ? FUNCTIONS[(callee as jsep.Identifier).name] : undefined;
    if (!fn || !argument) return UNKNOWN;
    const [lo, hi] = this.value(argument, moment, action, ctx, bound);
    return [fn(lo), fn(hi)];
  }

  private binary({ operator, left, right }: jsep.BinaryExpression, moment: CastMoment, action: string, ctx: FactContext, bound?: FactPath): Range {
    const a = this.value(left, moment, action, ctx, bound);
    if (operator === '&' || operator === '|' || operator === '^') return this.logical(operator, this.truth(a), () => this.truth(this.value(right, moment, action, ctx, bound)));
    const b = this.value(right, moment, action, ctx, bound);
    return this.compare(operator, a, b) ?? this.arithmetic(operator, a, b);
  }

  private logical(operator: string, left: Truth, right: () => Truth): Range {
    if (operator === '&') return this.fromTruth(left === 'false' ? 'false' : this.and(left, right()));
    if (operator === '|') return this.fromTruth(left === 'true' ? 'true' : this.or(left, right()));
    const other = right();
    return this.fromTruth(left === 'unknown' || other === 'unknown' ? 'unknown' : left === other ? 'false' : 'true');
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
