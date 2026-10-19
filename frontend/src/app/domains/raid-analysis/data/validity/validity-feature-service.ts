import { inject, Injectable } from '@angular/core';
import { Result, Results } from '../../../shared/util-http/result';
import { SpecRole } from '../analysis/spec-role-service';
import { FINDING_REGISTRY } from '../verdict/finding-registry';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { CALIBRATION_SOURCE } from '../verdict/calibration/calibration-source';
import { RegistryHashService } from '../verdict/calibration/registry-hash-service';
import { CalibrationIndex, FamilyCalibration, PageLoad } from '../verdict/calibration/calibration.models';

const ROLE_LABEL: Record<SpecRole, string> = { dps: 'DPS', tank: 'Tank', healer: 'Healer' };

const TAG = { red: 'Red', amber: 'Amber', blue: 'Count', neutral: 'Measurement', muted: 'Measurement' } as const;

interface ValidityRoleRow {
  label: string;
  pulls: number;
  redPerPull: number;
  amberPerPull: number;
}

export interface ValidityFamilyRow {
  label: string;
  /** The tone the page may give it, or why it gives none. */
  tag: string;
  graded: boolean;
  tests: number;
  /** Null on a check no top log was judged on. */
  redRate: number | null;
  amberRate: number | null;
  detection: { trials: number; detected: number };
  /** How much more often it flags weaker logs; null before enough of them are compared, or for a count. */
  separation: { lift: number; liftLower: number; auc: number } | null;
  reason: string;
}

export interface ValidityMeasurement {
  encounters: number;
  pulls: number;
  /** Weaker logs judged against the full top-log benches. */
  contrastPulls: number;
  /** False when the checks changed after the measurement, which leaves every check without a color. */
  current: boolean;
  roles: ValidityRoleRow[];
  families: ValidityFamilyRow[];
}

/** Null `measurement` when no measurement is published. */
export interface ValidityView {
  measurement: ValidityMeasurement | null;
  budget: { red: number; amber: number };
}

/** The validity report pages read: how often each check flags held-out top logs, and the page load each role draws. */
@Injectable({ providedIn: 'root' })
export class ValidityFeatureService {
  private readonly source = inject(CALIBRATION_SOURCE);
  private readonly hashes = inject(RegistryHashService);

  async loadView(): Promise<Result<ValidityView>> {
    const loaded = await this.source.load();
    if (!loaded.ok && loaded.error.kind !== 'missing') return loaded;
    const index = loaded.ok ? loaded.value : null;
    return Results.ok({ measurement: this.isIndex(index) ? this.measurement(index) : null, budget: VERDICT_CHOICES.pageBudget });
  }

  protected measurement(index: CalibrationIndex): ValidityMeasurement {
    return {
      encounters: index.encounters,
      pulls: index.pulls,
      contrastPulls: index.contrast_pulls,
      current: index.registry_hash === this.hashes.registryHash(),
      roles: (Object.entries(index.page.armed) as [SpecRole, PageLoad][])
        .filter(([, load]) => load.pulls > 0)
        .map(([role, load]) => ({ label: ROLE_LABEL[role], pulls: load.pulls, redPerPull: load.red / load.pulls, amberPerPull: load.amber / load.pulls })),
      families: FINDING_REGISTRY.flatMap(family => {
        const measured = index.families[family.id];
        return measured ? [this.familyRow(family.label, measured)] : [];
      }),
    };
  }

  private familyRow(label: string, family: FamilyCalibration): ValidityFamilyRow {
    const { pooled, verdict, discrimination } = family;
    const graded = verdict.status === 'graded';
    return {
      label, graded,
      tag: graded ? TAG[verdict.cap] : verdict.status === 'hidden' ? 'Hidden' : 'Not graded',
      tests: pooled.tests,
      redRate: pooled.tests ? pooled.red / pooled.tests : null,
      amberRate: pooled.tests ? pooled.amber / pooled.tests : null,
      detection: family.detection,
      separation: discrimination ? { lift: discrimination.lift, liftLower: discrimination.liftLower, auc: discrimination.auc } : null,
      reason: verdict.reason,
    };
  }

  private isIndex(value: unknown): value is CalibrationIndex {
    const index = value as Partial<CalibrationIndex> | null;
    return typeof index?.registry_hash === 'string' && typeof index.families === 'object' && typeof index.page?.armed === 'object';
  }
}
