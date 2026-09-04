export interface NorthernSkyPhase {
  /** Fractional for Northern Sky's intermission phases. */
  phase: number;
  start_s: number;
}

/** Northern Sky's Mythic phase starts per encounter, read from `data/specs/northern-sky-phases.json` (written by `npm run phases:pull`). */
// Holds only the encounters whose Northern Sky module advances the phase in combat: an entry for a single-phase one would strand its later lines in a phase the addon never enters.
export type NorthernSkyPhases = Record<number, readonly NorthernSkyPhase[]>;
