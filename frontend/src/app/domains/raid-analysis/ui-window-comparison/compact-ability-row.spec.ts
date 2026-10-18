import { describe, it, expect } from 'vitest';
import { CompactAbilityRow } from './compact-ability-row';
import type { RangeRow } from '../data/analysis/window-comparison.models';
import { statusColor, mountDom } from '../../../../testing/component-harness';
import { SHADOW_BLADES } from '../../../../testing/spell-ids';

function row(overrides: Partial<RangeRow>): RangeRow {
  return { label: 'Test', icon: '', playerPct: null, topAvg: null, topMin: null, topMax: null, ...overrides };
}

const GAP = 'span[class*="md:col-start-4"]';
const CASTS = 'span[class*="md:col-start-2"]';

function render(r: RangeRow, extra: Record<string, unknown> = {}) {
  const dom = mountDom(CompactAbilityRow, { row: r, ...extra });
  return {
    dom,
    gap: dom.query(GAP),
    casts: dom.query(CASTS),
  };
}

const clean = (el: HTMLElement | null): string => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
const appearance = (el: HTMLElement | null): string | undefined => el?.dataset['appearance'];

describe('CompactAbilityRow gap', () => {
  it('shows a positive gap with a + sign when the player exceeds top avg', () => {
    expect(clean(render(row({ playerPct: 150, topAvg: 100 })).gap)).toBe('+50');
  });

  it('shows a negative gap with a - sign when the player falls short', () => {
    expect(clean(render(row({ playerPct: 60, topAvg: 100 })).gap)).toBe('-40');
  });

  it('reads "Not used" rather than a number for an ability the player never used', () => {
    expect(clean(render(row({ playerPct: null, topAvg: 100 })).gap)).toBe('Not used');
  });

  it('renders no player cell at all when the player column is hidden', () => {
    const { gap } = render(row({ playerPct: 150, topAvg: 100 }), { hidePlayer: true });
    expect(gap).toBeNull();
  });
});

describe('CompactAbilityRow casts badge', () => {
  it('shows the player and top counts', () => {
    expect(clean(render(row({ playerCasts: 3, topCasts: 3 })).casts)).toBe('3 / 3');
  });

  it('shows a dash for top when top casts are unknown', () => {
    expect(clean(render(row({ playerCasts: 2, topCasts: null })).casts)).toBe('2 / -');
  });

  it('reads "Passive" instead of a count for an ability that is never cast', () => {
    expect(clean(render(row({ passive: true, playerCasts: 0, topCasts: 0 })).casts)).toBe('Passive');
  });

  it('shows a count, not the passive tag, for an ordinary cast row', () => {
    expect(clean(render(row({ playerCasts: 2, topCasts: 3 })).casts)).toBe('2 / 3');
  });

  it('renders no casts cell when the casts column is turned off', () => {
    expect(render(row({ playerCasts: 2, topCasts: 3 }), { showCasts: false }).casts).toBeNull();
  });
});

describe('CompactAbilityRow label', () => {
  it('spells out the top-average label the narrow layout puts in front of the value', () => {
    expect(render(row({ topAvg: 100 })).dom.text()).toContain('Top raiders average');
  });

  it('names the ability whether or not the row carries a spell id', () => {
    const LABEL = 'Shadow Blades';
    expect(render(row({ label: LABEL, spellId: SHADOW_BLADES })).dom.text()).toContain(LABEL);
    expect(render(row({ label: LABEL })).dom.text()).toContain(LABEL);
  });
});

describe('CompactAbilityRow color', () => {
  it('prints the gap and the casts with no color, since no rule grades one ability', () => {
    const { gap, casts } = render(row({ playerPct: 60, topAvg: 100, playerCasts: 0, topCasts: 3 }));

    expect(statusColor(gap)).toBeNull();
    expect(appearance(casts)).toBe('neutral');
  });
});
