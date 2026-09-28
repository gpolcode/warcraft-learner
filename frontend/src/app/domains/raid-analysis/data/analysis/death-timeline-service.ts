import { Injectable } from '@angular/core';
import { getOrInsert } from './analysis-math';
import { TimedEvent } from './wcl-projections-service';

/** `[diedS, backS)`: from a death to the resurrect after it, or to the fight end. */
export type DeadSpan = [number, number];

interface LifeEdge {
  atS: number;
  playerId: number;
  died: boolean;
}

@Injectable({ providedIn: 'root' })
export class DeathTimelineService {
  /** Keyed by the dead player's actor id. */
  deadSpans(deaths: TimedEvent[], resurrects: TimedEvent[], fightEndS: number): Map<number, DeadSpan[]> {
    const diedAtS = new Map<number, number>();
    const spans = new Map<number, DeadSpan[]>();
    for (const { atS, playerId, died } of this.timeline(deaths, resurrects)) {
      const sinceS = diedAtS.get(playerId);
      if (died && sinceS === undefined) {
        diedAtS.set(playerId, atS);
      } else if (!died && sinceS !== undefined) {
        getOrInsert(spans, playerId, () => []).push([sinceS, atS]);
        diedAtS.delete(playerId);
      }
    }
    for (const [playerId, sinceS] of diedAtS) getOrInsert(spans, playerId, () => []).push([sinceS, fightEndS]);
    return spans;
  }

  /** The first instant `count` players are dead at once, or null when they never are. */
  firstDeadAtOnceS(deaths: TimedEvent[], resurrects: TimedEvent[], count: number): number | null {
    const dead = new Set<number>();
    for (const { atS, playerId, died } of this.timeline(deaths, resurrects)) {
      if (died) dead.add(playerId);
      else dead.delete(playerId);
      if (dead.size >= count) return atS;
    }
    return null;
  }

  deadWithin(spans: readonly DeadSpan[], startS: number, endS: number): boolean {
    return spans.some(([diedS, backS]) => diedS < endS && backS > startS);
  }

  // At a tied timestamp a resurrect lands before a death: a battle-rez in the same instant keeps another death from making the wipe, and does not end the death it shares the instant with.
  private timeline(deaths: TimedEvent[], resurrects: TimedEvent[]): LifeEdge[] {
    const edges = (events: TimedEvent[], died: boolean): LifeEdge[] => events.flatMap(event =>
      event.targetID === undefined ? [] : [{ atS: event.atS, playerId: event.targetID, died }]);
    return [...edges(deaths, true), ...edges(resurrects, false)]
      .sort((a, b) => a.atS - b.atS || Number(a.died) - Number(b.died));
  }
}
