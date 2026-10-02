import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { BACKSTAB, DARKEST_NIGHT, EVISCERATE, SHADOW_DANCE } from '../../../../../../testing/spell-ids';
import type { ConditionCheck } from '../../analysis/analysis.models';
import type { ButtonBench, RotationBench } from '../rotation-data-source';
import { bench } from '../rotation-harness';
import type { CastCheck, CastVerdict, LogReading, OrderCheck, TermReading } from './list-check-service';
import { ConditionEvalService } from './condition-eval-service';
import { ListFindingService } from './list-finding-service';
import { priorityList } from './priority-list-harness';
import type { Range, Truth } from './priority-list.models';
import type { PriorityList } from '../../plan/plan.models';

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
/** `right` casts on the list, then `wrong` off it, so the share is right over both. */
const share = (right: number, wrong: number): CastCheck[] => [
  ...Array.from({ length: right }, (_, at) => cast('on', at)),
  ...Array.from({ length: wrong }, (_, at) => cast('off', right + at, 3)),
];

describe('ListFindingService rows', () => {
  it('reads your share of the button\'s moments right beside the top logs\' range', () => {
    expect(rowOf(reading(quarterOff))).toMatchObject({ name: 'Eviscerate', spellId: EVISCERATE, icon: 'evis', you: THREE_QUARTERS, top: FIELD });
  });

  it('counts a skip when due as a miss, and lists it among the casts in time order', () => {
    const row = rowOf(reading([cast('on', 20), cast('on', 40)], [skipped(30)]));
    expect(row?.you).toBe(TWO_THIRDS);
    expect(row?.occurrences.map(occ => [occ.atS, occ.ok])).toEqual([[20, true], [30, false], [40, true]]);
    expect(row?.occurrences[1]).toMatchObject({ result: 'Skipped when due', detail: 'they all held, but you pressed Backstab instead.' });
    expect(row?.occurrences[1]?.checks).toEqual([{ text: 'At 5+ combo points', truth: 'true', value: '5 combo points', role: 'decisive' }]);
  });

  it('marks each cast right, wrong or not judged, its line read term by term', () => {
    const row = rowOf(reading([...quarterOff, cast('unjudged', 50)]));
    expect(row?.occurrences.map(occ => [occ.ok, occ.unjudged ?? false])).toEqual([[false, false], [true, false], [true, false], [true, false], [false, true]]);
    expect(row?.occurrences[0]?.checks).toEqual([{ text: 'At 5+ combo points', truth: 'false', value: '3 combo points', role: 'decisive' }]);
  });

  it('leaves the casts the log could not settle out of your share', () => {
    expect(rowOf(reading([cast('unjudged', 10), cast('on', 20)]))?.you).toBe(1);
  });

  it('shows no row for a button whose moments the log settled none of', () => {
    expect(findings.rows(withButtons(), reading([cast('unjudged', 10)]))).toEqual([]);
  });

  it('tones a row under every top log as bad, and one at the lowest top log as only under their average', () => {
    expect(rowOf(reading(share(3, 1)))?.status).toBe('bad');
    expect(rowOf(reading(share(4, 1)))?.status).toBe('warn');
  });

  it('tones a row under the top raiders\' average as a warning, and one at the average as good', () => {
    expect(rowOf(reading(share(8, 1)))?.status).toBe('warn');
    expect(rowOf(reading(share(9, 1)))?.status).toBe('good');
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

describe('ListFindingService cast reads', () => {
  it('explains a cast by the rule its conditions make, its result, and what they said at its moment', () => {
    const occurrences = rowOf(reading([cast('on', 10), cast('off', 20, 3), cast('unjudged', 30)]))?.occurrences ?? [];
    expect(occurrences.map(occ => occ.rule)).toEqual(Array(3).fill('Eviscerate is only right when these conditions hold.'));
    expect(occurrences.map(occ => [occ.result, occ.detail])).toEqual([
      ['Right time', 'they did.'],
      ['Wrong time', 'they did not. Wait for the conditions marked with a cross.'],
      ['Not judged', 'your log does not show all of them, so this cast is not judged.'],
    ]);
  });

  it('keeps the bare verdict for a cast whose line has no conditions to show', () => {
    const backstab = withButtons([button({ action: 'backstab', spell_id: BACKSTAB })]);
    const occurrence = findings.rows(backstab, reading([], [], [cast('on', 10)]))[0]?.occurrences[0];
    expect(occurrence).toEqual({ atS: 10, ok: true, detail: 'Right time.', checks: [] });
  });
});

describe('ListFindingService condition paths', () => {
  const logic = TestBed.inject(ConditionEvalService);
  const pathed = priorityList({
    ...list,
    lines: [{ action: 'eviscerate', terms: ['(buff.darkest_night.down&combo_points<5)|(buff.darkest_night.up&combo_points.deficit>0)', 'active_enemies>1'] }],
    spells: { ...list.spells, darkest_night: planSpell('Darkest Night', [DARKEST_NIGHT]) },
  });
  const read = (truth: Truth): TermReading => ({ truth, value: null });
  const both = (first: Truth, second: Truth): TermReading => ({ truth: logic.and(first, second), value: null, parts: [read(first), read(second)] });
  const moment = (down: [Truth, Truth], up: [Truth, Truth], enemies: Truth = 'true'): TermReading[] => {
    const options = [both(...down), both(...up)];
    return [{ truth: logic.or(...options.map(option => option.truth)), value: null, parts: options }, read(enemies)];
  };
  const pressed = (verdict: CastVerdict, terms: TermReading[], atS = 10): CastCheck => ({
    atS, verdict, line: 0, lines: [{ truth: logic.and(...terms.map(term => term.truth)), terms }],
  });
  /** A row shows only beside a moment the log settled. */
  const settled = pressed('on', moment(['true', 'true'], ['true', 'true']), 20);
  const occurrenceOf = (check: CastCheck) => rowOf(reading([check, settled]), withButtons([button()], { list: pathed }))?.occurrences[0];
  const roles = (checks: ConditionCheck[] = []): string[] => checks.map(check => check.role ?? 'plain');
  const parts = (check: CastCheck) => {
    const [either, enemies] = occurrenceOf(check)?.checks ?? [];
    const [down, up] = either?.group?.checks ?? [];
    return { down, up, enemies };
  };

  it('marks every condition on a right cast\'s met path decisive, and fades the option it did not need', () => {
    const { down, up, enemies } = parts(pressed('on', moment(['true', 'true'], ['false', 'true'])));
    expect(roles(down?.group?.checks)).toEqual(['decisive', 'decisive']);
    expect(up?.role).toBe('unneeded');
    expect(roles(up?.group?.checks)).toEqual(['unneeded', 'unneeded']);
    expect(enemies?.role).toBe('decisive');
  });

  it('says the faded conditions were not needed on a right cast that faded one', () => {
    expect(occurrenceOf(pressed('on', moment(['true', 'true'], ['false', 'true'])))?.detail).toBe('they did. Conditions that were not needed are faded.');
  });

  it('says nothing of faded conditions on a right cast whose every option held', () => {
    expect(occurrenceOf(pressed('on', moment(['true', 'true'], ['true', 'true'])))?.detail).toBe('they did.');
  });

  it('marks the unmet conditions of a wrong cast\'s nearest option decisive, and fades the farther option', () => {
    const { down, up, enemies } = parts(pressed('off', moment(['true', 'false'], ['false', 'false'])));
    expect(roles(down?.group?.checks)).toEqual(['plain', 'decisive']);
    expect(up?.role).toBe('unneeded');
    expect(enemies?.role).toBeUndefined();
  });

  it('keeps every option of a wrong cast that sits as near to holding as the nearest', () => {
    const { down, up } = parts(pressed('off', moment(['true', 'false'], ['false', 'true'])));
    expect(roles(down?.group?.checks)).toEqual(['plain', 'decisive']);
    expect(roles(up?.group?.checks)).toEqual(['decisive', 'plain']);
  });

  it('leads an either-or with the option that settled it', () => {
    const [either] = occurrenceOf(pressed('on', moment(['false', 'true'], ['true', 'true'])))?.checks ?? [];
    const [first, second] = either?.group?.checks ?? [];
    expect(first?.group?.checks.map(check => check.text)).toEqual(['While Darkest Night is up', 'With over 0 combo points missing']);
    expect(second?.role).toBe('unneeded');
  });

  it('keeps the list\'s order in an either-or its first option settled', () => {
    const [either] = occurrenceOf(pressed('on', moment(['true', 'true'], ['false', 'true'])))?.checks ?? [];
    expect(either?.group?.checks[0]?.group?.checks.map(check => check.text)).toEqual(['While Darkest Night is down', 'At under 5 combo points']);
  });

  it('marks the condition the log cannot read on a cast it could not judge, and fades the option that failed', () => {
    const { down, up, enemies } = parts(pressed('unjudged', moment(['true', 'unknown'], ['false', 'true'])));
    expect(roles(down?.group?.checks)).toEqual(['plain', 'decisive']);
    expect(up?.role).toBe('unneeded');
    expect(enemies?.role).toBeUndefined();
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
      text: 'One of', truth: 'false', value: '',
      group: {
        any: true,
        checks: [
          { text: 'At 5+ combo points', truth: 'false', value: '3 combo points', role: 'decisive' },
          { text: 'While Shadow Dance is up', truth: 'false', value: 'Down', role: 'decisive' },
        ],
      },
    }]);
  });
});

describe('ListFindingService checklist values', () => {
  const READY: Range = [1, 1];
  const THREE_STACKS: Range = [3, 3];
  const negated = priorityList({ ...list, lines: [{ action: 'eviscerate', terms: ['!cooldown.shadow_dance.ready', '!(buff.shadow_dance.stack>2)'] }] });
  const offCast: CastCheck = {
    atS: 10, verdict: 'off', line: 0,
    lines: [{ truth: 'false', terms: [{ truth: 'false', value: READY }, { truth: 'false', value: THREE_STACKS }] }],
  };
  const checks = () => rowOf(reading([offCast]), withButtons([button()], { list: negated }))?.occurrences[0]?.checks;

  it('shows a negated flag with the state of what it negates, which the phrase then fails', () => {
    expect(checks()?.[0]).toEqual({ text: 'While Shadow Dance is on cooldown', truth: 'false', value: 'Ready', role: 'decisive' });
  });

  it('shows a negated comparison with its subject\'s count, not as a flag', () => {
    expect(checks()?.[1]).toEqual({ text: 'At 2 or fewer Shadow Dance stacks', truth: 'false', value: '3 stacks', role: 'decisive' });
  });
});

describe('ListFindingService build terms', () => {
  const built = priorityList({ ...list, lines: [{ action: 'eviscerate', terms: ['!talent.unseen_blade', 'combo_points>=5&!talent.unseen_blade'] }] });
  const settled: TermReading = { truth: 'true', value: [0, 0], build: true };
  const offCast: CastCheck = {
    atS: 10, verdict: 'off', line: 0,
    lines: [{ truth: 'false', terms: [settled, { truth: 'false', value: null, parts: [{ truth: 'false', value: [3, 3] }, settled] }] }],
  };

  const checksOf = (list: PriorityList, check: CastCheck) => rowOf(reading([check]), withButtons([button()], { list }))?.occurrences[0]?.checks;

  it('leaves what the player\'s build alone settles out of every checklist, at any depth', () => {
    expect(checksOf(built, offCast)?.map(check => check.text)).toEqual(['At 5+ combo points']);
  });

  it('reads an all-of the build leaves holding one condition as that condition', () => {
    expect(checksOf(built, offCast)).toEqual([{ text: 'At 5+ combo points', truth: 'false', value: '3 combo points', role: 'decisive' }]);
  });

  it('keeps an all-of the build leaves holding two conditions as a group', () => {
    const twoLeft = priorityList({ ...list, lines: [{ action: 'eviscerate', terms: ['combo_points>=5&buff.shadow_dance.up&!talent.unseen_blade'] }] });
    const missed: CastCheck = {
      atS: 10, verdict: 'off', line: 0,
      lines: [{ truth: 'false', terms: [{ truth: 'false', value: null, parts: [{ truth: 'false', value: [3, 3] }, { truth: 'true', value: [1, 1] }, settled] }] }],
    };
    const [group] = checksOf(twoLeft, missed) ?? [];
    expect(group?.text).toBe('All of');
    expect(group?.group?.checks.map(check => check.text)).toEqual(['At 5+ combo points', 'While Shadow Dance is up']);
  });
});
