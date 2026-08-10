// Colocated with rotation.service.ts and rotation-transform.service.ts so the runtime and the ingest bench detect Bloodlust with the same code.
import { TimedEvent } from '../../../shared/analysis/wcl-projections';

/** Bloodlust / Heroism / Time Warp and equivalents. */
const BLOODLUST_IDS = new Set([2825, 32182, 80353, 90355, 264667, 390386]);

// A cast just before the pull still covers the opener, so this intentionally does not bound by fight start.
export function detectBloodlust(buffEvents: TimedEvent[]): number | null {
  for (const event of buffEvents) {
    if (event.type === 'applybuff' && BLOODLUST_IDS.has(event.abilityGameID)) {
      return event.atS;
    }
  }
  return null;
}
