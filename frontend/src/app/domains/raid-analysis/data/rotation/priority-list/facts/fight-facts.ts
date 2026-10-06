import { Injectable } from '@angular/core';
import { max, min } from 'd3-array';
import { UNKNOWN, AddSpan, CastMoment, FactContext, FactKind, FactPath, FactReader, FactStream, FieldRow, FieldWords, Range } from '../priority-list.models';
import { Words } from '../list-words';

interface FightState {
  moment: CastMoment;
  ctx: FactContext;
}

interface Adds {
  up: readonly AddSpan[];
  wave: readonly AddSpan[];
  next: number | undefined;
  exists: boolean;
}

/** Adds first hit this close together came as one wave. */
const WAVE_S = 3;
/** An AoE ability lands well inside a GCD or two of its cast. */
const TARGET_COUNT_WINDOW_S = 3;
/** The app reads raid bosses only, which SimC's Patchwerk styles stand for, so a dungeon style is never the one being played. */
const RAID_STYLES = new Set(['patchwerk', 'castingpatchwerk']);
const DUNGEON_STYLES = new Set(['dungeonroute', 'dungeonslice']);
/** Fields whose reading needs no stream, so a list of nothing but them fetches none. */
const STREAMLESS = new Set(['fight_style', 'in_combat', 'in_boss_encounter', 'time_to_bloodlust']);
const flag = (holds: boolean): Range => (holds ? [1, 1] : [0, 0]);
const at = (value: number): Range => [value, value];

/** A wipe never shows when the boss would have died, so its end bounds the clock only from below. */
const fightLeft = ({ moment: { atS }, ctx }: FightState): Range => (ctx.kill ? at(ctx.fightDurationS - atS) : [ctx.fightDurationS - atS, Infinity]);
/** An enemy whose last health reading is zero died then; one still standing lived at least that long. */
const targetLeft = (state: FightState): Range => {
  const { moment, ctx } = state;
  const last = moment.target ? ctx.targetHealth(moment.target).at(-1) : undefined;
  if (!last) return fightLeft(state);
  const [seenS, share] = last;
  return share === 0 ? at(seenS - moment.atS) : [Math.max(0, seenS - moment.atS), Infinity];
};
const timeToPct = (state: FightState, path: FactPath): Range => {
  const { moment, ctx } = state;
  if (!moment.target) return UNKNOWN;
  const reached = ctx.targetHealth(moment.target).find(([atS, share]) => atS >= moment.atS && share * 100 <= path.n);
  return reached ? at(reached[0] - moment.atS) : [fightLeft(state)[0], Infinity];
};
const enemies = ({ moment: { atS }, ctx }: FightState): Range => {
  const targets = new Set<string>();
  for (const [hitS, target] of ctx.damageIndex()) {
    if (hitS > atS + TARGET_COUNT_WINDOW_S) break;
    if (hitS >= atS) targets.add(target);
  }
  return targets.size ? at(targets.size) : [1, Infinity];
};
const healthPct = ({ moment, ctx }: FightState, path: FactPath): Range => {
  if (!path.target) {
    const { hitPoints, maxHitPoints } = moment.event;
    return hitPoints != null && maxHitPoints ? at((hitPoints / maxHitPoints) * 100) : UNKNOWN;
  }
  const last = moment.target ? ctx.targetHealth(moment.target).filter(([atS]) => atS <= moment.atS).pop() : undefined;
  return last ? at(last[1] * 100) : UNKNOWN;
};
const isBoss = ({ moment, ctx }: FightState): Range => {
  const spans = ctx.addSpans();
  return moment.target && spans ? flag(!spans.some(([, , target]) => target === moment.target)) : UNKNOWN;
};
/** The log shows when Bloodlust came, which SimC only plans. */
const bloodlust = ({ moment: { atS }, ctx }: FightState): Range => {
  const id = ctx.auraId('bloodlust', 'self');
  const next = id === null ? undefined : ctx.selfSpans(id).find(span => span.startS > atS);
  if (next) return at(next.startS - atS);
  return ctx.kill ? [Infinity, Infinity] : UNKNOWN;
};
const style = (_: FightState, path: FactPath): Range => (RAID_STYLES.has(path.subject) ? [1, 1] : DUNGEON_STYLES.has(path.subject) ? [0, 0] : UNKNOWN);

/** SimC's reading of each adds field (`engine/sim/raid_event.cpp`); adds are the enemies the player hit that are not the boss, up from the first hit to the last. */
const ADDS: Record<string, ((adds: Adds, atS: number) => Range) | undefined> = {
  exists: adds => flag(adds.exists),
  up: adds => flag(adds.up.length > 0),
  remains: (adds, atS) => at(adds.up.length ? (max(adds.up, ([, endS]) => endS) ?? atS) - atS : 0),
  in: (adds, atS) => at(adds.next === undefined ? Infinity : adds.next - atS),
  count: adds => at(adds.wave.length),
  duration: adds => at(max(adds.wave, ([startS, endS]) => endS - startS) ?? 0),
  has_boss: () => flag(false),
};
/** No pull of a dungeon route plays out on a raid boss, so the event never comes. */
const NO_PULL: Record<string, Range | undefined> = { exists: [0, 0], up: [0, 0], remains: [0, 0], in: [Infinity, Infinity], count: [0, 0], duration: [0, 0], has_boss: [0, 0] };
const adds = (spans: readonly AddSpan[], atS: number): Adds => {
  const next = min(spans.filter(([startS]) => startS > atS), ([startS]) => startS);
  return {
    up: spans.filter(([startS, endS]) => startS <= atS && atS <= endS),
    wave: next === undefined ? [] : spans.filter(([startS]) => startS >= next && startS <= next + WAVE_S),
    next, exists: spans.length > 0,
  };
};
const event = (field: string) => ({ moment: { atS }, ctx }: FightState, path: FactPath): Range => {
  if (path.subject === 'pull') return NO_PULL[field] ?? UNKNOWN;
  const spans = path.subject === 'adds' ? ctx.addSpans() : null;
  return spans ? ADDS[field]?.(adds(spans, atS), atS) ?? UNKNOWN : UNKNOWN;
};

const ENEMIES: FieldWords = { frame: 'count', unit: 'enemies', at: (_, op, n) => Words.enemies(op, n) };
/** The events SimC's raid profiles script, in the words a raider uses for each. */
const EVENTS: Record<string, Record<string, FieldWords | undefined> | undefined> = {
  adds: {
    exists: { frame: 'flag', states: ['Adds', 'No adds'], flag: (_, holds) => `in a fight ${holds ? 'with' : 'without'} adds` },
    up: { frame: 'flag', states: ['Adds up', 'No adds up'], flag: (_, holds) => (holds ? 'while adds are up' : 'while no adds are up') },
    in: { frame: 'away', unit: 's until adds', at: (_, op, n) => (Words.below(op) ? `when adds come within ${Words.secs(n)}` : `when adds are ${Words.lessMore(op)} ${Words.secs(n)} away`) },
    remains: { frame: 'left', unit: 's of adds left', at: (_, op, n) => `with ${Words.lessMore(op)} ${Words.secs(n)} of adds left` },
    count: { frame: 'count', unit: 'adds', at: (_, op, n) => `with ${Words.bound(op, n)} adds coming` },
    duration: { frame: 'seconds', unit: 's of adds', at: (_, op, n) => `with adds lasting ${Words.lessMore(op)} ${Words.secs(n)}` },
    has_boss: { frame: 'flag', states: ['With a boss', 'Without a boss'], flag: (_, holds) => `when the adds ${holds ? 'include' : 'leave out'} a boss` },
  },
  pull: { exists: { frame: 'flag', states: ['Dungeon', 'Raid'], flag: (_, holds) => (holds ? 'in a dungeon' : 'outside a dungeon') } },
  movement: {
    exists: { frame: 'flag', states: ['Movement', 'No movement'], flag: (_, holds) => `in a fight ${holds ? 'with' : 'without'} forced movement` },
    in: { frame: 'away', unit: 's until you move', at: (_, op, n) => (Words.below(op) ? `when you must move within ${Words.secs(n)}` : `with ${Words.lessMore(op)} ${Words.secs(n)} before you must move`) },
    up: { frame: 'flag', states: ['Moving', 'Standing still'], flag: (_, holds) => (holds ? 'while moving' : 'while standing still') },
  },
};
/** An event or field the lists do not use phrases by its own words. */
const eventWords = (field: string) => (path: FactPath): FieldWords => EVENTS[path.subject]?.[field] ?? { frame: 'amount', label: Words.spaced(field) };
const styleWords = (path: FactPath): FieldWords => {
  if (RAID_STYLES.has(path.subject)) return { frame: 'flag', states: ['Raid boss', 'Not a raid boss'], flag: (_, holds) => `${holds ? 'against' : 'away from'} a raid boss` };
  if (DUNGEON_STYLES.has(path.subject)) return { frame: 'flag', states: ['Dungeon', 'Raid'], flag: (_, holds) => `${holds ? 'in' : 'outside'} a dungeon` };
  return { frame: 'flag', states: ['Yes', 'No'], flag: (_, holds) => `${holds ? 'in' : 'outside'} a ${Words.spaced(path.subject)} fight` };
};
const eventRow = (field: string): FieldRow<FightState> => ({ value: event(field), words: eventWords(field) });

const FIELDS: Record<string, FieldRow<FightState> | undefined> = {
  time: {
    value: ({ moment }) => at(moment.atS),
    words: { frame: 'seconds', unit: 's in', at: (_, op, n) => (Words.below(op) ? `in the first ${Words.secs(n)} of the fight` : `after the first ${Words.secs(n)} of the fight`) },
  },
  in_combat: { value: () => [1, 1], words: { frame: 'flag', states: ['In combat', 'Out of combat'], flag: (_, holds) => (holds ? 'while in combat' : 'while out of combat') } },
  fight_remains: {
    value: fightLeft,
    words: { frame: 'left', unit: 's left', at: (_, op, n) => (Words.below(op) ? `in the last ${Words.secs(n)} of the fight` : `with ${Words.lessMore(op)} ${Words.secs(n)} of the fight left`) },
  },
  expected_combat_length: {
    value: ({ ctx }) => (ctx.kill ? at(ctx.fightDurationS) : [ctx.fightDurationS, Infinity]),
    words: { frame: 'seconds', unit: 's long', at: (_, op, n) => `in a fight ${Words.lessMore(op)} ${Words.secs(n)} long` },
  },
  time_to_die: { value: targetLeft, words: { frame: 'left', unit: 's to live', at: (_, op, n) => `when the target has ${Words.lessMore(op)} ${Words.secs(n)} to live` } },
  time_to_pct: {
    value: timeToPct,
    words: { frame: 'away', unit: 's to the mark', at: (_, op, n, path) => `when the target is ${Words.lessMore(op)} ${Words.secs(n)} from ${path.n}% health` },
  },
  time_to_bloodlust: { value: bloodlust, words: { frame: 'away', unit: 's to Bloodlust', at: (_, op, n) => `when Bloodlust is ${Words.lessMore(op)} ${Words.secs(n)} away` } },
  active_enemies: { value: enemies, words: ENEMIES },
  desired_targets: { words: { frame: 'count', unit: 'enemies', at: (_, op, n) => `in a fight set up for ${Words.bound(op, n)} enemies` } },
  'health.pct': {
    value: healthPct,
    words: { frame: 'percent', unit: '% health', at: (_, op, n, path) => `${Words.below(op) ? 'below' : 'above'} ${n}% ${path.target ? 'target ' : ''}health` },
  },
  health: { words: { frame: 'amount', unit: 'health', at: (_, op, n, path) => `with ${path.target ? 'target' : 'your'} health ${Words.lessMore(op)} ${n}` } },
  'health.max': { words: { frame: 'amount', unit: 'max health', at: (_, op, n, path) => `with ${path.target ? 'target' : 'your'} max health ${Words.lessMore(op)} ${n}` } },
  is_boss: { value: isBoss, words: { frame: 'flag', states: ['Boss', 'Add'], flag: (_, holds) => (holds ? 'against the boss' : 'against an add') } },
  in_boss_encounter: { value: () => [1, 1], words: { frame: 'flag', states: ['Boss fight', 'Not a boss fight'], flag: (_, holds) => `${holds ? 'in' : 'outside'} a boss fight` } },
  fight_style: { value: style, words: styleWords },
  ...Object.fromEntries(['exists', 'up', 'remains', 'in', 'count', 'duration', 'has_boss'].map(field => [`raid_event.${field}`, eventRow(field)])),
};

/** The encounter around the cast: its clock, its enemies, the target's health and the events SimC scripts. */
@Injectable({ providedIn: 'root' })
export class FightFacts implements FactReader {
  readonly kinds: FactKind[] = ['fight'];
  readonly fields = FIELDS;

  streams(path: FactPath): FactStream[] {
    return STREAMLESS.has(path.field) ? [] : ['damage'];
  }

  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    return FIELDS[path.field]?.value?.({ moment, ctx }, path) ?? UNKNOWN;
  }
}
