import type { UnjudgedCause } from './pull-model-service';
import type { RowRank, Tone } from '../verdict/tone.models';

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

/** A tone from the window's check, or muted where the pull model leaves the window unjudged. */
export type WindowStatus = 'muted' | Tone;

export interface ComparisonWindow {
  timeStartS: number;
  timeEndS: number;
  spells: WindowSpell[];
  labels: string[];
  /** What the player did in this window, kept out of `labels` so a verdict never renders as a recommended cooldown. Empty renders nothing. */
  note: string;
  status: WindowStatus;
  statusIcon: string;
  /** A pre-fight window: no player overlay, only the top logs' figures. */
  benchOnly: boolean;
  /** The window's verdict in one or two sentences, naming its top logs as a count; empty renders nothing. */
  message: string;
  family?: string;
  /** Absent on a muted or bench-only window. */
  rank?: RowRank;
  /** Why a muted window is not judged; null on a judged or bench-only window. */
  unjudged: UnjudgedCause | null;
  overview: RangeRow;
  detailRows: RangeRow[];
}
