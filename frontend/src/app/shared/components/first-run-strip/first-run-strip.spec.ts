import { describe, it, expect } from 'vitest';
import { mountVm } from '../../../../testing/component-harness';
import { FirstRunStrip } from './first-run-strip';

const STEP_COUNT = 3;

describe('FirstRunStrip', () => {
  it('walks the pre-fight flow from the dropdowns to the plan', () => {
    const copy = mountVm(FirstRunStrip).vm['copy'];

    expect(copy.headline).toBe('What the pre-fight plan gives you');
    expect(copy.intro).toContain('No log of your own needed');
    expect(copy.steps).toHaveLength(STEP_COUNT);
    expect(copy.steps[2]?.detail).toContain('Cooldowns, defensives, gear and positioning');
  });
});
