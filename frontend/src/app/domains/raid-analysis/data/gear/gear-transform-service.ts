import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import { CharacterGear, ParseRanking, TopParseSelection } from '../wcl/wcl.models';
import { EncounterGearStats } from '../encounter/encounter.models';
import { Result } from '../../../shared/util-http/result';
import { GearExtractService, GameNames } from './gear-extract-service';
import { TalentKeyService } from './talent-key-service';
import { TalentDataService } from '../http/talent-data-service';
import { EnchantItemDataService, EnchantItems } from '../http/enchant-item-data-service';
import { SpecTalents } from './talent.models';
import { getOrInsert } from '../analysis/analysis-math';
import { BenchPipelineService, BenchParse } from '../analysis/bench-pipeline-service';
import { DataSource } from '../data-source/data-source';
import { GearBench } from './gear-data-source';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { GearComparisonService } from './gear-comparison-service';

const MAX_TALENT_BUILDS = 3;
const MAX_TRINKET_SETS = 3;
const MAX_ENCHANTS_PER_SLOT = 3;

// The parse identity rides along so each bench talent build can link back to an example parse using it.
export interface ParseGear {
  talent_key: string;
  trinkets: { slot: number; id: number; name: string; icon: string }[];
  enchants: { slot: number; id: number; name: string }[];
  report_code: string;
  fight_id: number;
  player_name: string;
  source_id: number;
}

@Injectable({ providedIn: 'root' })
export class GearTransformService implements DataSource<GearBench> {
  private readonly logger = inject(LoggerService);
  private readonly gearComparison = inject(GearComparisonService);
  private readonly gearExtract = inject(GearExtractService);
  private readonly benchPipeline = inject(BenchPipelineService);
  private readonly talentKey = inject(TalentKeyService);
  private readonly wclApi = inject(WclApiService);
  private readonly talentData = inject(TalentDataService);
  private readonly enchantItemData = inject(EnchantItemDataService);

  async getBench(spec: string, encounterId: number, selection?: TopParseSelection): Promise<Result<GearBench>> {
    return this.benchPipeline.benchFromTopParses(this.wclApi, { spec, encounterId, selection }, {
      logSource: 'GearTransformService',
      errorId: 'gear.bench',
      noRankingsMessage: 'Not yet ingested.',
      parse: parse => this.fetchParseGear(parse),
      bench: async ({ parses }) => {
        const stats = this.aggregateParseGear(parses);
        return {
          talent_builds: this.withTalentDiffs(stats.talent_builds, await this.talentData.getTalents(spec)),
          trinket_sets: stats.trinket_sets,
          enchants: await this.withItemNames(stats.enchants),
        };
      },
    });
  }

  private async fetchParseGear({ ranking, fight, player }: BenchParse): Promise<ParseGear | null> {
    const event = this.gearExtract.selectCombatantInfo(await this.wclApi.getCombatantInfo(ranking.report_code, fight.id, player.id), player.id);
    if (!event?.gear?.length) return null;

    const { trinkets, enchants } = this.gearExtract.extractGear(event.gear);
    const names = await this.resolveGameNames(ranking, trinkets, enchants);
    this.gearExtract.fillGameNames(trinkets, 'i', names);
    this.gearExtract.fillGameNames(enchants, 'e', names);

    const characterGear: CharacterGear = {
      talent_key: this.talentKey.talentKeyFromTree(event.talentTree), trinkets, enchants,
    };
    return this.toParseGear(characterGear, ranking, player.id);
  }

  // A failed name lookup leaves the ids intact, so the parse still benches with blank names.
  private async resolveGameNames(
    ranking: ParseRanking, trinkets: { id: number }[], enchants: { id: number }[],
  ): Promise<GameNames> {
    const itemIds = [...new Set(trinkets.filter(trinket => trinket.id).map(trinket => trinket.id))];
    const enchantIds = [...new Set(enchants.filter(enchant => enchant.id).map(enchant => enchant.id))];
    try {
      return await this.wclApi.getGameNames(itemIds, enchantIds);
    } catch (err) {
      this.logger.logWarn(`GearTransformService name resolution ${ranking.report_code}:${ranking.fight_id}`, err);
      return {};
    }
  }

  private async withItemNames(enchants: EncounterGearStats['enchants']): Promise<EncounterGearStats['enchants']> {
    const enchantItems = await this.enchantItemData.getEnchantItems();
    if (!enchantItems.ok) return enchants;
    try {
      const names = await this.wclApi.getGameNames(this.enchantItemIds(enchants, enchantItems.value), []);
      return this.nameEnchantsByItem(enchants, enchantItems.value, names);
    } catch (err) {
      this.logger.logWarn('GearTransformService enchant item names', err);
      return enchants;
    }
  }

  protected enchantItemIds(enchants: EncounterGearStats['enchants'], enchantItems: EnchantItems): number[] {
    const itemIds = Object.values(enchants).flat().map(enchant => enchantItems[enchant.id]).filter(itemId => itemId !== undefined);
    return [...new Set(itemIds)];
  }

  // WCL names an enchant by its effect (stat text for an armor kit); the item name is what the auction house lists.
  protected nameEnchantsByItem(
    enchants: EncounterGearStats['enchants'], enchantItems: EnchantItems, names: GameNames,
  ): EncounterGearStats['enchants'] {
    const named: EncounterGearStats['enchants'] = {};
    for (const [slot, ranked] of Object.entries(enchants)) {
      named[Number(slot)] = ranked.map(enchant => {
        const itemId = enchantItems[enchant.id];
        const item = itemId === undefined ? undefined : names[`i${itemId}`];
        if (itemId === undefined || !item?.name) return enchant;
        return { ...enchant, name: this.gearExtract.decodeHtmlEntities(item.name), icon: this.gearExtract.iconFile(item.icon), item_id: itemId };
      });
    }
    return named;
  }

  private pct(count: number, total: number): number {
    return total ? Math.round((count / total) * 100) : 0;
  }

  protected toParseGear(gear: CharacterGear, ranking: ParseRanking, sourceId: number): ParseGear {
    return {
      talent_key: gear.talent_key ?? '',
      trinkets: (gear.trinkets ?? []).map(trinket => ({ slot: trinket.slot, id: trinket.id, name: trinket.name, icon: trinket.icon ?? '' })),
      enchants: (gear.enchants ?? []).map(enchant => ({ slot: enchant.slot, id: enchant.id, name: enchant.name })),
      report_code: ranking.report_code,
      fight_id: ranking.fight_id,
      player_name: ranking.player,
      source_id: sourceId,
    };
  }

  protected aggregateTalents(parses: ParseGear[]): EncounterGearStats['talent_builds'] {
    const total = parses.length;
    // Carry the first-seen example alongside the count, avoiding a later non-null re-lookup.
    interface TalentAgg { count: number; report_code: string; fight_id: number; player_name: string; source_id: number }
    const talentBuilds = new Map<string, TalentAgg>();

    for (const parse of parses) {
      if (!parse.talent_key) continue;
      const existing = talentBuilds.get(parse.talent_key);
      if (existing) {
        existing.count += 1;
      } else {
        talentBuilds.set(parse.talent_key, {
          count: 1,
          report_code: parse.report_code,
          fight_id: parse.fight_id,
          player_name: parse.player_name,
          source_id: parse.source_id,
        });
      }
    }

    return [...talentBuilds.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, MAX_TALENT_BUILDS)
      .map(([key, { count, report_code, fight_id, player_name, source_id }]) =>
        ({ key, pct: this.pct(count, total), report_code, fight_id, player_name, source_id, diff: [] }));
  }

  protected aggregateTrinketSets(parses: ParseGear[]): EncounterGearStats['trinket_sets'] {
    const total = parses.length;
    // The key holds only ids, so the items ride along or the ranked sets lose their names and icons.
    interface SetAgg { count: number; items: { id: number; name: string; icon: string }[] }
    const sets = new Map<string, SetAgg>();

    for (const parse of parses) {
      const worn = parse.trinkets
        .map(({ id, name, icon }) => ({ id, name, icon }))
        .sort((a, b) => a.id - b.id);
      if (!worn.length) continue;

      const key = this.gearComparison.trinketSetKey(worn);
      const existing = sets.get(key);
      if (existing) {
        existing.count += 1;
        // A parse whose name lookup failed stores '', which a later real name replaces.
        existing.items.forEach((item, i) => { item.name ||= worn[i]?.name ?? ''; });
      } else {
        sets.set(key, { count: 1, items: worn });
      }
    }

    return [...sets.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_TRINKET_SETS)
      .map(({ count, items }) => ({ items, pct: this.pct(count, total) }));
  }

  protected aggregateEnchants(parses: ParseGear[]): EncounterGearStats['enchants'] {
    const total = parses.length;
    const countsBySlot = new Map<number, Map<number, number>>();
    const names = new Map<number, string>();

    for (const enchant of parses.flatMap(parse => parse.enchants)) {
      if (!enchant.id) continue;
      const counter = getOrInsert(countsBySlot, enchant.slot, () => new Map<number, number>());
      counter.set(enchant.id, (counter.get(enchant.id) ?? 0) + 1);
      // A parse whose name lookup failed stores '', which a later real name replaces.
      if (!names.get(enchant.id) && enchant.name) names.set(enchant.id, enchant.name);
    }

    const enchants: EncounterGearStats['enchants'] = {};
    for (const [slot, counter] of [...countsBySlot.entries()].sort((a, b) => a[0] - b[0])) {
      enchants[slot] = [...counter.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_ENCHANTS_PER_SLOT)
        .map(([id, count]) => ({ id, name: names.get(id) ?? '', pct: this.pct(count, total) }));
    }
    return enchants;
  }

  protected aggregateParseGear(parses: ParseGear[]): EncounterGearStats {
    return {
      talent_builds: this.aggregateTalents(parses),
      trinket_sets: this.aggregateTrinketSets(parses),
      enchants: this.aggregateEnchants(parses),
    };
  }

  protected withTalentDiffs(
    builds: EncounterGearStats['talent_builds'], talents: Result<SpecTalents>,
  ): EncounterGearStats['talent_builds'] {
    const baseline = builds[0];
    if (!talents.ok || builds.length < 2 || !baseline) return builds;
    const baselineKey = baseline.key;
    return builds.map((build, i) => i === 0 ? build : { ...build, diff: this.gearComparison.buildTalentDiff(build.key, baselineKey, talents.value) });
  }
}
