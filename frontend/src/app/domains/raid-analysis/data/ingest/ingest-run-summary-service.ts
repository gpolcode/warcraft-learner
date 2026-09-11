import { Injectable } from '@angular/core';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import type { AplUnknownToken, AplUnknownTokenKind } from '../simc/simc.models';
import { getOrInsert } from '../analysis/analysis-math';

/** One SimulationCraft token outside the vocabulary inventory, with the specs whose profiles carry it. */
export interface VocabularyGap {
  kind: AplUnknownTokenKind;
  token: string;
  specs: string[];
}

export interface IngestRunSummary {
  succeeded: string[];
  failed: { spec: string; message: string }[];
  budgetStopped: boolean;
  fatal?: string;
  vocabularyGaps?: VocabularyGap[];
}

/** Published on `globalThis.__INGEST_DONE__`, the headless harness's exit signal, with the gap report rendered so the harness only relays it. */
export interface PublishedRunSummary extends IngestRunSummary {
  gapWarnings: string[];
  gapReport: string | null;
}

const GAP_LABEL: Record<AplUnknownTokenKind, string> = {
  expression: 'Expression', option: 'Action option', variable_op: 'Variable op', syntax: 'Unparsed expression',
};
const INVENTORY_PATH = 'frontend/src/app/domains/raid-analysis/data/simc/apl-vocabulary.ts';
/** The issue step compares this line alone, so an edit of the surrounding prose never reads as a new set of gaps. */
const FINGERPRINT = 'warcraft-learner-gaps';

@Injectable({ providedIn: 'root' })
export class IngestRunSummaryService {
  publish(summary: IngestRunSummary): void {
    const published: PublishedRunSummary = { ...summary, gapWarnings: this.gapWarnings(summary), gapReport: this.gapReport(summary) };
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
    console.log(warnings.length ? `APL vocabulary gaps (${warnings.length}):` : 'No APL vocabulary gaps.');
    for (const warning of warnings) console.log(`  ${warning}`);
  }

  /** One gap per token over every spec, so the report reads the same whichever specs a run ingested. */
  vocabularyGaps(tokensBySpec: Map<string, AplUnknownToken[]>): VocabularyGap[] {
    const gaps = new Map<string, VocabularyGap>();
    for (const [spec, tokens] of tokensBySpec) {
      for (const token of tokens) getOrInsert(gaps, `${token.kind}:${token.token}`, () => ({ kind: token.kind, token: token.token, specs: [] })).specs.push(spec);
    }
    return [...gaps.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.token.localeCompare(b.token));
  }

  gapWarnings(summary: IngestRunSummary): string[] {
    return (summary.vocabularyGaps ?? []).map(gap => `${GAP_LABEL[gap.kind]} "${gap.token}" is outside the APL vocabulary inventory (${gap.specs.join(', ')})`);
  }

  /** The issue body: a table of the gaps plus a fingerprint of the set, or null when the inventory covers every profile. */
  gapReport(summary: IngestRunSummary): string | null {
    const gaps = summary.vocabularyGaps ?? [];
    if (!gaps.length) return null;
    const rows = gaps.map(gap => `| ${GAP_LABEL[gap.kind]} | \`${gap.token}\` | ${gap.specs.join(', ')} |`);
    const fingerprint = bytesToHex(sha256(utf8ToBytes(rows.join('\n')))).slice(0, 16);
    return [
      `SimulationCraft tokens outside the APL vocabulary inventory (\`${INVENTORY_PATH}\`).`,
      'Add each to the inventory with its support level and note, or extend the builder to read it.',
      '',
      '| Kind | Token | Specs |',
      '|---|---|---|',
      ...rows,
      '',
      `<!-- ${FINGERPRINT}:${fingerprint} -->`,
    ].join('\n');
  }
}
