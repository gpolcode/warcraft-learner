import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TuiTitle } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { LoadResourceService } from '../../shared/ui-load-state/load-resource-service';
import { LoadState } from '../../shared/ui-load-state/load-state';
import { EmptyState } from '../../shared/ui-empty-state/empty-state';
import { OddsPipe } from '../../shared/ui-format/odds-pipe';
import { ValidityFeatureService } from '../data/validity/validity-feature-service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-validity-report',
  imports: [DecimalPipe, TuiTitle, TuiBadge, TuiCardLarge, TuiHeader, LoadState, EmptyState, OddsPipe],
  templateUrl: './validity-report.html',
})
export class ValidityReport {
  private readonly loadRes = inject(LoadResourceService);
  private readonly validity = inject(ValidityFeatureService);

  readonly busyChange = output<boolean>();
  readonly availableChange = output<boolean>();

  private readonly load = this.loadRes.loadResource({
    params: () => ({}),
    load: () => this.validity.loadView(),
    context: 'validity.load',
    busyChange: this.busyChange,
    availableChange: this.availableChange,
  });

  protected readonly measurement = computed(() => this.load.value()?.measurement ?? null);
  protected readonly budget = computed(() => this.load.value()?.budget ?? null);
  protected readonly available = this.load.available;
  protected readonly error = this.load.error;
}
