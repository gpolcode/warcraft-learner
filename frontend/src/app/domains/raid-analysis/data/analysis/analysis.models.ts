import type { Tone } from '../verdict/tone.models';
import type { UnjudgedCause } from './pull-model-service';

export interface FindingOccurrence {
  atS: number;
  ok: boolean;
  /** Where `rule` is set, it continues `At <time>` mid-sentence, so it never stands on its own. */
  detail: string;
  /** A cast the log could not settle: `ok` is false, yet it is no miss. */
  unjudged?: boolean;
  checks: ConditionCheck[];
  rule?: string;
  result?: string;
}

export interface ConditionCheck {
  text: string;
  truth: 'true' | 'false' | 'unknown';
  value: string;
  /** Absent on a met condition of a missed press: on the path, yet not what to change. */
  role?: 'decisive' | 'unneeded';
  /** An either-or or all-of term, read operand by operand in place of its own row. */
  group?: { any: boolean; checks: ConditionCheck[] };
}

export interface AnalysisFinding {
  /** The `FindingFamily.id` of a family on the verdict contract. */
  family?: string;
  /** A family on the verdict contract carries the tone `ToneService` made; a legacy producer still names its own word. */
  severity: 'critical' | 'warning' | 'info' | 'hold_suggestion' | 'success' | Tone;
  /** Why a muted finding was not judged. */
  unjudged?: UnjudgedCause;
  category: string;
  cd_name?: string;
  message: string;
  // Populated by the analysis engine so the UI never has to parse the templated `message`.
  measured?: { value: string; unit?: string };
  label?: string;
  timestamp_s?: number;
  /** The pull time the finding rests on; a death or the wipe inside it is the root cause, so the finding folds under that cause instead of rendering. */
  span?: { fromS: number; toS: number };
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

/** One top log's own window inside a baked cluster. */
interface WindowMember {
  /** Index of the log in the bench's `sources`. */
  parse: number;
  time_s: number;
  window_length_s: number;
  damage: number;
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
  /** Every top log whose window formed this one; a log the window lacks had no window there. */
  members: WindowMember[];
}

export interface PlayerBurstWindow {
  window_damage: number;
  ability_breakdown?: { spell_id: number; damage: number; casts?: number }[];
}

export interface DefensiveWindow {
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
  never_used: 'never used',
  cooldown_delay: 'late',
  cooldown_alignment: 'Bloodlust',
  cast_efficiency: 'downtime',
  hold_suggestion: 'hold until',
};
