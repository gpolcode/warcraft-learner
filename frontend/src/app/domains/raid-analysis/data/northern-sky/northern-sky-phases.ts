export interface NorthernSkyPhase {
  /** Fractional for Northern Sky's intermission phases. */
  phase: number;
  start_s: number;
}

/** Northern Sky's Mythic phase starts, by encounter id, as its addon source declares them. */
export type NorthernSkyPhases = Record<number, readonly NorthernSkyPhase[]>;
