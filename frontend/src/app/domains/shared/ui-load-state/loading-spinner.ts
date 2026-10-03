import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiLoader } from '@taiga-ui/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-loading-spinner',
  imports: [TuiLoader],
  host: { class: 'block p-12' },
  template: `<tui-loader size="l" [textContent]="message()" />`,
})
export class LoadingSpinner {
  readonly message = input<string>('');
}
