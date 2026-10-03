import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmMarkerImports } from '@spartan-ng/helm/marker';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { map } from 'rxjs';

// Tailwind's md breakpoint, where the page leaves room for a side panel.
const PHONE = '(max-width: 47.99rem)';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-flyover-panel',
  imports: [HlmButtonImports, HlmDrawerImports, HlmMarkerImports, HlmSpinner, NgIcon],
  templateUrl: './flyover-panel.html',
})
export class FlyoverPanel {
  private readonly breakpoints = inject(BreakpointObserver);

  readonly heading = input.required<string>();
  readonly intro = input.required<string>();
  readonly loadingText = input<string>('');
  readonly closeLabel = input.required<string>();
  readonly closed = output();

  protected readonly phone = toSignal(this.breakpoints.observe(PHONE).pipe(map(state => state.matches)), {
    initialValue: this.breakpoints.isMatched(PHONE),
  });
}
