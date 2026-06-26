import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../../../core/services/wcl-api';
import { DataFileApiService } from '../../../core/services/data-file-api';
import { ParseRanking } from '../../../core/services/wcl-mappers';
import { RulebookCooldown, RulebookDefensive } from '../../../core/models/rulebook.models';
import { summarizeCooldownCasts } from '../../../core/analysis/bench/cooldown-casts';
import { findBurstWindows, clusterBurstWindows } from '../../../core/analysis/bench/burst-windows';
import { RawBurstWindow } from '../../../core/analysis/bench/models';
import { logWarn } from '../../../core/log';
import { BurstBench, BurstDataSource } from './burst-data-source';

/** How many top parses to sample when computing the bench live (matches ingest). */
const TOP_PARSE_COUNT = 10;
/** A window must carry at least this share of fight damage to count (matches ingest). */
const BURST_SIGNIFICANCE_PCT = 0.03;

/** Cooldown / defensive name -> spell id, for the burst window header icons. */
function buildCdSpellIds(cooldowns: RulebookCooldown[], defensives: RulebookDefensive[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const cooldown of cooldowns) if (cooldown.spell_id) map[cooldown.name] = cooldown.spell_id;
  for (const defensive of defensives) if (defensive.spell_id) map[defensive.name] = defensive.spell_id;
  return map;
}

/**
 * Dev-flag `BurstDataSource`: computes the burst bench live in the browser (no
 * ingestion). It fetches the encounter's top parses, refetches each parse's Casts +
 * DamageDone, runs the SHARED pure burst pipeline (the same code ingest runs), and
 * clusters across parses. Bound by `environment.useLiveTransform`.
 *
 * Bloodlust timing is not needed here: `findBurstWindows` keys windows off cooldown
 * cast times only, so the Buffs fetch is skipped and `blTimeS` is null.
 */
@Injectable({ providedIn: 'root' })
export class BurstTransformService implements BurstDataSource {
  private readonly wclApi = inject(WclApiService);
  private readonly dataFiles = inject(DataFileApiService);

  async getBurstBench(spec: string, encounterId: number): Promise<BurstBench | null> {
    const rulebook = await this.dataFiles.getRulebook(spec);
    const cooldowns = rulebook?.major_cooldowns ?? [];
    if (!cooldowns.length) return null;
    const defensives = rulebook?.defensives ?? [];

    const rankings = await this.wclApi.getRankings(spec, encounterId, TOP_PARSE_COUNT);
    if (!rankings.length) return null;

    const allWindows: RawBurstWindow[] = [];
    let sampleCount = 0;
    let encounterName = '';
    for (const ranking of rankings) {
      const parse = await this.computeParseWindows(ranking, cooldowns);
      if (!parse) continue;
      allWindows.push(...parse.windows);
      encounterName ||= parse.encounterName;
      sampleCount += 1;
    }
    if (!sampleCount) return null;

    return {
      spec,
      encounter_id: encounterId,
      encounter_name: encounterName,
      sample_count: sampleCount,
      windows: clusterBurstWindows(allWindows, sampleCount),
      cd_spell_ids: buildCdSpellIds(cooldowns, defensives),
    };
  }

  /** One parse's raw burst windows via the shared pipeline; null if it can't be fetched. */
  private async computeParseWindows(
    ranking: ParseRanking, cooldowns: RulebookCooldown[],
  ): Promise<{ windows: RawBurstWindow[]; encounterName: string } | null> {
    try {
      const report = await this.wclApi.getReport(ranking.report_code);
      const fight = report.fights.find(entry => entry.id === ranking.fight_id);
      const player = report.masterData?.actors?.find(actor => actor.name === ranking.player);
      if (!fight || !player) return null;

      const abilityNames = new Map<number, string>(
        (report.masterData?.abilities ?? []).map(ability => [ability.gameID, ability.name]),
      );
      const [casts, damage] = await Promise.all([
        this.wclApi.getAllEvents(ranking.report_code, fight.id, 'Casts', fight.startTime, fight.endTime, player.id),
        this.wclApi.getAllEvents(ranking.report_code, fight.id, 'DamageDone', fight.startTime, fight.endTime, player.id),
      ]);

      const cdSummary = summarizeCooldownCasts(casts, cooldowns, fight.startTime, null);
      const windows = findBurstWindows(damage, fight.startTime, cdSummary, cooldowns, BURST_SIGNIFICANCE_PCT, casts, abilityNames);
      return { windows, encounterName: fight.name ?? '' };
    } catch (err) {
      logWarn(`BurstTransformService parse ${ranking.report_code}:${ranking.fight_id}`, err);
      return null;
    }
  }
}
