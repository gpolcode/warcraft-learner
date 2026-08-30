import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FlyoverPanel } from '../flyover-panel/flyover-panel';
import { BenchmarkExplainerStore } from '../../state/benchmark-explainer-store';

/** The app's one answer to "what am I being compared against", hosted once per page and opened from any card subtitle. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-benchmark-explainer',
  imports: [FlyoverPanel],
  templateUrl: './benchmark-explainer.html',
})
export class BenchmarkExplainer {
  protected readonly explainer = inject(BenchmarkExplainerStore);
}
