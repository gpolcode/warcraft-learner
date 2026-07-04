import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LiveCaptureFeatureService } from './live-capture.service';
import { ClipPlayerComponent } from './clip-player';

/**
 * Host for the recording flyover: a right-side drawer on desktop, a full-screen sheet
 * on mobile. Mirrors `MapPanelComponent` - it injects exactly one service
 * (`LiveCaptureFeatureService`) and renders the video player when the panel is open. The
 * page renders this once and wires other cards' `openClip` outputs into `openClip`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-clip-panel',
  imports: [MatButtonModule, MatIconModule, ClipPlayerComponent],
  templateUrl: './clip-panel.html',
})
export class ClipPanelComponent {
  protected readonly clip = inject(LiveCaptureFeatureService);
  private readonly breakpoints = inject(BreakpointObserver);

  protected readonly isMobile = toSignal(
    this.breakpoints.observe('(max-width: 768px)').pipe(map(result => result.matches)),
    { initialValue: false },
  );
}
