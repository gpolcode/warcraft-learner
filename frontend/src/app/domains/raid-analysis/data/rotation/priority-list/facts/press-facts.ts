import { Injectable } from '@angular/core';
import { mode } from 'd3-array';
import type { TimedEvent } from '../../../analysis/wcl-projections-service';
import { SUMMON_PREFIXES, UNKNOWN, CastMoment, FactContext, FactPath, FactReader, FactStream, Range } from '../priority-list.models';

const GCD_FLOOR_S = 0.75;
/** A class whose global cooldown is a flat second never has it hasted. */
const FLAT_GCD_S = 1;
/** Haste can at most halve a cast when no hardcast in the log narrows it. */
const HASTE_FACTOR_MIN = 0.5;
/** A shot the log never shows landing was lost to a dead target, so past this it stops counting. */
const LOST_AFTER_S = 5;

type Field = (path: FactPath, moment: CastMoment, ctx: FactContext) => Range;

const flag = (holds: boolean): Range => (holds ? [1, 1] : [0, 0]);
const point = (value: number): Range => [value, value];

/** What the player pressed around the moment: the casts before it, a shot still in the air, a cast still going, the global cooldown, a pet still out. */
@Injectable({ providedIn: 'root' })
export class PressFacts implements FactReader {
  readonly kind = 'press';
  private readonly fields: Record<string, Field | undefined> = {
    prev: ({ subject }, moment, ctx) => flag(this.cast(this.before(moment, ctx)[0], ctx.castIds(subject))),
    prev_gcd: ({ subject, n }, moment, ctx) => flag(this.cast(this.before(moment, ctx).filter(event => ctx.gcd(event.abilityGameID))[n - 1], ctx.castIds(subject))),
    prev_off_gcd: ({ subject }, moment, ctx) => this.offGcd(this.before(moment, ctx), ctx.castIds(subject), ctx),
    last_used: ({ subject }, moment, ctx) => {
      const last = this.before(moment, ctx).find(event => ctx.castIds(subject).has(event.abilityGameID));
      return last ? point(moment.atS - last.atS) : [Infinity, Infinity];
    },
    in_flight: ({ subject }, { atS }, ctx) => flag(this.flying(ctx.castTimes(subject), ctx.landings(subject), atS) > 0),
    in_flight_count: ({ subject }, { atS }, ctx) => point(this.flying(ctx.castTimes(subject), ctx.landings(subject), atS)),
    in_flight_remains: ({ subject }, { atS }, ctx) => this.lands(this.flying(ctx.castTimes(subject), ctx.landings(subject), atS), ctx.landings(subject), atS),
    executing: ({ subject }, { atS }, ctx) => flag(this.finishing(subject, atS, ctx) !== null),
    execute_remains: ({ subject }, { atS }, ctx) => {
      const done = this.finishing(subject, atS, ctx);
      return done === null ? [0, 0] : point(done - atS);
    },
    cast_time: ({ subject }, { atS }, ctx) => this.castTime(ctx.list.spells[subject]?.cast_time, this.haste(atS, ctx)),
    gcd: (_, { atS }, ctx) => this.gcd(atS, ctx),
    'gcd.remains': (_, moment, ctx) => this.gcdRemains(moment, this.gcd(moment.atS, ctx), ctx),
    'pet.remains': ({ subject }, { atS }, ctx) => this.pet(subject, atS, ctx),
  };

  streams({ field }: FactPath): FactStream[] {
    return field.startsWith('in_flight') ? ['damage'] : [];
  }

  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    return this.fields[path.field]?.(path, moment, ctx) ?? UNKNOWN;
  }

  /** The listed casts before the moment, latest first; a cast the list never names is a utility press, not part of the rotation SimC counts. */
  private before(moment: CastMoment, ctx: FactContext): TimedEvent[] {
    return ctx.casts.slice(0, moment.index).filter(event => ctx.gcd(event.abilityGameID) !== null).reverse();
  }

  private cast(event: TimedEvent | undefined, ids: ReadonlySet<number>): boolean {
    return !!event && ids.has(event.abilityGameID);
  }

  /** The off-GCD casts since the last one on it. */
  private offGcd(before: TimedEvent[], ids: ReadonlySet<number>, ctx: FactContext): Range {
    const lastGcd = before.findIndex(event => ctx.gcd(event.abilityGameID));
    return flag((lastGcd === -1 ? before : before.slice(0, lastGcd)).some(event => ids.has(event.abilityGameID)));
  }

  /** Each landing takes the oldest cast still in the air; one the same instant as its cast is the instant hit of a spell that never flies. */
  private flying(casts: readonly number[], landings: readonly number[], atS: number): number {
    const air: number[] = [];
    let next = 0;
    const land = (before: (landS: number) => boolean): void => {
      for (; next < landings.length && before(landings[next] ?? Infinity); next++) air.shift();
    };
    for (const castS of casts) {
      if (castS >= atS) break;
      land(landS => landS < castS);
      air.push(castS);
      land(landS => landS <= castS);
    }
    land(landS => landS <= atS);
    return air.filter(castS => castS >= atS - LOST_AFTER_S).length;
  }

  private lands(flying: number, landings: readonly number[], atS: number): Range {
    if (!flying) return [0, 0];
    const lands = landings.find(landS => landS > atS);
    return lands === undefined ? UNKNOWN : point(lands - atS);
  }

  /** When the cast of the button begun before the moment and still going lands; null when none is. */
  private finishing(token: string, atS: number, ctx: FactContext): number | null {
    const ids = ctx.castIds(token);
    const begun = ctx.begincasts.filter(event => ids.has(event.abilityGameID) && event.atS < atS).pop();
    const done = begun && ctx.casts.find(event => ids.has(event.abilityGameID) && event.atS >= begun.atS);
    return !begun || !done || done.atS <= atS ? null : done.atS;
  }

  private castTime(base: number | undefined, [fLo, fHi]: Range): Range {
    return base === undefined ? UNKNOWN : [base * fLo, base * fHi];
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

  /** A pet is out from its summon for the summon's duration. */
  private pet(pet: string, atS: number, ctx: FactContext): Range {
    const summon = SUMMON_PREFIXES.map(prefix => prefix + pet).find(token => ctx.list.spells[token]?.duration);
    if (!summon) return UNKNOWN;
    const last = ctx.castTimes(summon).filter(castS => castS < atS).pop();
    return point(last === undefined ? 0 : Math.max(0, last + (ctx.list.spells[summon]?.duration ?? 0) - atS));
  }
}
