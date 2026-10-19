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
  /** A missing enchant is a loss only once this share of the top logs agree on the slot's enchant, which shows the slot takes one. */
  enchantLeaderShare: 0.5,
  /** A talent node is shared once this share of the top logs with a readable tree take it at one rank; each such node flags a held-out top log at most 1 - share of the time. */
  talentNodeShare: 0.9,
  /** A lust later than this is mid-fight: the opener's cooldowns, pressed at the pull, are not what overlaps it. */
  midFightLustS: 30,
  /** A cooldown wants Bloodlust once this share of the top logs that lusted mid-fight had it up during their lust. */
  lustWantShare: 0.5,
  /** Paired consensus colors only when this share of the top logs agree; alone it needs all of them. */
  pairedConsensusShare: 0.8,
  /** SimC's own minimum reaction: a fact that changed this close before a press reads unknown. */
  reactionS: 0.35,
  /** A wipe with no call ends once this share of the raid is dead at once. */
  wipeDeadShare: 0.5,
  /** A window after a phase that began further than this from the bench median is muted. */
  phaseGuardS: 15,
  /** The harness's own numbers: the arming bound's confidence, the per-bench anomaly test, the power floors and the perturbation invariants. */
  calibration: {
    armingConfidence: 0.95,
    /** A bench whose own leave-one-out rate is this unlikely under the pooled rate demotes the family on that bench. */
    anomalyP: 0.01,
    /** Share of injected mistakes a tone must catch before it arms. */
    detectionFloor: { red: 0.9, amber: 0.7 },
    /** Truncation and an inserted death may raise a rule's flag rate by at most this factor. */
    perturbedRateRatio: 1.5,
    /** Jittering every event may move the burst flag rate by under this share. */
    jitterRateShift: 0.02,
    jitterS: 2,
    lustShiftsS: [120, 180],
    damageScale: 0.85,
    delayS: 30,
    burstShiftS: 15,
    idleGcds: 5,
    gcdS: 1.5,
    offListPresses: 5,
    /** A held-out pull is cut, or its player dies, somewhere in this share of the pull. */
    perturbedShare: { from: 0.2, to: 0.9 },
    rezAfterS: 30,
  },
  /** Discrimination gates against the contrast cohort. */
  discrimination: { minLift: 2, minLiftLowerBound: 1.3, minAuc: 0.6 },
} as const;
