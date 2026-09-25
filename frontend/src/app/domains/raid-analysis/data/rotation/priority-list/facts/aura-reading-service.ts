import { Injectable, inject } from '@angular/core';
import { AuraWindowsService, AuraSpan, StackTimeline } from '../../../analysis/aura-windows-service';
import type { Range } from '../priority-list.models';

/** Up going INTO a cast: an aura the cast itself applies is not up for it, one the cast consumes is. */
export interface AuraAt {
  /** The last application or refresh before the cast. */
  appliedS: number;
  /** When the aura finally dropped; null when it outlived the log. */
  endS: number | null;
}

@Injectable({ providedIn: 'root' })
export class AuraReadingService {
  private readonly auraWindows = inject(AuraWindowsService);

  /** `spans` are one aura's spans on one actor, time-ordered, a refresh ending one span and starting the next. */
  auraAt(spans: readonly AuraSpan[], atS: number): AuraAt | null {
    const index = spans.findIndex(span => span.startS < atS && (span.endS == null || atS <= span.endS));
    const current = spans[index];
    if (!current) return null;
    let last = current;
    for (const next of spans.slice(index + 1)) {
      if (!last.endedByRefresh) break;
      last = next;
    }
    return { appliedS: current.startS, endS: last.endS };
  }

  /** The log shows when the aura dropped and the spell data when it was due to; a consumed or extended aura sits between the two. */
  remains(aura: AuraAt | null, duration: number, atS: number, fightEndS: number): Range {
    if (!aura) return [0, 0];
    const actual: Range = aura.endS == null ? [fightEndS - atS, Infinity] : [aura.endS - atS, aura.endS - atS];
    if (!duration) return actual;
    const due = aura.appliedS + duration - atS;
    return [Math.min(actual[0], due), Math.max(actual[1], due)];
  }

  /** A timeline that starts mid-aura knows nothing before its first event, so an up aura then holds anywhere from one stack to its cap. */
  stacks(timeline: StackTimeline, up: boolean, maxStacks: number, atS: number): Range {
    if (!up) return [0, 0];
    const count = this.auraWindows.stacksAt(timeline, atS);
    if (count === null || count === 0) return [1, maxStacks || Infinity];
    return [count, count];
  }
}
