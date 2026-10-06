import type { Op } from './priority-list.models';

/** The words a bound takes in a condition's sentence, shared by every field's own phrasing and the frames. */
export class Words {
  private constructor() {}

  static not(holds: boolean): string {
    return holds ? '' : 'not ';
  }

  static below(op: Op): boolean {
    return op.startsWith('<');
  }

  static lessMore(op: Op): string {
    return { '<': 'under', '<=': 'at most', '>': 'over', '>=': 'at least', '=': 'exactly', '!=': 'other than' }[op];
  }

  /** `4` reads as `4 s`; a named amount such as `one GCD` stays as it is. */
  static secs(n: string): string {
    return /^\d+(\.\d+)?$/.test(n) ? `${n} s` : n;
  }

  static bound(op: Op, n: string): string {
    if (!/^\d/.test(n)) return `${Words.below(op) ? 'under ' : ''}${n}`;
    return { '>=': `${n}+`, '>': `over ${n}`, '<=': `${n} or fewer`, '<': `under ${n}`, '=': `exactly ${n}`, '!=': `other than ${n}` }[op];
  }

  static enemies(op: Op, n: string): string {
    const count = Number(n);
    if ((op === '=' || op === '<=') && count === 1) return 'on a single enemy';
    if (op === '<' && count === 2) return 'on a single enemy';
    return op === '>' && Number.isInteger(count) ? `on ${count + 1}+ enemies` : `on ${Words.bound(op, n)} enemies`;
  }

  /** `Shadow Dance` to `Shadow Dance's`, `adds` to `adds'`. */
  static possessive(noun: string): string {
    return noun.endsWith('s') ? `${noun}'` : `${noun}'s`;
  }

  static spaced(token: string): string {
    return token.replace(/_/g, ' ');
  }
}
