import type { EncounterEntry } from '../core/models/encounter.models';
import type { IngestEncounter } from './models/wcl.models';

/** The index lists the current zone's encounters even at zero samples (they must stay selectable while a new raid waits for parses); an empty `current` (no live zone resolved) keeps the on-disk entries so one bad discovery never blanks the UI. */
export function encounterIndexEntries(current: IngestEncounter[], onDisk: EncounterEntry[]): EncounterEntry[] {
  if (!current.length) return onDisk;
  const samplesById = new Map(onDisk.map(entry => [entry.id, entry.sample_count]));
  return current.map(encounter => ({ id: encounter.id, name: encounter.name, sample_count: samplesById.get(encounter.id) ?? 0 }));
}
