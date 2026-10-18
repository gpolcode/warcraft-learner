import { Injectable, inject } from '@angular/core';
import { CalibrationRunService } from '../data/verdict/calibration/calibration-run-service';

/** The headless runner's exit signal, the shape ingest publishes. */
interface CheckSummary {
  succeeded: string[];
  failed: { spec: string; message: string }[];
  budgetStopped: boolean;
  fatal?: string;
  report?: string;
}

function publishSummary(summary: CheckSummary): void {
  (globalThis as { __INGEST_DONE__?: CheckSummary }).__INGEST_DONE__ = summary;
}

/** Recomputes calibration from the baked benches and fails on a page-budget breach, a failed invariant or a lost grade. */
@Injectable({ providedIn: 'root' })
export class CalibrationCheckService {
  private readonly calibration = inject(CalibrationRunService);

  /** Never rejects: the fire-and-forget app initializer must not see an unhandled rejection. */
  async run(): Promise<void> {
    try {
      const { report, breaches } = await this.calibration.run(true);
      console.log(report);
      if (breaches.length) {
        for (const breach of breaches) console.error(breach);
        publishSummary({ succeeded: [], failed: [], budgetStopped: false, fatal: `${breaches.length} calibration breach(es)`, report });
        return;
      }
      publishSummary({ succeeded: ['calibration'], failed: [], budgetStopped: false, report });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('\nFatal error:', message);
      publishSummary({ succeeded: [], failed: [], budgetStopped: false, fatal: message });
    }
  }
}
