/**
 * Pure view-model core for the burst card (functional core; the feature service is
 * the shell). Each calculated field is its own small, testable function; the public
 * `buildBurstView` just composes them. Pure: no Angular, no icon cache - the caller
 * supplies `nameOf` for ability labels.
 */
import { BurstWindow, PlayerBurstWindow } from '../../../core/models/analysis.models';
import { ComparisonWindow, WindowStatus } from '../../../shared/components/window-comparison/window-comparison';
import { RangeRow } from '../../../shared/components/range-chart/range-chart';

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

/**
 * Status glyph for one burst window. Higher player damage is better, so falling
 * short of the top-parse range is the problem. Mirrors the original card logic.
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
