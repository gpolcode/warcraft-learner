import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LoadError } from '../../../core/result';

// `missing` renders as the bench-empty banner elsewhere, so this leaf excludes it.
export type RenderableLoadError = Extract<LoadError, { kind: 'transient' | 'permanent' }>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-load-error',
  imports: [MatIconModule],
  host: { class: 'block' },
  templateUrl: './load-error.html',
})
export class LoadErrorComponent {
  readonly error = input.required<RenderableLoadError>();
}
