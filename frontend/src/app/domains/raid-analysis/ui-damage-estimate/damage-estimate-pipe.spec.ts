import { describe, it, expect } from 'vitest';
import { DamageEstimatePipe } from './damage-estimate-pipe';

const pipe = new DamageEstimatePipe();

describe('DamageEstimatePipe', () => {
  it('prints the estimate with its range in whole seconds', () => {
    expect(pipe.transform({ aboutS: 24.6, lowS: 18.2, highS: 31.4 })).toBe('About 25s of your damage, between 18s and 31s.');
  });

  it('drops the range where its ends round alike', () => {
    expect(pipe.transform({ aboutS: 30, lowS: 29.8, highS: 30.2 })).toBe('About 30s of your damage.');
  });

  it('prints nothing without an estimate', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
