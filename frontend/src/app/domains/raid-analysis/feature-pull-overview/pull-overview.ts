import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WclFight } from '../data/wcl/wcl.models';
import { ClipAnchor } from '../data/capture/capture.models';
import { MapAnchor } from '../data/map/map-feature-service';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import { FormatDamagePipe } from '../../shared/ui-format/format-damage-pipe';
import { LoadState } from '../../shared/ui-load-state/load-state';
import { PullOverviewFeatureService } from '../data/pull-overview/pull-overview-feature-service';
import { LoadResourceService } from '../../shared/ui-load-state/load-resource-service';

// Needs no bench, so it is always available (no availableChange, unlike the other post-raid cards).
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-pull-overview',
  imports: [DecimalPipe, MatIconModule, MatButtonModule, FormatDurationPipe, FormatDamagePipe, LoadState],
  templateUrl: './pull-overview.html',
  host: { class: 'block' },
})
export class PullOverview {
  private readonly loadRes = inject(LoadResourceService);
  private readonly service = inject(PullOverviewFeatureService);

  readonly report = input.required<string>();
  readonly player = input.required<number>();
  readonly fight = input.required<WclFight>();
  readonly showMap = input<boolean>(false);
  readonly showClip = input<boolean>(false);

  readonly openMap = output<MapAnchor>();
  readonly openClip = output<ClipAnchor>();
  readonly busyChange = output<boolean>();

  private readonly load = this.loadRes.loadResource({
    params: () => ({ report: this.report(), player: this.player(), fight: this.fight() }),
    load: ({ report, player, fight }) => this.service.loadView(report, player, fight),
    context: 'pull-overview.loadView',
    busyChange: this.busyChange,
  });

  protected readonly view = this.load.value;
  protected readonly error = this.load.error;

  protected onOpenMap(timeS: number): void {
    this.openMap.emit({ timeS, windowLengthS: 0 });
  }

  protected onOpenClip(timeS: number, key: string): void {
    this.openClip.emit({ timeS, windowLengthS: 0, key });
  }
}
