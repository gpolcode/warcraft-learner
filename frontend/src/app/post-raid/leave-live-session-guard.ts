import { inject, Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { LiveCaptureFeatureService } from '../domains/raid-analysis/data/live/live-capture-feature-service';
import { PostRaid } from './post-raid';

const LEAVE_PROMPT = 'Following the latest pull or recording the game client stops if you leave this page. Leave anyway?';

// Router navigation (e.g. the sidenav) bypasses beforeunload entirely, so an active session needs this separate confirmation.
@Injectable({ providedIn: 'root' })
export class LeaveLiveSessionGuard implements CanDeactivate<PostRaid> {
  private readonly liveCapture = inject(LiveCaptureFeatureService);

  canDeactivate(): boolean {
    return !this.liveCapture.hasActiveSession() || confirm(LEAVE_PROMPT);
  }
}
