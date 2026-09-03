import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FlyoverPanel } from '../../shared/ui-flyover-panel/flyover-panel';
import { LiveCaptureFeatureService } from '../data/live/live-capture-feature-service';
import { ClipPlayer } from './clip-player';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-clip-panel',
  imports: [FlyoverPanel, ClipPlayer],
  templateUrl: './clip-panel.html',
})
export class ClipPanel {
  protected readonly clip = inject(LiveCaptureFeatureService);
}
