import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { TuiButton, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiChip, TuiToastService } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { GameIcon } from '../ui-game-icon/game-icon';
import { Collapsible } from '../../shared/ui-collapsible/collapsible';
import { LoadState } from '../../shared/ui-load-state/load-state';
import { GearFeatureService } from '../data/gear/gear-feature-service';
import { LoadResourceService } from '../../shared/ui-load-state/load-resource-service';

const COPIED_MESSAGE = 'Copied to clipboard. Paste it into the auction house search.';
const COPY_FAILED_MESSAGE = 'Clipboard write failed. Retry the copy.';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-gear',
  imports: [TuiCardLarge, TuiHeader, TuiTitle, TuiButton, TuiIcon, TuiChip, GameIcon, Collapsible, LoadState],
  templateUrl: './gear.html',
})
export class Gear {
  private readonly loadRes = inject(LoadResourceService);
  private readonly gear = inject(GearFeatureService);
  private readonly clipboard = inject(Clipboard);
  private readonly toast = inject(TuiToastService);

  readonly spec = input.required<string>();
  readonly encounterId = input.required<number>();
  readonly report = input<string>('');
  readonly fight = input<number>(0);
  readonly player = input<number>(0);

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
    load: p => p.report && p.fight && p.player
      ? this.gear.loadComparisonView(p.spec, p.encounterId, p.report, p.fight, p.player)
      : this.gear.loadBenchView(p.spec, p.encounterId),
    context: 'gear.load',
    busyChange: this.busyChange,
    availableChange: this.availableChange,
  });

  protected readonly view = computed(() => this.load.value() ?? this.gear.emptyGearView());
  // available() is the load outcome, not a view flag: true only once an ok result lands.
  protected readonly available = this.load.available;
  protected readonly error = this.load.error;

  protected readonly enchantIssues = computed(() => this.view().enchantRows.filter(row => row.status !== 'ok'));
  protected readonly enchantOnPlan = computed(() => this.view().enchantRows.filter(row => row.status === 'ok'));

  protected copy(name: string): void {
    this.toast.open(this.clipboard.copy(name) ? COPIED_MESSAGE : COPY_FAILED_MESSAGE).subscribe();
  }
}
