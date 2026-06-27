/**
 * View-model data shapes for the window-comparison + range-chart leaves.
 *
 * Kept in core/models (not in the component files) so feature/transform services can
 * import them as plain models without reaching into a UI component.
 */

/** One ability comparison row: player value vs the top-parse min/avg/max range. */
export interface RangeRow {
  spellId?: number;
  label: string;
  /** Baked icon filename for `wl-game-icon` (empty string when there is no art). */
  icon: string;
  playerPct: number | null;
  // Top-parse range. All three may be null when no comparison data exists for a row.
  topAvg: number | null;
  topMin: number | null;
  topMax: number | null;
  // Cast counts for the sorted-impact table. The burst card renders these; the
  // defensive card hides the casts column (showCasts=false) and sets them to 0.
  playerCasts: number;
  topCasts: number;
  // True when the ability is passive (never cast), so the casts cell shows a muted
  // "passive" tag instead of a count. The defensive card sets it to false.
  passive: boolean;
}

/** A spell rendered in a window header chip: id + its baked icon + name. */
export interface WindowSpell {
  id: number;
  icon: string;
  name: string;
}

export type WindowStatus = 'good' | 'warn' | 'bad' | 'muted' | 'info';

export interface ComparisonWindow {
  timeStartS: number;
  timeEndS: number;
  /** Known cooldowns as header chips (id + baked icon + name). */
  spells: WindowSpell[];
  /** Cooldown names with no spell id, rendered as plain text. */
  labels: string[];
  status: WindowStatus;
  statusIcon: string;
  overview: RangeRow;
  detailRows: RangeRow[];
}
