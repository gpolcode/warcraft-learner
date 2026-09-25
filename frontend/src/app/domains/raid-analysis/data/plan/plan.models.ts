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

export interface PlanLine {
  /** SimC's token, not the in-game name: `black_powder`. */
  action: string;
  /** The `&` terms of the line and of every list call above it, as SimC text; null when no parser reads the condition. */
  terms: string[] | null;
  line_cd?: number;
}

/** A variable SimC sets during the fight, replayed at each cast in list order; one set once is inlined into the lines instead. */
export interface PlanVariable {
  name: string;
  op: string;
  value?: string;
  value_else?: string;
  condition?: string;
  terms: string[] | null;
  default?: number;
  /** Set once before the pull. */
  precombat?: true;
}

/** Merged over every record SimC holds under the name; a log casts under any of `ids`. */
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

/** Picking any one of `entries` holds the talent. */
export interface PlanTalent {
  name: string;
  entries: number[];
}

export interface PriorityList {
  lines: PlanLine[];
  variables: PlanVariable[];
  spells: Record<string, PlanSpell>;
  talents: Record<string, PlanTalent>;
}
