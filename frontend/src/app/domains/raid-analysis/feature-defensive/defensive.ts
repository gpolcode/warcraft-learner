import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ClipAnchor } from '../data/capture/capture.models';
import {
  FindingRow, FindingTable, OnPlanChip,
} from '../ui-finding-table/finding-table';
import { WindowComparison } from '../ui-window-comparison/window-comparison';
import { LoadState } from '../../shared/ui-load-state/load-state';
import { DefensiveFeatureService, DefensiveMapAnchor } from '../data/defensive/defensive-feature-service';
import { LoadResourceService } from '../../shared/ui-load-state/load-resource-service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-defensive',
  imports: [FindingTable, WindowComparison, LoadState],
  templateUrl: './defensive.html',
})
export class Defensive {
  private readonly loadRes = inject(LoadResourceService);
  private readonly defensive = inject(DefensiveFeatureService);

  readonly spec = input.required<string>();
  readonly encounterId = input.required<number>();
  readonly report = input.required<string>();
  readonly fight = input.required<number>();
  readonly player = input.required<number>();
  readonly showMap = input<boolean>(false);
  readonly showClip = input<boolean>(false);

  readonly openMap = output<DefensiveMapAnchor>();
  readonly openClip = output<ClipAnchor>();
  readonly busyChange = output<boolean>();
  readonly availableChange = output<boolean>();

  private readonly load = this.loadRes.loadResource({
    params: () => ({
      spec: this.spec(),
      encounterId: this.encounterId(),
      report: this.report(),
      fight: this.fight(),
      player: this.player(),
    }),
    load: p => this.defensive.loadAnalysisView(p.spec, p.encounterId, p.report, p.fight, p.player),
    context: 'defensive.loadAnalysisView',
    initialAvailable: true,
    busyChange: this.busyChange,
    availableChange: this.availableChange,
  });

  protected readonly available = this.load.available;
  protected readonly error = this.load.error;
  protected readonly windows = computed(() => this.load.value()?.windows ?? []);
  private readonly anchors = computed<DefensiveMapAnchor[]>(() => this.load.value()?.anchors ?? []);
  private readonly clipAnchors = computed<ClipAnchor[]>(() => this.load.value()?.clipAnchors ?? []);

  protected readonly findingRows = computed<FindingRow[]>(() => this.load.value()?.findingRows ?? []);
  protected readonly onPlan = computed<OnPlanChip[]>(() => this.load.value()?.onPlan ?? []);

  protected onOpenMap(index: number): void {
    const anchor = this.anchors()[index];
    if (anchor) this.openMap.emit(anchor);
  }

  protected onOpenClip(index: number): void {
    const anchor = this.clipAnchors()[index];
    if (anchor) this.openClip.emit(anchor);
  }

  protected onFindingMap(row: FindingRow): void {
    if (row.timestampS == null) return;
    this.openMap.emit({
      timeS: row.timestampS,
      refGameId: null,
    });
  }

  protected onFindingClip(row: FindingRow): void {
    if (row.timestampS == null) return;
    this.openClip.emit(this.defensive.defensiveFindingClipAnchor(row.timestampS));
  }
}
