import { Injectable } from '@angular/core';
import type { CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';

const ENEMIES = /^(active_enemies|spell_targets(\.\w+)?)$/;
/** Enemies damaged this soon after a cast count as engaged for it; an AoE ability lands well inside a GCD or two. */
const TARGET_COUNT_WINDOW_S = 3;

/** `active_enemies` and `spell_targets`: every enemy the player damaged in the seconds after the cast, since both ask how many were up to be hit. */
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
