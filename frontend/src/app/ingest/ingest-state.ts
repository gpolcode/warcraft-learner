// On disk a never-checked encounter and one WCL has no Mythic parses for look identical (no burst file); this marker separates them so the second stops outranking the specs that need refreshing.
import * as z from '../core/zod-mini';
import { type IngestStamp } from './signature';

export interface SpecIngestState {
  ingest_version: number;
  ingested_at_s: number;
  empty_encounter_ids: number[];
}

const INGEST_STATE_SCHEMA = z.looseObject({
  ingest_version: z.number(),
  ingested_at_s: z.number(),
  empty_encounter_ids: z.array(z.number()),
});

/** A malformed marker reads as no marker: the spec loop that reads it has no per-spec catch, so throwing there would abort the whole run. */
export function readIngestState(parsed: unknown): SpecIngestState | null {
  const file = INGEST_STATE_SCHEMA.safeParse(parsed);
  if (!file.success) return null;
  const { ingest_version, ingested_at_s, empty_encounter_ids } = file.data;
  return { ingest_version, ingested_at_s, empty_encounter_ids };
}

/** `benchedIds` comes from re-listing the burst directory, so a mark clears itself even when an earlier run died between writing a bench and updating the marker. */
export function nextIngestState(
  previous: SpecIngestState | null,
  emptyThisPass: readonly number[],
  benchedIds: ReadonlySet<number>,
  stamp: IngestStamp,
): SpecIngestState {
  const marked = new Set([...(previous?.empty_encounter_ids ?? []), ...emptyThisPass]);
  return {
    ingest_version: stamp.version,
    ingested_at_s: stamp.ingestedAtS,
    empty_encounter_ids: [...marked].filter(id => !benchedIds.has(id)).sort((a, b) => a - b),
  };
}

/** Null means nothing to write, so the prune pass never restamps a marker it did not change and the report's age column keeps naming the real last check. */
export function prunedIngestState(
  previous: SpecIngestState | null,
  keepIds: ReadonlySet<number>,
): SpecIngestState | null {
  if (!previous) return null;
  const kept = previous.empty_encounter_ids.filter(id => keepIds.has(id));
  if (kept.length === previous.empty_encounter_ids.length) return null;
  return { ...previous, empty_encounter_ids: kept };
}

/** The file server's crashed temp writes are named `<id>.json.<pid>.<n>.tmp`, so only an exact `.json` name is an encounter. */
export function encounterIdsFromFiles(files: readonly string[]): number[] {
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => parseInt(file))
    .filter(id => Number.isFinite(id))
    .sort((a, b) => a - b);
}
