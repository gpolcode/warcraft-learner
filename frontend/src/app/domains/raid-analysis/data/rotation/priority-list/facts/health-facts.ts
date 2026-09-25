import { Injectable } from '@angular/core';
import { UNKNOWN, CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';

/** Health as a share of its max: the cast's target's from the damage rows, the player's own from the cast. */
@Injectable({ providedIn: 'root' })
export class HealthFacts implements FactReader {
  readonly streams: FactStream[] = ['targetHealth'];

  matches(name: string): boolean {
    return name === 'target.health.pct' || name === 'health.pct';
  }

  read(name: string, moment: CastMoment, _action: string, ctx: FactContext): Range {
    if (name === 'health.pct') {
      const { hitPoints, maxHitPoints } = moment.event;
      return hitPoints != null && maxHitPoints ? [(hitPoints / maxHitPoints) * 100, (hitPoints / maxHitPoints) * 100] : UNKNOWN;
    }
    const last = moment.target ? ctx.targetHealth(moment.target).filter(([atS]) => atS <= moment.atS).pop() : undefined;
    return last ? [last[1] * 100, last[1] * 100] : UNKNOWN;
  }
}
