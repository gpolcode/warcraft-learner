import {
  round, getOrInsert, groupByTime, isOutlierAbove, isOutlierBeyond, isOutlierBelow, OUTLIER_SIGMAS,
  castEfficiencyPct, closestToZero, benchExpectedUses, fmtClock, sortBySeverity,
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

describe('isOutlierAbove', () => {
  const MEAN = 10;
  const STDDEV = 2;
  // mean + 2*stddev = 14 is the strict boundary.
  it('flags a value more than two sigma above the mean', () => {
    expect(isOutlierAbove(14.1, MEAN, STDDEV)).toBe(true);
  });
  it('does not flag a value exactly at the two-sigma boundary', () => {
    expect(isOutlierAbove(14, MEAN, STDDEV)).toBe(false);
  });
});

describe('isOutlierBeyond', () => {
  const MEAN = 10;
  const STDDEV = 2;
  it('flags a value more than two sigma below the mean', () => {
    expect(isOutlierBeyond(5.9, MEAN, STDDEV)).toBe(true);
  });
  it('does not flag a value exactly at the boundary', () => {
    expect(isOutlierBeyond(6, MEAN, STDDEV)).toBe(false);
  });
});

describe('a band floor', () => {
  const MEAN = 10;
  const TIGHT_STDDEV = 0.2; // two sigma is only 0.4
  const FLOOR = 2;

  it('widens a tight band above the mean to the floor, flagging only past it', () => {
    expect(isOutlierAbove(MEAN + FLOOR, MEAN, TIGHT_STDDEV, OUTLIER_SIGMAS, FLOOR)).toBe(false);
    expect(isOutlierAbove(MEAN + FLOOR + 0.1, MEAN, TIGHT_STDDEV, OUTLIER_SIGMAS, FLOOR)).toBe(true);
  });

  it('widens a tight band on both sides of the mean to the floor', () => {
    expect(isOutlierBeyond(MEAN - FLOOR, MEAN, TIGHT_STDDEV, OUTLIER_SIGMAS, FLOOR)).toBe(false);
    expect(isOutlierBeyond(MEAN - FLOOR - 0.1, MEAN, TIGHT_STDDEV, OUTLIER_SIGMAS, FLOOR)).toBe(true);
  });

  it('leaves a band already wider than the floor at two sigma', () => {
    const WIDE_STDDEV = 2; // two sigma is 4
    expect(isOutlierAbove(MEAN + 4, MEAN, WIDE_STDDEV, OUTLIER_SIGMAS, FLOOR)).toBe(false);
    expect(isOutlierAbove(MEAN + 4.1, MEAN, WIDE_STDDEV, OUTLIER_SIGMAS, FLOOR)).toBe(true);
  });
});

describe('isOutlierBelow', () => {
  const MEAN = 10;
  const STDDEV = 2;
  it('flags a value more than the default two sigma below the mean', () => {
    // mean - 2*stddev = 6 is the strict boundary.
    expect(isOutlierBelow(5.9, MEAN, STDDEV)).toBe(true);
    expect(isOutlierBelow(6, MEAN, STDDEV)).toBe(false);
  });
  it('honors an explicit sigma count (one sigma below)', () => {
    // mean - stddev = 8 is the strict boundary.
    expect(isOutlierBelow(7.9, MEAN, STDDEV, 1)).toBe(true);
    expect(isOutlierBelow(8, MEAN, STDDEV, 1)).toBe(false);
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

describe('benchExpectedUses', () => {
  type Cadence = Parameters<typeof benchExpectedUses>[1];
  function cadence(over: Partial<Cadence> = {}): Cadence {
    return { uses_per_min: { avg: 2, stddev: 0 }, avg_first_cast_s: 0, avg_gap_s: null, ...over };
  }
  const FIGHT_DUR_S = 120;

  it('scales the top uses per minute by the fight length when the top logs show no gap to pace by', () => {
    // 2 per minute over 2 minutes.
    expect(benchExpectedUses(FIGHT_DUR_S, cadence()).expected).toBe(4);
  });
  it('floors the -1 sigma estimate at zero', () => {
    expect(benchExpectedUses(FIGHT_DUR_S, cadence({ uses_per_min: { avg: 1, stddev: 5 } })).floor).toBe(0);
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
      expect(benchExpectedUses(PULL_END_BEFORE_IT_S, TOP).expected).toBe(CASTS_BEFORE_IT);
    });
    it('expects the cast that lands exactly as the pull ends', () => {
      expect(benchExpectedUses(THIRTEENTH_CAST_S, TOP).expected).toBe(CASTS_BEFORE_IT + 1);
    });
    it('measures the floor from the casts that fit', () => {
      // 12 - 0.06 * 364 / 60 = 11.64 rounds to 12; the rate's 13 would have put the floor at 13.
      expect(benchExpectedUses(PULL_END_BEFORE_IT_S, TOP).floor).toBe(CASTS_BEFORE_IT);
    });
    it('keeps the rate count when top raiders press it less often than the cadence fits', () => {
      const slower = cadence({ ...TOP, uses_per_min: { avg: 1, stddev: 0 } });
      // 1 * 365 / 60 = 6.08, well under the 13 that fit.
      const SLOWER_RATE_COUNT = 6;
      expect(benchExpectedUses(THIRTEENTH_CAST_S, slower).expected).toBe(SLOWER_RATE_COUNT);
    });
    it('counts a cast on the last second of the pull despite float error in the gap count', () => {
      // (33.3 - 3.3) / 30 computes as 0.9999999999999999; 4 * 33.3 / 60 = 2.22 rounds to 2.
      const edge = cadence({ uses_per_min: { avg: 4, stddev: 0 }, avg_first_cast_s: 3.3, avg_gap_s: 30 });
      const SECOND_CAST_S = 33.3;
      expect(benchExpectedUses(SECOND_CAST_S, edge).expected).toBe(2);
    });
  });

  describe('around the top first cast', () => {
    // Top raiders first press it at 100s, then every 60s.
    const LATE_OPENER = cadence({ uses_per_min: { avg: 0.9, stddev: 0 }, avg_first_cast_s: 100, avg_gap_s: 60 });

    it('expects no cast from a pull that ends before top raiders first press it', () => {
      // 0.9 * 99 / 60 = 1.49 rounds to 1, but no top raider has pressed it by 99s.
      expect(benchExpectedUses(LATE_OPENER.avg_first_cast_s - 1, LATE_OPENER).expected).toBe(0);
    });
    it('expects the first cast from a pull that ends right on it', () => {
      expect(benchExpectedUses(LATE_OPENER.avg_first_cast_s, LATE_OPENER).expected).toBe(1);
    });
  });
});

describe('fmtClock', () => {
  it('zero-pads minutes and seconds', () => {
    expect(fmtClock(65)).toBe('01:05');
  });
});

describe('sortBySeverity', () => {
  it('orders critical first and success last, stable for equal ranks', () => {
    // info and hold_suggestion share rank 2, so their input order must survive the sort.
    const findings = [
      { severity: 'success', message: 's' },
      { severity: 'info', message: 'i' },
      { severity: 'hold_suggestion', message: 'h' },
      { severity: 'critical', message: 'c' },
    ] as AnalysisFinding[];
    sortBySeverity(findings);
    expect(findings.map(finding => finding.message)).toEqual(['c', 'i', 'h', 's']);
  });
});
