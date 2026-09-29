import { Injectable, inject } from '@angular/core';
import { CharacterGear, WclCombatantInfo } from '../wcl/wcl.models';
import { EncounterGearStats } from '../encounter/encounter.models';
import { WclApiService } from '../wcl/wcl-api-service';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from '../http/http-load-error';
import { EnchantItemDataService, EnchantItems } from '../http/enchant-item-data-service';
import { GearExtractService, GameNames } from './gear-extract-service';
import { GearStatus, EnchantRow, TalentBuildRow, BenchEnchantRow, TrinketSetRow } from './gear-comparison-service';
import { GEAR_DATA_SOURCE, GearBench } from './gear-data-source';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { TalentKeyService } from './talent-key-service';
import { GearComparisonService } from './gear-comparison-service';

export interface GearComparisonView {
  comparison: boolean;

  talentBuilds: TalentBuildRow[];
  talentStatus: { status: GearStatus; note: string };

  trinketSets: TrinketSetRow[];
  trinketStatus: { status: GearStatus; note: string };

  enchantRows: EnchantRow[];
  enchantStatus: GearStatus;
  benchEnchantRows: BenchEnchantRow[];
}

type PlayerEnchant = NonNullable<CharacterGear['enchants']>[number];

@Injectable({ providedIn: 'root' })
export class GearFeatureService {
  private readonly logger = inject(LoggerService);
  private readonly talentKeys = inject(TalentKeyService);
  private readonly gearComparison = inject(GearComparisonService);
  private readonly gearExtract = inject(GearExtractService);
  private readonly source = inject(GEAR_DATA_SOURCE);
  private readonly wclApi = inject(WclApiService);
  private readonly enchantItemData = inject(EnchantItemDataService);

  // Propagates a non-ok bench and the player's own no-combatant-info error unchanged, never degrading to bench-only.
  async loadComparisonView(
    spec: string, encounterId: number,
    reportCode: string, fightId: number, playerId: number,
  ): Promise<Result<GearComparisonView>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;
    const playerGear = await this.fetchPlayerGear(reportCode, fightId, playerId);
    if (!playerGear.ok) return playerGear;
    return Results.ok(this.buildGearView(playerGear.value, this.benchToStats(bench.value)));
  }

  async loadBenchView(spec: string, encounterId: number): Promise<Result<GearComparisonView>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;
    return Results.ok(this.buildBenchGearView(this.benchToStats(bench.value)));
  }

  // A WCL fetch failure becomes a mapped LoadError, never a silent fallback.
  private async fetchPlayerGear(
    reportCode: string, fightId: number, playerId: number,
  ): Promise<Result<CharacterGear>> {
    try {
      const [combatants, enchantItemsRead] = await Promise.all([
        this.wclApi.getCombatantInfo(reportCode, fightId, playerId),
        this.enchantItemData.getEnchantItems(),
      ]);
      const event = this.gearExtract.selectCombatantInfo(combatants, playerId);
      // A failed Raidbots read leaves every enchant on its WCL effect text rather than failing the card.
      const enchantItems = enchantItemsRead.ok ? enchantItemsRead.value : {};
      let names: GameNames = {};
      if (event?.gear?.length) {
        const { trinkets, enchants } = this.gearExtract.extractGear(event.gear);
        const { itemIds, enchantIds } = this.gameNameIds(trinkets, enchants, enchantItems);
        try {
          names = await this.wclApi.getGameNames(itemIds, enchantIds);
        } catch (err) {
          this.logger.logWarn(`GearFeatureService name resolution ${reportCode}:${fightId}:${playerId}`, err);
        }
      }
      return this.buildCharacterGear(event, names, enchantItems);
    } catch (cause) {
      this.logger.logWarn(`GearFeatureService player gear ${reportCode}:${fightId}:${playerId}`, cause);
      return HttpLoadErrors.toLoadError(cause, 'gear.player-view');
    }
  }

  emptyGearView(): GearComparisonView {
    return {
      comparison: false,
      talentBuilds: [], talentStatus: { status: 'unknown', note: 'No talent data.' },
      trinketSets: [], trinketStatus: { status: 'unknown', note: 'No trinket data.' },
      enchantRows: [], enchantStatus: 'ok', benchEnchantRows: [],
    };
  }

  // A log with no combatant info is a usable-looking 200 OK, so it is a permanent error, not a placeholder the caller silently discards.
  protected buildCharacterGear(
    event: WclCombatantInfo | null,
    names: GameNames,
    enchantItems: EnchantItems,
  ): Result<CharacterGear> {
    if (!event?.gear?.length) {
      return Results.permanent('No combatant info in this log.', 'gear.combatant-info');
    }
    const { trinkets, enchants } = this.gearExtract.extractGear(event.gear);
    const talent_key = this.talentKeys.talentKeyFromTree(event.talentTree);

    this.gearExtract.fillGameNames(trinkets, 'i', names);
    this.gearExtract.fillGameNames(enchants, 'e', names);

    return Results.ok({ talent_key, trinkets, enchants: this.nameEnchantsByItem(enchants, enchantItems, names) });
  }

  // A mapped enchant still asks for its effect text, the fallback name where WCL names no item.
  protected gameNameIds(
    trinkets: { id: number }[], enchants: { id: number }[], enchantItems: EnchantItems,
  ): { itemIds: number[]; enchantIds: number[] } {
    const enchantIds = [...new Set(enchants.filter(enchant => enchant.id).map(enchant => enchant.id))];
    const enchantItemIds = enchantIds.map(enchantId => enchantItems[enchantId]).filter(itemId => itemId !== undefined);
    return { itemIds: [...new Set([...trinkets.filter(trinket => trinket.id).map(trinket => trinket.id), ...enchantItemIds])], enchantIds };
  }

  // Names the player's enchant as the bench names the top one, so a row compares two items rather than stat text with an item.
  protected nameEnchantsByItem(enchants: PlayerEnchant[], enchantItems: EnchantItems, names: GameNames): PlayerEnchant[] {
    return enchants.map(enchant => ({ ...enchant, name: this.gearExtract.enchantItem(enchant.id, enchantItems, names)?.name ?? enchant.name }));
  }

  protected benchToStats(bench: GearBench): EncounterGearStats {
    return { talent_builds: bench.talent_builds, trinket_sets: bench.trinket_sets, enchants: bench.enchants };
  }

  // playerGear is never null: the card builds comparison rows only once the combatant-info gear is in hand.
  protected buildGearView(playerGear: CharacterGear, stats: EncounterGearStats): GearComparisonView {
    const playerKey = playerGear.talent_key ?? '';
    const trinketKey = this.gearComparison.trinketSetKey(playerGear.trinkets ?? []);
    const enchantRows = this.gearComparison.buildEnchantRows(playerGear, stats);

    return {
      comparison: true,
      talentBuilds: this.gearComparison.buildTalentBuilds(stats, playerKey),
      talentStatus: this.gearComparison.talentStatusOf(stats, playerKey),
      trinketSets: this.gearComparison.buildTrinketSets(stats, trinketKey),
      trinketStatus: this.gearComparison.trinketStatusOf(stats, trinketKey),
      enchantRows,
      enchantStatus: this.gearComparison.enchantStatusOf(enchantRows),
      benchEnchantRows: [],
    };
  }

  // Uses the dedicated bench enchant builder, so the comparison builder is never reached without a player.
  protected buildBenchGearView(stats: EncounterGearStats): GearComparisonView {
    return {
      comparison: false,
      talentBuilds: this.gearComparison.buildTalentBuilds(stats, ''),
      talentStatus: this.gearComparison.talentStatusOf(stats, ''),
      trinketSets: this.gearComparison.buildTrinketSets(stats, ''),
      trinketStatus: this.gearComparison.trinketStatusOf(stats, ''),
      enchantRows: [],
      enchantStatus: 'ok',
      benchEnchantRows: this.gearComparison.buildBenchEnchantRows(stats),
    };
  }
}
