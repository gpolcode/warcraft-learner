/**
 * Production environment (default).
 *
 * `useLiveTransform: false` binds every `*_DATA_SOURCE` token (see `environmentProviders`
 * below) to a generic `FileDataSource` that reads the ingested, tailored static file. The
 * dev override lives in `environment.development.ts` and is swapped in by the `development`
 * build configuration's `fileReplacements` (see angular.json).
 *
 * `dataBaseHref` is the absolute base every deployed build fetches `data/specs/` from. On
 * gh-pages the data is a single shared copy at the site root (`/data/specs/`), a sibling of
 * every environment folder (`main/`, `pr-N/`). Because each environment lives at a different
 * depth, an absolute base keeps the fetch identical for all of them - `main` and every PR
 * preview read the one canonical copy, and no preview ships its own duplicate. The
 * `development` build overrides this with an empty string so `npm start` resolves
 * `data/specs/` relative to `document.baseURI` (it runs live-transform anyway).
 */
import { Provider } from '@angular/core';
import { provideFileDataSource } from '../app/core/data-source/provide-data-source';
import { BURST_DATA_SOURCE } from '../app/pages/post-raid/burst-windows/burst-data-source';
import { ROTATION_DATA_SOURCE } from '../app/pages/post-raid/rotation/rotation-data-source';
import { DEFENSIVE_DATA_SOURCE } from '../app/pages/post-raid/defensive/defensive-data-source';
import { GEAR_DATA_SOURCE } from '../app/pages/post-raid/gear/gear-data-source';
import { MAP_DATA_SOURCE } from '../app/pages/post-raid/map/map-data-source';

// WCL OAuth client used for the client-credentials grant.
//
// INTENTIONAL SECRET EXPOSURE: this secret ships inside the static JS bundle and is
// therefore public. That is a deliberate design choice. The client-credentials token
// only grants access to public WCL report data - there is no private data behind it and
// no per-user budget to lose. The sole risk is that someone extracts the secret and
// drains our shared hourly rate-limit budget. Mitigation is manual: regenerate the
// secret at warcraftlogs.com/api/clients/ and redeploy (WCL exposes no API to rotate a
// secret, so this cannot be automated). See the project notes on this trade-off.
const CLIENT_ID = 'a21cf850-4cf8-4591-b3e5-906aba0da145';
const CLIENT_SECRET = 'ZYBFec16gC0CfwaunQjSAwUCQwEXTKOFo5JkwSze';

export const environment = {
  /** When true, slices compute their prepared data live in the browser instead of
   * reading ingested files - lets the whole app run with no ingestion. */
  useLiveTransform: false,
  /**
   * Absolute base for the static data files. Empty (development) resolves
   * `data/specs/` relative to `document.baseURI`.
   *
   * The site is served from the custom domain root (see the gh-pages `CNAME` file), so
   * this is just the site-root path to the shared data folder - no repo-name segment.
   * It must stay a sibling of every environment folder (`main/`, `pr-N/`), which the
   * workflows derive their `--base-href` from in `.github/workflows/deploy-pages.yml`
   * and `pr-preview.yml`.
   */
  dataBaseHref: '/data/specs/',
  /** True only in the ingest environment: boots the ingest orchestrator on startup. */
  ingest: false,
  /** Ingest environment only: target a single spec folder (e.g. 'SubtletyRogue') instead of all. */
  ingestSpec: null as string | null,
  /** WCL client-credentials pair (see the INTENTIONAL SECRET EXPOSURE note above). */
  wclClientId: CLIENT_ID,
  wclClientSecret: CLIENT_SECRET,
};

/**
 * Production data-source bindings: every slice reads its ingest-baked tailored file. This
 * file imports only the slice tokens (never a `*TransformService`), so the five transforms
 * are absent from the eager production graph and tree-shaken from the bundle. They exist
 * solely to compute benches live under the dev flag (`environment.development.ts`) and in
 * the ingest environment (`environment.ingest.ts`), so production never needs them.
 * Spread into `app.config.ts`.
 */
export const environmentProviders: Provider[] = [
  provideFileDataSource(BURST_DATA_SOURCE, 'burst'),
  provideFileDataSource(ROTATION_DATA_SOURCE, 'rotation'),
  provideFileDataSource(DEFENSIVE_DATA_SOURCE, 'defensive'),
  provideFileDataSource(GEAR_DATA_SOURCE, 'gear'),
  provideFileDataSource(MAP_DATA_SOURCE, 'positions'),
];
