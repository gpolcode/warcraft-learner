import {
  round, getOrInsert, groupByTime,
  castEfficiencyPct, closestToZero, benchExpectedUses, fmtClock, sortBySeverity,
  AliveSpan, spansS, overlapS, castDowntimeS,
} from './analysis-math';
import { AnalysisFinding } from './analysis.models';

describe('round', () => {
  it('rounds to one decimal by default', () => {
    expect(round(1.249)).toBe(1.2);
  });
  it('honours an explicit decimal count', () => {
    expect(round(1.2349, 3)).toBe(1.235);
  });
});

describe('getOrInsert', () => {
  it('inserts and returns the default when the key is absent', () => {
    const map = new Map<string, number[]>();
    const list = getOrInsert(map, 'a', () => []);
    list.push(1);
    expect(map.get('a')).toEqual([1]);
  });
  it('returns the existing value without calling the factory again', () => {
    const map = new Map<string, number[]>();
    getOrInsert(map, 'a', () => []).push(1);
    let calls = 0;
    getOrInsert(map, 'a', () => { calls += 1; return []; }).push(2);
    expect(calls).toBe(0);
    expect(map.get('a')).toEqual([1, 2]);
  });
});

describe('groupByTime', () => {
  const MERGE_S = 5;
  it('keeps windows within mergeS of the running median in one cluster', () => {
    // 0 and 4 cluster (median 2); 6 is within 5 of that median, so all three merge.
    const clusters = groupByTime([{ time_s: 0 }, { time_s: 4 }, { time_s: 6 }], MERGE_S);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toHaveLength(3);
  });
  it('opens a new cluster when a window is beyond mergeS of the median', () => {
    // 0 and 4 cluster (median 2); 20 is > 5 from the median, so it splits off.
    const clusters = groupByTime([{ time_s: 0 }, { time_s: 4 }, { time_s: 20 }], MERGE_S);
    expect(clusters).toHaveLength(2);
    expect(clusters[1]).toEqual([{ time_s: 20 }]);
  });
});

describe('castEfficiencyPct', () => {
  const FIGHT_DUR_S = 100;
  it('reports the share of fight time spent casting', () => {
    expect(castEfficiencyPct(20, FIGHT_DUR_S)).toBe(80);
  });
  it('clamps to zero when downtime exceeds the fight', () => {
    expect(castEfficiencyPct(150, FIGHT_DUR_S)).toBe(0);
  });
});

describe('closestToZero', () => {
  it('returns the value with the smallest absolute magnitude', () => {
    expect(closestToZero([-3, 1, 4])).toBe(1);
  });
  it('returns 0 for an empty array', () => {
    expect(closestToZero([])).toBe(0);
  });
});

/** An alive player on a pull nothing cut short. */
function wholePull(endS: number): AliveSpan[] {
  return [[0, endS]];
}

describe('benchExpectedUses', () => {
  type Cadence = Parameters<typeof benchExpectedUses>[1];
  function cadence(over: Partial<Cadence> = {}): Cadence {
    return { uses_per_min: { avg: 2, stddev: 0 }, avg_first_cast_s: 0, avg_gap_s: null, ...over };
  }
  const FIGHT_DUR_S = 120;

  it('scales the top uses per minute by the fight length when the top logs show no gap to pace by', () => {
    // 2 per minute over 2 minutes.
    expect(benchExpectedUses(wholePull(FIGHT_DUR_S), cadence()).expected).toBe(4);
  });
  it('floors the -1 sigma estimate at zero', () => {
    expect(benchExpectedUses(wholePull(FIGHT_DUR_S), cadence({ uses_per_min: { avg: 1, stddev: 5 } })).floor).toBe(0);
  });

  describe('against the top cadence', () => {
    // Top raiders open at 5s, then press it every 30s, 2.1 times a minute.
    const TOP = cadence({ uses_per_min: { avg: 2.1, stddev: 0.06 }, avg_first_cast_s: 5, avg_gap_s: 30 });
    // Casts at 5, 35, ..., 335.
    const CASTS_BEFORE_IT = 12;
    // 5 + 12 * 30.
    const THIRTEENTH_CAST_S = 365;
    const PULL_END_BEFORE_IT_S = THIRTEENTH_CAST_S - 1;

    it('does not expect a cast the pull ends before, though the rate rounds up to it', () => {
      // 2.1 * 364 / 60 = 12.74 rounds to 13.
      expect(benchExpectedUses(wholePull(PULL_END_BEFORE_IT_S), TOP).expected).toBe(CASTS_BEFORE_IT);
    });
    it('expects the cast that lands exactly as the pull ends', () => {
      expect(benchExpectedUses(wholePull(THIRTEENTH_CAST_S), TOP).expected).toBe(CASTS_BEFORE_IT + 1);
    });
    it('measures the floor from the casts that fit', () => {
      // 12 - 0.06 * 364 / 60 = 11.64 rounds to 12; the rate's 13 would have put the floor at 13.
      expect(benchExpectedUses(wholePull(PULL_END_BEFORE_IT_S), TOP).floor).toBe(CASTS_BEFORE_IT);
    });
    it('keeps the rate count when top raiders press it less often than the cadence fits', () => {
      const slower = cadence({ ...TOP, uses_per_min: { avg: 1, stddev: 0 } });
      // 1 * 365 / 60 = 6.08, well under the 13 that fit.
      const SLOWER_RATE_COUNT = 6;
      expect(benchExpectedUses(wholePull(THIRTEENTH_CAST_S), slower).expected).toBe(SLOWER_RATE_COUNT);
    });
    it('counts a cast on the last second of the pull despite float error in the gap count', () => {
      // (33.3 - 3.3) / 30 computes as 0.9999999999999999; 4 * 33.3 / 60 = 2.22 rounds to 2.
      const edge = cadence({ uses_per_min: { avg: 4, stddev: 0 }, avg_first_cast_s: 3.3, avg_gap_s: 30 });
      const SECOND_CAST_S = 33.3;
      expect(benchExpectedUses(wholePull(SECOND_CAST_S), edge).expected).toBe(2);
    });
  });

  describe('around the top first cast', () => {
    // Top raiders first press it at 100s, then every 60s.
    const LATE_OPENER = cadence({ uses_per_min: { avg: 0.9, stddev: 0 }, avg_first_cast_s: 100, avg_gap_s: 60 });

    it('expects no cast from a pull that ends before top raiders first press it', () => {
      // 0.9 * 99 / 60 = 1.49 rounds to 1, but no top raider has pressed it by 99s.
      expect(benchExpectedUses(wholePull(LATE_OPENER.avg_first_cast_s - 1), LATE_OPENER).expected).toBe(0);
    });
    it('expects the first cast from a pull that ends right on it', () => {
      expect(benchExpectedUses(wholePull(LATE_OPENER.avg_first_cast_s), LATE_OPENER).expected).toBe(1);
    });
  });

  describe('over alive spans', () => {
    it('removes exactly the dead span from the rate', () => {
      // Alive 0:00 to 1:00 and 2:00 to 3:00: two alive minutes, the same as a whole two-minute pull.
      const WITH_DEATH: AliveSpan[] = [[0, 60], [120, 180]];
      expect(benchExpectedUses(WITH_DEATH, cadence()).expected).toBe(benchExpectedUses(wholePull(120), cadence()).expected);
    });

    // A fast rate, so the cadence alone decides the count: open at 5s, then every 30s.
    const PACED = cadence({ uses_per_min: { avg: 10, stddev: 0 }, avg_first_cast_s: 5, avg_gap_s: 30 });
    // Dead from 4s, before the opener, and back at 100s.
    const DIED_S = 4;
    const BACK_S = 100;

    it('expects a cast from a life after a resurrect that lasts a whole top gap', () => {
      expect(benchExpectedUses([[0, DIED_S], [BACK_S, BACK_S + 30]], PACED).expected).toBe(1);
    });
    it('expects none from a life after a resurrect that ends just short of a whole top gap', () => {
      expect(benchExpectedUses([[0, DIED_S], [BACK_S, BACK_S + 29.9]], PACED).expected).toBe(0);
    });
  });
});

describe('spansS and overlapS', () => {
  const SPANS: AliveSpan[] = [[0, 20], [50, 100]];

  it('sums the alive time of every span', () => {
    // 20 + 50.
    expect(spansS(SPANS)).toBe(70);
  });
  it('counts only the alive part of a stretch that crosses a death', () => {
    // 10..20 and 50..60.
    expect(overlapS(SPANS, 10, 60)).toBe(20);
  });
  it('counts nothing for a stretch that lies wholly in a death', () => {
    expect(overlapS(SPANS, 20, 50)).toBe(0);
  });
});

describe('castDowntimeS', () => {
  const THRESHOLD_S = 4;
  const SPANS: AliveSpan[] = [[0, 20], [50, 100]];

  it('counts a gap over the threshold in full', () => {
    expect(castDowntimeS([0, 10], THRESHOLD_S, wholePull(100))).toBe(10);
  });
  it('does not count a gap exactly at the threshold', () => {
    expect(castDowntimeS([0, THRESHOLD_S], THRESHOLD_S, wholePull(100))).toBe(0);
  });
  it('counts only the alive part of a gap across a death', () => {
    // 10..20 and 50..60 alive.
    expect(castDowntimeS([10, 60], THRESHOLD_S, SPANS)).toBe(20);
  });
  it('does not count a gap across a death whose alive part is exactly the threshold', () => {
    // 18..20 and 50..52 alive: 4s.
    expect(castDowntimeS([18, 52], THRESHOLD_S, SPANS)).toBe(0);
  });
  it('counts a gap across a death whose alive part is just over the threshold', () => {
    // 17.9..20 and 50..52 alive: 4.1s.
    expect(castDowntimeS([17.9, 52], THRESHOLD_S, SPANS)).toBeCloseTo(4.1);
  });
  it('never counts the time after the last cast inside the judged span', () => {
    // The 50s cast falls after the judged end at 30s, so only the 0..10 gap is judged.
    expect(castDowntimeS([0, 10, 50], THRESHOLD_S, wholePull(30))).toBe(10);
  });
});

describe('fmtClock', () => {
  it('zero-pads minutes and seconds', () => {
    expect(fmtClock(65)).toBe('01:05');
  });
});

describe('sortBySeverity', () => {
  it('orders red first and muted last, stable for equal tones', () => {
    // Both blue findings share a rank, so their input order must survive the sort.
    const findings = [
      { severity: 'muted', message: 'm' },
      { severity: 'blue', message: 'b1' },
      { severity: 'blue', message: 'b2' },
      { severity: 'red', message: 'r' },
    ] as AnalysisFinding[];
    sortBySeverity(findings);
    expect(findings.map(finding => finding.message)).toEqual(['r', 'b1', 'b2', 'm']);
  });
});
