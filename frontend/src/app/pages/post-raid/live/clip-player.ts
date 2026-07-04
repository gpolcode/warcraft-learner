import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LiveCaptureFeatureService } from './live-capture.service';

/**
 * Inner leaf of the recording flyover (the video analogue of `map-canvas`). Injects only
 * the slice service and renders the assembled clip: a seekable `<video>` and a download
 * affordance. No inputs - it reads the current `ClipHandle` from the service.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-clip-player',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './clip-player.html',
})
export class ClipPlayerComponent {
  protected readonly clip = inject(LiveCaptureFeatureService);

  /** Seek to the window start once the clip's metadata (and duration) are known. */
  protected onLoaded(video: HTMLVideoElement): void {
    const handle = this.clip.handle();
    if (handle) video.currentTime = handle.startOffsetS;
  }
}
