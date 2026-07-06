/**
 * The one contract every per-use-case slice's data source satisfies: read the slice's
 * prepared, ready-to-render bench for an encounter. Two adapters cross this seam -
 * `FileDataSource<T>` (production: reads the ingest-baked tailored file) and the slice's
 * own `*TransformService` (the dev `useLiveTransform` flag / ingestion: computes it live).
 *
 * `T` is the slice's own bench shape (e.g. `RotationBench`, `BurstBench`, `MapData`). The
 * per-slice `*_DATA_SOURCE` token is typed `InjectionToken<DataSource<XBench>>`, so each
 * feature service injects a source already narrowed to its bench.
 *
 * The read returns a `Result`: `ok(bench)` when the tailored file exists, `err(missing)`
 * for an un-ingested encounter (a 404, which drives the bench-empty waiting state), and
 * `err(transient)` / `err(permanent)` when the read itself failed. Callers discriminate
 * on `.ok` instead of null-checking, so an outage never masquerades as "not ingested".
 */
import { Result, LoadError } from '../result';

export interface DataSource<T> {
  getBench(spec: string, encounterId: number): Promise<Result<T, LoadError>>;
}
