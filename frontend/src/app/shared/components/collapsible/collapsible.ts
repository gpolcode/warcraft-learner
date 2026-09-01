import {
  afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, signal, viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

type CollapsibleMode = 'prose' | 'chips';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-collapsible',
  // Angular custom elements default to display:inline; block keeps the clamp + toggle stacked.
  host: { class: 'block' },
  imports: [MatIconModule],
  templateUrl: './collapsible.html',
})
export class Collapsible {
  private readonly destroyRef = inject(DestroyRef);
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  readonly mode = input<CollapsibleMode>('prose');

  protected readonly expanded = signal(false);
  protected readonly overflowing = signal(false);

  constructor() {
    afterNextRender(() => {
      const el = this.content().nativeElement;
      this.measure(el);
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => { this.measure(el); });
        observer.observe(el);
        this.destroyRef.onDestroy(() => { observer.disconnect(); });
      }
    });
  }

  // Once expanded the clamp is off and scrollHeight === clientHeight, so keep the last collapsed reading.
  protected measure(el: HTMLElement): void {
    if (this.expanded()) return;
    this.overflowing.set(el.scrollHeight - el.clientHeight > 1);
  }

  protected toggle(): void {
    this.expanded.update(open => !open);
  }
}
