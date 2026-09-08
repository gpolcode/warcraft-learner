export interface RangeRow {
  spellId?: number;
  label: string;
  icon: string;
  playerPct: number | null;
  // Top-parse range. All three may be null when no comparison data exists for a row.
  topAvg: number | null;
  topMin: number | null;
  topMax: number | null;
  playerCasts?: number | null;
  topCasts?: number | null;
  // Burst windows only: the ability is passive (never cast), so the casts cell shows a muted "passive" tag instead of a count.
  passive?: boolean;
}

export interface WindowSpell {
  id: number;
  icon: string;
  name: string;
}

export type WindowStatus = 'good' | 'warn' | 'bad' | 'muted' | 'info';

export interface ComparisonWindow {
  timeStartS: number;
  timeEndS: number;
  spells: WindowSpell[];
  labels: string[];
  /** What the player did in this window, kept out of `labels` so a verdict never renders as a recommended cooldown. Empty renders nothing. */
  note: string;
  status: WindowStatus;
  statusIcon: string;
  overview: RangeRow;
  detailRows: RangeRow[];
}
