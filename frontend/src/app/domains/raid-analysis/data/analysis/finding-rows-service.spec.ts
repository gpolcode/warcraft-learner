import { assert, describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import { FindingEntry, UNKNOWN_COOLDOWN_LABEL, FindingRowsService } from './finding-rows-service';
import type { AnalysisFinding } from './analysis.models';
import { SHADOW_BLADES, VANISH } from '../../../../../testing/spell-ids';
import { TestBed } from '@angular/core/testing';
import { tone } from '../../../../../testing/builders/tone';

const rowBuilder = TestBed.inject(FindingRowsService);

const spellId = (_name: string) => null;
const icon = (_name: string) => '';

const f = (
  severity: AnalysisFinding['severity'],
  category: string,
  cdName?: string,
  opts: Partial<AnalysisFinding> = {},
): AnalysisFinding => ({
  severity,
  category,
  cd_name: cdName,
  message: `${severity}/${category}`,
  occurrences: [],
  ...opts,
});

describe('bucketFindings', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  beforeEach(() => { warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined); });
  afterEach(() => { warnSpy.mockRestore(); });

  it('groups a red issue under its cooldown name', () => {
    const finding = f(tone('red'), 'lost_cooldown', 'Shadow Blades');
    const entries = rowBuilder.bucketFindings([finding], { spellId, icon });

    expect(entries).toHaveLength(1);
    assert.exists(entries[0]);
    expect(entries[0].name).toBe('Shadow Blades');
    assert.exists(entries[0]);
    expect(entries[0].hasIssue).toBe(true);
  });

  it('buckets a hold under the cooldown its details name, since a hold finding carries no cd_name of its own', () => {
    const finding: AnalysisFinding = {
      severity: tone('blue'),
      category: 'cooldown_hold',
      message: 'hold tip',
      details: { cd_name: 'Feint' },
      occurrences: [],
    };
    const entries = rowBuilder.bucketFindings([finding], { spellId, icon });

    expect(entries).toHaveLength(1);
    assert.exists(entries[0]);
    expect(entries[0].name).toBe('Feint');
    assert.exists(entries[0]);
    expect(entries[0].hasIssue).toBe(true);
  });

  it('buckets a rule_violation under its cooldown name', () => {
    const finding: AnalysisFinding = f(tone('amber'), 'rule_violation', 'Shadow Blades');
    const entries = rowBuilder.bucketFindings([finding], { spellId, icon });

    expect(entries).toHaveLength(1);
    assert.exists(entries[0]);
    expect(entries[0].name).toBe('Shadow Blades');
  });

  it('gives an on-plan finding an entry with no issue, so it surfaces as a chip', () => {
    const finding = rowBuilder.onPlanFinding('Shadow Blades');
    const entries = rowBuilder.bucketFindings([finding], { spellId, icon });

    expect(entries).toHaveLength(1);
    assert.exists(entries[0]);
    expect(entries[0].name).toBe('Shadow Blades');
    assert.exists(entries[0]);
    expect(entries[0].hasIssue).toBe(false);
  });

  it('returns no entries for empty input', () => {
    expect(rowBuilder.bucketFindings([], { spellId, icon })).toHaveLength(0);
  });

  it('surfaces a finding with no cd_name as an Unknown cooldown entry', () => {
    const finding = f(tone('amber'), 'cast_efficiency');
    const entries = rowBuilder.bucketFindings([finding], { spellId, icon });
    expect(entries).toHaveLength(1);
    assert.exists(entries[0]);
    expect(entries[0].name).toBe(UNKNOWN_COOLDOWN_LABEL);
    assert.exists(entries[0]);
    expect(entries[0].hasIssue).toBe(true);
    assert.exists(entries[0]);
    expect(entries[0].findings).toContain(finding);
  });

  it('logs a warning carrying the finding so an unidentified cooldown can be reproduced', () => {
    const finding = f(tone('amber'), 'cast_efficiency');
    rowBuilder.bucketFindings([finding], { spellId, icon });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown-cooldown'), finding);
  });
});

describe('rowsFromEntries', () => {
  const issueEntry: FindingEntry = {
    name: 'Shadow Blades',
    spellId: SHADOW_BLADES,
    icon: '',
    hasIssue: true,
    findings: [
      { severity: tone('red'), category: 'lost_cooldown', message: 'lost', measured: { value: '0 / 2', unit: 'cast(s)' }, occurrences: [] },
    ],
  };

  const onPlanEntry: FindingEntry = {
    name: 'Vanish',
    spellId: null,
    icon: '',
    hasIssue: false,
    findings: [],
  };

  it('generates one row per finding for entries with hasIssue=true', () => {
    const rows = rowBuilder.rowsFromEntries([issueEntry]);
    expect(rows).toHaveLength(1);
    assert.exists(rows[0]);
    expect(rows[0].name).toBe('Shadow Blades');
    assert.exists(rows[0]);
    expect(rows[0].chip).toBe('lost cast');
    assert.exists(rows[0]);
    expect(rows[0].measured).toEqual({ value: '0 / 2', unit: 'cast(s)' });
  });

  it('carries the finding sentence, so the row says what happened before the remedy', () => {
    expect(rowBuilder.rowsFromEntries([issueEntry])[0]?.message).toBe('lost');
  });

  it('leaves the chip off a category that has no label, so no row shows an empty tag', () => {
    const entry: FindingEntry = {
      name: 'Shadow Blades', spellId: null, icon: '', hasIssue: true,
      findings: [{ severity: tone('amber'), category: 'rule_violation', message: 'bad', occurrences: [] }],
    };
    const rows = rowBuilder.rowsFromEntries([entry]);
    assert.exists(rows[0]);
    expect(rows[0].chip).toBeUndefined();
  });

  it('skips entries with hasIssue=false', () => {
    expect(rowBuilder.rowsFromEntries([onPlanEntry])).toHaveLength(0);
  });

  it('uses a dash placeholder when finding.measured is absent', () => {
    const entry: FindingEntry = {
      name: 'Shadow Blades', spellId: null, icon: '', hasIssue: true,
      findings: [{ severity: tone('amber'), category: 'rule_violation', message: 'bad', occurrences: [] }],
    };
    const rows = rowBuilder.rowsFromEntries([entry]);
    assert.exists(rows[0]);
    expect(rows[0].measured).toEqual({ value: '-' });
  });

  it('carries each finding\'s tone onto its row unchanged', () => {
    const mixedEntry: FindingEntry = {
      ...issueEntry,
      findings: [
        { severity: tone('red'), category: 'lost_cooldown', message: '', measured: { value: '', unit: '' }, occurrences: [] },
        { severity: tone('blue'), category: 'cooldown_hold', message: '', measured: { value: '', unit: '' }, occurrences: [] },
        { severity: tone('muted'), category: 'cooldown_delay', message: '', measured: { value: '', unit: '' }, occurrences: [] },
      ],
    };
    expect(rowBuilder.rowsFromEntries([mixedEntry]).map(row => row.severity)).toEqual(['red', 'blue', 'muted']);
  });
});

describe('onPlanFromEntries', () => {
  it('returns only entries with hasIssue=false', () => {
    const entries: FindingEntry[] = [
      { name: 'Shadow Blades', spellId: SHADOW_BLADES, icon: '', hasIssue: true,  findings: [] },
      { name: 'Vanish',        spellId: VANISH,   icon: '', hasIssue: false, findings: [] },
    ];
    const chips = rowBuilder.onPlanFromEntries(entries);
    expect(chips).toHaveLength(1);
    expect(chips[0]).toEqual({ name: 'Vanish', spellId: VANISH, icon: '' });
  });

  it('returns empty array when all entries have issues', () => {
    const entries: FindingEntry[] = [
      { name: 'Shadow Blades', spellId: null, icon: '', hasIssue: true, findings: [] },
    ];
    expect(rowBuilder.onPlanFromEntries(entries)).toHaveLength(0);
  });
});
