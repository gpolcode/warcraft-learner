/**
 * Burst slice runtime shell + its pure transform functions, colocated.
 *
 * `BurstFeatureService` is the imperative shell (the component injects only it): it
 * reads the prepared bench via the swappable `BURST_DATA_SOURCE`, then calls the
 * pure functions below to assemble the view-model. Every calculated field is its
 * own small, exported, individually-tested pure function - no separate vm file.
 */
import { Injectable, inject } from '@angular/core';
import { BurstWindow, PlayerBurstWindow } from '../../../core/models/analysis.models';
import { ComparisonWindow, WindowStatus, RangeRow } from '../../../core/models/window-comparison.models';
import { BURST_DATA_SOURCE } from './burst-data-source';

/** Spell id -> display info, baked from the report's master abilities (AnalysisResult.ability_icons). */
export type AbilityIcons = Record<number, { icon: string; name: string }>;

/** Anchor for opening the positioning map on a burst window (emitted as an output). */
export interface BurstMapAnchor {
  timeS: number;
  label: string;
  spellIds: number[];
}

/** The burst card view-model: one ComparisonWindow + one map anchor per top window. */
export interface BurstView {
  windows: ComparisonWindow[];
  anchors: BurstMapAnchor[];
}

/* ----------------------------- pure functions ----------------------------- */

/**
 * Status glyph for one burst window. Higher player damage is better, so falling
 * short of the top-parse range is the problem.
 */
export function burstWindowStatus(
  playerDamage: number | null,
  topAvg: number,
  topMin: number,
  stddev: number,
  notReached: boolean,
): { status: WindowStatus; icon: string } {
  if (notReached) return { status: 'muted', icon: 'schedule' };
  if (playerDamage === null) return { status: 'muted', icon: 'help_outline' };
  if (playerDamage < topMin - stddev) return { status: 'bad', icon: 'error' };
  if (topAvg > 0 && playerDamage < topAvg - stddev) return { status: 'warn', icon: 'warning_amber' };
  return { status: 'good', icon: 'check_circle' };
}

/** Split a window's cooldown names into icon spell-ids (known) and plain labels (unknown). */
export function splitCommonCds(
  commonCds: string[],
  cdSpellIds: Record<string, number>,
): { spellIds: number[]; labels: string[] } {
  const spellIds: number[] = [];
  const labels: string[] = [];
  for (const name of commonCds) {
    const spellId = cdSpellIds[name];
    if (spellId) spellIds.push(spellId);
    else labels.push(name);
  }
  return { spellIds, labels };
}

/** Per-ability comparison rows: player damage / casts vs the top-parse range. */
export function burstDetailRows(
  abilityBreakdown: BurstWindow['ability_breakdown'],
  playerWindow: PlayerBurstWindow | null,
  nameOf: (spellId: number) => string,
): RangeRow[] {
  const playerByAbility: Record<number, { damage: number; casts?: number }> = {};
  for (const ability of playerWindow?.ability_breakdown ?? []) playerByAbility[ability.spell_id] = ability;
  return abilityBreakdown.map(ability => ({
    spellId: ability.spell_id,
    label: nameOf(ability.spell_id),
    playerPct: playerByAbility[ability.spell_id]?.damage ?? null,
    topAvg: ability.avg_damage,
    topMin: ability.min_damage,
    topMax: ability.max_damage,
    playerCasts: playerByAbility[ability.spell_id]?.casts ?? null,
    topCasts: ability.avg_casts ?? null,
  }));
}

/** Map anchor for a window: when to seek and which cooldowns to highlight. */
export function burstMapAnchor(window: BurstWindow, cdSpellIds: Record<string, number>): BurstMapAnchor {
  const cds = window.common_cds ?? [];
  return {
    timeS: window.time_s,
    label: cds.join(', ') || 'Burst window',
    spellIds: cds.map(name => cdSpellIds[name]).filter((id): id is number => !!id),
  };
}

/**
 * Build the burst card view-model: each top-parse burst window paired with the
 * player's damage inside it (by index), plus a map anchor. A window whose start is
 * past the player's fight length is "not reached" and shown muted.
 */
export function buildBurstView(
  topWindows: BurstWindow[],
  playerWindows: PlayerBurstWindow[],
  fightDurationS: number,
  cdSpellIds: Record<string, number>,
  nameOf: (spellId: number) => string,
): BurstView {
  const windows: ComparisonWindow[] = [];
  const anchors: BurstMapAnchor[] = [];
  topWindows.forEach((window, index) => {
    const notReached = window.time_s > fightDurationS;
    const playerWindow = notReached ? null : (playerWindows[index] ?? null);
    const playerDamage = playerWindow?.window_damage ?? null;
    const { status, icon } = burstWindowStatus(playerDamage, window.dmg_avg, window.dmg_min, window.dmg_stddev, notReached);
    const { spellIds, labels } = splitCommonCds(window.common_cds ?? [], cdSpellIds);
    windows.push({
      timeStartS: window.time_s,
      timeEndS: window.time_s + window.window_length_s,
      spellIds,
      labels,
      status,
      statusIcon: icon,
      overview: { label: '', playerPct: playerDamage, topAvg: window.dmg_avg, topMin: window.dmg_min, topMax: window.dmg_max },
      detailRows: burstDetailRows(window.ability_breakdown, playerWindow, nameOf),
    });
    anchors.push(burstMapAnchor(window, cdSpellIds));
  });
  return { windows, anchors };
}

/* ----------------------------- feature service ---------------------------- */

/**
 * Runtime shell for the burst card. Injects only its data source (swapped file /
 * live by the dev flag), reads the prepared bench windows, then calls the pure
 * functions above to build the view-model. Contains no arithmetic of its own.
 *
 * The player-vs-bench window damage (`playerWindows`) is still produced upstream by
 * the analysis worker and passed in; having the slice fetch the player log itself is
 * a follow-up. Ability names come baked in via `abilityIcons`, so this never touches
 * the icon cache.
 */
@Injectable({ providedIn: 'root' })
export class BurstFeatureService {
  private readonly source = inject(BURST_DATA_SOURCE);

  async loadView(
    spec: string,
    encounterId: number,
    fightDurationS: number,
    playerWindows: PlayerBurstWindow[],
    abilityIcons: AbilityIcons,
  ): Promise<BurstView> {
    const bench = await this.source.getBurstBench(spec, encounterId);
    if (!bench) return { windows: [], anchors: [] };
    const nameOf = (spellId: number): string => abilityIcons[spellId]?.name ?? `Spell ${spellId}`;
    return buildBurstView(bench.windows, playerWindows, fightDurationS, bench.cd_spell_ids, nameOf);
  }
}
