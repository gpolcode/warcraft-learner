import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EVISCERATE } from '../../../../../../testing/spell-ids';
import type { CastCheck, CastVerdict, LogReading, OrderCheck, TermReading } from './list-check-service';
import { ListBenchService, MIN_MEASURED_PARSES } from './list-bench-service';
import { priorityList } from './priority-list-harness';
import type { Truth } from './priority-list.models';

const EVISCERATE_HERO = 1269205;
const list = priorityList({
  lines: [
    { action: 'eviscerate', terms: ['combo_points>=5'] },
    { action: 'eviscerate', terms: ['buff.darkest_night.up'] },
  ],
});
const benches = TestBed.inject(ListBenchService);

const term = (truth: Truth, value: [number, number] | null = null): TermReading => ({ truth, value });
/** A cast read against both Eviscerate lines: the first measures combo points, the second is a flag. */
const cast = (verdict: CastVerdict, line = 0, cp = 5): CastCheck => ({
  atS: 1, verdict, line,
  lines: [{ truth: cp >= 5 ? 'true' : 'false', terms: [term(cp >= 5 ? 'true' : 'false', [cp, cp])] }, { truth: 'false', terms: [term('false', [0, 0])] }],
});
const decision = (pressed: string): OrderCheck => ({ atS: 1, expected: 'eviscerate', pressed, line: 0, terms: [] });
const log = (casts: CastCheck[], opts: { order?: OrderCheck[]; id?: number } = {}): LogReading => ({
  casts: new Map([['eviscerate', casts]]),
  order: opts.order ?? [],
  builds: new Map([['eviscerate', ['true', 'true']]]),
  ids: new Map([['eviscerate', opts.id ?? EVISCERATE]]),
});
const field = (count: number, casts: CastCheck[], opts = {}): LogReading[] => Array.from({ length: count }, () => log(casts, opts));
const benchOf = (readings: LogReading[]) => benches.bench(list, readings)[0];

describe('ListBenchService', () => {
  const clean = [cast('on'), cast('on'), cast('on'), cast('on')];

  it('benches a button once enough top logs pressed it, and leaves it out below that', () => {
    expect(benchOf(field(MIN_MEASURED_PARSES, clean))?.off_tolerance).toBe(0);
    expect(benchOf(field(MIN_MEASURED_PARSES - 1, clean))).toBeUndefined();
  });

  it('sets the tolerance at the share all but the sloppiest top log stays under', () => {
    // Four logs never stray and one strays on a quarter of its casts: the 90th percentile sits between them.
    const readings = [...field(MIN_MEASURED_PARSES - 1, clean), log([cast('off', 0, 3), cast('on'), cast('on'), cast('on')])];
    expect(benchOf(readings)?.off_tolerance).toBe(0.15);
  });

  it('judges no casts of a button the field strays from at least half the time, since the list does not describe how it is played', () => {
    const half = [cast('off', 0, 3), cast('on')];
    expect(benchOf(field(MIN_MEASURED_PARSES, half))?.off_tolerance ?? null).toBeNull();
  });

  it('leaves the casts the logs could not settle out of the share', () => {
    expect(benchOf(field(MIN_MEASURED_PARSES, [cast('unjudged'), cast('off', 0, 3), ...clean.slice(2)]))?.off_tolerance).toBe(0.333);
  });

  it('shares the on-list casts out over the lines that allowed them', () => {
    const readings = field(MIN_MEASURED_PARSES, [cast('on', 0), cast('on', 0), cast('on', 0), cast('on', 1)]);
    expect(benchOf(readings)?.lines.map(line => line.allowed)).toEqual([0.75, 0.25]);
  });

  it('keeps the spread of what each term measured, from the 10th to the 90th percentile', () => {
    const readings = field(MIN_MEASURED_PARSES, [cast('off', 0, 3), cast('on', 0, 5), cast('on', 0, 6), cast('on', 0, 7)]);
    expect(benchOf(readings)?.lines[0]?.spreads).toEqual([[3, 7]]);
  });

  it('keeps no spread for a flag', () => {
    expect(benchOf(field(MIN_MEASURED_PARSES, clean))?.lines[1]?.spreads).toEqual([null]);
  });

  it('benches the order once enough top logs met a moment the list settled for the button', () => {
    const readings = field(MIN_MEASURED_PARSES, clean, { order: [decision('eviscerate'), decision('eviscerate'), decision('eviscerate'), decision('backstab')] });
    expect(benchOf(readings)?.skip_tolerance).toBe(0.25);
  });

  it('names the button\'s icon by the id most top logs cast it under', () => {
    const readings = [...field(3, clean, { id: EVISCERATE_HERO }), ...field(2, clean)];
    expect(benchOf(readings)?.spell_id).toBe(EVISCERATE_HERO);
  });
});
