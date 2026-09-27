import { Injectable } from '@angular/core';
import { SUMMON_PREFIXES } from '../../../simc/spec-plan-service';
import { UNKNOWN, CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';

const PET = /^pet\.(\w+)\.(active|remains)$/;
const FLIGHT = /^(?:action\.(\w+)\.)?(in_flight|in_flight_count|in_flight_remains|placed)$/;
/** A shot the log never shows landing was lost to a dead target, so past this it stops counting. */
const LOST_AFTER_S = 5;

/** A button pressed lately and still at work: a pet out for its summon's duration, a projectile or sigil until it lands. */
@Injectable({ providedIn: 'root' })
export class RecentCastFacts implements FactReader {
  readonly streams: FactStream[] = ['damage'];

  matches(name: string): boolean {
    return PET.test(name) || FLIGHT.test(name);
  }

  read(name: string, { atS }: CastMoment, action: string, ctx: FactContext): Range {
    const [, pet, petField = ''] = PET.exec(name) ?? [];
    if (pet) return this.pet(pet, petField, atS, ctx);
    const [, token = action, field = ''] = FLIGHT.exec(name) ?? [];
    return this.flight(field, this.flying(ctx.castTimes(token), ctx.landings(token), atS), ctx.landings(token), atS);
  }

  private flight(field: string, flying: number, landings: readonly number[], atS: number): Range {
    if (field === 'in_flight_count') return [flying, flying];
    if (field !== 'in_flight_remains') return flying ? [1, 1] : [0, 0];
    const lands = landings.find(landS => landS > atS);
    if (!flying) return [0, 0];
    return lands === undefined ? UNKNOWN : [lands - atS, lands - atS];
  }

  private pet(pet: string, field: string, atS: number, ctx: FactContext): Range {
    const summon = SUMMON_PREFIXES.map(prefix => prefix + pet).find(token => ctx.list.spells[token]?.duration);
    if (!summon) return UNKNOWN;
    const last = ctx.castTimes(summon).filter(castS => castS < atS).pop();
    const left = last === undefined ? 0 : Math.max(0, last + (ctx.list.spells[summon]?.duration ?? 0) - atS);
    return field === 'remains' ? [left, left] : left > 0 ? [1, 1] : [0, 0];
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
}
