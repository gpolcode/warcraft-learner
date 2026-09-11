import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LiveCaptureFeatureService } from '../domains/raid-analysis/data/live/live-capture-feature-service';
import { LeaveLiveSessionGuard } from './leave-live-session-guard';

describe('LeaveLiveSessionGuard', () => {
  function setup(): { guard: LeaveLiveSessionGuard; liveCapture: LiveCaptureFeatureService } {
    TestBed.configureTestingModule({ providers: [LeaveLiveSessionGuard, LiveCaptureFeatureService] });
    return { guard: TestBed.inject(LeaveLiveSessionGuard), liveCapture: TestBed.inject(LiveCaptureFeatureService) };
  }

  afterEach(() => { vi.restoreAllMocks(); });

  it('leaves without prompting while no live session is active', () => {
    const { guard } = setup();
    const confirmSpy = vi.spyOn(globalThis, 'confirm');

    expect(guard.canDeactivate()).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('defers to the prompt answer while live sync is following the latest pull', () => {
    const { guard, liveCapture } = setup();
    liveCapture.setLive(true);
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false);

    expect(guard.canDeactivate()).toBe(false);
  });

  it('defers to the prompt answer while the game client is recording', () => {
    const { guard, liveCapture } = setup();
    liveCapture.isCapturing.set(true);
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    expect(guard.canDeactivate()).toBe(true);
  });
});
