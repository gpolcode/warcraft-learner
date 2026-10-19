import { inject, Injectable } from '@angular/core';
import { type AnalysisFinding, type FindingOccurrence, CAT_LABEL } from './analysis.models';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import type { DamageEstimate, RowRank, Tone } from '../verdict/tone.models';
import { ToneService } from '../verdict/tone-service';
import type { UnjudgedCause } from './pull-model-service';

@Injectable({ providedIn: 'root' })
export class FindingRowsService {
  private readonly logger = inject(LoggerService);
  private readonly tones = inject(ToneService);

  /** Surfaces the button as an "On plan" chip when nothing else is flagged for it. */
  onPlanFinding(name: string): AnalysisFinding {
    return { severity: this.tones.neutral(), onPlan: true, category: 'cooldown_usage', cd_name: name, message: `${name} is on plan.`, occurrences: [] };
  }

  rowsFromEntries(entries: FindingEntry[]): FindingRow[] {
    const rows: FindingRow[] = [];
    for (const entry of entries) {
      if (!entry.hasIssue) continue;
      for (const f of entry.findings) {
        rows.push({
          severity: f.severity,
          ...this.ranked(f),
          name: entry.name,
          spellId: entry.spellId,
          icon: entry.icon,
          timestampS: f.timestamp_s ?? null,
          chip: CAT_LABEL[f.category],
          measured: f.measured ?? { value: '-' },
          message: f.message,
          fix: f.details?.remedy,
          occurrences: f.occurrences,
        });
      }
    }
    return rows;
  }

  /** The fields the page-wide order reads, carried only where the finding has them. */
  ranked(finding: AnalysisFinding): Pick<FindingRow, 'family' | 'rank' | 'damage'> {
    return {
      ...finding.family ? { family: finding.family } : {},
      ...finding.rank ? { rank: finding.rank } : {},
      ...finding.damage ? { damage: finding.damage } : {},
    };
  }

  onPlanFromEntries(entries: FindingEntry[]): OnPlanChip[] {
    return entries.filter(e => !e.hasIssue).map(e => ({ name: e.name, spellId: e.spellId, icon: e.icon }));
  }

  private bucketOf(byName: FindingBuckets, name: string): FindingBucket {
    return (byName[name] ??= { issues: [], holds: [] });
  }

  private bucketIssue(byName: FindingBuckets, finding: AnalysisFinding): void {
    if (finding.category === 'cooldown_hold' && finding.details?.cd_name) {
      this.bucketOf(byName, finding.details.cd_name).holds.push(finding);
    } else if (finding.cd_name) {
      this.bucketOf(byName, finding.cd_name).issues.push(finding);
    } else {
      // Surface a nameless finding under an explicit label so the coaching feedback is never dropped.
      this.logger.logWarn(UNKNOWN_COOLDOWN_CONTEXT, finding);
      this.bucketOf(byName, UNKNOWN_COOLDOWN_LABEL).issues.push(finding);
    }
  }

  bucketFindings(
    findings: AnalysisFinding[],
    options: BucketOptions,
  ): FindingEntry[] {
    const byName: FindingBuckets = {};

    for (const finding of findings) {
      if (!finding.onPlan) this.bucketIssue(byName, finding);
    }
    for (const finding of findings) {
      if (!finding.onPlan) continue;
      const name = finding.cd_name;
      // The empty bucket is what surfaces the cooldown as an "On plan" chip.
      if (name) this.bucketOf(byName, name);
    }

    return Object.entries(byName).map(([name, bucket]) => ({
      name,
      spellId: options.spellId(name),
      icon: options.icon(name),
      hasIssue: bucket.issues.length > 0 || bucket.holds.length > 0,
      findings: [...bucket.issues, ...bucket.holds],
    }));
  }
}

export const UNKNOWN_COOLDOWN_LABEL = 'Unknown cooldown';

const UNKNOWN_COOLDOWN_CONTEXT = 'finding-table.unknown-cooldown';

interface FindingMeasure {
  value: string;
  unit?: string;
}

export interface FindingRow {
  severity: Tone;
  family?: string;
  rank?: RowRank;
  damage?: DamageEstimate;
  /** Why a muted row was not judged. */
  unjudged?: UnjudgedCause;
  name?: string;
  spellId?: number | null;
  icon: string;
  timestampS?: number | null;
  chip?: string;
  what?: string;
  measured: FindingMeasure;
  message: string;
  fix?: string;
  occurrences: FindingOccurrence[];
}

export interface OnPlanChip {
  name: string;
  spellId: number | null;
  icon: string;
}

export interface FindingEntry {
  name: string;
  spellId: number | null;
  icon: string;
  hasIssue: boolean;
  findings: AnalysisFinding[];
}

interface FindingBucket { issues: AnalysisFinding[]; holds: AnalysisFinding[]; }

export interface BucketOptions {
  spellId: (name: string) => number | null;
  icon: (name: string) => string;
}

type FindingBuckets = Record<string, FindingBucket>;
