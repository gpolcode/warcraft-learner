import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FindingRow, FindingTable, OnPlanChip } from '../ui-finding-table/finding-table';
import { ButtonTable } from '../ui-button-table/button-table';
import type { ButtonRow } from '../data/rotation/priority-list/list-finding-service';
import { LoadState } from '../../shared/ui-load-state/load-state';
import { RotationFeatureService } from '../data/rotation/rotation-feature-service';
import { LoadResourceService } from '../../shared/ui-load-state/load-resource-service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-rotation',
  imports: [ButtonTable, FindingTable, LoadState],
  templateUrl: './rotation.html',
})
export class Rotation {
  private readonly loadRes = inject(LoadResourceService);
  private readonly rotation = inject(RotationFeatureService);

  readonly spec = input.required<string>();
  readonly encounterId = input.required<number>();
  readonly reportCode = input.required<string>();
  readonly fightId = input.required<number>();
  readonly playerId = input.required<number>();

  readonly busyChange = output<boolean>();
  readonly availableChange = output<boolean>();

  private readonly load = this.loadRes.loadResource({
    params: () => ({
      spec: this.spec(),
      encounterId: this.encounterId(),
      reportCode: this.reportCode(),
      fightId: this.fightId(),
      playerId: this.playerId(),
    }),
    load: p => this.rotation.loadPlayerView(p.spec, p.encounterId, p.reportCode, p.fightId, p.playerId),
    context: 'rotation.loadPlayerView',
    initialAvailable: true,
    busyChange: this.busyChange,
    availableChange: this.availableChange,
  });

  protected readonly available = this.load.available;
  protected readonly error = this.load.error;
  protected readonly buttonRows = computed<ButtonRow[]>(() => this.load.value()?.buttonRows ?? []);
  protected readonly downtimeRows = computed<FindingRow[]>(() => this.load.value()?.downtimeRows ?? []);
  protected readonly offensiveRows = computed<FindingRow[]>(() => this.load.value()?.offensiveRows ?? []);
  protected readonly onPlan = computed<OnPlanChip[]>(() => this.load.value()?.onPlan ?? []);
}
