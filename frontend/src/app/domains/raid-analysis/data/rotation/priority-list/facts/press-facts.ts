import { Injectable } from '@angular/core';
import { mode } from 'd3-array';
import type { TimedEvent } from '../../../analysis/wcl-projections-service';
import { SUMMON_PREFIXES, UNKNOWN, CastMoment, FactContext, FactKind, FactPath, FactReader, FactStream, FieldRow, FieldWords, Range } from '../priority-list.models';
import { Words } from '../list-words';

interface PressState {
  moment: CastMoment;
  ctx: FactContext;
  /** The listed casts before the moment, newest first; a cast the list never names is a utility press, not part of the rotation SimC counts. */
  before: readonly TimedEvent[];
}

const GCD_FLOOR_S = 0.75;
/** A class whose global cooldown is a flat second never has it hasted. */
const FLAT_GCD_S = 1;
/** Haste can at most halve a cast when no hardcast in the log narrows it. */
const HASTE_FACTOR_MIN = 0.5;
/** A shot the log never shows landing was lost to a dead target, so past this it stops counting. */
const LOST_AFTER_S = 5;
const flag = (holds: boolean): Range => (holds ? [1, 1] : [0, 0]);
const at = (value: number): Range => [value, value];
const hits = (event: TimedEvent | undefined, ids: ReadonlySet<number>): boolean => !!event && ids.has(event.abilityGameID);

const prev = ({ before, ctx }: PressState, path: FactPath): Range => flag(hits(before[0], ctx.castIds(path.subject)));
const prevGcd = ({ before, ctx }: PressState, path: FactPath): Range => flag(hits(before.filter(event => ctx.gcd(event.abilityGameID))[path.n - 1], ctx.castIds(path.subject)));
/** The off-GCD casts since the last one on it. */
const prevOffGcd = ({ before, ctx }: PressState, path: FactPath): Range => {
  const lastGcd = before.findIndex(event => ctx.gcd(event.abilityGameID));
  const ids = ctx.castIds(path.subject);
  return flag((lastGcd === -1 ? before : before.slice(0, lastGcd)).some(event => ids.has(event.abilityGameID)));
};
const comboStrike = ({ before, ctx }: PressState, path: FactPath): Range => flag(!hits(before.find(event => ctx.gcd(event.abilityGameID)), ctx.castIds(path.subject)));
const lastUsed = ({ before, ctx, moment }: PressState, path: FactPath): Range => {
  const last = before.find(event => ctx.castIds(path.subject).has(event.abilityGameID));
  return last ? at(moment.atS - last.atS) : [Infinity, Infinity];
};
/** Each landing takes the oldest cast still in the air; one the same instant as its cast is the instant hit of a spell that never flies. */
const flying = (casts: readonly number[], landings: readonly number[], atS: number): number => {
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
};
const inFlight = ({ ctx, moment: { atS } }: PressState, { subject }: FactPath): Range => flag(flying(ctx.castTimes(subject), ctx.landings(subject), atS) > 0);
const inFlightCount = ({ ctx, moment: { atS } }: PressState, { subject }: FactPath): Range => at(flying(ctx.castTimes(subject), ctx.landings(subject), atS));
const inFlightRemains = ({ ctx, moment: { atS } }: PressState, { subject }: FactPath): Range => {
  if (!flying(ctx.castTimes(subject), ctx.landings(subject), atS)) return [0, 0];
  const lands = ctx.landings(subject).find(landS => landS > atS);
  return lands === undefined ? UNKNOWN : at(lands - atS);
};
/** A cast still going at the moment: begun before it, done after. */
const executing = ({ ctx, moment: { atS } }: PressState, { subject }: FactPath): number | null => {
  const ids = ctx.castIds(subject);
  const begun = ctx.begincasts.filter(event => ids.has(event.abilityGameID) && event.atS < atS).pop();
  const done = begun && ctx.casts.find(event => ids.has(event.abilityGameID) && event.atS >= begun.atS);
  return !begun || !done || done.atS <= atS ? null : done.atS - atS;
};
const pet = ({ ctx, moment: { atS } }: PressState, { subject }: FactPath): number | null => {
  const summon = SUMMON_PREFIXES.map(prefix => prefix + subject).find(token => ctx.list.spells[token]?.duration);
  if (!summon) return null;
  const last = ctx.castTimes(summon).filter(castS => castS < atS).pop();
  return last === undefined ? 0 : Math.max(0, last + (ctx.list.spells[summon]?.duration ?? 0) - atS);
};

const LAST_PRESS: FieldWords = { frame: 'flag', states: ['Last press', 'Not last press'], flag: (noun, holds) => `${Words.not(holds)}right after ${noun}` };
const pressesBack = (path: FactPath): FieldWords => (path.n <= 1 ? LAST_PRESS : {
  frame: 'flag', states: [`${path.n} presses back`, `Not ${path.n} presses back`], flag: (noun, holds) => `${Words.not(holds)}with ${noun} ${path.n} presses back`,
});
const IN_THE_AIR: FieldWords = { frame: 'flag', states: ['In the air', 'Not in the air'] };
const CASTING: FieldWords = { frame: 'flag', states: ['Casting', 'Not casting'], flag: (noun, holds) => `while ${Words.not(holds)}casting ${noun}` };
const CAST_TIME: FieldWords = { frame: 'seconds', label: 'cast time', unit: 's' };
const GCD: FieldWords = { frame: 'seconds', unit: 's', at: (_, op, n) => `with a global cooldown ${Words.lessMore(op)} ${Words.secs(n)}` };

const FIELDS: Record<string, FieldRow<PressState> | undefined> = {
  prev: { value: prev, words: LAST_PRESS },
  prev_off_gcd: { value: prevOffGcd, words: LAST_PRESS },
  prev_gcd: { value: prevGcd, words: pressesBack },
  combo_strike: {
    value: comboStrike,
    words: { frame: 'flag', states: ['Not a repeat', 'Repeats last press'], flag: (_, holds) => (holds ? 'when it does not repeat your last press' : 'when it repeats your last press') },
  },
  last_used: { value: lastUsed, words: { frame: 'seconds', unit: 's since pressed', at: (noun, op, n) => `with ${Words.lessMore(op)} ${Words.secs(n)} since you last pressed ${noun}` } },
  in_flight: { value: inFlight, words: IN_THE_AIR },
  in_flight_count: { value: inFlightCount, words: { frame: 'count', unit: 'in the air', at: (noun, op, n) => `with ${Words.bound(op, n)} ${noun} in the air` } },
  in_flight_remains: { value: inFlightRemains, words: { frame: 'away', unit: 's to land', at: (noun, op, n) => `with ${Words.lessMore(op)} ${Words.secs(n)} until ${noun} lands` } },
  placed: { value: inFlight, words: { frame: 'flag', states: ['Placed', 'Not placed'], flag: (noun, holds) => `while ${noun} is ${Words.not(holds)}about to go off` } },
  executing: { value: (state, path) => flag(executing(state, path) !== null), words: CASTING },
  execute_remains: {
    value: (state, path) => at(executing(state, path) ?? 0),
    words: { frame: 'seconds', unit: 's of cast left', at: (noun, op, n) => `with ${Words.lessMore(op)} ${Words.secs(n)} left on the ${noun} cast` },
  },
  cast_time: { words: CAST_TIME },
  execute_time: { words: CAST_TIME },
  gcd: { words: GCD },
  'gcd.remains': { words: { frame: 'left', unit: 's of GCD left', at: (_, op, n) => `with ${Words.lessMore(op)} ${Words.secs(n)} of global cooldown left` } },
  'pet.active': { value: (state, path) => flag((pet(state, path) ?? NaN) > 0), words: { frame: 'flag', states: ['Out', 'Not out'], flag: (noun, holds) => `while ${noun} is ${Words.not(holds)}out` } },
  'pet.remains': { value: (state, path) => { const left = pet(state, path); return left === null ? UNKNOWN : at(left); }, words: { frame: 'left' } },
};
/** Fields that read the log's landings. */
const LANDING_FIELDS = new Set(['in_flight', 'in_flight_count', 'in_flight_remains', 'placed']);

/** What the player pressed around the moment: the casts before it, the shots still in the air, the cast under way, and how long the next one takes. */
@Injectable({ providedIn: 'root' })
export class PressFacts implements FactReader {
  readonly kinds: FactKind[] = ['press'];
  readonly fields = FIELDS;

  streams(path: FactPath): FactStream[] {
    return LANDING_FIELDS.has(path.field) ? ['damage'] : [];
  }

  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    if (path.field === 'cast_time' || path.field === 'execute_time') return this.castTime(path, moment, ctx);
    if (path.field === 'gcd') return this.gcd(moment.atS, ctx);
    if (path.field === 'gcd.remains') return this.gcdRemains(moment, ctx);
    const row = FIELDS[path.field];
    if (!row?.value) return UNKNOWN;
    if (path.field === 'pet.active' && pet({ moment, ctx, before: [] }, path) === null) return UNKNOWN;
    const before = ctx.casts.slice(0, moment.index).filter(event => ctx.gcd(event.abilityGameID) !== null).reverse();
    return row.value({ moment, ctx, before }, path);
  }

  private castTime(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    const base = ctx.list.spells[path.subject]?.cast_time;
    if (base === undefined) return UNKNOWN;
    const [fLo, fHi] = this.haste(moment.atS, ctx);
    const cast: Range = [base * fLo, base * fHi];
    if (path.field === 'cast_time') return cast;
    const gcd = this.gcd(moment.atS, ctx);
    return [Math.max(cast[0], gcd[0]), Math.max(cast[1], gcd[1])];
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
  private gcdRemains(moment: CastMoment, ctx: FactContext): Range {
    if (ctx.gcd(moment.event.abilityGameID)) return [0, 0];
    const last = ctx.casts.slice(0, moment.index).reverse().find(event => ctx.gcd(event.abilityGameID));
    if (!last) return [0, 0];
    const [gLo, gHi] = this.gcd(moment.atS, ctx);
    return [Math.max(0, last.atS + gLo - moment.atS), Math.max(0, last.atS + gHi - moment.atS)];
  }
}
