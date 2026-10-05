import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, output } from '@angular/core';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { TUI_BREAKPOINT, TuiButton, TuiLoader, TuiPopup, TuiTitle } from '@taiga-ui/core';
import { TuiSheetDialog } from '@taiga-ui/addon-mobile';
import { TuiDrawer } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';

// Distinguishes the heading ids when the map and an export panel are open together.
let nextInstanceSeq = 0;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-flyover-panel',
  imports: [NgTemplateOutlet, TuiPopup, TuiDrawer, TuiSheetDialog, TuiHeader, TuiTitle, TuiButton, TuiLoader],
  templateUrl: './flyover-panel.html',
})
export class FlyoverPanel {
  private readonly breakpoint = inject(TUI_BREAKPOINT);
  private readonly doc = inject(DOCUMENT);

  readonly heading = input.required<string>();
  readonly intro = input.required<string>();
  readonly loadingText = input<string>('');
  readonly closeLabel = input.required<string>();
  readonly closed = output();

  private readonly instanceId = `wl-flyover-panel-${nextInstanceSeq++}`;
  protected readonly headingId = `${this.instanceId}-heading`;
  protected readonly introId = `${this.instanceId}-intro`;

  // Fullscreen widens the window to the screen, and swapping layouts then would re-parent the fullscreen element, which ends fullscreen.
  protected readonly isMobile = linkedSignal<boolean, boolean>({
    source: () => this.breakpoint() === 'mobile',
    computation: (mobile, previous) => (previous && this.doc.fullscreenElement ? previous.value : mobile),
  });
}
