import { describe, it, expect } from 'vitest';
import { CompactAbilityRowComponent } from './compact-ability-row';
import { RangeRow } from '../range-chart/range-chart';
import { mountVm } from '../../../../testing/component-harness';

function row(overrides: Partial<RangeRow>): RangeRow {
  return { label: 'Test', playerPct: null, topAvg: null, topMin: null, topMax: null, ...overrides };
}

const mount = (r: RangeRow, max: number) =>
  mountVm(CompactAbilityRowComponent, { row: r, max }).vm;

describe('CompactAbilityRowComponent bar layers', () => {
  it('positions the range band from topMin to topMax over max', () => {
    const vm = mount(row({ topMin: 100, topMax: 300 }), 400);
    const style = (vm['rangeStyle'] as () => string | null)();
    expect(style).toContain('left:25%');
    expect(style).toContain('width:50%');
  });

  it('positions the average tick at topAvg over max', () => {
    const vm = mount(row({ topAvg: 200 }), 400);
    expect((vm['avgStyle'] as () => string | null)()).toContain('left:50%');
  });

  it('positions the player marker at playerPct over max', () => {
    const vm = mount(row({ playerPct: 100 }), 400);
    expect((vm['playerStyle'] as () => string | null)()).toContain('left:25%');
  });

  it('renders no player marker when playerPct is null', () => {
    const vm = mount(row({ playerPct: null, topAvg: 200 }), 400);
    expect((vm['playerStyle'] as () => string | null)()).toBeNull();
  });

  it('renders no range band when topMin/topMax are missing', () => {
    const vm = mount(row({ topMin: null, topMax: null }), 400);
    expect((vm['rangeStyle'] as () => string | null)()).toBeNull();
  });

  it('clamps player above the range to 100%', () => {
    const vm = mount(row({ playerPct: 800 }), 400);
    expect((vm['playerStyle'] as () => string | null)()).toContain('left:100%');
  });
});

describe('CompactAbilityRowComponent delta', () => {
  it('formats a positive delta when player beats the top average', () => {
    const vm = mount(row({ playerPct: 150, topAvg: 100 }), 200);
    expect((vm['formattedDelta'] as () => string)()).toBe('+50%');
    expect((vm['deltaColor'] as () => string)()).toBe('#3fb950');
  });

  it('formats a negative delta when player falls short', () => {
    const vm = mount(row({ playerPct: 60, topAvg: 100 }), 200);
    expect((vm['formattedDelta'] as () => string)()).toBe('-40%');
    expect((vm['deltaColor'] as () => string)()).toBe('#f85149');
  });

  it('renders no delta when player or top average is missing', () => {
    const vm = mount(row({ playerPct: null, topAvg: 100 }), 200);
    expect((vm['formattedDelta'] as () => string)()).toBe('');
  });

  it('inverts delta colour for lower-is-better (defensives)', () => {
    const vm = mountVm(CompactAbilityRowComponent, {
      row: row({ playerPct: 60, topAvg: 100 }),
      max: 200,
      higherIsBetter: false,
    }).vm;
    expect((vm['deltaColor'] as () => string)()).toBe('#3fb950');
  });
});
