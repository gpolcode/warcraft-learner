import { Injectable } from '@angular/core';

/** Published on `globalThis.__INGEST_DONE__`, the headless harness's exit signal for every ingest mode. */
export interface IngestRunSummary {
  succeeded: string[];
  failed: { spec: string; message: string }[];
  budgetStopped: boolean;
  fatal?: string;
}

@Injectable({ providedIn: 'root' })
export class IngestRunSummaryService {
  publish(summary: IngestRunSummary): void {
    (globalThis as { __INGEST_DONE__?: IngestRunSummary }).__INGEST_DONE__ = summary;
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
  }
}
