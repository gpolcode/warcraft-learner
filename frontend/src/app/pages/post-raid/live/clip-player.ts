import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClipHandle } from '../../../core/models/capture.models';
import { LiveCaptureFeatureService, pipeIntoElement } from './live-capture.service';

/**
 * Inner leaf of the recording flyover. Injects only the slice service and renders the
 * resolved clip: it stitches the ordered segment blobs into its own `<video>` via MSE (the
 * MediaSource must attach to a real element to open, so assembly happens here, not in the
 * service), then seeks to the window start. Plus a download affordance.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-clip-player',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './clip-player.html',
})
export class ClipPlayerComponent {
  protected readonly clip = inject(LiveCaptureFeatureService);
  private readonly player = viewChild<ElementRef<HTMLVideoElement>>('player');

  /** The handle already piped into the element, so an effect re-fire never re-stitches it. */
  private piped: ClipHandle | null = null;

  constructor() {
    effect(() => {
      const handle = this.clip.handle();
      const el = this.player()?.nativeElement;
      if (!handle || !el || this.piped === handle) return;
      this.piped = handle;
      void pipeIntoElement(el, handle.blobs, handle.mimeType);
    });
  }

  /** Seek to the window start and begin looping once the stitched clip's metadata is known. */
  protected onLoaded(video: HTMLVideoElement): void {
    const handle = this.clip.handle();
    if (handle) {
      console.debug('[clip] player loadedmetadata: duration', video.duration, 'window', handle.startOffsetS, '-', handle.endOffsetS);
      video.currentTime = handle.startOffsetS;
      void video.play();
    }
  }

  /** Loop over the exact window `[startOffsetS, endOffsetS]` forever. */
  protected onTick(video: HTMLVideoElement): void {
    const handle = this.clip.handle();
    if (!handle) return;
    const end = Math.min(handle.endOffsetS, video.duration || handle.endOffsetS);
    if (video.currentTime >= end) video.currentTime = handle.startOffsetS;
  }

  /** Footage ended before the window end (window ran to the buffer edge): restart the loop. */
  protected onEnded(video: HTMLVideoElement): void {
    const handle = this.clip.handle();
    if (handle) { video.currentTime = handle.startOffsetS; void video.play(); }
  }
}
