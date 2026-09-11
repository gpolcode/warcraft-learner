import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LiveCaptureFeatureService } from '../domains/raid-analysis/data/live/live-capture-feature-service';
import { postRaidPage } from './post-raid-page';

describe('PostRaid page-leave warning', () => {
  function dispatchBeforeUnload(): Event {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    return event;
  }

  it('does not warn before leaving while live sync and recording are both off', () => {
    postRaidPage({});

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it('warns before leaving while live sync is following the latest pull', () => {
    postRaidPage({});
    TestBed.inject(LiveCaptureFeatureService).setLive(true);

    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);
  });

  it('warns before leaving while the game client is recording', () => {
    postRaidPage({});
    TestBed.inject(LiveCaptureFeatureService).isCapturing.set(true);

    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);
  });

  it('stops warning once live sync is switched off and recording has stopped', () => {
    postRaidPage({});
    const liveCapture = TestBed.inject(LiveCaptureFeatureService);
    liveCapture.setLive(true);
    liveCapture.setLive(false);

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });
});
