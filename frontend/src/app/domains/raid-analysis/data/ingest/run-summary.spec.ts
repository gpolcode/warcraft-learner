import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { IngestRunSummaryService, type IngestRunSummary, type RunGap } from './ingest-run-summary-service';
import type { RulebookGap } from '../rulebook-build/rulebook-build.models';

const summaries = TestBed.inject(IngestRunSummaryService);

const SPEC_COUNT = 3;
const UNKNOWN_SHAPE = 'buff.*.brand_new_field';
const MISSING_ACTION = 'aimed_shot';
const SHAPE_GAP: RulebookGap = { kind: 'expression', token: UNKNOWN_SHAPE };
const ACTION_GAP: RulebookGap = { kind: 'action', token: MISSING_ACTION };
const MERGED: RunGap[] = [
  { kind: 'action', token: MISSING_ACTION, specs: ['MarksmanshipHunter'] },
  { kind: 'expression', token: UNKNOWN_SHAPE, specs: ['SubtletyRogue', 'MarksmanshipHunter'] },
];
/** The marker the issue step greps for, followed by a short hash of the rows. */
const FINGERPRINT = /<!-- warcraft-learner-gaps:[0-9a-f]{16} -->/;

const summary = (over: Partial<IngestRunSummary> = {}): IngestRunSummary => ({ succeeded: ['SubtletyRogue'], failed: [], budgetStopped: false, ...over });

describe('gaps', () => {
  it('merges the same token across specs and orders by kind, then token', () => {
    const bySpec = new Map([['SubtletyRogue', [SHAPE_GAP]], ['MarksmanshipHunter', [SHAPE_GAP, ACTION_GAP]]]);
    expect(summaries.gaps(bySpec)).toEqual(MERGED);
  });
});

describe('gapWarnings', () => {
  it('names the kind, the token and the specs in one sentence each', () => {
    expect(summaries.gapWarnings(summary({ gaps: MERGED }))).toEqual([
      `Unresolved action "${MISSING_ACTION}" is outside what the rulebook builder reads (MarksmanshipHunter)`,
      `Expression "${UNKNOWN_SHAPE}" is outside what the rulebook builder reads (SubtletyRogue, MarksmanshipHunter)`,
    ]);
  });
});

describe('gapReport', () => {
  it('renders one table row per gap and a fingerprint of the set', async () => {
    const report = await summaries.gapReport(summary({ gaps: MERGED }));
    expect(report).toContain(`| Unresolved action | \`${MISSING_ACTION}\` | MarksmanshipHunter |`);
    expect(report).toContain(`| Expression | \`${UNKNOWN_SHAPE}\` | SubtletyRogue, MarksmanshipHunter |`);
    expect(report).toMatch(FINGERPRINT);
  });

  it('fingerprints the set of gaps alone, so the same gaps over other specs read as the same set', async () => {
    const fingerprintOf = (report: string | null): string => FINGERPRINT.exec(report ?? '')?.[0] ?? '';
    const same = await summaries.gapReport(summary({ gaps: MERGED }));
    const reordered = await summaries.gapReport(summary({ gaps: MERGED, succeeded: [] }));
    const grown = await summaries.gapReport(summary({ gaps: [...MERGED, { kind: 'talent', token: 'massacre', specs: ['ArmsWarrior'] }] }));
    expect(fingerprintOf(reordered)).toBe(fingerprintOf(same));
    expect(fingerprintOf(grown)).not.toBe(fingerprintOf(same));
  });

  it('renders no report when the builder reads every source whole', async () => {
    expect(await summaries.gapReport(summary({ gaps: [] }))).toBeNull();
    expect(await summaries.gapReport(summary())).toBeNull();
  });
});

describe('formatRunSummary', () => {
  it('counts the specs, lists the failures and the gaps', () => {
    const text = summaries.formatRunSummary(summary({ failed: [{ spec: 'FireMage', message: 'boom' }], gaps: MERGED }), SPEC_COUNT);
    expect(text).toContain(`Specs processed: 1 of ${SPEC_COUNT}`);
    expect(text).toContain('Specs failed (1): FireMage');
    expect(text).toContain('  FireMage: boom');
    expect(text).toContain('SimulationCraft gaps (2):');
  });

  it('says so when nothing failed and nothing was left unread', () => {
    const text = summaries.formatRunSummary(summary(), SPEC_COUNT);
    expect(text).toContain('No spec-level failures.');
    expect(text).toContain('No SimulationCraft gaps.');
  });

  it('notes a run the budget stopped', () => {
    expect(summaries.formatRunSummary(summary({ budgetStopped: true }), SPEC_COUNT)).toContain('Stopped early');
  });
});

describe('published', () => {
  it('carries the warnings and the report beside the summary, for the harness to relay', async () => {
    const published = await summaries.published(summary({ gaps: MERGED }));
    expect(published.gapWarnings).toHaveLength(MERGED.length);
    expect(published.gapReport).toMatch(FINGERPRINT);
    expect(published.succeeded).toEqual(['SubtletyRogue']);
  });
});
