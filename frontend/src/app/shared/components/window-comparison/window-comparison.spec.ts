import { describe, it, expect } from 'vitest';
import { WindowComparisonComponent, ComparisonWindow, WindowStatus } from './window-comparison';
import { RangeRow } from '../range-chart/range-chart';
import { mountVm } from '../../../../testing/component-harness';

function win(overview: Partial<RangeRow>, status: WindowStatus = 'good'): ComparisonWindow {
  return {
    timeStartS: 0,
    timeEndS: 10,
    spellIds: [],
    labels: [],
    status,
    statusIcon: 'check_circle',
    overview: { label: '', playerPct: null, topAvg: null, topMin: null, topMax: null, ...overview },
    detailRows: [],
  };
}

const overviewMaxOf = (windows: ComparisonWindow[]): number => {
  const { vm } = mountVm(WindowComparisonComponent, { windows });
  return (vm['overviewMax'] as () => number)();
};

const selectedIndexOf = (windows: ComparisonWindow[], higherIsBetter = true): number => {
  const { vm } = mountVm(WindowComparisonComponent, { windows, higherIsBetter });
  return (vm['selectedIndex'] as () => number)();
};

describe('WindowComparisonComponent overviewMax', () => {
  it('is the largest of topAvg / topMax / playerPct across every window', () => {
    expect(overviewMaxOf([win({ topAvg: 100, topMax: 250, playerPct: 180 }), win({ topAvg: 90, topMax: 120, playerPct: 300 })])).toBe(300);
  });

  it('ignores null comparison values', () => {
    expect(overviewMaxOf([win({ topAvg: null, topMax: 42, playerPct: null })])).toBe(42);
  });

  it('floors at 0.01 so an all-null/empty set never yields a zero scale', () => {
    expect(overviewMaxOf([win({})])).toBe(0.01);
  });
});

describe('WindowComparisonComponent selectedIndex', () => {
  it('picks the lowest player/top ratio when higher is better (burst)', () => {
    const windows = [
      win({ playerPct: 95, topAvg: 100 }), // ratio 0.95
      win({ playerPct: 40, topAvg: 100 }), // ratio 0.40 - worst
      win({ playerPct: 120, topAvg: 100 }),
    ];
    expect(selectedIndexOf(windows, true)).toBe(1);
  });

  it('picks the highest player/top ratio when lower is better (damage taken)', () => {
    const windows = [
      win({ playerPct: 95, topAvg: 100 }),
      win({ playerPct: 40, topAvg: 100 }),
      win({ playerPct: 200, topAvg: 100 }), // ratio 2.0 - worst (most damage taken)
    ];
    expect(selectedIndexOf(windows, false)).toBe(2);
  });

  it('skips muted windows and windows without player/top data', () => {
    const windows = [
      win({ playerPct: 10, topAvg: 100 }, 'muted'), // muted: ignored despite worst ratio
      win({ playerPct: null, topAvg: 100 }),        // no player data: ignored
      win({ playerPct: 80, topAvg: 100 }),          // only valid window
    ];
    expect(selectedIndexOf(windows, true)).toBe(2);
  });

  it('falls back to 0 when no window has comparable data', () => {
    expect(selectedIndexOf([win({}, 'muted'), win({ playerPct: null, topAvg: null })], true)).toBe(0);
  });
});

describe('WindowComparisonComponent selection', () => {
  it('does not activate a muted window on select', () => {
    const windows = [win({ playerPct: 80, topAvg: 100 }), win({}, 'muted')];
    const { vm } = mountVm(WindowComparisonComponent, { windows });
    (vm['select'] as (i: number) => void)(1);
    expect((vm['activeIndex'] as () => number)()).toBe(0);
  });

  it('activates a non-muted window on select, overriding the default', () => {
    const windows = [win({ playerPct: 40, topAvg: 100 }), win({ playerPct: 95, topAvg: 100 })];
    const { vm } = mountVm(WindowComparisonComponent, { windows });
    expect((vm['activeIndex'] as () => number)()).toBe(0); // worst by default
    (vm['select'] as (i: number) => void)(1);
    expect((vm['activeIndex'] as () => number)()).toBe(1);
  });
});

describe('WindowComparisonComponent timeTicks', () => {
  const ticksFor = (fightDuration: number): number[] => {
    const { vm } = mountVm(WindowComparisonComponent, { windows: [win({})], fightDuration });
    return (vm['timeTicks'] as () => number[])();
  };

  it('returns no ticks for a zero-length fight', () => {
    expect(ticksFor(0)).toEqual([]);
  });

  it('returns 6 evenly spaced ticks from 0 to fightDuration', () => {
    expect(ticksFor(300)).toEqual([0, 60, 120, 180, 240, 300]);
  });

  it('handles short fights', () => {
    expect(ticksFor(10)).toEqual([0, 2, 4, 6, 8, 10]);
  });
});
