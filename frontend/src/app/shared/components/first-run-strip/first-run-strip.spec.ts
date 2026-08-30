import { describe, it, expect } from 'vitest';
import { mountVm } from '../../../../testing/component-harness';
import { FirstRunStrip } from './first-run-strip';

interface StripCopy {
  headline: string;
  intro: string;
  steps: readonly { icon: string; label: string; detail: string }[];
}

const copyOf = (variant: string): StripCopy =>
  (mountVm(FirstRunStrip, { variant }).vm['copy'] as () => StripCopy)();

const STEP_COUNT = 3;

describe('FirstRunStrip', () => {
  it('walks the post-raid flow from the paste to the fix', () => {
    const copy = copyOf('post');

    expect(copy.headline).toBe('What pasting a report gets you');
    expect(copy.steps).toHaveLength(STEP_COUNT);
    expect(copy.steps[0]?.detail).toContain('Mythic raid pulls only');
    expect(copy.steps[1]?.detail).toContain('top 10 logs');
  });

  it('walks the pre-fight flow from the dropdowns to the plan', () => {
    const copy = copyOf('pre');

    expect(copy.headline).toBe('What the pre-fight plan gives you');
    expect(copy.steps).toHaveLength(STEP_COUNT);
    expect(copy.intro).toContain('No log of your own needed');
    expect(copy.steps[2]?.detail).toContain('Cooldowns, defensives, gear and positioning');
  });
});
