import { inject, Injectable } from '@angular/core';
import { TimedEvent } from '../analysis/wcl-projections-service';
import { AuraWindowsService } from '../analysis/aura-windows-service';

@Injectable({ providedIn: 'root' })
export class RotationBloodlustService {
  private readonly auraWindows = inject(AuraWindowsService);

  // Returns whatever start buildAuraWindows finds, negative included: a Lust cast before the pull still covers the opener.
  detectBloodlust(buffEvents: TimedEvent[]): number | null {
    return this.lustSpan(buffEvents, Number.POSITIVE_INFINITY)?.startS ?? null;
  }

  /** The earliest Bloodlust aura on the player; one still up when the log ends closes at `fightEndS`. */
  lustSpan(buffEvents: TimedEvent[], fightEndS: number): { startS: number; endS: number } | null {
    const windows = this.auraWindows.buildAuraWindows(buffEvents);
    const spans = [...BLOODLUST_IDS]
      .map(id => windows.get(id)?.[0])
      .filter((span): span is [number, number | null] => span != null)
      .sort((a, b) => a[0] - b[0]);
    const [first] = spans;
    return first ? { startS: first[0], endS: first[1] ?? fightEndS } : null;
  }
}

export const BLOODLUST_IDS = new Set([2825, 32182, 80353, 90355, 264667, 390386]);
