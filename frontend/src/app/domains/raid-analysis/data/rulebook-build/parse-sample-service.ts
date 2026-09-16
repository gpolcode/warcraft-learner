import { Injectable, inject } from '@angular/core';
import type { WclApiService } from '../wcl/wcl-api-service';
import type { ParseRanking, TopParseSelection, WclFight } from '../wcl/wcl.models';
import { BenchPipelineService, type BenchHeader } from '../analysis/bench-pipeline-service';
import { WclProjectionsService, type ReportActor } from '../analysis/wcl-projections-service';
import type { ParseSample } from './rulebook-build.models';

export interface ParseSampleQuery {
  spec: string;
  encounterId: number;
  selection: TopParseSelection;
}

interface SampleBench extends BenchHeader {
  samples: ParseSample[];
}

@Injectable({ providedIn: 'root' })
export class ParseSampleService {
  private readonly pipeline = inject(BenchPipelineService);
  private readonly projections = inject(WclProjectionsService);

  /** The encounter's top parses as the player's own cast, buff and, when asked for, enemy aura streams, walked by the benches' own pipeline so both share one cache and one parse count. */
  async sample(wclApi: WclApiService, query: ParseSampleQuery, enemyAuras: boolean): Promise<ParseSample[]> {
    const sampled = await this.pipeline.benchFromTopParses<ParseSample, SampleBench>(wclApi, query, {
      logSource: 'ParseSampleService',
      errorId: 'rulebook.samples',
      noRankingsMessage: 'No top parses to read the rules from.',
      parse: ({ ranking, fight, player }) => this.sampleOne(wclApi, ranking, fight, player, enemyAuras),
      bench: ({ parses }) => ({ samples: parses }),
    });
    return sampled.ok ? sampled.value.samples : [];
  }

  private async sampleOne(wclApi: WclApiService, ranking: ParseRanking, fight: WclFight, player: ReportActor, enemyAuras: boolean): Promise<ParseSample> {
    // The same request shapes as the rotation bench, so the cache serves both from one fetch.
    const stream = async (dataType: 'Casts' | 'Buffs') => this.projections.withRelativeS(
      await wclApi.getAllEvents(ranking.report_code, fight.id, dataType, fight.startTime, fight.endTime, player.id, dataType === 'Casts'), fight.startTime);
    // `Enemies` plus a sourceID returns nothing, so the player's dots come off the raid-wide stream, as at runtime.
    const enemyStream = async () => this.projections.withRelativeS(
      (await wclApi.getAllEvents(ranking.report_code, fight.id, 'Debuffs', fight.startTime, fight.endTime, undefined, false, 'Enemies'))
        .filter(event => event.sourceID === player.id), fight.startTime);
    const [casts, buffs, debuffs] = await Promise.all([stream('Casts'), stream('Buffs'), enemyAuras ? enemyStream() : []]);
    return {
      fightDurationS: this.projections.relativeS(fight.endTime, fight.startTime),
      casts: casts.filter(event => event.type === 'cast'), buffs, debuffs,
    };
  }
}
