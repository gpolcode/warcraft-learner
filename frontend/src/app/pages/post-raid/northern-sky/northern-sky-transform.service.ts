import { Injectable, inject } from '@angular/core';
import { median } from 'd3-array';
import { WclApiService } from '../../../core/services/wcl-api';
import { DataFileApiService } from '../../../core/services/data-file-api';
import { WclEvent } from '../../../core/models/wcl.models';
import { logWarn } from '../../../core/log';
import { Result, LoadError, ok, missing } from '../../../core/result';
import { toLoadError } from '../../../core/http-load-error';
import { round, getOrInsert } from '../../../shared/analysis/analysis-math';
import { abilityIcons, toParseRankings, unwrapRankings } from '../../../shared/analysis/wcl-projections';
import { DataSource } from '../../../core/data-source/data-source';
import { NorthernSkyBench, NorthernSkyAbility } from './northern-sky-data-source';

interface ExportAbility { spell_id: number; name: string; kind: NorthernSkyAbility['kind']; }

const TOP_PARSE_COUNT = 10;
// Over-fetch so a private/unfetchable top parse can be backfilled by the next-best one.
const CANDIDATE_POOL_COUNT = TOP_PARSE_COUNT * 2;
// An ordinal survives only when this share of sampled parses reached it, floored at MIN_CONSENSUS_PARSES.
const CONSENSUS_FRAC = 0.5;
const MIN_CONSENSUS_PARSES = 2;

interface TimedCast { time_s: number; parse: number; }

export function cooldownCastTimes(casts: WclEvent[], spellId: number, fightStartMs: number): number[] {
  return casts
    .filter(cast => cast.type === 'cast' && cast.abilityGameID === spellId)
    .map(cast => (cast.timestamp - fightStartMs) / 1000)
    .sort((a, b) => a - b);
}

// Aligned by use ordinal, not absolute time, so reactive defensives that fire at spread times still survive.
export function consensusCastTimes(casts: TimedCast[], sampleCount: number): number[] {
  const minParses = Math.max(MIN_CONSENSUS_PARSES, Math.ceil(CONSENSUS_FRAC * sampleCount));
  const byParse = new Map<number, number[]>();
  for (const cast of casts) getOrInsert(byParse, cast.parse, () => []).push(cast.time_s);
  const perParse = [...byParse.values()].map(times => [...times].sort((a, b) => a - b));
  const maxUses = Math.max(0, ...perParse.map(times => times.length));
  const result: number[] = [];
  for (let ordinal = 0; ordinal < maxUses; ordinal++) {
    const nth = perParse.filter(times => ordinal < times.length).map(times => times[ordinal]);
    if (nth.length >= minParses) result.push(round(median(nth) ?? 0));
  }
  return result.sort((a, b) => a - b);
}

@Injectable({ providedIn: 'root' })
export class NorthernSkyTransformService implements DataSource<NorthernSkyBench> {
  private readonly wclApi = inject(WclApiService);
  private readonly dataFiles = inject(DataFileApiService);

  async getBench(spec: string, encounterId: number): Promise<Result<NorthernSkyBench, LoadError>> {
    const rulebook = await this.dataFiles.getRulebook(spec);
    if (!rulebook.ok) return rulebook;
    const abilities: ExportAbility[] = [
      ...(rulebook.value.major_cooldowns ?? []).map(cd => ({ spell_id: cd.spell_id, name: cd.name, kind: 'cooldown' as const })),
      ...(rulebook.value.defensives ?? []).map(def => ({ spell_id: def.spell_id, name: def.name, kind: 'defensive' as const })),
    ].filter(ability => ability.spell_id);
    if (!abilities.length) return missing('Not yet ingested.');

    try {
      const rankings = toParseRankings(unwrapRankings(await this.wclApi.getRankings(spec, encounterId)), CANDIDATE_POOL_COUNT);
      if (!rankings.length) return missing('Not yet ingested.');

      const castsBySpellId = new Map<number, TimedCast[]>();
      let sampleCount = 0;
      let encounterName = '';
      for (const ranking of rankings) {
        const parse = await this.parseCastTimes(ranking, abilities);
        if (!parse) continue;
        for (const ability of abilities) {
          const times = parse.timesBySpellId.get(ability.spell_id) ?? [];
          const bucket = getOrInsert(castsBySpellId, ability.spell_id, () => []);
          for (const time_s of times) bucket.push({ time_s, parse: sampleCount });
        }
        encounterName ||= parse.encounterName;
        sampleCount += 1;
        if (sampleCount >= TOP_PARSE_COUNT) break;
      }
      if (!sampleCount) return missing('Not yet ingested.');

      const built: NorthernSkyAbility[] = [];
      for (const ability of abilities) {
        const cast_times_s = consensusCastTimes(castsBySpellId.get(ability.spell_id) ?? [], sampleCount);
        if (cast_times_s.length) built.push({ spell_id: ability.spell_id, name: ability.name, icon: '', kind: ability.kind, cast_times_s });
      }
      if (!built.length) return missing('Not yet ingested.');

      const icons = abilityIcons(await this.wclApi.getAbilities(built.map(entry => entry.spell_id)));
      for (const entry of built) entry.icon = icons[entry.spell_id]?.icon ?? '';

      return ok({
        spec,
        encounter_id: encounterId,
        encounter_name: encounterName,
        sample_count: sampleCount,
        abilities: built,
      });
    } catch (cause) {
      logWarn('NorthernSkyTransformService.getBench', cause);
      return toLoadError(cause, 'northern-sky.bench');
    }
  }

  private async parseCastTimes(
    ranking: { player: string; report_code: string; fight_id: number },
    abilities: ExportAbility[],
  ): Promise<{ timesBySpellId: Map<number, number[]>; encounterName: string } | null> {
    try {
      const report = await this.wclApi.getReport(ranking.report_code);
      const fight = report.fights.find(entry => entry.id === ranking.fight_id);
      const player = report.masterData?.actors?.find(actor => actor.name === ranking.player);
      if (!fight || !player) return null;

      const casts = await this.wclApi.getAllEvents(ranking.report_code, fight.id, 'Casts', fight.startTime, fight.endTime, player.id);
      const timesBySpellId = new Map<number, number[]>();
      for (const ability of abilities) timesBySpellId.set(ability.spell_id, cooldownCastTimes(casts, ability.spell_id, fight.startTime));
      return { timesBySpellId, encounterName: fight.name ?? '' };
    } catch (cause) {
      logWarn(`NorthernSkyTransformService parse ${ranking.report_code}:${ranking.fight_id}`, cause);
      return null;
    }
  }
}
