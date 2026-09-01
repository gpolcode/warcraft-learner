import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FirstRunStore } from './first-run-store';

// A fresh instance per call keeps the cross-instance persistence assertions meaningful.
const freshStore = () => TestBed.runInInjectionContext(() => new FirstRunStore());

// Mirror KEYS in the source; the flag outlives deploys, so changing a key shows the caption again to every returning raider.
const POST_RAID_STORAGE_KEY = 'wl.firstRun.postRaid';

/** Stands in for a disabled, full, or otherwise unavailable localStorage. */
const STORAGE_FAILURE = 'localStorage unavailable';

/** Captures the store's logWarn output and keeps it out of the test log. */
function spyOnWarn() {
  return vi.spyOn(console, 'warn').mockImplementation(() => undefined);
}

describe('FirstRunStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports the page as not done before anything is stored', () => {
    expect(freshStore().isDone('postRaid')).toBe(false);
  });

  it('marks a page done under its stable key, and a fresh instance reads it back', () => {
    freshStore().markDone('postRaid');

    expect(localStorage.getItem(POST_RAID_STORAGE_KEY)).not.toBeNull();
    expect(freshStore().isDone('postRaid')).toBe(true);
  });

  it('answers done when the storage read fails, so the caption never pins itself on', () => {
    const warn = spyOnWarn();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error(STORAGE_FAILURE);
    });

    expect(freshStore().isDone('postRaid')).toBe(true);
    expect(warn).toHaveBeenCalled();
  });

  it('does not throw and logs a warning when the storage write fails', () => {
    const warn = spyOnWarn();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error(STORAGE_FAILURE);
    });

    expect(() => { freshStore().markDone('postRaid'); }).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });
});
