/**
 * Live slice runtime shell + its pure clip-correlation functions, colocated.
 *
 * `LiveCaptureFeatureService` is the imperative shell for the whole live feature: the
 * components (`wl-live-controls`, `wl-clip-panel`, `wl-clip-player`) inject only it. It
 * owns the state the live feature needs so the core gains no new media infrastructure:
 *
 *  1. Recording engine - `getDisplayMedia` + a per-segment `MediaRecorder` rolling
 *     buffer, MSE clip assembly, and `captureStream` export (spec sections 6.1, 7.1-7.4).
 *  2. Live-sync toggle + status - the `LiveModeState` signal and the status line the
 *     controls strip renders; the polling pipeline itself lives on the page per the
 *     polling convention (`LiveReportSyncService` owns the timer machinery).
 *  3. Clip flyover state - the `MapFeatureService` analogue: panel open/close, the current
 *     `ClipHandle`, and the correlation context captured from `prepare`.
 *
 * Clips are session-scoped: a resolved clip is memoized in memory (so a window stays
 * openable after the rolling buffer moves past it) and nothing is written to disk,
 * matching the controls strip's "stays in this browser session" promise.
 *
 * Per the slice self-containment rule it imports only the core live-mode signal, the
 * models, and `logWarn`. Every derived value is a small, exported, individually-tested
 * pure function below - no separate vm file.
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { WclFight } from '../../../core/models/wcl.models';
import { ClipAnchor } from '../../../core/models/capture.models';
import { logWarn } from '../../../core/log';
import { LiveModeState } from '../../../core/services/live-mode-state';

/* ------------------------- slice-private data shapes ----------------------- */
/* Colocated like the other slices' anchor/view types (`BurstMapAnchor` in
 * burst.service.ts, `MapAnchor` in map.service.ts); only `ClipAnchor`, the shape the
 * cards emit across the layer boundary, lives in core/models. All wall-clock fields
 * are unix-epoch milliseconds: the recorder and the WCL timeline share one clock
 * (same machine), so `report.startTime + fight.startTime` maps directly onto a
 * segment's `start`/`end` with no skew term. */

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

/** A wall-clock span to cut a clip for, plus a stable key for the clip memo. */
export interface ClipWindow {
  fromMs: number;
  toMs: number;
  key: string;
}

/**
 * A resolved clip ready to play: the ordered segment blobs to stitch (via MSE on the
 * player's own `<video>`) plus the loop bounds within the assembled timeline. The
 * MediaSource must be attached to the real media element to open, so assembly happens in
 * the player, not here. Playback loops over `[startOffsetS, endOffsetS]`, which is the
 * exact requested window trimmed out of the whole-segment footage.
 */
export interface ClipHandle {
  blobs: Blob[];
  startOffsetS: number;
  endOffsetS: number;
  mimeType: string;
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

/**
 * Roll around a point-in-time anchor (a single cast, e.g. a defensive finding), which
 * has no duration of its own. Bench WINDOWS (burst/defensive) use their exact bounds
 * with no roll.
 */
export const POINT_CLIP_ROLL: ClipRoll = { preMs: 5_000, postMs: 5_000 };
/** No roll: a window anchor plays exactly its own span. */
export const NO_CLIP_ROLL: ClipRoll = { preMs: 0, postMs: 0 };

/** Grace period before a downloaded clip's object URL is revoked, so the browser can open the blob stream. */
const DOWNLOAD_URL_TTL_MS = 10_000;

/* ----------------------------- pure functions ----------------------------- */

/**
 * Absolute wall-clock start (unix epoch ms) of a bench offset. The recorder and the
 * WCL timeline share one clock, so this is an identity mapping with no skew term.
 */
export function absoluteWindowStart(reportStartTime: number, fightStartTime: number, timeS: number): number {
  return reportStartTime + fightStartTime + timeS * 1000;
}

/**
 * Map each bench window to an absolute wall-clock `ClipWindow`, widened by pre/post
 * roll. One clip per window (kept separate so each stays independently openable). Total
 * function - empty input yields `[]`.
 */
export function buildClipWindows(
  reportStartTime: number, fightStartTime: number, windows: ClipAnchor[], roll: ClipRoll,
): ClipWindow[] {
  return windows.map(window => {
    const absStart = absoluteWindowStart(reportStartTime, fightStartTime, window.timeS);
    return {
      fromMs: absStart - roll.preMs,
      toMs: absStart + window.windowLengthS * 1000 + roll.postMs,
      key: window.key,
    };
  });
}

/** Segments overlapping `[fromMs, toMs]`, sorted by start. Half-open on neither end (any touch counts). */
export function selectSegments(segments: Segment[], window: ClipWindow): Segment[] {
  return segments
    .filter(segment => segment.end > window.fromMs && segment.start < window.toMs)
    .sort((a, b) => a.start - b.start);
}

/**
 * Seconds to seek into an assembled (sequence-mode) clip so playback starts at the
 * window start. The assembled timeline re-bases to 0 at the first segment's start, so
 * the offset is how far into that first segment the window begins. Never negative.
 */
export function segmentSeekOffset(window: ClipWindow, firstSegment: { start: number } | undefined): number {
  if (!firstSegment) return 0;
  return Math.max(0, (window.fromMs - firstSegment.start) / 1000);
}

/**
 * Total wall-clock time lost between consecutive segments (the per-segment MediaRecorder
 * restart gaps). The MSE sequence-mode timeline is gapless, so a loop length computed
 * from a wall-clock span must shrink by this much to end on the same footage. Total
 * function - 0 for back-to-back, single, or no segments.
 */
export function interSegmentGapMs(segments: { start: number; end: number }[]): number {
  let gaps = 0;
  for (let i = 1; i < segments.length; i++) gaps += Math.max(0, segments[i].start - segments[i - 1].end);
  return gaps;
}

/** Whether the buffer's covered span overlaps `[fromMs, toMs]` at all. */
export function segmentsCover(segments: Segment[], fromMs: number, toMs: number): boolean {
  return segments.some(segment => segment.end > fromMs && segment.start < toMs);
}

/* --------------------------- media type helpers --------------------------- */

/** A video element exposing `captureStream`, which the DOM lib types only on canvas. */
interface CapturableMedia { captureStream(): MediaStream }

/**
 * Most specific supported recording mime: the profile codec, then VP8, then bare WebM.
 * The chosen value is also what MSE assembly re-declares via `addSourceBuffer`, which
 * rejects bare `video/webm`, so a codec-qualified pick keeps playback on the MSE path.
 */
function mimeFor(profile: CaptureProfile): string {
  const candidates = [`video/webm;codecs=${profile.codec}`, 'video/webm;codecs=vp8', 'video/webm'];
  return candidates.find(candidate => MediaRecorder.isTypeSupported(candidate)) ?? 'video/webm';
}

/* ----------------------------- feature service ---------------------------- */

@Injectable({ providedIn: 'root' })
export class LiveCaptureFeatureService {
  private readonly liveMode = inject(LiveModeState);

  // --- recording engine state ---
  readonly isCapturing = signal(false);
  readonly isStarting = signal(false);
  readonly sourceLabel = signal('');
  readonly captureProfile = signal<CaptureProfile>(DEFAULT_CAPTURE_PROFILE);

  /**
   * Drives the record toggle's `checked`. Includes `isStarting` so a cancelled picker
   * still moves the bound value (true while the picker is open, back to false on dismiss),
   * forcing Material to reset the switch - a plain `isCapturing` binding stays false the
   * whole time and never gets re-written after the user flips it.
   */
  readonly recordToggleOn = computed(() => this.isCapturing() || this.isStarting());

  private stream: MediaStream | null = null;
  private recording = false;
  private readonly segments = signal<Segment[]>([]);
  private segIdx = 0;
  private mimeType = 'video/webm';

  // --- live-sync toggle + status (rendered by wl-live-controls) ---
  readonly liveEnabled = this.liveMode.active.asReadonly();
  readonly status = signal('');

  // --- clip flyover state ---
  readonly open = signal(false);
  readonly handle = signal<ClipHandle | null>(null);

  private readonly ctx = signal<{ reportCode: string; reportStartTime: number; fight: WclFight } | null>(null);
  private currentAnchor: ClipAnchor | null = null;
  /** Clips already cut this session, keyed `reportCode:fightId:windowKey`; keeps a window openable after the buffer rolls past it. */
  private readonly resolved = new Map<string, ClipHandle>();

  setLive(on: boolean): void { this.liveMode.active.set(on); }
  setStatus(message: string): void { this.status.set(message); }

  /* ------------------------- recording engine ---------------------------- */

  /** Opt in to recording: prompt for a window, then run the rolling-buffer loop. */
  async startRecording(profile: CaptureProfile = DEFAULT_CAPTURE_PROFILE): Promise<void> {
    if (this.recording || this.isStarting()) return;
    this.isStarting.set(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const [track] = stream.getVideoTracks();
      await track.applyConstraints({ width: { max: 1920 }, height: { max: profile.maxHeight }, frameRate: { max: profile.fps } });
      this.stream = stream;
      this.captureProfile.set(profile);
      this.mimeType = mimeFor(profile);
      this.sourceLabel.set(track.label || 'your screen');
      // Sharing stopped from the browser UI (or the window closed) ends capture cleanly.
      track.addEventListener('ended', () => this.stopRecording());
      this.recording = true;
      this.isCapturing.set(true);
      this.cycleSegment();
    } catch (err) {
      // A user who dismisses the picker is not an error to surface loudly.
      logWarn('LiveCaptureFeatureService.startRecording', err);
    } finally {
      this.isStarting.set(false);
    }
  }

  /** Stop recording and release the display stream; the buffer is kept so covered fights stay clip-able. */
  stopRecording(): void {
    this.recording = false;
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.isCapturing.set(false);
    this.sourceLabel.set('');
  }

  /**
   * Record one `SEG_MS` segment, then roll immediately into the next. Each segment is a
   * complete WebM (own header + keyframe) so it appends cleanly during MSE assembly.
   */
  private cycleSegment(): void {
    if (!this.recording || !this.stream) return;
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(this.stream, { mimeType: this.mimeType, videoBitsPerSecond: this.captureProfile().bitrateBps });
    const start = Date.now();
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = () => {
      const segment: Segment = { idx: this.segIdx++, start, end: Date.now(), blob: new Blob(chunks, { type: this.mimeType }) };
      const cutoff = Date.now() - BUFFER_MS;
      this.segments.update(buffer => [...buffer.filter(existing => existing.end >= cutoff), segment]);
      if (this.recording) this.cycleSegment();
    };
    recorder.start();
    setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, SEG_MS);
  }

  /* --------------------------- clip flyover ------------------------------ */

  /**
   * Capture the correlation context for the resolved fight so a clip button can map a
   * bench offset to buffer time. Called from the page on every newly resolved fight.
   * With a buffer long enough to hold a whole fight plus upload lag, footage is still
   * present when the user opens a clip; the cut is then memoized so the window stays
   * openable after the buffer rolls on.
   */
  prepare(reportCode: string, reportStartTime: number, fight: WclFight): void {
    this.ctx.set({ reportCode, reportStartTime, fight });
  }

  /** True once the rolling buffer covers the prepared fight. Drives the `showClip` gate. */
  readonly clipReady = computed(() => {
    const ctx = this.ctx();
    if (!ctx) return false;
    const fightFrom = ctx.reportStartTime + ctx.fight.startTime;
    const fightTo = ctx.reportStartTime + ctx.fight.endTime;
    return segmentsCover(this.segments(), fightFrom, fightTo);
  });

  /** Open the clip panel at an anchor emitted by a card: resolve the clip, then show it. */
  openClip(anchor: ClipAnchor): void {
    this.currentAnchor = anchor;
    this.open.set(true);
    const ctx = this.ctx();
    if (!ctx) {
      this.handle.set(null);
      logWarn(`LiveCaptureFeatureService.openClip ${anchor.key}`, 'no correlation context (report not resolved)');
      return;
    }
    this.handle.set(this.resolveHandle(ctx.reportCode, ctx.fight.id, this.clipWindowFor(anchor)));
  }

  /** Export the clip currently in the player to one downloadable WebM file. */
  async download(): Promise<void> {
    const anchor = this.currentAnchor;
    const handle = this.handle();
    if (!anchor || !handle) return;
    try {
      this.triggerDownload(await this.reRecord(handle), `${anchor.key}.webm`);
    } catch (err) {
      logWarn(`LiveCaptureFeatureService.download ${anchor.key}`, err);
    }
  }

  close(): void { this.open.set(false); }

  /** Drop the flyover context and memoized clips (a new analysis); recording is independent and untouched. */
  clear(): void {
    this.open.set(false);
    this.handle.set(null);
    this.ctx.set(null);
    this.currentAnchor = null;
    this.resolved.clear();
  }

  private clipWindowFor(anchor: ClipAnchor): ClipWindow {
    const { reportStartTime, fight } = this.ctx()!;
    // A bench window plays its exact span; a point-in-time cast gets pre/post roll so it has
    // context on either side.
    const roll: ClipRoll = anchor.windowLengthS > 0 ? NO_CLIP_ROLL : POINT_CLIP_ROLL;
    const [window] = buildClipWindows(reportStartTime, fight.startTime, [anchor], roll);
    return window;
  }

  /** Serve a memoized cut, or cut the window from the rolling buffer and memoize it. */
  private resolveHandle(reportCode: string, fightId: number, window: ClipWindow): ClipHandle | null {
    const key = `${reportCode}:${fightId}:${window.key}`;
    const cached = this.resolved.get(key);
    if (cached) return cached;
    const segments = selectSegments(this.segments(), window);
    if (!segments.length) return null;
    const handle = this.handleFor(window, segments);
    this.resolved.set(key, handle);
    return handle;
  }

  /**
   * Build the playable handle: the loop starts where the window begins inside the first
   * segment (`startOffsetS`) and ends one window-span later, so playback trims the
   * whole-segment footage down to the exact requested window. The window span is
   * wall-clock while the assembled timeline is gapless, so the recorder-restart gaps
   * between the selected segments are subtracted from the loop length.
   */
  private handleFor(window: ClipWindow, segments: Segment[]): ClipHandle {
    const startOffsetS = segmentSeekOffset(window, segments[0]);
    const loopSpanS = (window.toMs - window.fromMs - interSegmentGapMs(segments)) / 1000;
    return {
      blobs: segments.map(segment => segment.blob),
      startOffsetS,
      endOffsetS: startOffsetS + Math.max(0, loopSpanS),
      mimeType: this.mimeType,
    };
  }

  /**
   * Re-record the assembled clip in real time into one clean WebM, playing only the exact
   * window `[startOffsetS, endOffsetS]` so the downloaded file matches the on-screen clip.
   */
  private async reRecord(handle: ClipHandle): Promise<Blob> {
    const video = document.createElement('video');
    video.muted = true;
    await pipeIntoElement(video, handle.blobs, handle.mimeType);
    if (video.readyState < 1) await onceEvent(video, 'loadedmetadata');
    return new Promise((resolve, reject) => {
      try {
        const stream = (video as unknown as CapturableMedia).captureStream();
        const recorder = new MediaRecorder(stream, { mimeType: handle.mimeType, videoBitsPerSecond: this.captureProfile().bitrateBps });
        const out: Blob[] = [];
        let stopped = false;
        const stop = (): void => { if (!stopped && recorder.state !== 'inactive') { stopped = true; recorder.stop(); } };
        recorder.ondataavailable = event => { if (event.data.size) out.push(event.data); };
        recorder.onstop = () => {
          releaseElement(video);
          resolve(new Blob(out, { type: handle.mimeType }));
        };
        // Stop at the window end (single pass, no loop for the downloaded file).
        video.addEventListener('timeupdate', () => { if (video.currentTime >= handle.endOffsetS) stop(); });
        video.addEventListener('ended', stop, { once: true });
        video.currentTime = handle.startOffsetS;
        recorder.start();
        void video.play();
      } catch (err) {
        releaseElement(video);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    // Revoking synchronously can invalidate the URL before the browser reads the blob.
    setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_TTL_MS);
  }
}

/**
 * Stitch the ordered segment blobs into `video` via MSE in `sequence` mode, which re-bases
 * each self-contained segment's timecodes so the assembled timeline starts at 0. The
 * MediaSource only reaches `sourceopen` once attached to a real media element, so the URL
 * is set on `video` FIRST, then the buffers are appended; after attachment the URL is
 * revoked (the element itself keeps the MediaSource alive). Falls back to a concatenated
 * single blob src if any append throws (plays the first segment in Chrome; opens fully in
 * VLC after a download).
 */
export async function pipeIntoElement(video: HTMLVideoElement, blobs: Blob[], mimeType: string): Promise<void> {
  releaseElement(video);
  try {
    const source = new MediaSource();
    const attachUrl = URL.createObjectURL(source);
    video.src = attachUrl;
    await onceOpen(source);
    URL.revokeObjectURL(attachUrl);
    const buffer = source.addSourceBuffer(mimeType);
    buffer.mode = 'sequence';
    for (const blob of blobs) await appendAndWait(buffer, await blob.arrayBuffer());
    source.endOfStream();
  } catch (err) {
    logWarn('pipeIntoElement: MSE assembly failed, falling back to single-blob src', err);
    video.src = URL.createObjectURL(new Blob(blobs, { type: mimeType }));
  }
}

/** Revoke a media element's blob src (a no-op for an already-revoked or non-blob src). */
export function releaseElement(video: HTMLVideoElement): void {
  if (video.src.startsWith('blob:')) URL.revokeObjectURL(video.src);
}

/** Resolve once a media element fires `event`. */
function onceEvent(el: HTMLMediaElement, event: string): Promise<void> {
  return new Promise(resolve => el.addEventListener(event, () => resolve(), { once: true }));
}

/** Resolve once a `MediaSource` reaches `sourceopen`. */
function onceOpen(source: MediaSource): Promise<void> {
  return new Promise(resolve => source.addEventListener('sourceopen', () => resolve(), { once: true }));
}

/** Append one buffer and resolve on `updateend` (SourceBuffer appends are async). */
function appendAndWait(buffer: SourceBuffer, data: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    buffer.addEventListener('updateend', () => resolve(), { once: true });
    buffer.addEventListener('error', () => reject(new Error('append failed')), { once: true });
    buffer.appendBuffer(data);
  });
}
