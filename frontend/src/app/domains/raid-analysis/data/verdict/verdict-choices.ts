/** Every number the verdict layer chooses rather than measures, in one place, so a calibration report can name each one. */
export const VERDICT_CHOICES = {
  /** False-flag rate per graded test on held-out top logs that each tone may spend. */
  perTestBudget: { red: 0.01, amber: 0.05 },
  /** Colored rows per held-out top pull, per role. */
  pageBudget: { red: 0.1, amber: 1.0 },
  /** A tier arms when the one-sided 95% Clopper-Pearson upper bound of its pooled leave-one-out rate is under the bound, over at least this many tests. */
  arming: {
    red: { bound: 0.02, minPooledTests: 1500 },
    amber: { bound: 0.08, minPooledTests: 500 },
  },
  /** Fewer top logs than this describe one log's habit rather than the field's: such a bench is context only. */
  minReferenceN: 5,
  /** Effect floors inside a cost class: shares in excess misses, counts in uses, timings in seconds. */
  effectFloors: {
    excessMisses: { amber: 2, red: 3 },
    lostUses: 1,
    lostUsesShare: 0.25,
    timingS: 5,
    /** A first use top logs agree on to the second still tolerates this much. */
    openerS: 2,
  },
  /** Paired consensus colors only when this share of the top logs agree; alone it needs all of them. */
  pairedConsensusShare: 0.8,
  /** SimC's own minimum reaction: a fact that changed this close before a press reads unknown. */
  reactionS: 0.35,
  /** A wipe with no call ends once this share of the raid is dead at once. */
  wipeDeadShare: 0.5,
  /** A window after a phase that began further than this from the bench median is muted. */
  phaseGuardS: 15,
  /** Discrimination gates against the contrast cohort. */
  discrimination: { minLift: 2, minLiftLowerBound: 1.3, minAuc: 0.6 },
} as const;
