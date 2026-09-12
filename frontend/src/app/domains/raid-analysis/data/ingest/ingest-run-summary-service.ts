import { Injectable, inject } from '@angular/core';
import type { RulebookGap, RulebookGapKind } from '../simc/simc.models';
import { HashService } from '../../../shared/util-hash/hash-service';
import { getOrInsert } from '../analysis/analysis-math';

/** One name or token the rulebook builder could not read, with the specs whose sources carry it. */
export interface RunGap {
  kind: RulebookGapKind;
  token: string;
  specs: string[];
}

export interface IngestRunSummary {
  succeeded: string[];
  failed: { spec: string; message: string }[];
  budgetStopped: boolean;
  fatal?: string;
  gaps?: RunGap[];
}

/** Published on `globalThis.__INGEST_DONE__`, the headless harness's exit signal, with the gap report rendered so the harness only relays it. */
export interface PublishedRunSummary extends IngestRunSummary {
  gapWarnings: string[];
  gapReport: string | null;
}

const GAP_LABEL: Record<RulebookGapKind, string> = {
  expression: 'Expression', option: 'Action option', variable_op: 'Variable op', syntax: 'Unparsed expression',
  line: 'Unparsed line', list: 'Missing list', variable: 'Undefined variable',
  action: 'Unresolved action', aura: 'Unresolved aura', talent: 'Unresolved talent',
};
const INVENTORY_PATH = 'frontend/src/app/domains/raid-analysis/data/simc/apl-vocabulary.ts';
/** The issue step compares this line alone, so an edit of the surrounding prose never reads as a new set of gaps. */
const FINGERPRINT = 'warcraft-learner-gaps';
const FINGERPRINT_LENGTH = 16;

@Injectable({ providedIn: 'root' })
export class IngestRunSummaryService {
  private readonly hash = inject(HashService);

  async publish(summary: IngestRunSummary): Promise<void> {
    const published: PublishedRunSummary = { ...summary, gapWarnings: this.gapWarnings(summary), gapReport: await this.gapReport(summary) };
    (globalThis as { __INGEST_DONE__?: PublishedRunSummary }).__INGEST_DONE__ = published;
  }

  print(summary: IngestRunSummary, specCount: number): void {
    console.log('\n=== Ingestion summary ===');
    console.log(`Specs processed: ${summary.succeeded.length} of ${specCount}`);
    if (summary.budgetStopped) {
      console.log('Stopped early: WCL point budget exhausted; the remaining specs resume next run.');
    }
    if (summary.failed.length) {
      console.log(`Specs failed (${summary.failed.length}): ${summary.failed.map(entry => entry.spec).join(', ')}`);
      for (const entry of summary.failed) console.log(`  ${entry.spec}: ${entry.message}`);
    } else {
      console.log('No spec-level failures.');
    }
    const warnings = this.gapWarnings(summary);
    console.log(warnings.length ? `SimulationCraft gaps (${warnings.length}):` : 'No SimulationCraft gaps.');
    for (const warning of warnings) console.log(`  ${warning}`);
  }

  /** One gap per token over every spec, so the report reads the same whichever specs a run ingested. */
  gaps(gapsBySpec: Map<string, RulebookGap[]>): RunGap[] {
    const gaps = new Map<string, RunGap>();
    for (const [spec, entries] of gapsBySpec) {
      for (const gap of entries) getOrInsert(gaps, `${gap.kind}:${gap.token}`, () => ({ kind: gap.kind, token: gap.token, specs: [] })).specs.push(spec);
    }
    return [...gaps.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.token.localeCompare(b.token));
  }

  gapWarnings(summary: IngestRunSummary): string[] {
    return (summary.gaps ?? []).map(gap => `${GAP_LABEL[gap.kind]} "${gap.token}" is outside what the rulebook builder reads (${gap.specs.join(', ')})`);
  }

  /** The issue body: a table of the gaps plus a fingerprint of the set, or null when the builder reads every source whole. */
  async gapReport(summary: IngestRunSummary): Promise<string | null> {
    const gaps = summary.gaps ?? [];
    if (!gaps.length) return null;
    const rows = gaps.map(gap => `| ${GAP_LABEL[gap.kind]} | \`${gap.token}\` | ${gap.specs.join(', ')} |`);
    const fingerprint = (await this.hash.sha256Hex(rows.join('\n'))).slice(0, FINGERPRINT_LENGTH);
    return [
      `SimulationCraft tokens and names the rulebook builder cannot read; the inventory is \`${INVENTORY_PATH}\`.`,
      'A shape, option or op closes with an inventory row and its support level; an action or aura with an alias or an unrecorded-name note; a talent by its Raidbots name; a line or list by extending the reader.',
      '',
      '| Kind | Token | Specs |',
      '|---|---|---|',
      ...rows,
      '',
      `<!-- ${FINGERPRINT}:${fingerprint} -->`,
    ].join('\n');
  }
}
