import { Injectable } from '@angular/core';
import type { CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';

const ENEMIES = /^(active_enemies|spell_targets(\.\w+)?)$/;
/** An AoE ability lands well inside a GCD or two of its cast. */
const TARGET_COUNT_WINDOW_S = 3;

/** `spell_targets` reads the same count as `active_enemies`, since both ask how many enemies were up to be hit. */
@Injectable({ providedIn: 'root' })
export class EnemyFacts implements FactReader {
  readonly streams: FactStream[] = ['damage'];

  matches(name: string): boolean {
    return ENEMIES.test(name);
  }

  read(_name: string, { atS }: CastMoment, _action: string, ctx: FactContext): Range {
    const targets = new Set<string>();
    for (const [hitS, target] of ctx.damageIndex()) {
      if (hitS > atS + TARGET_COUNT_WINDOW_S) break;
      if (hitS >= atS) targets.add(target);
    }
    return targets.size ? [targets.size, targets.size] : [1, Infinity];
  }
}
