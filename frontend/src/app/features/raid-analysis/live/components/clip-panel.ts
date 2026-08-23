import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FlyoverPanelComponent } from '../../../../shared/components/flyover-panel/flyover-panel';
import { LiveCaptureFeatureService } from '../facade/live-capture-feature-service';
import { ClipPlayerComponent } from './clip-player';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-clip-panel',
  imports: [FlyoverPanelComponent, ClipPlayerComponent],
  templateUrl: './clip-panel.html',
})
export class ClipPanelComponent {
  protected readonly clip = inject(LiveCaptureFeatureService);
}
