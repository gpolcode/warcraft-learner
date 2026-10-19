import { Injectable, inject } from '@angular/core';
import { CharacterGear, WclCombatantInfo } from '../wcl/wcl.models';
import { EncounterGearStats } from '../encounter/encounter.models';
import { WclApiService } from '../wcl/wcl-api-service';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from '../http/http-load-error';
import { GearExtractService, GameNames } from './gear-extract-service';
import { TalentBuildRow, BenchEnchantRow, TalentNodeDiff, TrinketSetRow } from './gear-comparison-service';
import {
  ENCHANT_CHOICE_FAMILY, ENCHANT_MISSING_FAMILY, EnchantRow, GearJudgeService, GearVerdict, TALENT_BUILD_FAMILY, TalentVerdict, TRINKET_PAIR_FAMILY,
} from './gear-judge-service';
import { CalibrationCapsService } from '../verdict/calibration/calibration-caps-service';
import { FamilyCaps } from '../verdict/tone.models';
import { NotGradedNote } from '../verdict/calibration/calibration.models';
import { GEAR_DATA_SOURCE, GearBench, GearParseMeasures } from './gear-data-source';
import { SpecTalents } from './talent.models';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { GearComparisonService } from './gear-comparison-service';
import { BenchStrip, BenchStripService } from '../analysis/bench-strip-service';
import { CardRankingService } from '../analysis/card-ranking-service';
import { CardRanking } from '../verdict/row-order-service';

export interface GearComparisonView {
  comparison: boolean;

  talentBuilds: TalentBuildRow[];
  /** Null where the pull or the bench has no shared talent to compare. */
  talentVerdict: TalentVerdict | null;
  /** Null when the player takes every shared talent. */
  talentDiff: TalentNodeDiff | null;
  talentEmpty: string;

  trinketSets: TrinketSetRow[];
  trinketVerdict: GearVerdict | null;
  trinketEmpty: string;

  enchantRows: EnchantRow[];
  benchEnchantRows: BenchEnchantRow[];
  enchantEmpty: string;
  /** Shown when every enchant row matches the top logs. */
  enchantsClean: string;
  /** Null on the placeholder no bench backs. */
  bench: BenchStrip | null;
  /** Empty without a player's gear, since only a comparison carries a tone. */
  notGraded: NotGradedNote[];
}

type GearRows = Omit<GearComparisonView, 'bench' | 'notGraded'>;

const GEAR_FAMILIES = [TALENT_BUILD_FAMILY, TRINKET_PAIR_FAMILY, ENCHANT_MISSING_FAMILY, ENCHANT_CHOICE_FAMILY];

@Injectable({ providedIn: 'root' })
export class GearFeatureService {
  private readonly logger = inject(LoggerService);
  private readonly gearComparison = inject(GearComparisonService);
  private readonly judge = inject(GearJudgeService);
  private readonly gearExtract = inject(GearExtractService);
  private readonly source = inject(GEAR_DATA_SOURCE);
  private readonly wclApi = inject(WclApiService);
  private readonly benchStrips = inject(BenchStripService);
  private readonly calibration = inject(CalibrationCapsService);
  private readonly cardRanking = inject(CardRankingService);

  // Propagates a non-ok bench and the player's own no-combatant-info error unchanged, never degrading to bench-only.
  async loadComparisonView(
    spec: string, encounterId: number,
    reportCode: string, fightId: number, playerId: number,
  ): Promise<Result<GearComparisonView>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;
    const playerGear = await this.fetchPlayerGear(reportCode, fightId, playerId);
    if (!playerGear.ok) return playerGear;
    const caps = await this.calibration.load(spec, encounterId);
    return Results.ok({
      ...this.buildGearView(playerGear.value, bench.value, caps),
      bench: this.benchStrips.strip(bench.value), notGraded: this.calibration.notGraded(caps, GEAR_FAMILIES),
    });
  }

  async loadBenchView(spec: string, encounterId: number): Promise<Result<GearComparisonView>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;
    return Results.ok({ ...this.buildBenchGearView(bench.value), bench: this.benchStrips.strip(bench.value), notGraded: [] });
  }

  // A WCL fetch failure becomes a mapped LoadError, never a silent fallback.
  private async fetchPlayerGear(
    reportCode: string, fightId: number, playerId: number,
  ): Promise<Result<CharacterGear>> {
    try {
      const event = this.gearExtract.selectCombatantInfo(await this.wclApi.getCombatantInfo(reportCode, fightId, playerId), playerId);
      let names: GameNames = {};
      if (event?.gear?.length) {
        const { trinkets, enchants } = this.gearExtract.extractGear(event.gear);
        const itemIds = [...new Set(trinkets.filter(trinket => trinket.id).map(trinket => trinket.id))];
        const enchantIds = [...new Set(enchants.filter(enchant => enchant.id).map(enchant => enchant.id))];
        try {
          names = await this.wclApi.getGameNames(itemIds, enchantIds);
        } catch (err) {
          this.logger.logWarn(`GearFeatureService name resolution ${reportCode}:${fightId}:${playerId}`, err);
        }
      }
      return this.buildCharacterGear(event, names);
    } catch (cause) {
      this.logger.logWarn(`GearFeatureService player gear ${reportCode}:${fightId}:${playerId}`, cause);
      return HttpLoadErrors.toLoadError(cause, 'gear.player-view');
    }
  }

  /** The card's judged rows on a pull; a bench-only view judges none. */
  ranking(view: GearComparisonView | null): CardRanking {
    if (!view?.comparison) return this.cardRanking.ranking([]);
    return this.cardRanking.ranking(this.cardRanking.gear('Gear', [view.talentVerdict, view.trinketVerdict], view.enchantRows));
  }

  emptyGearView(): GearComparisonView {
    return {
      comparison: false,
      talentBuilds: [], talentVerdict: null, talentDiff: null, talentEmpty: 'No talent data.',
      trinketSets: [], trinketVerdict: null, trinketEmpty: 'No trinket data.',
      enchantRows: [], benchEnchantRows: [], enchantEmpty: 'No enchant data.', enchantsClean: '',
      bench: null, notGraded: [],
    };
  }

  // A log with no combatant info is a usable-looking 200 OK, so it is a permanent error, not a placeholder the caller silently discards.
  protected buildCharacterGear(
    event: WclCombatantInfo | null,
    names: GameNames,
  ): Result<CharacterGear> {
    if (!event?.gear?.length) {
      return Results.unusableLog('This log has no combatant info.', 'gear.combatant-info');
    }
    const { trinkets, enchants } = this.gearExtract.extractGear(event.gear);
    const talent_key = this.judge.measureTalentKey(event.talentTree);

    this.gearExtract.fillGameNames(trinkets, 'i', names);
    this.gearExtract.fillGameNames(enchants, 'e', names);

    return Results.ok({ talent_key, trinkets, enchants });
  }

  protected benchToStats(bench: GearBench): EncounterGearStats {
    return { talent_builds: bench.talent_builds, trinket_sets: bench.trinket_sets, enchants: bench.enchants };
  }

  // An older bench carries no per-log picks, so every check reads n = 0 and renders as a comparison.
  protected perParse(bench: GearBench): GearParseMeasures[] {
    const stored: Partial<GearBench> = bench;
    return stored.per_parse ?? [];
  }

  // playerGear is never null: the card builds comparison rows only once the combatant-info gear is in hand.
  protected buildGearView(playerGear: CharacterGear, bench: GearBench, caps?: FamilyCaps): GearRows {
    const perParse = this.perParse(bench);
    const stats = this.benchToStats(bench);
    const playerKey = playerGear.talent_key ?? '';
    const trinketKey = this.judge.trinketKey(this.judge.measureTrinkets(playerGear.trinkets ?? []));
    const enchantRows = this.judge.enchantRows(playerGear, bench.enchants, perParse, slot => this.gearComparison.slotName(slot), caps);
    const talentVerdict = this.judge.talentVerdict(playerKey, this.judge.talentReference(bench), caps);
    return {
      ...this.sections(perParse),
      comparison: true,
      talentBuilds: this.gearComparison.buildTalentBuilds(stats, playerKey),
      talentVerdict,
      talentDiff: this.gearComparison.buildTalentNodeDiff(talentVerdict, this.talentNames(bench)),
      trinketSets: this.gearComparison.buildTrinketSets(stats, trinketKey),
      trinketVerdict: this.judge.trinketVerdict(trinketKey, this.rankedPairs(bench), this.judge.trinketReference(perParse), caps),
      enchantRows,
      enchantEmpty: this.gearComparison.emptyNote('enchant', perParse.length, 'carries an enchant'),
      enchantsClean: this.enchantsClean(enchantRows.length, perParse.length),
    };
  }

  // Uses the leaders the bench agrees on, so the comparison builder is never reached without a player.
  protected buildBenchGearView(bench: GearBench): GearRows {
    const perParse = this.perParse(bench);
    const stats = this.benchToStats(bench);
    const leaders = this.judge.enchantLeaders(bench.enchants, perParse);
    return {
      ...this.sections(perParse),
      comparison: false,
      talentBuilds: this.gearComparison.buildTalentBuilds(stats, ''),
      trinketSets: this.gearComparison.buildTrinketSets(stats, ''),
      benchEnchantRows: this.gearComparison.buildBenchEnchantRows(leaders),
      enchantEmpty: leaders.length
        ? `No enchant data. No slot where at least half of the ${perParse.length} top logs use one enchant.`
        : this.gearComparison.emptyNote('enchant', perParse.length, 'carries an enchant'),
    };
  }

  // A bench before the names were baked names each talent of the diff by its id.
  private talentNames(bench: GearBench): SpecTalents | null {
    const stored: Partial<GearBench> = bench;
    return stored.talent_names ?? null;
  }

  private sections(perParse: readonly GearParseMeasures[]): GearRows {
    return {
      comparison: false,
      talentBuilds: [], talentVerdict: null, talentDiff: null,
      talentEmpty: this.gearComparison.emptyNote('talent', perParse.length, 'has a readable talent tree'),
      trinketSets: [], trinketVerdict: null,
      trinketEmpty: this.gearComparison.emptyNote('trinket', perParse.length, 'carries a trinket'),
      enchantRows: [], benchEnchantRows: [], enchantEmpty: '', enchantsClean: '',
    };
  }

  private enchantsClean(checked: number, n: number): string {
    return `Nothing flagged. ${checked} ${checked === 1 ? 'enchant' : 'enchants'} checked against ${n} top logs.`;
  }

  private rankedPairs(bench: GearBench): { key: string; label: string }[] {
    return bench.trinket_sets.map((set, i) =>
      ({ key: this.judge.trinketKey(this.judge.measureTrinkets(set.items)), label: this.gearComparison.rankLabel(i, 'pair') }));
  }
}
