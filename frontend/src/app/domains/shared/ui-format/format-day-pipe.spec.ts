import { describe, it, expect } from 'vitest';
import { FormatDayPipe } from './format-day-pipe';

const pipe = new FormatDayPipe();

// Noon UTC, so every time zone reads the same day.
const NOON_18_OCT_2026_S = 1_792_324_800;

describe('FormatDayPipe', () => {
  it('reads epoch seconds as the day, the short month and the year', () => {
    expect(pipe.transform(NOON_18_OCT_2026_S)).toBe('18 Oct 2026');
  });

  it('renders nothing for a missing time', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
