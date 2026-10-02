import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { LoadError } from '../util-http/result';

/** The hard-error kinds this panel renders; a null error is the waiting (not-yet-ingested) state. */
export type RenderableLoadError = Extract<LoadError, { kind: 'transient' | 'permanent' }>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-load-state',
  imports: [NgIcon],
  host: { class: 'block' },
  templateUrl: './load-state.html',
})
export class LoadState {
  readonly heading = input<string>('');
  readonly subtitle = input<string>('');
  readonly caption = input<string>('Built from the top logs for your spec.');
  readonly error = input<RenderableLoadError | null>(null);
}
