import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TuiButton, TuiLoader, TuiPopup, TuiTitle } from '@taiga-ui/core';
import { TuiDrawer } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';

// Distinguishes the heading ids when the map and an export panel are open together.
let nextInstanceSeq = 0;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-flyover-panel',
  imports: [TuiPopup, TuiDrawer, TuiHeader, TuiTitle, TuiButton, TuiLoader],
  templateUrl: './flyover-panel.html',
})
export class FlyoverPanel {
  readonly heading = input.required<string>();
  readonly intro = input.required<string>();
  readonly loadingText = input<string>('');
  readonly closeLabel = input.required<string>();
  readonly closed = output();

  private readonly instanceId = `wl-flyover-panel-${nextInstanceSeq++}`;
  protected readonly headingId = `${this.instanceId}-heading`;
  protected readonly introId = `${this.instanceId}-intro`;
}
