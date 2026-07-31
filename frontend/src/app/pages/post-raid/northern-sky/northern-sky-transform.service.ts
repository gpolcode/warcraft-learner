import { Injectable, inject } from '@angular/core';
import { median } from 'd3-array';
import { WclApiService } from '../../../core/services/wcl-api';
import { DataFileApiService } from '../../../core/services/data-file-api';
import { WclEvent } from '../../../core/models/wcl.models';
import { RulebookCooldown } from '../../../core/models/rulebook.models';
import { logWarn } from '../../../core/log';
import { Result, LoadError, ok, missing } from '../../../core/result';
import { toLoadError } from '../../../core/http-load-error';
import { round, groupByTime, getOrInsert } from '../../../shared/analysis/analysis-math';
import { abilityIcons, toParseRankings, unwrapRankings } from '../../../shared/analysis/wcl-projections';
import { DataSource } from '../../../core/data-source/data-source';
import { NorthernSkyBench, NorthernSkyCooldown } from './northern-sky-data-source';
import { blizzardSpecId } from './spec-ids';

/** How many top parses to sample. */
const TOP_PARSE_COUNT = 10;
// Over-fetch so a private/unfetchable top parse can be backfilled by the next-best one.
const CANDIDATE_POOL_COUNT = TOP_PARSE_COUNT * 2;
/** Cast times within this many seconds cluster into one shared use. */
const CLUSTER_MERGE_S = 15;
/** A use is exported only when at least this share of sampled parses share it. */
const CONSENSUS_FRAC = 0.5;
/** A cluster always needs at least this many distinct parses to count as consensus. */
const MIN_CLUSTER_PARSES = 2;

interface TimedCast { time_s: number; parse: number; }

/** Cast times of one cooldown in one parse, relative to the pull, ascending. */
export function cooldownCastTimes(casts: WclEvent[], spellId: number, fightStartMs: number): number[] {
  return casts
    .filter(cast => cast.type === 'cast' && cast.abilityGameID === spellId)
    .map(cast => (cast.timestamp - fightStartMs) / 1000)
    .sort((a, b) => a - b);
}

/**
 * The consensus cast times for one cooldown across parses: cluster all casts by time, keep a
 * cluster only when enough distinct parses share it, and emit the median of each kept cluster's
 * one-per-parse representative time. A parse double-casting inside a window counts once.
 */
export function consensusCastTimes(casts: TimedCast[], sampleCount: number): number[] {
  const minParses = Math.max(MIN_CLUSTER_PARSES, Math.ceil(CONSENSUS_FRAC * sampleCount));
  const times: number[] = [];
  for (const cluster of groupByTime(casts, CLUSTER_MERGE_S)) {
    const earliestByParse = new Map<number, number>();
    for (const cast of cluster) {
      const prev = earliestByParse.get(cast.parse);
      if (prev === undefined || cast.time_s < prev) earliestByParse.set(cast.parse, cast.time_s);
    }
    if (earliestByParse.size < minParses) continue;
    times.push(round(median([...earliestByParse.values()]) ?? 0));
  }
  return times.sort((a, b) => a - b);
}

@Injectable({ providedIn: 'root' })
export class NorthernSkyTransformService implements DataSource<NorthernSkyBench> {
  private readonly wclApi = inject(WclApiService);
  private readonly dataFiles = inject(DataFileApiService);

  async getBench(spec: string, encounterId: number): Promise<Result<NorthernSkyBench, LoadError>> {
    const rulebook = await this.dataFiles.getRulebook(spec);
    if (!rulebook.ok) return rulebook;
    const cooldowns = (rulebook.value.major_cooldowns ?? []).filter(cooldown => cooldown.spell_id);
    if (!cooldowns.length) return missing('Not yet ingested.');

    try {
      const rankings = toParseRankings(unwrapRankings(await this.wclApi.getRankings(spec, encounterId)), CANDIDATE_POOL_COUNT);
      if (!rankings.length) return missing('Not yet ingested.');

      const castsByCooldown = new Map<number, TimedCast[]>();
      let sampleCount = 0;
      let encounterName = '';
      for (const ranking of rankings) {
        const parse = await this.parseCastTimes(ranking, cooldowns);
        if (!parse) continue;
        for (const cooldown of cooldowns) {
          const times = parse.timesBySpellId.get(cooldown.spell_id) ?? [];
          const bucket = getOrInsert(castsByCooldown, cooldown.spell_id, () => []);
          for (const time_s of times) bucket.push({ time_s, parse: sampleCount });
        }
        encounterName ||= parse.encounterName;
        sampleCount += 1;
        if (sampleCount >= TOP_PARSE_COUNT) break;
      }
      if (!sampleCount) return missing('Not yet ingested.');

      const built: NorthernSkyCooldown[] = [];
      for (const cooldown of cooldowns) {
        const cast_times_s = consensusCastTimes(castsByCooldown.get(cooldown.spell_id) ?? [], sampleCount);
        if (cast_times_s.length) built.push({ spell_id: cooldown.spell_id, name: cooldown.name, icon: '', cast_times_s });
      }
      if (!built.length) return missing('Not yet ingested.');

      const icons = abilityIcons(await this.wclApi.getAbilities(built.map(entry => entry.spell_id)));
      for (const entry of built) entry.icon = icons[entry.spell_id]?.icon ?? '';

      return ok({
        spec,
        spec_id: blizzardSpecId(spec),
        encounter_id: encounterId,
        encounter_name: encounterName,
        sample_count: sampleCount,
        cooldowns: built,
      });
    } catch (cause) {
      logWarn('NorthernSkyTransformService.getBench', cause);
      return toLoadError(cause, 'northern-sky.bench');
    }
  }

  private async parseCastTimes(
    ranking: { player: string; report_code: string; fight_id: number },
    cooldowns: RulebookCooldown[],
  ): Promise<{ timesBySpellId: Map<number, number[]>; encounterName: string } | null> {
    try {
      const report = await this.wclApi.getReport(ranking.report_code);
      const fight = report.fights.find(entry => entry.id === ranking.fight_id);
      const player = report.masterData?.actors?.find(actor => actor.name === ranking.player);
      if (!fight || !player) return null;

      const casts = await this.wclApi.getAllEvents(ranking.report_code, fight.id, 'Casts', fight.startTime, fight.endTime, player.id);
      const timesBySpellId = new Map<number, number[]>();
      for (const cooldown of cooldowns) timesBySpellId.set(cooldown.spell_id, cooldownCastTimes(casts, cooldown.spell_id, fight.startTime));
      return { timesBySpellId, encounterName: fight.name ?? '' };
    } catch (cause) {
      logWarn(`NorthernSkyTransformService parse ${ranking.report_code}:${ranking.fight_id}`, cause);
      return null;
    }
  }
}
