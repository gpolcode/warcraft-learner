import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TopParseSelectionService {
  private readonly projections = inject(WclProjectionsService);
  private readonly specRoles = inject(SpecRoleService);

  /** Newest-first, as a patch rolls WCL's default partition over before the new one fills; a pool no partition fills is the newest non-empty one, so the bench can say how few it had. */
  async resolveTopParses(
    wclApi: WclApiService, spec: string, encounterId: number, partitionIds: readonly number[] = [],
  ): Promise<TopParseSelection> {
    const metric = this.specRoles.rankingMetric(spec);
    let thin: TopParseSelection = [];
    for (const partition of (partitionIds.length ? partitionIds : [null])) {
      const raw = await wclApi.getRankings(spec, encounterId, partition, metric);
      const rows = this.projections.toParseRankings(this.projections.unwrapRankings(raw), CANDIDATE_POOL_DEPTH);
      if (rows.length >= MIN_SAMPLE_COUNT) return rows;
      if (!thin.length) thin = rows;
    }
    return thin;
  }
}

/** Resolves which top parses an encounter is benched from, once, so the ingest signature and every bench reads the same pool. */
import { WclApiService } from '../wcl/wcl-api-service';
import { TopParseSelection } from '../wcl/wcl.models';
import { WclProjectionsService } from './wcl-projections-service';
import { SpecRoleService } from './spec-role-service';

/** Fewer top logs than this describe one log's habit rather than the field's, for every bench. */
export const MIN_SAMPLE_COUNT = 5;

// Over-fetch past the sampled top parses so a private or unfetchable one is backfilled by the next-best.
const CANDIDATE_POOL_DEPTH = 20;
