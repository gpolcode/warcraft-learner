import { Injectable } from '@angular/core';
import { logWarn } from '../../../core/log';
import { BurstBench, BurstDataSource } from './burst-data-source';

/**
 * Dev-flag `BurstDataSource`: computes the burst bench live in the browser so the
 * app can run with no ingested data (`environment.useLiveTransform`).
 *
 * Computing the top-parse bench in-browser means porting the ingest extract
 * (characterRankings -> ~10 parse fetches -> the pure clustering core) to the
 * browser. That is the single piece intentionally deferred from the burst pilot, so
 * the dev flag ships pointing at the file source (see environment.development.ts).
 * Until the live extract lands this returns null with a warning if ever selected.
 */
@Injectable({ providedIn: 'root' })
export class BurstTransformService implements BurstDataSource {
  async getBurstBench(spec: string, encounterId: number): Promise<BurstBench | null> {
    logWarn(
      'BurstTransformService.getBurstBench',
      `live burst transform not implemented yet for ${spec}/${encounterId}; use ingested data`,
    );
    return null;
  }
}
