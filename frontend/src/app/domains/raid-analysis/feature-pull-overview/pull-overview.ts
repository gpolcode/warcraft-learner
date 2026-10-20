import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TuiButton, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { WclFight } from '../data/wcl/wcl.models';
import { ClipAnchor } from '../data/capture/capture.models';
import { MapAnchor } from '../data/map/map-feature-service';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import { FormatDamagePipe } from '../../shared/ui-format/format-damage-pipe';
import { LoadState } from '../../shared/ui-load-state/load-state';
import { PullOverviewFeatureService } from '../data/pull-overview/pull-overview-feature-service';
import { LoadResourceService } from '../../shared/ui-load-state/load-resource-service';
import { EmptyState } from '../../shared/ui-empty-state/empty-state';

// A missing bench costs only the reference range, so it is always available (no availableChange, unlike the other post-raid cards).
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-pull-overview',
  imports: [EmptyState, DecimalPipe, TuiCardLarge, TuiHeader, TuiTitle, TuiIcon, TuiButton, FormatDurationPipe, FormatDamagePipe, LoadState],
  templateUrl: './pull-overview.html',
  host: { class: 'block' },
})
export class PullOverview {
  private readonly loadRes = inject(LoadResourceService);
  private readonly service = inject(PullOverviewFeatureService);

  readonly spec = input.required<string>();
  readonly encounterId = input.required<number>();
  readonly report = input.required<string>();
  readonly player = input.required<number>();
  readonly fight = input.required<WclFight>();
  readonly showMap = input<boolean>(false);
  readonly showClip = input<boolean>(false);

  readonly openMap = output<MapAnchor>();
  readonly openClip = output<ClipAnchor>();
  readonly busyChange = output<boolean>();

  private readonly load = this.loadRes.loadResource({
    params: () => ({ spec: this.spec(), encounterId: this.encounterId(), report: this.report(), player: this.player(), fight: this.fight() }),
    load: ({ spec, encounterId, report, player, fight }) => this.service.loadView({ spec, encounterId, reportCode: report, playerId: player }, fight),
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
