/**
 * Screen-capture / clip data shapes for the live recording slice.
 *
 * The recording logic lives in the `live` slice (`pages/post-raid/live/`), but its
 * data shapes belong here in `core/models` like every other view-model. A clip is a
 * presentational artifact keyed to a bench window the analysis already defines; none
 * of these types enter the analysis core.
 *
 * All wall-clock fields are unix-epoch milliseconds. The recorder and the WCL timeline
 * share one clock (same machine), so `report.startTime + fight.startTime` maps directly
 * onto a segment's `start`/`end` with no skew term.
 */

/** The anchor a feature card emits (and the page forwards) to open a clip. */
export interface ClipAnchor {
  timeS: number;
  windowLengthS: number;
  /** Stable per-window key, so the same window resolves the same persisted clip. */
  key: string;
}

/** A bench window reduced to what clip correlation needs. */
export interface ClipWindowSpec {
  timeS: number;
  windowLengthS: number;
  key: string;
}

/** Capture quality knobs passed to `getDisplayMedia` + `MediaRecorder`. */
export interface CaptureProfile {
  codec: 'vp9' | 'vp8';
  maxHeight: number;
  fps: number;
  bitrateBps: number;
}

/** One finalized WebM segment of the rolling buffer, tagged with wall-clock bounds. */
export interface Segment {
  idx: number;
  start: number;
  end: number;
  blob: Blob;
}

/** A wall-clock span to cut a clip for, plus a stable key for storage. */
export interface ClipWindow {
  fromMs: number;
  toMs: number;
  key: string;
}

/** A playable clip: an object URL, where to seek to reach the window start, its length, and how it was built. */
export interface ClipHandle {
  url: string;
  startOffsetS: number;
  durationS: number;
  mode: 'mse' | 'playlist';
}

/** Pre/post roll (ms) added around a window so the moment has lead-in and tail. */
export interface ClipRoll {
  preMs: number;
  postMs: number;
}

/**
 * Default capture profile. VP9 with hardware encode where available (the same path
 * Discord screenshare uses); VP8 is the fallback codec. 1080p / 30 fps / ~4 Mbps was
 * the working profile on the tester's hardware. Tunable, not hardcoded at the use site.
 */
export const DEFAULT_CAPTURE_PROFILE: CaptureProfile = {
  codec: 'vp9',
  maxHeight: 1080,
  fps: 30,
  bitrateBps: 4_000_000,
};

/**
 * Restart the recorder every `SEG_MS` so each segment is a complete, independently
 * decodable WebM (a single continuous recorder with `timeslice` cannot be assembled
 * via MSE). Larger favors fewer restarts; trim precision does not depend on it.
 */
export const SEG_MS = 3_000;

/**
 * Rolling-buffer retention. Must cover the longest fight plus WCL upload lag plus
 * pre-roll so a fight is still buffered when it finally appears in WCL.
 */
export const BUFFER_MS = 12 * 60 * 1_000;

/** Pre/post roll around a bench window. */
export const DEFAULT_CLIP_ROLL: ClipRoll = { preMs: 5_000, postMs: 5_000 };

/** Total on-disk budget for persisted clips before oldest-fight-first eviction kicks in. */
export const CLIP_STORE_CAP_BYTES = 2 * 1_024 * 1_024 * 1_024;
