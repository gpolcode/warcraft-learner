import { Injectable } from '@angular/core';
import { max, min } from 'd3-array';
import { UNKNOWN, AddSpan, CastMoment, FactContext, FactPath, FactReader, FactStream, HealthRow, Range } from '../priority-list.models';

/** An AoE ability lands well inside a GCD or two of its cast. */
const TARGET_COUNT_WINDOW_S = 3;
/** Adds first hit this close together came as one wave. */
const WAVE_S = 3;
const ADDS_PREFIX = 'raid_event.adds.';

interface Adds {
  up: readonly AddSpan[];
  wave: readonly AddSpan[];
  next: number | undefined;
  exists: boolean;
}

const flag = (holds: boolean): Range => (holds ? [1, 1] : [0, 0]);
const point = (value: number): Range => [value, value];
/** SimC's reading of each adds field (`engine/sim/raid_event.cpp`), an event that never comes reading `in` as never and the rest as 0. */
const ADDS: Record<string, ((adds: Adds, atS: number) => Range) | undefined> = {
  exists: adds => flag(adds.exists),
  up: adds => flag(adds.up.length > 0),
  remains: (adds, atS) => point(adds.up.length ? (max(adds.up, ([, endS]) => endS) ?? atS) - atS : 0),
  in: (adds, atS) => point(adds.next === undefined ? Infinity : adds.next - atS),
  count: adds => point(adds.wave.length),
  duration: adds => point(max(adds.wave, ([startS, endS]) => endS - startS) ?? 0),
};

/** The encounter around the cast: its clock, the enemies up, their health and the adds, which are the enemies the player hit that are not the boss. */
@Injectable({ providedIn: 'root' })
export class FightFacts implements FactReader {
  readonly kind = 'fight';
  private readonly fields: Record<string, ((moment: CastMoment, ctx: FactContext) => Range) | undefined> = {
    time: ({ atS }) => point(atS),
    fight_remains: ({ atS }, ctx) => this.left(atS, ctx),
    expected_combat_length: (_, ctx) => (ctx.kill ? point(ctx.fightDurationS) : [ctx.fightDurationS, Infinity]),
    time_to_die: ({ atS, target }, ctx) => (target ? this.targetLeft(ctx.targetHealth(target), atS, this.left(atS, ctx)) : this.left(atS, ctx)),
    active_enemies: ({ atS }, ctx) => this.enemies(atS, ctx),
    'health.pct': ({ event }) => (event.hitPoints != null && event.maxHitPoints ? point((event.hitPoints / event.maxHitPoints) * 100) : UNKNOWN),
    'target.health.pct': ({ atS, target }, ctx) => {
      const last = target ? ctx.targetHealth(target).filter(([seenS]) => seenS <= atS).pop() : undefined;
      return last ? point(last[1] * 100) : UNKNOWN;
    },
  };

  streams(): FactStream[] {
    return ['damage'];
  }

  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    if (!path.field.startsWith(ADDS_PREFIX)) return this.fields[path.field]?.(moment, ctx) ?? UNKNOWN;
    const spans = ctx.addSpans();
    return spans ? ADDS[path.field.slice(ADDS_PREFIX.length)]?.(this.adds(spans, moment.atS), moment.atS) ?? UNKNOWN : UNKNOWN;
  }

  /** A wipe never shows when the boss would have died, so its end bounds the clock only from below. */
  private left(atS: number, ctx: FactContext): Range {
    const end = ctx.fightDurationS;
    return ctx.kill ? [end - atS, end - atS] : [end - atS, Infinity];
  }

  /** An enemy whose last health reading is zero died then; one still standing lived at least that long. */
  private targetLeft(rows: readonly HealthRow[], atS: number, fightLeft: Range): Range {
    const last = rows[rows.length - 1];
    if (!last) return fightLeft;
    const [seenS, share] = last;
    return share === 0 ? [seenS - atS, seenS - atS] : [Math.max(0, seenS - atS), Infinity];
  }

  private enemies(atS: number, ctx: FactContext): Range {
    const targets = new Set<string>();
    for (const [hitS, target] of ctx.damageIndex()) {
      if (hitS > atS + TARGET_COUNT_WINDOW_S) break;
      if (hitS >= atS) targets.add(target);
    }
    return targets.size ? point(targets.size) : [1, Infinity];
  }

  private adds(spans: readonly AddSpan[], atS: number): Adds {
    const next = min(spans.filter(([startS]) => startS > atS), ([startS]) => startS);
    return {
      up: spans.filter(([startS, endS]) => startS <= atS && atS <= endS),
      wave: next === undefined ? [] : spans.filter(([startS]) => startS >= next && startS <= next + WAVE_S),
      next, exists: spans.length > 0,
    };
  }
}
