import { Injectable, inject } from '@angular/core';
import type { WclApiService } from '../wcl/wcl-api-service';
import type { ParseRanking } from '../wcl/wcl.models';
import { TOP_PARSE_COUNT } from '../analysis/bench-pipeline-service';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import type { ParseSample } from './rulebook-build.models';

@Injectable({ providedIn: 'root' })
export class ParseSampleService {
  private readonly projections = inject(WclProjectionsService);
  private readonly logger = inject(LoggerService);

  /** The rankings in order, each as the player's own cast, buff and, when asked for, enemy aura streams, up to the benches' own parse count. */
  async sample(wclApi: WclApiService, rankings: ParseRanking[], encounterId: number, enemyAuras: boolean): Promise<ParseSample[]> {
    const samples: ParseSample[] = [];
    for (const ranking of rankings) {
      const sample = await this.sampleOne(wclApi, ranking, encounterId, enemyAuras);
      if (sample) samples.push(sample);
      if (samples.length >= TOP_PARSE_COUNT) break;
    }
    return samples;
  }

  // An unfetchable or unbindable parse drops out; the next ranking backfills it.
  private async sampleOne(wclApi: WclApiService, ranking: ParseRanking, encounterId: number, enemyAuras: boolean): Promise<ParseSample | null> {
    try {
      const report = await wclApi.getReport(ranking.report_code);
      const fight = report.fights.find(entry => entry.id === ranking.fight_id);
      const player = this.projections.findParseActor(report.masterData?.actors, ranking);
      if (!fight || !player) return null;
      // The same request shapes as the rotation bench, so the cache serves both from one fetch.
      const stream = async (dataType: 'Casts' | 'Buffs') => this.projections.withRelativeS(
        await wclApi.getAllEvents(ranking.report_code, fight.id, dataType, fight.startTime, fight.endTime, player.id, dataType === 'Casts'), fight.startTime);
      // `Enemies` plus a sourceID returns nothing, so the player's dots come off the raid-wide stream, as at runtime.
      const enemyStream = async () => this.projections.withRelativeS(
        (await wclApi.getAllEvents(ranking.report_code, fight.id, 'Debuffs', fight.startTime, fight.endTime, undefined, false, 'Enemies'))
          .filter(event => event.sourceID === player.id), fight.startTime);
      const [casts, buffs, debuffs] = await Promise.all([stream('Casts'), stream('Buffs'), enemyAuras ? enemyStream() : []]);
      return {
        reportCode: ranking.report_code, fightId: fight.id, encounterId,
        fightDurationS: this.projections.relativeS(fight.endTime, fight.startTime),
        casts: casts.filter(event => event.type === 'cast'), buffs, debuffs,
      };
    } catch (cause) {
      this.logger.logWarn(`ParseSampleService ${ranking.report_code}:${ranking.fight_id}`, cause);
      return null;
    }
  }
}
