import { describe, expect, it } from 'vitest';
import { clipDirName, planEviction, StoredClipMeta } from './clip-store';
import { ClipWindow } from '../../../core/models/capture.models';

const WINDOW: ClipWindow = { fromMs: 0, toMs: 1_000, key: 'w0' };
// A 1 GiB cap keeps the arithmetic legible: each fixture clip is a round fraction of it.
const CAP_BYTES = 1_024 * 1_024 * 1_024;
const HALF_GIB = CAP_BYTES / 2;
const QUARTER_GIB = CAP_BYTES / 4;

function meta(over: Partial<StoredClipMeta> = {}): StoredClipMeta {
  return {
    key: 'r:1:w0', fightId: 1, window: WINDOW, bytes: QUARTER_GIB, storedAt: 1_000,
    segments: [{ idx: 0, start: 0, end: 1_000 }], ...over,
  };
}

describe('planEviction', () => {
  it('evicts nothing while the incoming clip still fits under the cap', () => {
    const existing = [meta({ key: 'a', bytes: QUARTER_GIB })];
    expect(planEviction(existing, QUARTER_GIB, CAP_BYTES)).toEqual([]);
  });

  it('evicts the oldest fight first until the incoming clip fits', () => {
    const existing = [
      meta({ key: 'fight2', fightId: 2, bytes: HALF_GIB, storedAt: 2_000 }),
      meta({ key: 'fight1', fightId: 1, bytes: HALF_GIB, storedAt: 1_000 }),
    ];
    // Cap is full (2 x 0.5 GiB); a 0.25 GiB incoming clip needs the oldest fight gone.
    expect(planEviction(existing, QUARTER_GIB, CAP_BYTES)).toEqual(['fight1']);
  });

  it('breaks fight-id ties by oldest stored first', () => {
    const existing = [
      meta({ key: 'newer', fightId: 1, bytes: HALF_GIB, storedAt: 5_000 }),
      meta({ key: 'older', fightId: 1, bytes: HALF_GIB, storedAt: 1_000 }),
    ];
    expect(planEviction(existing, QUARTER_GIB, CAP_BYTES)).toEqual(['older']);
  });

  it('returns [] for an empty store when the clip fits', () => {
    expect(planEviction([], QUARTER_GIB, CAP_BYTES)).toEqual([]);
  });
});

describe('clipDirName', () => {
  it('replaces the colon-delimited key with a filesystem-safe name', () => {
    expect(clipDirName('AbCd1234:7:win-42')).toBe('AbCd1234_7_win-42');
  });
});
