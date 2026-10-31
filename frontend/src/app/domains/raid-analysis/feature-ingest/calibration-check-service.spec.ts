import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CalibrationCheckService } from './calibration-check-service';
import { CalibrationRunService, type CalibrationRun } from '../data/verdict/calibration/calibration-run-service';

interface Published { succeeded: string[]; fatal?: string; report?: string }

const REPORT = '## Verdict validity';
const BREACH = 'amber page budget breached for dps';

function published(): Published | undefined {
  return (globalThis as { __INGEST_DONE__?: Published }).__INGEST_DONE__;
}

async function check(run: () => Promise<Pick<CalibrationRun, 'report' | 'breaches'>>): Promise<Published | undefined> {
  TestBed.configureTestingModule({ providers: [{ provide: CalibrationRunService, useValue: { run } }] });
  await TestBed.inject(CalibrationCheckService).run();
  return published();
}

describe('CalibrationCheckService.run', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    delete (globalThis as { __INGEST_DONE__?: Published }).__INGEST_DONE__;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('recomputes calibration rather than reusing the stored per-encounter files', async () => {
    const run = vi.fn(async () => ({ report: REPORT, breaches: [] }));

    await check(run);

    expect(run).toHaveBeenCalledWith(true);
  });

  it('publishes success with the report when the recompute breaches nothing', async () => {
    const summary = await check(async () => ({ report: REPORT, breaches: [] }));

    expect(summary).toEqual({ succeeded: ['calibration'], failed: [], budgetStopped: false, report: REPORT });
  });

  it('publishes a fatal exit naming the count once the recompute breaches one check', async () => {
    const summary = await check(async () => ({ report: REPORT, breaches: [BREACH] }));

    expect(summary).toEqual({ succeeded: [], failed: [], budgetStopped: false, fatal: '1 calibration breach(es)', report: REPORT });
  });

  it('publishes a fatal exit with the error message when the recompute throws, without rejecting', async () => {
    const summary = await check(async () => { throw new Error('index unreadable'); });

    expect(summary).toEqual({ succeeded: [], failed: [], budgetStopped: false, fatal: 'index unreadable' });
  });
});
