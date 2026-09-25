import { Injectable } from '@angular/core';
import { mode } from 'd3-array';
import { UNKNOWN, CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';

const TIMING = /^(?:action\.(\w+)\.)?(gcd|gcd\.max|gcd\.remains|cast_time|execute_time|executing|execute_remains)$/;
/** The floor haste can press a hasted global cooldown down to. */
const GCD_FLOOR_S = 0.75;
/** A class whose global cooldown is a flat second never has it hasted. */
const FLAT_GCD_S = 1;
/** Haste can at most halve a cast when no hardcast in the log narrows it. */
const HASTE_FACTOR_MIN = 0.5;

/** Global cooldown and cast times, hasted by the factor the log's own hardcasts show around the cast. */
@Injectable({ providedIn: 'root' })
export class TimingFacts implements FactReader {
  readonly streams: FactStream[] = [];

  matches(name: string): boolean {
    return TIMING.test(name);
  }

  read(name: string, moment: CastMoment, action: string, ctx: FactContext): Range {
    const [, named = action, field = ''] = TIMING.exec(name) ?? [];
    if (field === 'executing' || field === 'execute_remains') return this.executing(field, named, moment.atS, ctx);
    const gcd = this.gcd(moment.atS, ctx);
    if (field === 'gcd.remains') return this.gcdRemains(moment, gcd, ctx);
    if (field === 'gcd' || field === 'gcd.max') return gcd;
    return this.castTime(field, ctx.list.spells[named]?.cast_time, gcd, this.haste(moment.atS, ctx));
  }

  /** `execute_time` is the cast or the global cooldown, whichever is longer. */
  private castTime(field: string, base: number | undefined, gcd: Range, [fLo, fHi]: Range): Range {
    if (base === undefined) return UNKNOWN;
    const cast: Range = [base * fLo, base * fHi];
    return field === 'cast_time' ? cast : [Math.max(cast[0], gcd[0]), Math.max(cast[1], gcd[1])];
  }

  /** Between the factors of the nearest hardcasts either side, since haste changes with procs and Bloodlust. */
  private haste(atS: number, ctx: FactContext): Range {
    const factors = ctx.hasteFactors();
    const after = factors.findIndex(([castS]) => castS >= atS);
    const near = [factors[after === -1 ? factors.length - 1 : after - 1], factors[after]].flatMap(entry => (entry ? [entry[1]] : []));
    return near.length ? [Math.min(...near), Math.max(...near)] : [HASTE_FACTOR_MIN, 1];
  }

  private gcd(atS: number, ctx: FactContext): Range {
    const gcds = ctx.list.lines.flatMap(line => ctx.list.spells[line.action]?.gcd ?? []).filter(gcd => gcd > 0);
    const base = gcds.length ? mode(gcds) : 0;
    if (!base) return UNKNOWN;
    if (base <= FLAT_GCD_S) return [base, base];
    const [fLo, fHi] = this.haste(atS, ctx);
    return [Math.max(GCD_FLOOR_S, base * fLo), Math.max(GCD_FLOOR_S, base * fHi)];
  }

  /** A cast on the global cooldown starts when it is free; an off-GCD one waits on the last cast that spent it. */
  private gcdRemains(moment: CastMoment, [gLo, gHi]: Range, ctx: FactContext): Range {
    if (ctx.gcd(moment.event.abilityGameID)) return [0, 0];
    const last = ctx.casts.slice(0, moment.index).reverse().find(event => ctx.gcd(event.abilityGameID));
    if (!last) return [0, 0];
    return [Math.max(0, last.atS + gLo - moment.atS), Math.max(0, last.atS + gHi - moment.atS)];
  }

  private executing(field: string, token: string, atS: number, ctx: FactContext): Range {
    const ids = ctx.castIds(token);
    const begun = ctx.begincasts.filter(event => ids.has(event.abilityGameID) && event.atS < atS).pop();
    const done = begun && ctx.casts.find(event => ids.has(event.abilityGameID) && event.atS >= begun.atS);
    if (!begun || !done || done.atS <= atS) return [0, 0];
    return field === 'executing' ? [1, 1] : [done.atS - atS, done.atS - atS];
  }
}
