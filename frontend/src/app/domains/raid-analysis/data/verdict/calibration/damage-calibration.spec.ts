import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DamageCalibrationService } from './damage-calibration-service';
import { ContrastBench } from './calibration.models';
import { EncounterBenches } from './held-out-case-service';
import { bench } from '../../rotation/rotation-harness';
import { benchSources, parseRanking } from '../../../../../../testing/builders/bench-sources';
import { burstBench, burstLog, defensiveLog, FIGHT_S, rotationLog } from './calibration-harness';
import type { DeadSpan } from '../../analysis/death-timeline-service';

const damage = TestBed.inject(DamageCalibrationService);

const TOP_N = 6;
/** Every top log idles 60s of the 300s pull, a fifth; a contrast log idling 90s is 30s past them, past the edge the 5s floor sets. */
const IDLE_PAST_S = 30;
/** Dead 30s, the same log is alive 270s, of which top logs would idle 54s: 36s past them. */
const IDLE_PAST_WHILE_ALIVE_S = 90 - 0.2 * 270;
const IDLE = rotationLog({ idle_s: [[100, 190]] });
/** Dead for 30 steady seconds of a burst log averaging 3,200 over 300s: 300 dealt is 28.125s of its average. */
const DEAD: DeadSpan[] = [[200, 230]];
const DEAD_PRICED_S = 300 / (3200 / FIGHT_S);
/** Top logs rank at 250,000; a weaker log at 200,000 over 300s is 75s of its own average short. */
const WEAKER = parseRanking({ rank: 950, amount: 200_000, duration_s: FIGHT_S });
const GAP_S = 75;

const benches = (over: Partial<EncounterBenches> = {}): EncounterBenches => ({
  rotation: bench({ sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: Array.from({ length: TOP_N }, () => rotationLog()) }),
  defensive: null,
  gear: null,
  burst: burstBench(Array.from({ length: TOP_N }, () => burstLog()), []),
  ...over,
});

const cohort = (over: Partial<ContrastBench> = {}): ContrastBench => ({
  spec: 'SubtletyRogue', encounter_id: 1, signature: '', fetched_at_s: 0, sources: [WEAKER],
  rotation: { sources: [WEAKER], per_parse: [IDLE] },
  defensive: { sources: [WEAKER], per_parse: [defensiveLog([], { dead: DEAD })] },
  gear: null, burst: null,
  ...over,
});

describe('DamageCalibrationService', () => {
  it('sums a contrast log\'s flagged idle time and its deaths against the gap its ranked figure shows', () => {
    expect(damage.samples(benches(), cohort())).toEqual([[IDLE_PAST_WHILE_ALIVE_S + DEAD_PRICED_S, GAP_S]]);
  });

  it('prices no idle time the rule leaves unflagged', () => {
    const asIdleAsTop = cohort({ rotation: { sources: [WEAKER], per_parse: [rotationLog()] }, defensive: null });

    expect(damage.samples(benches(), asIdleAsTop)).toEqual([[0, GAP_S]]);
  });

  it('prices a log with no defensive card on its idle time alone', () => {
    expect(damage.samples(benches(), cohort({ defensive: null }))).toEqual([[IDLE_PAST_S, GAP_S]]);
  });

  it('leaves out a log without its ranked figure', () => {
    const unranked = { ...WEAKER, amount: null };

    expect(damage.samples(benches(), cohort({ rotation: { sources: [unranked], per_parse: [IDLE] } }))).toEqual([]);
  });

  it('measures nothing before the cohort is fetched', () => {
    expect(damage.samples(benches(), null)).toEqual([]);
  });

  it('measures nothing on a bench ranked on healing', () => {
    const healing = benches({ rotation: bench({ metric: 'hps', sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: Array.from({ length: TOP_N }, () => rotationLog()) }) });

    expect(damage.samples(healing, cohort())).toEqual([]);
  });
});
