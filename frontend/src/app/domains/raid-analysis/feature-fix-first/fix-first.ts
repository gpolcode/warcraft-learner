import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { LoadResourceService } from '../../shared/ui-load-state/load-resource-service';
import { EmptyState } from '../../shared/ui-empty-state/empty-state';
import { FixFirstFeatureService } from '../data/fix-first/fix-first-feature-service';
import { CLOSED_GATE } from '../data/verdict/damage-estimate-service';
import type { CardRanking } from '../data/verdict/row-order-service';
import { DamageEstimatePipe } from '../ui-damage-estimate/damage-estimate-pipe';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-fix-first',
  imports: [TuiCardLarge, TuiHeader, TuiTitle, TuiIcon, EmptyState, DamageEstimatePipe],
  host: { class: 'block' },
  templateUrl: './fix-first.html',
})
export class FixFirst {
  private readonly loadRes = inject(LoadResourceService);
  private readonly fixFirst = inject(FixFirstFeatureService);

  readonly spec = input.required<string>();
  readonly rankings = input.required<readonly CardRanking[]>();
  readonly busyChange = output<boolean>();

  private readonly gate = this.loadRes.loadResource({
    params: () => this.spec(),
    load: spec => this.fixFirst.loadGate(spec),
    context: 'fix-first.loadGate',
    busyChange: this.busyChange,
  });

  protected readonly view = computed(() => this.fixFirst.view(this.rankings(), this.gate.value() ?? CLOSED_GATE));
}
