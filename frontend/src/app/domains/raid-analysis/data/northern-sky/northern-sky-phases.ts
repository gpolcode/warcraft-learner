export interface NorthernSkyPhase {
  /** Northern Sky's own phase number, fractional for its intermission phases. */
  phase: number;
  start_s: number;
}

/** Northern Sky's Mythic phase starts, seconds from the pull, mirrored from the addon's own boss timelines. */
// Only encounters whose Northern Sky module advances the phase in combat: a single-phase one listed here would strand its later lines in a phase the addon never enters.
export const NORTHERN_SKY_PHASES: Readonly<Record<number, readonly NorthernSkyPhase[]>> = {
  3429: [
    { phase: 1, start_s: 0 },
    { phase: 2, start_s: 175 },
    { phase: 2.5, start_s: 382 },
    { phase: 3, start_s: 417 },
    { phase: 4, start_s: 677 },
  ],
  3445: [
    { phase: 1, start_s: 0 },
    { phase: 2, start_s: 56 },
    { phase: 3, start_s: 157 },
    { phase: 4, start_s: 258 },
    { phase: 5, start_s: 359 },
    { phase: 6, start_s: 453 },
  ],
  3470: [
    { phase: 1, start_s: 0 },
    { phase: 1.5, start_s: 197.89 },
    { phase: 1.75, start_s: 281.9 },
    { phase: 2, start_s: 368.28 },
    { phase: 3, start_s: 588.28 },
  ],
  3497: [
    { phase: 1, start_s: 0 },
    { phase: 2, start_s: 64 },
    { phase: 3, start_s: 183 },
    { phase: 4, start_s: 306 },
    { phase: 5, start_s: 434 },
  ],
};
