/**
 * Empty-encounter environment (swapped in by the `empty` build configuration).
 *
 * `useLiveTransform: false` binds every `*_DATA_SOURCE` token (see `dataSourceProviders`
 * below) to an `EmptyDataSource`, whose `getBench` always resolves `null`. It reproduces a
 * fresh tier/expansion release where no top-parse bench has been ingested yet: every slice
 * reads `null`, so each card renders its "waiting for top parses" empty state and the pages
 * show the no-benchmark banner. Because it imports only the slice tokens (never a
 * `*TransformService`), the five transforms stay tree-shaken out, exactly as in production.
 *
 * Everything read through `DataFileApiService` (the spec manifest `index.json`, the WCL spec
 * universe `spec-meta.json`, per-spec `encounters.json`, and the authored `rulebook.json`) is
 * untouched, so the class/spec/encounter dropdowns still populate and the rulebook-driven
 * rotation rules still evaluate. `dataBaseHref` is empty so those files resolve relative to
 * `document.baseURI` (the served `public/data/specs/`); run `npm run data:pull` first to
 * populate them. Serve it with `npm run start:empty`.
 */
import { Provider } from '@angular/core';
import { provideEmptyDataSource } from '../app/core/data-source/provide-data-source';
import { BURST_DATA_SOURCE } from '../app/pages/post-raid/burst-windows/burst-data-source';
import { ROTATION_DATA_SOURCE } from '../app/pages/post-raid/rotation/rotation-data-source';
import { DEFENSIVE_DATA_SOURCE } from '../app/pages/post-raid/defensive/defensive-data-source';
import { GEAR_DATA_SOURCE } from '../app/pages/post-raid/gear/gear-data-source';
import { MAP_DATA_SOURCE } from '../app/pages/post-raid/map/map-data-source';

export const environment = {
  useLiveTransform: false,
  /** Empty resolves `data/specs/` relative to `document.baseURI` (the `data:pull`ed
   * `public/data/specs/`), so manifests + rulebooks load while the benches stay empty. */
  dataBaseHref: '',
};

/** Empty-encounter data-source bindings: every slice reads a null bench. */
export const dataSourceProviders: Provider[] = [
  provideEmptyDataSource(BURST_DATA_SOURCE),
  provideEmptyDataSource(ROTATION_DATA_SOURCE),
  provideEmptyDataSource(DEFENSIVE_DATA_SOURCE),
  provideEmptyDataSource(GEAR_DATA_SOURCE),
  provideEmptyDataSource(MAP_DATA_SOURCE),
];
