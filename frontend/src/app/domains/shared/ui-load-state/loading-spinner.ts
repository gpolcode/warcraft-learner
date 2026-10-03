import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmMarkerImports } from '@spartan-ng/helm/marker';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-loading-spinner',
  imports: [HlmMarkerImports, HlmSpinner],
  host: { class: 'block' },
  template: `<div hlmMarker role="status" class="justify-center py-12">
      <span hlmMarkerIcon><hlm-spinner /></span>
      @if (message()) {
        <span hlmMarkerContent class="shimmer">{{ message() }}</span>
      }
    </div>`,
})
export class LoadingSpinner {
  readonly message = input<string>('');
}
