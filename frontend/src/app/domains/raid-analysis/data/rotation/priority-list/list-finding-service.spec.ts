import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { BACKSTAB, EVISCERATE, SHADOW_DANCE } from '../../../../../../testing/spell-ids';
import type { ButtonBench, RotationBench } from '../rotation-data-source';
import { bench } from '../rotation-harness';
import type { CastCheck, CastVerdict, LogReading, OrderCheck, TermReading } from './list-check-service';
import { ListFindingService } from './list-finding-service';
import { priorityList } from './priority-list-harness';
import type { Truth } from './priority-list.models';

/** Mirrors the strip cap in list-finding-service.ts. */
const MAX_OCCURRENCES = 24;
/** Three right casts of four. */
const THREE_QUARTERS = 0.75;
/** Two right casts of three moments, the third a skip when due. */
const TWO_THIRDS = 0.667;
const FIELD = { lo: 0.8, avg: 0.9, hi: 1 };
const list = priorityList({
  lines: [{ action: 'eviscerate', terms: ['combo_points>=5'] }, { action: 'backstab', terms: [] }],
  spells: {
    eviscerate: planSpell('Eviscerate', [EVISCERATE]),
    backstab: planSpell('Backstab', [BACKSTAB]),
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE]),
  },
});
const findings = TestBed.inject(ListFindingService);

const button = (over: Partial<ButtonBench> = {}): ButtonBench => ({
  action: 'eviscerate', spell_id: EVISCERATE, right: FIELD,
  ...over,
});
const withButtons = (buttons: ButtonBench[] = [button()], over: Partial<RotationBench> = {}): RotationBench => bench({
  list, buttons, ability_icons: { [EVISCERATE]: { icon: 'evis', name: 'Eviscerate' } }, ...over,
});
const cast = (verdict: CastVerdict, atS: number, cp = 5): CastCheck => ({
  atS, verdict, line: 0,
  lines: [{ truth: verdict === 'on' ? 'true' : verdict === 'off' ? 'false' : 'unknown', terms: [{ truth: cp >= 5 ? 'true' : 'false', value: [cp, cp] }] }],
});
const skipped = (atS: number): OrderCheck => ({ atS, expected: 'eviscerate', pressed: 'backstab', line: 0, terms: [{ truth: 'true', value: [5, 5] }] });
const reading = (casts: CastCheck[], order: OrderCheck[] = [], backstabs: CastCheck[] = []): LogReading => ({
  casts: new Map([['eviscerate', casts], ['backstab', backstabs]]), order,
  ids: new Map([['eviscerate', EVISCERATE]]),
});
const quarterOff = [cast('off', 10, 3), cast('on', 20), cast('on', 30), cast('on', 40)];
const rowOf = (judged: LogReading, benched = withButtons()) => findings.rows(benched, judged)[0];

describe('ListFindingService rows', () => {
  it('reads your share of the button\'s moments right beside the top logs\' range', () => {
    expect(rowOf(reading(quarterOff))).toMatchObject({ name: 'Eviscerate', spellId: EVISCERATE, icon: 'evis', you: THREE_QUARTERS, top: FIELD });
  });

  it('counts a skip when due as a miss, and lists it among the casts in time order', () => {
    const row = rowOf(reading([cast('on', 20), cast('on', 40)], [skipped(30)]));
    expect(row?.you).toBe(TWO_THIRDS);
    expect(row?.occurrences.map(occ => [occ.atS, occ.ok])).toEqual([[20, true], [30, false], [40, true]]);
    expect(row?.occurrences[1]).toMatchObject({ detail: 'Skipped when due. You pressed Backstab instead.', checks: [{ text: 'At 5+ combo points', truth: 'true', value: '5 combo points' }] });
  });

  it('marks each cast right, wrong or not judged, its chip showing the time and its line read term by term', () => {
    const row = rowOf(reading([...quarterOff, cast('unjudged', 50)]));
    expect(row?.occurrences.map(occ => [occ.ok, occ.unjudged ?? false, occ.label])).toEqual([
      [false, false, undefined], [true, false, undefined], [true, false, undefined], [true, false, undefined], [false, true, undefined],
    ]);
    expect(row?.occurrences[0]?.checks).toEqual([{ text: 'At 5+ combo points', truth: 'false', value: '3 combo points' }]);
  });

  it('leaves the casts the log could not settle out of your share, and reads no share where it settled none', () => {
    expect(rowOf(reading([cast('unjudged', 10), cast('on', 20)]))?.you).toBe(1);
    expect(rowOf(reading([cast('unjudged', 10)]))?.you).toBeNull();
  });

  it('shows no row for a button the pull never pressed and never had due', () => {
    expect(findings.rows(withButtons(), reading([]))).toEqual([]);
  });

  it('leads with the button furthest under the top raiders\' average', () => {
    const benched = withButtons([button(), button({ action: 'backstab', spell_id: BACKSTAB })]);
    const rows = findings.rows(benched, reading([cast('on', 10)], [], [{ ...cast('on', 20), verdict: 'off' }]));
    expect(rows.map(row => row.name)).toEqual(['Backstab', 'Eviscerate']);
  });

  it('thins a long strip to the same mix of right and wrong moments', () => {
    const halfOff = Array.from({ length: 60 }, (_, at) => cast(at % 2 ? 'on' : 'off', at, at % 2 ? 5 : 3));
    const occurrences = rowOf(reading(halfOff))?.occurrences ?? [];
    expect(occurrences).toHaveLength(MAX_OCCURRENCES);
    expect(occurrences.filter(occ => !occ.ok)).toHaveLength(MAX_OCCURRENCES / 2);
  });

  it('keeps a lone miss when thinning a strip whose share of misses rounds to none', () => {
    // One miss in 61 moments is under half a chip of 24.
    const oneOff = [cast('off', 1, 3), ...Array.from({ length: 60 }, (_, at) => cast('on', at + 2))];
    expect(rowOf(reading(oneOff))?.occurrences.filter(occ => !occ.ok)).toHaveLength(1);
  });
});

describe('ListFindingService condition groups', () => {
  const grouped = priorityList({ ...list, lines: [{ action: 'eviscerate', terms: ['combo_points>=5|buff.shadow_dance.up'] }] });
  const term = (truth: Truth, value: [number, number]): TermReading => ({ truth, value });
  const offCast: CastCheck = {
    atS: 10, verdict: 'off', line: 0,
    lines: [{ truth: 'false', terms: [{ truth: 'false', value: null, parts: [term('false', [3, 3]), term('false', [0, 0])] }] }],
  };

  it('reads an either-or term operand by operand, each with its own value', () => {
    const row = rowOf(reading([offCast]), withButtons([button()], { list: grouped }));
    expect(row?.occurrences[0]?.checks).toEqual([{
      text: 'Either at 5+ combo points or while Shadow Dance is up', truth: 'false', value: '',
      group: {
        any: true,
        checks: [
          { text: 'At 5+ combo points', truth: 'false', value: '3 combo points' },
          { text: 'While Shadow Dance is up', truth: 'false', value: 'no' },
        ],
      },
    }]);
  });
});
