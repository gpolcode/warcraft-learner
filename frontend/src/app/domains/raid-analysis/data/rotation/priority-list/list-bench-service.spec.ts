import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EVISCERATE } from '../../../../../../testing/spell-ids';
import type { CastCheck, CastVerdict, LogReading, MissCheck, TermReading } from './list-check-service';
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
const cast = (verdict: CastVerdict, line = 0, cp = 5): CastCheck => ({
  atS: 1, verdict, line,
  lines: [{ truth: cp >= 5 ? 'true' : 'false', terms: [term(cp >= 5 ? 'true' : 'false', [cp, cp])] }, { truth: 'false', terms: [term('false', [0, 0])] }],
});
const idle: MissCheck = { atS: 1, action: 'eviscerate', kind: 'idle', line: 0, terms: [] };
const log = (casts: CastCheck[], opts: { missed?: MissCheck[]; id?: number } = {}): LogReading => ({
  casts: new Map([['eviscerate', casts]]),
  missed: opts.missed ?? [],
  ids: new Map([['eviscerate', opts.id ?? EVISCERATE]]),
});
const field = (count: number, casts: CastCheck[], opts = {}): LogReading[] => Array.from({ length: count }, () => log(casts, opts));
const benchOf = (readings: LogReading[]) => benches.bench(list, readings)[0];

/** Three right casts of four settled ones. */
const THREE_QUARTERS = 0.75;
/** Four right casts of five moments, the fifth missed while idle. */
const FOUR_FIFTHS = 0.8;

describe('ListBenchService', () => {
  const clean = [cast('on'), cast('on'), cast('on'), cast('on')];
  const quarterOff = [cast('off', 0, 3), cast('on'), cast('on'), cast('on')];

  it('benches a button once enough top logs pressed it, and leaves it out below that', () => {
    expect(benchOf(field(MIN_MEASURED_PARSES, clean))?.right).toEqual({ lo: 1, avg: 1, hi: 1 });
    expect(benchOf(field(MIN_MEASURED_PARSES - 1, clean))).toBeUndefined();
  });

  it('spans the top logs from the one that got the button right least often to the one that did most', () => {
    // Four logs never stray and one strays on a quarter of its casts, so the average sits a twentieth under the top.
    const readings = [...field(MIN_MEASURED_PARSES - 1, clean), log(quarterOff)];
    expect(benchOf(readings)?.right).toEqual({ lo: 0.75, avg: 0.95, hi: 1 });
  });

  it('leaves out a button the field gets wrong three times in ten, since the list does not describe how it is played', () => {
    const sevenOfTen = [...Array.from({ length: 3 }, () => cast('off', 0, 3)), ...Array.from({ length: 7 }, () => cast('on'))];
    expect(benchOf(field(MIN_MEASURED_PARSES, sevenOfTen))).toBeUndefined();
  });

  it('benches a button the field gets right three times in four', () => {
    expect(benchOf(field(MIN_MEASURED_PARSES, quarterOff))?.right.avg).toBe(THREE_QUARTERS);
  });

  it('leaves the casts the logs could not settle out of the share', () => {
    expect(benchOf(field(MIN_MEASURED_PARSES, [cast('unjudged'), ...quarterOff]))?.right.avg).toBe(THREE_QUARTERS);
  });

  it('counts a moment the button was due and nothing was pressed against it', () => {
    const readings = field(MIN_MEASURED_PARSES, clean, { missed: [idle] });
    expect(benchOf(readings)?.right.avg).toBe(FOUR_FIFTHS);
  });

  it('counts each log\'s right presses over its moments, a miss while idle being a moment it got wrong', () => {
    const RIGHT = 4;
    const MOMENTS = 5;
    const counts = benches.counts(list, [log(clean, { missed: [idle] })]);
    expect(counts).toEqual([{ eviscerate: { right: RIGHT, moments: MOMENTS, unjudged: 0 } }]);
  });

  it('leaves out of a log\'s counts a button it had no moment for', () => {
    expect(benches.counts(list, [log([cast('unjudged')])])).toEqual([{}]);
  });

  it('benches the trinket a log\'s trinket line resolved to, under its use spell', () => {
    const TRINKET = 'item_219314';
    const resolved = (): LogReading => ({ casts: new Map([[TRINKET, clean]]), missed: [], ids: new Map([[TRINKET, EVISCERATE]]), buttons: new Map([[TRINKET, []]]) });
    const trinketList = priorityList({ lines: [{ action: 'use_item', terms: [], item: 'trinket1' }] });
    expect(benches.bench(trinketList, Array.from({ length: MIN_MEASURED_PARSES }, resolved)).map(button => button.action)).toEqual([TRINKET]);
  });

  it('names the button\'s icon by the id most top logs cast it under', () => {
    const readings = [...field(3, clean, { id: EVISCERATE_HERO }), ...field(2, clean)];
    expect(benchOf(readings)?.spell_id).toBe(EVISCERATE_HERO);
  });
});
