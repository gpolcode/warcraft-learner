import { Injectable } from '@angular/core';
import { CalibrationIndex, Discrimination, FlagTally, PageLoad } from './calibration.models';

const RATE_DIGITS = 3;
const LIFT_DIGITS = 2;

/** The validity report: the per-role page load and each family's measured rates and verdict, as Markdown for a job summary. */
@Injectable({ providedIn: 'root' })
export class CalibrationReportService {
  report(index: CalibrationIndex): string {
    return [
      '## Verdict validity',
      '',
      `${index.encounters} encounters, ${index.pulls} held-out top pulls, ${index.contrast_pulls} contrast pulls.${this.unfoldable(index)}`,
      '',
      '| Role | Held-out pulls | Red per pull, rules | Amber per pull, rules | Red per pull, armed | Amber per pull, armed |',
      '|---|---|---|---|---|---|',
      ...Object.entries(index.page.measured).map(([role, measured]) => {
        const armed = index.page.armed[role as keyof typeof index.page.armed];
        return `| ${role} | ${measured.pulls} | ${this.perPull(measured, 'red')} | ${this.perPull(measured, 'amber')} | ${this.perPull(armed, 'red')} | ${this.perPull(armed, 'amber')} |`;
      }),
      '',
      '| Family | Tests | Red rate | Amber rate | Red bound | Amber bound | Detection | Lift (lower bound) | AUC | Verdict |',
      '|---|---|---|---|---|---|---|---|---|---|',
      ...Object.entries(index.families).map(([id, family]) => [
        id, family.pooled.tests, this.rate(family.pooled, 'red'), this.rate(family.pooled, 'amber'),
        family.upper.red.toFixed(RATE_DIGITS), family.upper.amber.toFixed(RATE_DIGITS),
        family.detection.trials ? `${family.detection.detected} of ${family.detection.trials}` : 'none',
        ...this.separation(family.discrimination ?? null),
        `${family.verdict.status}, ${family.verdict.cap}: ${family.verdict.reason}`,
      ].join(' | ')).map(row => `| ${row} |`),
      '',
      this.damage(index),
      '',
      ...this.failedInvariants(index),
    ].join('\n');
  }

  /** An index written before the gate was measured reads as no contrast log. */
  private damage(index: CalibrationIndex): string {
    const stored: Partial<CalibrationIndex> = index;
    const gate = stored.damage;
    if (!gate?.logs) return 'Damage estimates: hidden, no contrast log measured.';
    return `Damage estimates: ${gate.open ? 'shown' : 'hidden'}, over ${gate.logs} contrast logs, above the gap on ${gate.exceedShare.toFixed(RATE_DIGITS)}, Spearman ${gate.spearman.toFixed(LIFT_DIGITS)}.`;
  }

  private perPull(load: PageLoad | undefined, tone: 'red' | 'amber'): string {
    return load?.pulls ? (load[tone] / load.pulls).toFixed(2) : 'none';
  }

  private rate(tally: FlagTally, tone: 'red' | 'amber'): string {
    return tally.tests ? (tally[tone] / tally.tests).toFixed(RATE_DIGITS) : 'none';
  }

  private separation(discrimination: Discrimination | null): [string, string] {
    if (!discrimination) return ['none', 'none'];
    const { lift, liftLower, auc, contrastPulls } = discrimination;
    return [`${lift.toFixed(LIFT_DIGITS)} (${liftLower.toFixed(LIFT_DIGITS)}) over ${contrastPulls} pulls`, auc.toFixed(LIFT_DIGITS)];
  }

  private unfoldable(index: CalibrationIndex): string {
    const entries = Object.entries(index.unfoldable);
    if (!entries.length) return '';
    return ` Not folded, no per-log measures: ${entries.map(([bench, count]) => `${bench} ${count}`).join(', ')}.`;
  }

  private failedInvariants(index: CalibrationIndex): string[] {
    const failed = index.invariants.filter(result => !result.passed);
    if (!failed.length) return ['Every invariant holds.'];
    return failed.map(result => `- Invariant ${result.name} fails for ${result.family}: ${result.baseRate.toFixed(RATE_DIGITS)} before, ${result.perturbedRate.toFixed(RATE_DIGITS)} after.`);
  }
}
