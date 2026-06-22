import { describe, it, expect } from 'vitest';
import { CompactAbilityRowComponent } from './compact-ability-row';
import { RangeRow } from '../range-chart/range-chart';
import { mountVm } from '../../../../testing/component-harness';

function row(overrides: Partial<RangeRow>): RangeRow {
  return { label: 'Test', playerPct: null, topAvg: null, topMin: null, topMax: null, ...overrides };
}

const mount = (r: RangeRow, extra: Record<string, unknown> = {}) =>
  mountVm(CompactAbilityRowComponent, { row: r, ...extra }).vm;

describe('CompactAbilityRowComponent gap', () => {
  it('shows positive gap with + sign when player exceeds top avg', () => {
    const vm = mount(row({ playerPct: 150, topAvg: 100 }));
    expect((vm['gapSign'] as () => string)()).toBe('+');
    expect((vm['gapMagnitude'] as () => number)()).toBe(50);
    expect((vm['gapColor'] as () => string)()).toBe('#3fb950');
  });

  it('shows negative gap with - sign when player falls short', () => {
    const vm = mount(row({ playerPct: 60, topAvg: 100 }));
    expect((vm['gapSign'] as () => string)()).toBe('-');
    expect((vm['gapMagnitude'] as () => number)()).toBe(40);
    expect((vm['gapColor'] as () => string)()).toBe('#f85149');
  });

  it('shows warn color when gap is within 10% of topAvg', () => {
    const vm = mount(row({ playerPct: 92, topAvg: 100 }));
    expect((vm['gapColor'] as () => string)()).toBe('#d29922');
  });

  it('shows good color for defensives when player took less damage (gap < 0)', () => {
    const vm = mount(row({ playerPct: 60, topAvg: 100 }), { higherIsBetter: false });
    expect((vm['gapColor'] as () => string)()).toBe('#3fb950');
  });

  it('shows bad color for defensives when player took more damage', () => {
    const vm = mount(row({ playerPct: 150, topAvg: 100 }), { higherIsBetter: false });
    expect((vm['gapColor'] as () => string)()).toBe('#f85149');
  });

  it('returns muted color when topAvg is null', () => {
    const vm = mount(row({ playerPct: 100, topAvg: null }));
    expect((vm['gapColor'] as () => string)()).toBe('var(--muted)');
  });
});

describe('CompactAbilityRowComponent casts badge', () => {
  it('shows good color when player casts meet top casts', () => {
    const vm = mount(row({ playerCasts: 3, topCasts: 3 }));
    expect((vm['castsColor'] as () => string)()).toBe('#3fb950');
  });

  it('shows good color when player casts exceed top casts', () => {
    const vm = mount(row({ playerCasts: 4, topCasts: 3 }));
    expect((vm['castsColor'] as () => string)()).toBe('#3fb950');
  });

  it('shows warn color when player is within 1 cast of top', () => {
    const vm = mount(row({ playerCasts: 2, topCasts: 3 }));
    expect((vm['castsColor'] as () => string)()).toBe('#d29922');
  });

  it('shows bad color when player is 2+ casts below top', () => {
    const vm = mount(row({ playerCasts: 1, topCasts: 3 }));
    expect((vm['castsColor'] as () => string)()).toBe('#f85149');
  });

  it('shows muted color when topCasts is null', () => {
    const vm = mount(row({ playerCasts: 2, topCasts: null }));
    expect((vm['castsColor'] as () => string)()).toBe('var(--muted)');
  });
});

describe('CompactAbilityRowComponent grid layout', () => {
  it('uses 3-column layout by default (no casts, with gap)', () => {
    const vm = mount(row({}), { showCasts: false });
    expect((vm['gridCols'] as () => string)()).toBe('grid-cols-[1fr_6rem_6rem]');
  });

  it('uses 4-column layout when showCasts is true', () => {
    const vm = mount(row({}), { showCasts: true });
    expect((vm['gridCols'] as () => string)()).toBe('grid-cols-[1fr_5rem_6rem_6rem]');
  });

  it('uses 2-column layout when hidePlayer is true', () => {
    const vm = mount(row({}), { hidePlayer: true });
    expect((vm['gridCols'] as () => string)()).toBe('grid-cols-[1fr_6rem]');
  });
});
