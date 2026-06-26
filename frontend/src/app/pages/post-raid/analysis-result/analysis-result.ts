import { ChangeDetectionStrategy, Component, computed, inject, input, output, OnChanges } from '@angular/core';
import { AnalysisResult as IAnalysisResult } from '../../../core/models/analysis.models';
import { EncounterGearStats } from '../../../core/models/encounter.models';
import { IconCacheService } from '../../../core/services/icon-cache';
import {
  bucketFindings,
  CAT_LABEL,
  FindingRow,
  FindingTableComponent,
  onPlanFromEntries,
  rowsFromEntries,
} from '../../../shared/components/finding-table/finding-table';
import { BurstWindowsComponent } from '../burst-windows/burst-windows';
import { BurstMapAnchor } from '../burst-windows/burst.service';
import { DefensivesSectionComponent } from '../defensives-section/defensives-section';
import { GearSectionComponent } from '../gear-section/gear-section';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-analysis-result',
  imports: [
    FindingTableComponent,
    BurstWindowsComponent, DefensivesSectionComponent, GearSectionComponent,
  ],
  templateUrl: './analysis-result.html',
})
export class AnalysisResultComponent implements OnChanges {
  private readonly icons = inject(IconCacheService);

  readonly data = input.required<IAnalysisResult>();
  readonly topGear = input<EncounterGearStats | null>(null);
  /** Encounter id of the selected fight (not carried on AnalysisResult). */
  readonly encounterId = input<number>(0);
  /** True once the page has loaded top-parse positions, so cards can offer the map. */
  readonly mapReady = input<boolean>(false);

  /** Bubbles a burst window's "open map" request up to the page (which owns the panel). */
  readonly burstOpenMap = output<BurstMapAnchor>();

  private readonly bucketed = computed(() =>
    bucketFindings(this.data().findings, {
      spellId: name => this.data().cd_spell_ids?.[name] ?? null,
      collectRules: true,
    })
  );

  /** Rotation-rule findings as flat table rows. */
  protected readonly ruleRows = computed<FindingRow[]>(() =>
    this.bucketed().ruleFindings.map(f => ({
      severity: f.severity === 'critical' ? 'critical' : 'warning',
      what: f.label,
      measured: f.measured!,
      fix: f.details?.remedy,
    }))
  );

  /** Offensive cooldowns with issues, one row per finding. */
  protected readonly offensiveRows = computed<FindingRow[]>(() => rowsFromEntries(this.bucketed().entries, CAT_LABEL));
  /** Offensive cooldowns used on plan, shown as success chips. */
  protected readonly offensiveOnPlan = computed(() => onPlanFromEntries(this.bucketed().entries));

  ngOnChanges(): void {
    const d = this.data();
    if (d.ability_icons) this.icons.seedFromMap(d.ability_icons);
  }
}
