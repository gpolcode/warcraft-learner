import { describe, it, expect } from 'vitest';
import { formatAge, formatSpecReport, parseIngestedAt, SELECTED_MARKER, type SpecReportRow } from './spec-report';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const NOW = Date.parse('2026-08-15T12:00:00.000Z');

const row = (over: Partial<SpecReportRow> & { spec: string }): SpecReportRow => ({
  version: 23,
  ingestedAtMs: NOW - 3 * DAY,
  selected: false,
  ...over,
});

describe('parseIngestedAt', () => {
  it('parses an ISO stamp to epoch milliseconds', () => {
    expect(parseIngestedAt('2026-08-15T12:00:00.000Z')).toBe(NOW);
  });

  it('reports null for an absent stamp', () => {
    expect(parseIngestedAt(null)).toBeNull();
    expect(parseIngestedAt(undefined)).toBeNull();
    expect(parseIngestedAt('')).toBeNull();
  });

  it('reports null for an unparseable stamp instead of NaN', () => {
    expect(parseIngestedAt('last tuesday')).toBeNull();
  });
});

describe('formatAge', () => {
  it('reports whole days once a day has passed', () => {
    expect(formatAge(3 * DAY)).toBe('3d');
    expect(formatAge(3 * DAY + 23 * HOUR)).toBe('3d');
  });

  it('reports hours below a day', () => {
    expect(formatAge(2 * HOUR)).toBe('2h');
    expect(formatAge(DAY - 1)).toBe('23h');
  });

  it('reports minutes below an hour', () => {
    expect(formatAge(5 * MINUTE)).toBe('5m');
    expect(formatAge(HOUR - 1)).toBe('59m');
  });

  it('reports seconds below a minute', () => {
    expect(formatAge(0)).toBe('0s');
    expect(formatAge(MINUTE - 1)).toBe('59s');
  });

  it('switches unit exactly at the boundary, not before it', () => {
    expect(formatAge(MINUTE)).toBe('1m');
    expect(formatAge(HOUR)).toBe('1h');
    expect(formatAge(DAY)).toBe('1d');
  });

  it('clamps a stamp ahead of the clock to zero rather than reporting a negative age', () => {
    expect(formatAge(-5 * HOUR)).toBe('0s');
  });
});

describe('formatSpecReport', () => {
  it('marks the specs this run ingests and leaves the deferred ones unmarked', () => {
    const lines = formatSpecReport(
      [row({ spec: 'ArmsWarrior', selected: true }), row({ spec: 'BalanceDruid' })],
      NOW,
    ).split('\n');
    expect(lines[0]?.startsWith(`${SELECTED_MARKER} ArmsWarrior`)).toBe(true);
    expect(lines[1]?.startsWith('  BalanceDruid')).toBe(true);
  });

  it('reports every row in the given order, deferred ones included', () => {
    const specs = ['ArmsWarrior', 'BalanceDruid', 'HolyPaladin'];
    const report = formatSpecReport(specs.map(spec => row({ spec })), NOW);
    expect(report.split('\n')).toHaveLength(specs.length);
    expect(specs.every(spec => report.includes(spec))).toBe(true);
  });

  it('puts the version and the age next to each other', () => {
    const report = formatSpecReport([row({ spec: 'ArmsWarrior', version: 23, ingestedAtMs: NOW - 2 * HOUR })], NOW);
    expect(report).toBe('  ArmsWarrior  v23  2h');
  });

  it('pads to one column width so a long spec name does not skew the others', () => {
    const report = formatSpecReport(
      [
        row({ spec: 'AugmentationEvoker', version: 9, ingestedAtMs: NOW - DAY }),
        row({ spec: 'FuryWarrior', version: 23, ingestedAtMs: NOW - HOUR }),
      ],
      NOW,
    );
    const [first, second] = report.split('\n');
    expect(first).toBe('  AugmentationEvoker  v9   1d');
    expect(second).toBe('  FuryWarrior         v23  1h');
  });

  it('reports an unknown version and an unknown age for a spec with no stamped data', () => {
    expect(formatSpecReport([row({ spec: 'ArmsWarrior', version: null, ingestedAtMs: null })], NOW))
      .toBe('  ArmsWarrior  v?  ?');
  });

  it('returns an empty report for no specs', () => {
    expect(formatSpecReport([], NOW)).toBe('');
  });
});
