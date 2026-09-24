import { Injectable, inject } from '@angular/core';
import type { RulebookGap, RulebookGapKind } from '../rulebook-build/rulebook-build.models';
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

/** The summary with the gap report rendered, so the headless harness only relays it. */
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
/** The issue step compares the line carrying this marker alone, so an edit of the surrounding prose never reads as a new set of gaps. */
const FINGERPRINT_MARKER = 'warcraft-learner-gaps';

@Injectable({ providedIn: 'root' })
export class IngestRunSummaryService {
  private readonly hash = inject(HashService);

  async published(summary: IngestRunSummary): Promise<PublishedRunSummary> {
    return { ...summary, gapWarnings: this.gapWarnings(summary), gapReport: await this.gapReport(summary) };
  }

  formatRunSummary(summary: IngestRunSummary, specCount: number): string {
    const lines = ['', '=== Ingestion summary ===', `Specs processed: ${summary.succeeded.length} of ${specCount}`];
    if (summary.budgetStopped) lines.push('Stopped early: WCL point budget exhausted; the remaining specs resume next run.');
    if (summary.failed.length) {
      lines.push(`Specs failed (${summary.failed.length}): ${summary.failed.map(entry => entry.spec).join(', ')}`);
      for (const entry of summary.failed) lines.push(`  ${entry.spec}: ${entry.message}`);
    } else {
      lines.push('No spec-level failures.');
    }
    const warnings = this.gapWarnings(summary);
    lines.push(warnings.length ? `SimulationCraft gaps (${warnings.length}):` : 'No SimulationCraft gaps.');
    for (const warning of warnings) lines.push(`  ${warning}`);
    return lines.join('\n');
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
    return [
      `SimulationCraft tokens and names the rulebook builder cannot read; the inventory is \`${INVENTORY_PATH}\`.`,
      'A shape, option or op closes with an inventory row and its support level; an action or aura with an alias or an unrecorded-name note; a talent by its Raidbots name; a line or list by extending the reader; an undefined variable is a typo in the action list that waits for upstream.',
      '',
      '| Kind | Token | Specs |',
      '|---|---|---|',
      ...rows,
      '',
      `<!-- ${FINGERPRINT_MARKER}:${await this.hash.shortHash(rows.join('\n'))} -->`,
    ].join('\n');
  }
}
