import { describe, it, expect } from 'vitest';
import { FormatMultiplePipe } from './format-multiple-pipe';

const pipe = new FormatMultiplePipe();

describe('FormatMultiplePipe', () => {
  it('prints a ratio with one decimal and an x', () => {
    expect(pipe.transform(1.64)).toBe('1.6x');
  });

  it('keeps the decimal on a whole ratio', () => {
    expect(pipe.transform(2)).toBe('2.0x');
  });

  it('prints nothing for a missing or non-finite value', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(Number.NaN)).toBe('');
  });
});
