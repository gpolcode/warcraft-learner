import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TopParseSelectionService {
  private readonly projections = inject(WclProjectionsService);

  /** Newest-first over the encounter's partitions: a patch rolls WCL's default partition over before the new one has parses, and a single default-partition read then benches nothing. */
  async resolveTopParses(
    wclApi: WclApiService, spec: string, encounterId: number, partitionIds: readonly number[] = [],
  ): Promise<TopParseSelection> {
    for (const partition of (partitionIds.length ? partitionIds : [null])) {
      const raw = await wclApi.getRankings(spec, encounterId, partition);
      const rows = this.projections.toParseRankings(this.projections.unwrapRankings(raw), CANDIDATE_POOL_DEPTH);
      if (rows.length) return rows;
    }
    return [];
  }
}

/** Resolves which top parses an encounter is benched from, once, so the ingest signature and every bench reads the same pool. */
import { WclApiService } from '../wcl/wcl-api-service';
import { TopParseSelection } from '../wcl/wcl.models';
import { WclProjectionsService } from './wcl-projections-service';

// Over-fetch past the sampled top parses so a private or unfetchable one is backfilled by the next-best.
const CANDIDATE_POOL_DEPTH = 20;
