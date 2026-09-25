export interface FindingOccurrence {
  atS?: number;
  ok: boolean;
  label: string;
  /** Rendered only when `atS` is absent - never alongside it. */
  note?: string;
  detail: string;
  /** Excludes this entry from the ok/violation tone the template otherwise applies. */
  marker?: boolean;
  /** A cast the log could not settle either way, toned apart from both. */
  unjudged?: boolean;
  /** The list line the cast was read against, term by term. */
  checks?: ConditionCheck[];
}

/** One term of a list line at a cast: the condition in words, whether it held, and what the log shows. */
export interface ConditionCheck {
  text: string;
  truth: 'true' | 'false' | 'unknown';
  value: string;
  /** Where the top logs' casts put it, from their 10th to their 90th percentile, for a term that measures a number. */
  top?: string;
}

/** One line of a button's list entry: whose build it is and how often it allowed the player's and the top logs' casts. */
export interface LineSplit {
  text: string;
  /** Whether the player's talents hold for the line's talent terms. */
  build: 'true' | 'false' | 'unknown';
  /** Shares of on-list casts; null where there were none to share out. */
  you: number | null;
  top: number | null;
}

export interface AnalysisFinding {
  severity: 'critical' | 'warning' | 'info' | 'hold_suggestion' | 'success';
  category: string;
  cd_name?: string;
  message: string;
  // Populated by the analysis engine so the UI never has to parse the templated `message`.
  measured?: { value: string; unit?: string };
  label?: string;
  timestamp_s?: number;
  details?: {
    cd_name?: string;
    remedy?: string;
  };
  occurrences: FindingOccurrence[];
}

interface AbilityBreakdown {
  spell_id: number;
  avg_damage: number;
  min_damage: number;
  max_damage: number;
  avg_casts?: number;
  // Burst windows only: true when no top parse ever cast this ability, so the UI shows a "passive" tag instead of a cast count.
  is_passive?: boolean;
}

export interface BurstWindow {
  time_s: number;
  dmg_avg: number;
  dmg_min: number;
  dmg_max: number;
  dmg_stddev: number;
  common_cds: string[];
  ability_breakdown: AbilityBreakdown[];
  window_length_s: number;
  defensive_name?: string;
  spell_id?: number;
  ref_game_id?: number | null;
}

export interface PlayerBurstWindow {
  window_damage: number;
  ability_breakdown?: { spell_id: number; damage: number; casts?: number }[];
}

interface DefensiveWindow {
  start_s: number;
  end_s: number;
}

export interface PlayerDefensive {
  name: string;
  uses: number;
  cast_times_s?: number[];
  windows: DefensiveWindow[];
  talent_gated?: boolean;
}

export const CAT_LABEL: Record<string, string> = {
  lost_cooldown: 'lost cast',
  cooldown_delay: 'late',
  cooldown_alignment: 'Bloodlust',
  cast_efficiency: 'downtime',
  hold_suggestion: 'hold until',
};
