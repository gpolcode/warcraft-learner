import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-loading-spinner',
  imports: [HlmSpinner],
  template: `    <div class="flex flex-col items-center gap-3 p-12 text-muted">
      <hlm-spinner class="size-9" />
      @if (message()) {
        <span class="text-name">{{ message() }}</span>
      }
    </div>
`,
})
export class LoadingSpinner {
  readonly message = input<string>('');
}
