import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-flyover-panel',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './flyover-panel.html',
})
export class FlyoverPanel {
  readonly heading = input.required<string>();
  readonly intro = input.required<string>();
  readonly loadingText = input<string>('');
  readonly closeLabel = input.required<string>();
  readonly closed = output();
}
