/**
 * Ingest environment (swapped in by the `ingest` build configuration; run via
 * `npm run start:ingest`, which also starts the local file server on :3000).
 *
 * The app boots normally, and the ingest orchestrator runs in the background on
 * startup: it drives the five `*TransformService`s (bound below as the live data
 * sources) and persists their tailored files through `IngestHttpDataFileTransport`,
 * which reads and writes `frontend/public/data/**` via the file server. Progress is
 * logged to the browser console. Run `npm run data:pull` first so the signature-skip
 * check has the current published data to compare against.
 *
 * `wclClientId`/`wclClientSecret` default to the intentionally public pair every build
 * ships (see environment.ts). To ingest on a dedicated WCL client's budget, either edit
 * them here locally (do not commit a private pair) or let the headless harness inject
 * `WCL_CLIENT_ID`/`WCL_CLIENT_SECRET` from the process environment - the env override
 * takes precedence in wcl-auth.ts.
 */
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideLiveDataSource } from '../app/core/data-source/provide-data-source';
import { DATA_FILE_TRANSPORT } from '../app/core/services/data-file-transport';
import { WCL_INGEST_MODE } from '../app/core/services/wcl-transport';
import { RETRY_MAX_ATTEMPTS } from '../app/core/interceptors/retry-transient.interceptor';
import { IngestHttpDataFileTransport } from '../app/ingest/ingest-data-file-transport';
import { BURST_DATA_SOURCE } from '../app/pages/post-raid/burst-windows/burst-data-source';
import { BurstTransformService } from '../app/pages/post-raid/burst-windows/burst-transform.service';
import { ROTATION_DATA_SOURCE } from '../app/pages/post-raid/rotation/rotation-data-source';
import { RotationTransformService } from '../app/pages/post-raid/rotation/rotation-transform.service';
import { DEFENSIVE_DATA_SOURCE } from '../app/pages/post-raid/defensive/defensive-data-source';
import { DefensiveTransformService } from '../app/pages/post-raid/defensive/defensive-transform.service';
import { GEAR_DATA_SOURCE } from '../app/pages/post-raid/gear/gear-data-source';
import { GearTransformService } from '../app/pages/post-raid/gear/gear-transform.service';
import { MAP_DATA_SOURCE } from '../app/pages/post-raid/map/map-data-source';
import { MapTransformService } from '../app/pages/post-raid/map/map-transform.service';

// Nothing sits behind an unattended ingest run to retry for it, and a swallowed parse
// fetch silently thins the bench, so ingest rides out a longer blip than the interactive
// app's single retry.
const INGEST_RETRY_MAX_ATTEMPTS = 3;

export const environment = {
  useLiveTransform: true,
  /** Unused in ingest mode: every data-file read goes through the file server. */
  dataBaseHref: '',
  ingest: true,
  /** Set locally to target a single spec folder (e.g. 'SubtletyRogue') instead of all. */
  ingestSpec: null as string | null,
  wclClientId: 'a21cf850-4cf8-4591-b3e5-906aba0da145',
  wclClientSecret: 'ZYBFec16gC0CfwaunQjSAwUCQwEXTKOFo5JkwSze',
};

/**
 * Ingest bindings: live transforms as the data sources (the orchestrator drives the same
 * services), the read+write file-server transport in place of the read-only static one,
 * cache-first report reads (WCL_INGEST_MODE) so the five transforms share one fetch per
 * stream, and the longer transient-retry budget.
 */
export const environmentProviders: (Provider | EnvironmentProviders)[] = [
  provideLiveDataSource(BURST_DATA_SOURCE, BurstTransformService),
  provideLiveDataSource(ROTATION_DATA_SOURCE, RotationTransformService),
  provideLiveDataSource(DEFENSIVE_DATA_SOURCE, DefensiveTransformService),
  provideLiveDataSource(GEAR_DATA_SOURCE, GearTransformService),
  provideLiveDataSource(MAP_DATA_SOURCE, MapTransformService),
  { provide: WCL_INGEST_MODE, useValue: true },
  { provide: DATA_FILE_TRANSPORT, useExisting: IngestHttpDataFileTransport },
  { provide: RETRY_MAX_ATTEMPTS, useValue: INGEST_RETRY_MAX_ATTEMPTS },
];
