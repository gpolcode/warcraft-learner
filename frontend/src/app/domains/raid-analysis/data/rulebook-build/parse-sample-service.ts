import { Injectable, inject } from '@angular/core';
import { NgHttpCachingService } from 'ng-http-caching';
import type { WclApiService } from '../wcl/wcl-api-service';
import type { ParseRanking } from '../wcl/wcl.models';
import type { IngestEncounter } from '../ingest/ingest.models';
import { TopParseSelectionService } from '../analysis/top-parse-selection-service';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import type { ParseSample } from './rulebook-build.models';

/** Three bosses at five parses each: enough to separate a cast id from its aura and to read the opener, cheap enough to repeat on every source change. */
const ENCOUNTER_COUNT = 3;
const PARSES_PER_ENCOUNTER = 5;

@Injectable({ providedIn: 'root' })
export class ParseSampleService {
  private readonly topParses = inject(TopParseSelectionService);
  private readonly projections = inject(WclProjectionsService);
  private readonly logger = inject(LoggerService);
  private readonly wclCache = inject(NgHttpCachingService);

  /** The top parses of the raid's most-ranked encounters, each as the player's own cast, buff and debuff streams. */
  async sample(wclApi: WclApiService, spec: string, encounters: IngestEncounter[]): Promise<ParseSample[]> {
    const pools: { encounter: IngestEncounter; rankings: ParseRanking[] }[] = [];
    for (const encounter of encounters) {
      const rankings = await this.topParses.resolveTopParses(wclApi, spec, encounter.id, encounter.partitionIds);
      if (rankings.length) pools.push({ encounter, rankings });
    }
    pools.sort((a, b) => b.rankings.length - a.rankings.length);
    const samples: ParseSample[] = [];
    for (const { encounter, rankings } of pools.slice(0, ENCOUNTER_COUNT)) {
      for (const ranking of rankings) {
        const sample = await this.sampleOne(wclApi, ranking, encounter.id);
        if (sample) samples.push(sample);
        if (samples.filter(entry => entry.encounterId === encounter.id).length >= PARSES_PER_ENCOUNTER) break;
      }
      this.wclCache.clearCache();
    }
    return samples;
  }

  // An unfetchable or unbindable parse drops out; the next ranking backfills it.
  private async sampleOne(wclApi: WclApiService, ranking: ParseRanking, encounterId: number): Promise<ParseSample | null> {
    try {
      const report = await wclApi.getReport(ranking.report_code);
      const fight = report.fights.find(entry => entry.id === ranking.fight_id);
      const player = this.projections.findParseActor(report.masterData?.actors, ranking);
      if (!fight || !player) return null;
      const stream = async (dataType: 'Casts' | 'Buffs') => this.projections.withRelativeS(
        await wclApi.getAllEvents(ranking.report_code, fight.id, dataType, fight.startTime, fight.endTime, player.id), fight.startTime);
      // `Enemies` plus a sourceID returns nothing, so the player's dots come off the raid-wide stream, as at runtime.
      const enemyAuras = async () => this.projections.withRelativeS(
        (await wclApi.getAllEvents(ranking.report_code, fight.id, 'Debuffs', fight.startTime, fight.endTime, undefined, false, 'Enemies'))
          .filter(event => event.sourceID === player.id), fight.startTime);
      const [casts, buffs, debuffs] = await Promise.all([stream('Casts'), stream('Buffs'), enemyAuras()]);
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
