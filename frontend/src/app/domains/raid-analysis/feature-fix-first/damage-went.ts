import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { LoadResourceService } from '../../shared/ui-load-state/load-resource-service';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import { FixFirstFeatureService } from '../data/fix-first/fix-first-feature-service';
import { CLOSED_GATE } from '../data/verdict/damage-estimate-service';
import type { CardRanking } from '../data/verdict/row-order-service';
import { DamageEstimatePipe } from '../ui-damage-estimate/damage-estimate-pipe';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-damage-went',
  imports: [TuiCardLarge, TuiHeader, TuiTitle, FormatDurationPipe, DamageEstimatePipe],
  // Hidden rather than empty, so the page's gap closes over a card with no content.
  host: { class: 'block', '[class.hidden]': '!view()' },
  templateUrl: './damage-went.html',
})
export class DamageWent {
  private readonly loadRes = inject(LoadResourceService);
  private readonly fixFirst = inject(FixFirstFeatureService);

  readonly spec = input.required<string>();
  readonly encounterId = input.required<number>();
  readonly report = input.required<string>();
  readonly fight = input.required<number>();
  readonly player = input.required<number>();
  readonly rankings = input.required<readonly CardRanking[]>();
  readonly busyChange = output<boolean>();

  private readonly pricing = this.loadRes.loadResource({
    params: () => ({ spec: this.spec(), encounterId: this.encounterId(), pull: { reportCode: this.report(), fightId: this.fight(), playerId: this.player() } }),
    load: p => this.fixFirst.loadPricing(p.spec, p.encounterId, p.pull),
    context: 'damage-went.loadPricing',
    busyChange: this.busyChange,
  });

  protected readonly view = computed(() => {
    const pricing = this.pricing.value();
    return this.fixFirst.damageView(this.rankings(), pricing?.deaths ?? [], pricing?.gate ?? CLOSED_GATE);
  });
}
