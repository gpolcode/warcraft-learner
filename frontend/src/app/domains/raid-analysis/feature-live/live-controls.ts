import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmMarkerImports } from '@spartan-ng/helm/marker';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { LiveCaptureFeatureService } from '../data/live/live-capture-feature-service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-live-controls',
  imports: [HlmSwitchImports, HlmFieldImports, HlmMarkerImports, HlmSpinner],
  templateUrl: './live-controls.html',
})
export class LiveControls {
  protected readonly capture = inject(LiveCaptureFeatureService);

  protected onLiveToggle(checked: boolean): void {
    this.capture.setLive(checked);
  }

  protected onRecordToggle(checked: boolean): void {
    if (checked) void this.capture.startRecording();
    else this.capture.stopRecording();
  }
}
