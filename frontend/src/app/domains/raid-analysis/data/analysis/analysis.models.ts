export interface FindingOccurrence {
  atS: number;
  ok: boolean;
  /** Follows the occurrence's time; where `rule` is set, it continues `At <time>` mid-sentence. */
  detail: string;
  /** A cast the log could not settle: `ok` is false, yet it is no miss. */
  unjudged?: boolean;
  checks: ConditionCheck[];
  /** Set with `checks`: what they decide, said before the time. */
  rule?: string;
  /** Set with `checks`: the press's result, which heads them. */
  result?: string;
}

export interface ConditionCheck {
  text: string;
  truth: 'true' | 'false' | 'unknown';
  value: string;
  /** Decisive: settled the press's result. Unneeded: off the path that settled it. */
  role?: 'decisive' | 'unneeded';
  /** An either-or or all-of term, read operand by operand in place of its own row. */
  group?: { any: boolean; checks: ConditionCheck[] };
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
  /** The defensive is talent-gated and the pull's talents do not show the player took it. */
  talent_gated?: boolean;
}

export const CAT_LABEL: Record<string, string> = {
  lost_cooldown: 'lost cast',
  cooldown_delay: 'late',
  cooldown_alignment: 'Bloodlust',
  cast_efficiency: 'downtime',
  hold_suggestion: 'hold until',
};
