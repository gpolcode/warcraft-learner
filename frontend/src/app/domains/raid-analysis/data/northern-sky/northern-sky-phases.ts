export interface NorthernSkyPhase {
  /** Fractional for Northern Sky's intermission phases. */
  phase: number;
  start_s: number;
}

export type NorthernSkyPhases = Record<number, readonly NorthernSkyPhase[]>;
