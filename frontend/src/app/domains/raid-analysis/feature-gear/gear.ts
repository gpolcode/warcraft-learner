import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { TuiButton, TuiIcon, TuiLink, TuiTitle } from '@taiga-ui/core';
import { TUI_COPY_TEXTS, TuiChip, TuiItemsWithMore } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { GameIcon } from '../ui-game-icon/game-icon';
import { LoadState } from '../../shared/ui-load-state/load-state';
import { GearFeatureService } from '../data/gear/gear-feature-service';
import { LoadResourceService } from '../../shared/ui-load-state/load-resource-service';

const COPY_TEXTS = ['Copy name', 'Copied. Paste it into the auction house search.'] as const;
const CHIP_LINES = 2;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-gear',
  imports: [TuiCardLarge, TuiHeader, TuiTitle, TuiButton, TuiIcon, TuiLink, TuiChip, TuiItemsWithMore, GameIcon, LoadState],
  templateUrl: './gear.html',
  providers: [{ provide: TUI_COPY_TEXTS, useValue: signal(COPY_TEXTS) }],
})
export class Gear {
  private readonly loadRes = inject(LoadResourceService);
  private readonly gear = inject(GearFeatureService);

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
  private readonly openChipLists = signal<ReadonlySet<readonly unknown[]>>(new Set());

  protected chipLines(list: readonly unknown[]): number {
    return this.openChipLists().has(list) ? Number.POSITIVE_INFINITY : CHIP_LINES;
  }

  protected showAllChips(list: readonly unknown[]): void {
    this.openChipLists.update(open => new Set(open).add(list));
  }
}
