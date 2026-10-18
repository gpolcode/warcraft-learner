/** Ordered weakest first: a tone is the minimum of its caps. */
export const TONE_LEVELS = ['neutral', 'blue', 'amber', 'red'] as const;

export type ToneLevel = (typeof TONE_LEVELS)[number];

declare const toneBrand: unique symbol;

/** Only ToneService constructs one; `muted` is a check the pull could not judge. */
export type Tone = (ToneLevel | 'muted') & { readonly [toneBrand]: true };

/** What a whole finding costs the player: high is a major cooldown cast or a death, low a share or a node. */
export type CostClass = 'high' | 'medium' | 'low';

/** What a decision rule found, before the family's tier and cost class cap it. */
export interface Evidence {
  /** The strongest tone the evidence alone supports. */
  level: ToneLevel;
  observed: number;
  /** Top logs the rule compared against. */
  n: number;
  /** The edge the observed value crossed or must cross, in the construct's unit; null where the rule has none. */
  target: number | null;
  /** How far past the amber edge the observed value lies, in the construct's unit; 0 when inside. */
  excess: number;
}

/** The tone calibration lets each family reach on one page. */
export interface FamilyCaps {
  capOf(familyId: string): ToneLevel;
}
