import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiLabel, TuiLoader, TuiTitle } from '@taiga-ui/core';
import { TuiStatus, TuiSwitch } from '@taiga-ui/kit';
import { LiveCaptureFeatureService } from '../data/live/live-capture-feature-service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-live-controls',
  imports: [FormsModule, TuiLabel, TuiSwitch, TuiTitle, TuiLoader, TuiStatus],
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
