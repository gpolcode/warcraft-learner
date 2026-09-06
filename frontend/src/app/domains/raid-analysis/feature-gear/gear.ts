import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GameIcon } from '../ui-game-icon/game-icon';
import { Collapsible } from '../../shared/ui-collapsible/collapsible';
import { LoadState } from '../../shared/ui-load-state/load-state';
import { GearFeatureService } from '../data/gear/gear-feature-service';
import { LoadResourceService } from '../../shared/ui-load-state/load-resource-service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-gear',
  imports: [MatButtonModule, MatIconModule, GameIcon, Collapsible, LoadState],
  templateUrl: './gear.html',
})
export class Gear {
  private readonly loadRes = inject(LoadResourceService);
  private readonly gear = inject(GearFeatureService);
  private readonly clipboard = inject(Clipboard);

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

  // Partitioned in the component (semantic data only, no styling).
  protected readonly enchantIssues = computed(() => this.view().enchantRows.filter(row => row.status !== 'ok'));
  protected readonly enchantOnPlan = computed(() => this.view().enchantRows.filter(row => row.status === 'ok'));

  // Keyed by slot name, so the confirmation sits on the one row whose name was copied.
  protected readonly copiedSlot = signal<string | null>(null);
  protected readonly copyFailedSlot = signal<string | null>(null);

  protected copy(slotName: string, name: string): void {
    const succeeded = this.clipboard.copy(name);
    this.copiedSlot.set(succeeded ? slotName : null);
    this.copyFailedSlot.set(succeeded ? null : slotName);
  }
}
