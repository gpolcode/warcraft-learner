import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { BACKSTAB, EVISCERATE } from '../../../../../../testing/spell-ids';
import type { ButtonBench, RotationBench } from '../rotation-data-source';
import { bench } from '../rotation-harness';
import type { CastCheck, CastVerdict, LogReading, OrderCheck } from './list-check-service';
import { ListFindingService } from './list-finding-service';
import { priorityList } from './priority-list-harness';
import type { Truth } from './priority-list.models';

/** One off-list cast in four sits a quarter above zero. */
const QUARTER = 0.25;
const list = priorityList({
  lines: [{ action: 'eviscerate', terms: ['combo_points>=5'] }],
  spells: { eviscerate: planSpell('Eviscerate', [EVISCERATE]), backstab: planSpell('Backstab', [BACKSTAB]) },
});
const findings = TestBed.inject(ListFindingService);

const button = (over: Partial<ButtonBench> = {}): ButtonBench => ({
  action: 'eviscerate', spell_id: EVISCERATE, off_tolerance: 0, skip_tolerance: null,
  allowed: [1],
  ...over,
});
const withButton = (over: Partial<ButtonBench> = {}): RotationBench => bench({
  list, buttons: [button(over)], ability_icons: { [EVISCERATE]: { icon: 'evis', name: 'Eviscerate' } },
});
const cast = (verdict: CastVerdict, atS: number, cp = 5): CastCheck => ({
  atS, verdict, line: 0,
  lines: [{ truth: verdict === 'on' ? 'true' : verdict === 'off' ? 'false' : 'unknown', terms: [{ truth: cp >= 5 ? 'true' : 'false', value: [cp, cp] }] }],
});
const decision = (pressed: string, atS: number): OrderCheck => ({ atS, expected: 'eviscerate', pressed, line: 0, terms: [{ truth: 'true', value: [5, 5] }] });
const reading = (casts: CastCheck[], order: OrderCheck[] = []): LogReading => ({
  casts: new Map([['eviscerate', casts]]), order, builds: new Map([['eviscerate', ['true']]]), ids: new Map([['eviscerate', EVISCERATE]]),
});
const quarterOff = [cast('off', 10, 3), cast('on', 20), cast('on', 30), cast('on', 40)];

describe('ListFindingService casts at the wrong time', () => {
  it('flags a button pressed off its lines more often than the top logs allow', () => {
    const [row] = findings.judge(withButton(), reading(quarterOff)).rows;
    expect(row).toMatchObject({
      chip: 'Wrong time', what: 'Eviscerate at under 5 combo points',
      measured: { value: '1 / 4', unit: 'casts at the wrong time' },
      fix: 'Press Eviscerate at 5+ combo points.',
      occurrenceTarget: 'Top raiders never press it at the wrong time.',
    });
  });

  it('leaves a button on plan when it strays exactly as often as the tolerance', () => {
    const judged = findings.judge(withButton({ off_tolerance: QUARTER }), reading(quarterOff));
    expect(judged.rows).toEqual([]);
    expect(judged.onPlan).toEqual([{ name: 'Eviscerate', spellId: EVISCERATE, icon: 'evis' }]);
  });

  it('judges neither way a button the bench carries no band for, or one whose casts the log could not settle', () => {
    expect(findings.judge(withButton({ off_tolerance: null }), reading(quarterOff))).toEqual({ rows: [], onPlan: [] });
    expect(findings.judge(withButton(), reading([cast('unjudged', 10)]))).toEqual({ rows: [], onPlan: [] });
  });

  it('marks each cast on, off, or not judged, labelled with the value that decided it and the line read term by term', () => {
    const [row] = findings.judge(withButton(), reading([...quarterOff, cast('unjudged', 50)])).rows;
    expect(row?.occurrences.map(occ => [occ.ok, occ.unjudged ?? false, occ.label])).toEqual([
      [false, false, '3'], [true, false, '5'], [true, false, '5'], [true, false, '5'], [false, true, '-'],
    ]);
    expect(row?.occurrences[0]?.checks).toEqual([{ text: 'At 5+ combo points', truth: 'false', value: '3 combo points' }]);
  });

  it('splits no casts for a button with a single line', () => {
    expect(findings.judge(withButton(), reading(quarterOff)).rows[0]?.lines).toEqual([]);
  });

  it('thins a long strip without dropping a cast at the wrong time', () => {
    const many = [cast('off', 1, 3), ...Array.from({ length: 40 }, (_, at) => cast('on', at + 2))];
    const [row] = findings.judge(withButton(), reading(many)).rows;
    expect(row?.occurrences.length).toBeLessThanOrEqual(24);
    expect(row?.occurrences.some(occ => !occ.ok)).toBe(true);
  });
});

describe('ListFindingService split', () => {
  const DEATHSTALKERS_MARK = 1;
  const builds = priorityList({
    lines: [
      { action: 'eviscerate', terms: ['combo_points>=5'] },
      { action: 'eviscerate', terms: ['talent.deathstalkers_mark', 'combo_points>=4'] },
      { action: 'eviscerate', terms: ['!talent.deathstalkers_mark', 'combo_points>=3'] },
    ],
    spells: { eviscerate: planSpell('Eviscerate', [EVISCERATE]) },
    talents: { 'talent.deathstalkers_mark': { name: "Deathstalker's Mark", entries: [DEATHSTALKERS_MARK] } },
  });
  const onLine = (line: number, atS: number): CastCheck => ({ ...cast('on', atS), line });
  const judged = (picked: Truth[]) => findings.judge(
    bench({ list: builds, buttons: [button({ allowed: [0.5, 0.5, 0] })], ability_icons: {} }),
    { ...reading([cast('off', 10, 3), onLine(0, 20), onLine(0, 30), onLine(1, 40)]), builds: new Map([['eviscerate', picked]]) },
  ).rows[0]?.lines;

  it('splits the on-time casts over the lines the player\'s build can press, beside the top logs\' split', () => {
    expect(judged(['true', 'true', 'false'])).toEqual([
      { text: 'At 5+ combo points', you: 0.667, top: 0.5 },
      { text: 'At 4+ combo points', you: 0.333, top: 0.5 },
    ]);
  });

  it('splits nothing once the player\'s build can press only one of the lines', () => {
    expect(judged(['true', 'false', 'false'])).toEqual([]);
  });

  it('names a line\'s talent where the log shows no talents to settle the build', () => {
    expect(judged(['true', 'unknown', 'false'])?.[1]?.text).toBe("With Deathstalker's Mark: at 4+ combo points");
  });
});

describe('ListFindingService order', () => {
  const ordered = (tolerance: number) => withButton({ off_tolerance: null, skip_tolerance: tolerance });
  const quarterSkipped = [decision('backstab', 10), decision('eviscerate', 20), decision('eviscerate', 30), decision('eviscerate', 40)];

  it('flags a button skipped when due more often than the top logs allow', () => {
    const [row] = findings.judge(ordered(0), reading([], quarterSkipped)).rows;
    expect(row).toMatchObject({
      chip: 'Skipped', what: 'Eviscerate skipped when due', measured: { value: '1 / 4', unit: 'times skipped' },
      fix: 'Press Eviscerate first at 5+ combo points.',
    });
    expect(row?.occurrences[0]).toMatchObject({ ok: false, label: 'skipped', detail: 'It was due, and you pressed Backstab instead.' });
  });

  it('leaves the order on plan at exactly the tolerance', () => {
    expect(findings.judge(ordered(QUARTER), reading([], quarterSkipped)).rows).toEqual([]);
  });
});
