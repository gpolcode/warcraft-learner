import { Injectable } from '@angular/core';
import { max, min } from 'd3-array';
import { UNKNOWN, AddSpan, CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';

const RAID_EVENT = /^raid_event\.(adds|pull)\.(\w+)$/;
/** Adds first hit this close together came as one wave. */
const WAVE_S = 3;

interface Adds {
  up: readonly AddSpan[];
  wave: readonly AddSpan[];
  next: number | undefined;
  exists: boolean;
}

const flag = (holds: boolean): Range => (holds ? [1, 1] : [0, 0]);
const at = (value: number): Range => [value, value];
/** SimC's reading of each field (`engine/sim/raid_event.cpp`), an event that never comes reading `in` as never and the rest as 0. */
const FIELDS: Record<string, ((adds: Adds, atS: number) => Range) | undefined> = {
  exists: adds => flag(adds.exists),
  up: adds => flag(adds.up.length > 0),
  remains: (adds, atS) => at(adds.up.length ? (max(adds.up, ([, endS]) => endS) ?? atS) - atS : 0),
  in: (adds, atS) => at(adds.next === undefined ? Infinity : adds.next - atS),
  count: adds => at(adds.wave.length),
  duration: adds => at(max(adds.wave, ([startS, endS]) => endS - startS) ?? 0),
  has_boss: () => flag(false),
};

/** No pull of a dungeon route plays out on a raid boss; adds are the enemies the player hit that are not the boss, up from the first hit to the last. */
@Injectable({ providedIn: 'root' })
export class RaidEventFacts implements FactReader {
  readonly streams: FactStream[] = ['targetHealth'];

  matches(name: string): boolean {
    return RAID_EVENT.test(name);
  }

  read(name: string, { atS }: CastMoment, _action: string, ctx: FactContext): Range {
    const [, kind, field = ''] = RAID_EVENT.exec(name) ?? [];
    const spans = kind === 'adds' ? ctx.addSpans() : [];
    return spans ? FIELDS[field]?.(this.adds(spans, atS), atS) ?? UNKNOWN : UNKNOWN;
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
