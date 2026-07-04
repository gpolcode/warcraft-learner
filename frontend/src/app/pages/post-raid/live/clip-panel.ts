import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LiveCaptureFeatureService } from './live-capture.service';
import { ClipPlayerComponent } from './clip-player';

/**
 * Host for the recording flyover: a full-screen sheet on mobile, a right-side drawer on
 * desktop (the responsive switch is pure Tailwind `md:` utilities in the template). Mirrors
 * `MapPanelComponent` - it injects exactly one service (`LiveCaptureFeatureService`) and
 * renders the video player when the panel is open. The page renders this once and wires
 * other cards' `openClip` outputs into `openClip`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-clip-panel',
  imports: [MatButtonModule, MatIconModule, ClipPlayerComponent],
  templateUrl: './clip-panel.html',
})
export class ClipPanelComponent {
  protected readonly clip = inject(LiveCaptureFeatureService);
}
