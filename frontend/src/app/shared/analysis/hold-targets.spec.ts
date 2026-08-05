import { describe, it, expect } from 'vitest';
import {
  HOLD_BAND_MIN_MS, HoldWindowSource, buildHoldTargets, detectHoldWindows, holdSuggestionFindings,
} from './hold-targets';
import { CdHoldTargets } from '../../core/models/encounter.models';

describe('detectHoldWindows', () => {
  const EFFECTIVE_CD_MS = 90_000;

  it('flags a cast more than 8s past the prior cast + cooldown', () => {
    // prior 0 + cd 90s = expected 90s; actual 110s -> 20s hold.
    const holds = detectHoldWindows([0, 110_000], EFFECTIVE_CD_MS);
    expect(holds).toHaveLength(1);
    expect(holds[0]).toMatchObject({ cast_index: 2, actual_ms: 110_000, delay_ms: 20_000 });
  });

  it('does not flag a cast exactly at the threshold (strict)', () => {
    // prior 0 + cd 90s + 8s threshold = 98s; delay exactly 8s -> not a hold.
    expect(detectHoldWindows([0, 98_000], EFFECTIVE_CD_MS)).toHaveLength(0);
    expect(detectHoldWindows([0, 98_100], EFFECTIVE_CD_MS)).toHaveLength(1);
  });

  it('measures each hold from the prior cast, so one hold does not cascade', () => {
    // cast 2 held (0 -> 200s); cast 3 on cooldown after it (200s -> 290s).
    const holds = detectHoldWindows([0, 200_000, 290_000], EFFECTIVE_CD_MS);
    expect(holds).toHaveLength(1);
    expect(holds[0].cast_index).toBe(2);
  });

  it('returns nothing with a single cast', () => {
    expect(detectHoldWindows([5_000], EFFECTIVE_CD_MS)).toEqual([]);
  });
});

describe('buildHoldTargets', () => {
  const EFFECTIVE_CD_MS = 90_000;
  const HELD_INDEX = 2;

  const heldAt = (actualMs: number, delayMs: number, parses: number): HoldWindowSource[] =>
    Array.from({ length: parses }, () => ({
      hold_windows: [{ cast_index: HELD_INDEX, actual_ms: actualMs, delay_ms: delayMs }],
    }));
  const noHolds = (parses: number): HoldWindowSource[] =>
    Array.from({ length: parses }, () => ({ hold_windows: [] }));

  it('surfaces a target when a majority of parses hold at that index', () => {
    // 5 of 10 hold index 2 -> meets max(2, 0.5 * 10 = 5).
    const targets = buildHoldTargets([...heldAt(110_000, 20_000, 5), ...noHolds(5)], EFFECTIVE_CD_MS);
    expect(targets[String(HELD_INDEX)]).toBeDefined();
    expect(targets[String(HELD_INDEX)].count).toBe(5);
  });

  it('drops a target below the majority (strict boundary)', () => {
    // 4 of 10 hold -> below max(2, 5).
    const targets = buildHoldTargets([...heldAt(110_000, 20_000, 4), ...noHolds(6)], EFFECTIVE_CD_MS);
    expect(targets[String(HELD_INDEX)]).toBeUndefined();
  });

  it('records prior-relative delay, absolute target, and a band floored at 5s', () => {
    // identical delays -> stddev 0 -> band floored at HOLD_BAND_MIN_MS.
    const targets = buildHoldTargets(heldAt(110_000, 20_000, 3), EFFECTIVE_CD_MS);
    expect(targets[String(HELD_INDEX)]).toMatchObject({
      target_ms: 110_000, delay_ms: 20_000, band_ms: HOLD_BAND_MIN_MS, effective_cd_ms: EFFECTIVE_CD_MS,
    });
  });

  it('bands on the delay spread when it clears the floor', () => {
    const spread: HoldWindowSource[] = [
      { hold_windows: [{ cast_index: HELD_INDEX, actual_ms: 100_000, delay_ms: 40_000 }] },
      { hold_windows: [{ cast_index: HELD_INDEX, actual_ms: 130_000, delay_ms: 50_000 }] },
    ];
    // median actual 115s, median delay 45s; delays [40000, 50000] give sample stddev sqrt(50_000_000) = 7071.07 -> 7071.
    expect(buildHoldTargets(spread, EFFECTIVE_CD_MS)).toMatchObject({
      [String(HELD_INDEX)]: { target_ms: 115_000, delay_ms: 45_000, band_ms: 7071 },
    });
  });

  it('keys consensus on the sample size passed, not the holders alone', () => {
    const TOTAL_PARSES = 6;  // 2 holders of 6 sampled -> below max(2, 0.5 * 6 = 3)
    expect(buildHoldTargets(heldAt(110_000, 20_000, 2), EFFECTIVE_CD_MS, TOTAL_PARSES)).toEqual({});
  });
});

describe('holdSuggestionFindings', () => {
  const NAME = 'Shadow Blades';
  // Prior-relative band: the top parses hold this cast HOLD_DELAY_MS past the reset, and a player
  // is flagged only when their own gap from their prior cast falls more than HOLD_BAND_MS below
  // that. Over-holding is tolerated.
  const HELD_CAST_INDEX = 2;      // the second cast (1-based key)
  const EFFECTIVE_CD_MS = 60_000; // the cooldown (cadence zero-point)
  const HOLD_DELAY_MS = 40_000;   // top parses hold ~40s past the reset
  const HOLD_BAND_MS = 5_000;     // tolerance half-width
  const TARGET_CLOCK_MS = 130_000; // display-only median clock target ("hold to 02:10")
  const HELD_COUNT = 6;           // "6 of 10 top parses hold" copy
  const TOTAL_SAMPLED = 10;
  const PRIOR_CAST_MS = 10_000;
  const BAND_EDGE_MS = PRIOR_CAST_MS + EFFECTIVE_CD_MS + (HOLD_DELAY_MS - HOLD_BAND_MS);
  const UNDER_HELD_MS = BAND_EDGE_MS - 5_000;
  const OVER_HELD_MS = PRIOR_CAST_MS + EFFECTIVE_CD_MS + HOLD_DELAY_MS + 20_000;

  const targetAt = (castIndex: number): CdHoldTargets => ({
    [castIndex]: {
      target_ms: TARGET_CLOCK_MS, stddev_ms: HOLD_BAND_MS,
      delay_ms: HOLD_DELAY_MS, delay_stddev_ms: 3_000, band_ms: HOLD_BAND_MS, effective_cd_ms: EFFECTIVE_CD_MS,
      count: HELD_COUNT, total_samples: TOTAL_SAMPLED,
    },
  });
  const holdTargets = targetAt(HELD_CAST_INDEX);

  it('suggests a hold when the player under-held vs the prior-relative band', () => {
    const out = holdSuggestionFindings(NAME, [PRIOR_CAST_MS, UNDER_HELD_MS], holdTargets);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ severity: 'info', category: 'hold_suggestion' });
  });

  it('reports the cast clock and the consensus in the message', () => {
    const [finding] = holdSuggestionFindings(NAME, [PRIOR_CAST_MS, UNDER_HELD_MS], holdTargets);
    expect(finding.message).toContain(`${HELD_COUNT}/${TOTAL_SAMPLED} top parses hold to 02:10`);
    expect(finding.details?.cd_name).toBe(NAME);
  });

  it('does not suggest at the band edge (strict boundary)', () => {
    expect(holdSuggestionFindings(NAME, [PRIOR_CAST_MS, BAND_EDGE_MS], holdTargets)).toEqual([]);
  });

  it('tolerates over-holding (a later-than-band press is fine)', () => {
    expect(holdSuggestionFindings(NAME, [PRIOR_CAST_MS, OVER_HELD_MS], holdTargets)).toEqual([]);
  });

  it('skips index 0 - no prior cast to measure a gap against', () => {
    const PLAYER_FIRST_MS = 80_000;
    expect(holdSuggestionFindings(NAME, [PLAYER_FIRST_MS], targetAt(1))).toEqual([]);
  });

  it('skips a cast index the player never reached', () => {
    expect(holdSuggestionFindings(NAME, [PRIOR_CAST_MS], holdTargets)).toEqual([]);
  });

  it('returns nothing when the player never cast the ability', () => {
    expect(holdSuggestionFindings(NAME, [], holdTargets)).toEqual([]);
  });
});
