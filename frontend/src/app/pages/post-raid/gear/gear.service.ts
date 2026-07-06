/**
 * Gear slice runtime shell + its pure view-model assembly, colocated.
 *
 * `GearFeatureService` is the imperative shell (the component injects only it). It
 * reads the prepared gear bench via the swappable `GEAR_DATA_SOURCE`, optionally
 * fetches the analyzed player's combatant-info gear (post-raid mode), then calls the
 * pure `buildGearView` below to assemble the dual-mode view-model.
 *
 * Self-containment exception (blessed by CLAUDE.md): this slice MAY import the
 * cross-slice presentational helper `shared/gear/gear-comparison.ts` - it is
 * presentational, not a service. All gear math is delegated to it, so the feature
 * service itself contains no arithmetic.
 */
import { Injectable, inject } from '@angular/core';
import { CharacterGear, WclCombatantInfo } from '../../../core/models/wcl.models';
import { EncounterGearStats } from '../../../core/models/encounter.models';
import { WclApiService } from '../../../core/services/wcl-api';
import { logWarn } from '../../../core/log';
import { Result, LoadError, ok, err, permanent } from '../../../core/result';
import { toLoadError } from '../../../core/http-load-error';
import { decodeHtmlEntities, extractGear, selectCombatantInfo, talentKeyFromTree } from './gear-extract';
import {
  GearStatus,
  buildEnchantRows, enchantStatusOf, EnchantRow,
  buildTrinketRows, trinketStatusOf, TrinketRow,
  buildTalentBuilds, talentStatusOf, TalentBuildRow,
  buildBenchEnchantRows, BenchEnchantRow,
  buildBenchTrinketRows, BenchTrinketRow,
} from '../../../shared/gear/gear-comparison';
import { GEAR_DATA_SOURCE, GearBench } from './gear-data-source';

/**
 * The gear card's success payload. An `ok` `Result` carries this; the card's
 * waiting / error states are the `Result` variants, so the view holds no
 * `available` flag of its own.
 */
export interface GearComparisonView {
  /** True when the player's own gear is shown alongside the bench (post-raid). */
  comparison: boolean;

  // Talents
  talentBuilds: TalentBuildRow[];
  talentStatus: { status: GearStatus; note: string };

  // Trinkets
  trinketRows: TrinketRow[];
  trinketStatus: GearStatus;
  benchTrinketRows: BenchTrinketRow[];

  // Enchants
  enchantRows: EnchantRow[];
  enchantStatus: GearStatus;
  benchEnchantRows: BenchEnchantRow[];
}

/** Empty placeholder view the card holds while loading or in an error state. */
export function emptyGearView(): GearComparisonView {
  return {
    comparison: false,
    talentBuilds: [], talentStatus: { status: 'unknown', note: 'No talent data.' },
    trinketRows: [], trinketStatus: 'ok', benchTrinketRows: [],
    enchantRows: [], enchantStatus: 'ok', benchEnchantRows: [],
  };
}

/* ----------------------------- pure gear extraction (own, colocated) ----------------------------- */

/**
 * Assemble a `CharacterGear` from a raw CombatantInfo event + the resolved item /
 * enchant name map (raw `i<id>` / `e<id>` aliases). Names already on the gear item
 * win; otherwise they are filled in from the name map and decoded. A log with no
 * recorded combatant info is a 200 OK that is semantically unusable for this
 * analysis, so it is a `permanent` error (repro id `gear.combatant-info`), never a
 * placeholder the caller silently discards.
 */
export function buildCharacterGear(
  event: WclCombatantInfo | null,
  names: Record<string, { id: number; name: string }>,
  code: string,
  spec?: string,
): Result<CharacterGear, LoadError> {
  if (!event?.gear?.length) {
    return err(permanent('No combatant info in this log.', 'gear.combatant-info'));
  }
  const { trinkets, enchants } = extractGear(event.gear);
  const talent_key = talentKeyFromTree(event.talentTree);

  for (const trinket of trinkets) {
    if (!trinket.name && trinket.id) trinket.name = decodeHtmlEntities(names[`i${trinket.id}`]?.name ?? '');
  }
  for (const enchant of enchants) {
    if (!enchant.name && enchant.id) enchant.name = decodeHtmlEntities(names[`e${enchant.id}`]?.name ?? '');
  }

  return ok({ found: true, spec, source_report: code, talent_key, trinkets, enchants });
}

/* ----------------------------- pure view-model ----------------------------- */

/** Reshape a `GearBench` into the `EncounterGearStats` shape the helpers consume. */
export function benchToStats(bench: GearBench): EncounterGearStats {
  return { talent_builds: bench.talent_builds, trinkets: bench.trinkets, enchants: bench.enchants };
}

/**
 * Post-raid comparison view: the player's own gear against the bench. Takes a real
 * `CharacterGear` (never null) - the card only builds comparison rows once the
 * player's combatant-info gear is in hand, so the comparison enchant / trinket
 * builders are never called with an absent player. All derivation is delegated to
 * the shared presentational helpers.
 */
export function buildGearView(playerGear: CharacterGear, stats: EncounterGearStats): GearComparisonView {
  const playerKey = playerGear.talent_key ?? '';
  const enchantRows = buildEnchantRows(playerGear, stats);
  const trinketRows = buildTrinketRows(playerGear, stats);

  return {
    comparison: true,
    talentBuilds: buildTalentBuilds(stats, playerKey),
    talentStatus: talentStatusOf(stats, playerKey),
    trinketRows,
    trinketStatus: trinketStatusOf(trinketRows),
    benchTrinketRows: [],
    enchantRows,
    enchantStatus: enchantStatusOf(enchantRows),
    benchEnchantRows: [],
  };
}

/**
 * Pre-fight bench-only view: the top-parse consensus with no player overlay. Uses the
 * dedicated bench builders (`buildBenchEnchantRows` / `buildBenchTrinketRows`), so the
 * comparison builders are never reached without a player.
 */
export function buildBenchGearView(stats: EncounterGearStats): GearComparisonView {
  return {
    comparison: false,
    talentBuilds: buildTalentBuilds(stats, ''),
    talentStatus: talentStatusOf(stats, ''),
    trinketRows: [],
    trinketStatus: 'ok',
    benchTrinketRows: buildBenchTrinketRows(stats),
    enchantRows: [],
    enchantStatus: 'ok',
    benchEnchantRows: buildBenchEnchantRows(stats),
  };
}

/* ----------------------------- feature service ---------------------------- */

/**
 * Runtime shell for the gear card. Injects only its data source (swapped file /
 * live by the dev flag) plus the cached `WclApiService` (to read the analyzed
 * player's own combatant-info gear), then calls the pure functions above to build
 * the view-model. Contains no arithmetic of its own.
 */
@Injectable({ providedIn: 'root' })
export class GearFeatureService {
  private readonly source = inject(GEAR_DATA_SOURCE);
  private readonly wclApi = inject(WclApiService);

  /**
   * Post-raid: the analyzed player's gear vs the top-parse bench. Propagates a
   * non-ok bench (missing / transient / permanent) and the player's own
   * `permanent` no-combatant-info error unchanged, so the card surfaces the exact
   * failure instead of silently degrading to a bench-only view.
   */
  async loadComparisonView(
    spec: string, encounterId: number,
    reportCode: string, fightId: number, playerId: number,
  ): Promise<Result<GearComparisonView, LoadError>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;
    const playerGear = await this.fetchPlayerGear(reportCode, fightId, playerId, spec);
    if (!playerGear.ok) return playerGear;
    return ok(buildGearView(playerGear.value, benchToStats(bench.value)));
  }

  /** Pre-fight: bench-only consensus (no player log). Propagates a non-ok bench. */
  async loadBenchView(spec: string, encounterId: number): Promise<Result<GearComparisonView, LoadError>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;
    return ok(buildBenchGearView(benchToStats(bench.value)));
  }

  /**
   * The analyzed player's combatant-info gear. Reads the raw CombatantInfo event,
   * resolves item / enchant names in one batched gameData round-trip, then builds
   * the `CharacterGear`. A log with no combatant info surfaces as the `permanent`
   * error `buildCharacterGear` returns; a WCL fetch failure becomes the mapped
   * `LoadError` (a real failure, never a silent fallback).
   */
  private async fetchPlayerGear(
    reportCode: string, fightId: number, playerId: number, spec: string,
  ): Promise<Result<CharacterGear, LoadError>> {
    try {
      const event = selectCombatantInfo(await this.wclApi.getCombatantInfo(reportCode, fightId, playerId), playerId);
      let names: Record<string, { id: number; name: string }> = {};
      if (event?.gear?.length) {
        const { trinkets, enchants } = extractGear(event.gear);
        const itemIds = [...new Set(trinkets.filter(trinket => trinket.id).map(trinket => trinket.id))];
        const enchantIds = [...new Set(enchants.filter(enchant => enchant.id).map(enchant => enchant.id))];
        try {
          names = await this.wclApi.getGameNames(itemIds, enchantIds);
        } catch (err) {
          logWarn(`GearFeatureService name resolution ${reportCode}:${fightId}:${playerId}`, err);
        }
      }
      return buildCharacterGear(event, names, reportCode, spec);
    } catch (cause) {
      logWarn(`GearFeatureService player gear ${reportCode}:${fightId}:${playerId}`, cause);
      return err(toLoadError(cause, 'gear.player-view'));
    }
  }
}
