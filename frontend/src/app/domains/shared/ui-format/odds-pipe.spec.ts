import { describe, it, expect } from 'vitest';
import { OddsPipe } from './odds-pipe';

const odds = new OddsPipe();

describe('OddsPipe', () => {
  it('reads a rate as one in the nearest whole count', () => {
    const ONE_IN_63 = 1 / 63;
    expect(odds.transform(ONE_IN_63)).toBe('1 in 63');
  });

  it('reads a zero rate as none', () => {
    expect(odds.transform(0)).toBe('none');
  });

  it('reads a rate of every test as 1 in 1', () => {
    expect(odds.transform(1)).toBe('1 in 1');
  });

  it('prints nothing for a missing rate', () => {
    expect(odds.transform(null)).toBe('');
  });
});
