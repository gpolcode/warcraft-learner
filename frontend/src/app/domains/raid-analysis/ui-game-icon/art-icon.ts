import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-art-icon',
  host: { class: 'inline-flex items-center shrink-0 align-middle' },
  imports: [NgOptimizedImage],
  templateUrl: './art-icon.html',
})
export class ArtIcon {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
}
