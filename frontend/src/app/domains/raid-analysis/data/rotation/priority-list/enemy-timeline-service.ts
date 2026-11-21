import { Injectable } from '@angular/core';
import { quantile } from 'd3-array';
import { ENEMY_STEP_S, EnemyTimeline, FactContext, Range } from './priority-list.models';

/** Under this many top logs hitting anything in a step, one log's assignment would set the encounter's count there. */
const MIN_TIMELINE_LOGS = 3;
/** The middle of the top logs, so one log that cleaved onto a stray add or left the boss for an assignment does not widen the range. */
const LOW_QUANTILE = 0.1;
const HIGH_QUANTILE = 0.9;

@Injectable({ providedIn: 'root' })
export class EnemyTimelineService {
  /** Per step from the pull, how many enemies the log's player hit; null where they hit none, which says nothing of the count. */
  series(ctx: FactContext): (number | null)[] {
    const steps = Array.from({ length: Math.ceil(ctx.fightDurationS / ENEMY_STEP_S) }, () => new Set<string>());
    for (const [hitS, target] of ctx.damageIndex()) steps[Math.floor(hitS / ENEMY_STEP_S)]?.add(target);
    return steps.map(targets => targets.size || null);
  }

  /** Null when no step has enough top logs to say. */
  timeline(series: readonly (readonly (number | null)[])[]): EnemyTimeline | null {
    const length = Math.max(0, ...series.map(log => log.length));
    const steps = Array.from({ length }, (_, step): Range | null => {
      const counts = series.flatMap(log => log[step] ?? []);
      if (counts.length < MIN_TIMELINE_LOGS) return null;
      return [Math.floor(quantile(counts, LOW_QUANTILE) ?? 1), Math.ceil(quantile(counts, HIGH_QUANTILE) ?? 1)];
    });
    return steps.some(step => step) ? steps : null;
  }
}
