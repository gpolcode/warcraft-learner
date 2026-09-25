export interface PlanCooldown {
  name: string;
  spell_id: number;
  cooldown: number;
  opener_priority?: number;
  talent_gated?: boolean;
}

export interface PlanDefensive {
  name: string;
  spell_id: number;
  cooldown: number;
  talent_gated?: boolean;
}

/** One line of the list: its button, and the condition SimC presses it under. */
export interface PlanLine {
  /** The button as SimC names it: `black_powder`. */
  action: string;
  /** The `&` terms of the line's own condition and of every list call above it, as SimC text; null when SimC wrote one no parser reads. */
  terms: string[] | null;
  /** Seconds the line waits after it fires before it may fire again. */
  line_cd?: number;
}

/** The spell data a list's names resolve to; every record SimC holds under the name, each log reading the one it shows. */
export interface PlanSpell {
  name: string;
  ids: number[];
  /** A charged button's recharge. */
  cooldown: number;
  charges: number;
  /** An aura's base seconds, 0 when it states none. */
  duration: number;
  /** 0 for a spell off the global cooldown. */
  gcd: number;
  cast_time: number;
  max_stacks: number;
  /** Per WCL power type, in the game's own units. */
  costs: { type: number; amount: number }[];
}

/** The talent entries a list's `talent.x`, `hero_tree.x` or `apex.N` names; picking any one of them holds it. */
export interface PlanTalent {
  name: string;
  entries: number[];
}

/** A spec's SimulationCraft list and everything its names resolve to, so a log is read against it with nothing fetched. */
export interface PriorityList {
  lines: PlanLine[];
  spells: Record<string, PlanSpell>;
  talents: Record<string, PlanTalent>;
}
