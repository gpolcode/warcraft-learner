/**
 * Live slice runtime shell + its pure clip-correlation functions, colocated.
 *
 * `LiveCaptureFeatureService` is the imperative shell for the whole live feature: the
 * components (`wl-live-controls`, `wl-clip-panel`, `wl-clip-player`) inject only it. It
 * owns three concerns behind one service so the core gains no new media infrastructure:
 *
 *  1. Recording engine - `getDisplayMedia` + a per-segment `MediaRecorder` rolling
 *     buffer, MSE clip assembly, and `captureStream` export (spec sections 6.1, 7.1-7.4).
 *  2. Live-sync facade - a thin wrapper over the two core primitives (`LiveModeState`,
 *     `LiveReportSyncService`) so the toggle/status/poll wiring lives here, not on the page.
 *  3. Clip flyover state - the `MapFeatureService` analogue: panel open/close, the current
 *     `ClipHandle`, and the correlation context captured from `prepare`.
 *
 * Per the slice self-containment rule it imports only the two core live primitives, the
 * slice-local `ClipStore`, the models, and `logWarn`. Every derived value is a small,
 * exported, individually-tested pure function below - no separate vm file.
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { WclFight } from '../../../core/models/wcl.models';
import {
  CaptureProfile, ClipAnchor, ClipHandle, ClipRoll, ClipWindow, ClipWindowSpec, Segment,
  BUFFER_MS, DEFAULT_CAPTURE_PROFILE, DEFAULT_CLIP_ROLL, SEG_MS,
} from '../../../core/models/capture.models';
import { logWarn } from '../../../core/log';
import { LiveModeState } from '../../../core/services/live-mode-state';
import { LiveReportSyncService } from '../../../core/services/live-report-sync';
import { ClipStore, StoredClip } from './clip-store';

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
  reportStartTime: number, fightStartTime: number, windows: ClipWindowSpec[], roll: ClipRoll,
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

/** Whether the buffer's covered span overlaps `[fromMs, toMs]` at all. */
export function segmentsCover(segments: Segment[], fromMs: number, toMs: number): boolean {
  return segments.some(segment => segment.end > fromMs && segment.start < toMs);
}

/* --------------------------- media type helpers --------------------------- */

/** A video element exposing `captureStream`, which the DOM lib types only on canvas. */
interface CapturableMedia { captureStream(): MediaStream }

function mimeFor(profile: CaptureProfile): string {
  const candidate = `video/webm;codecs=${profile.codec}`;
  return MediaRecorder.isTypeSupported(candidate) ? candidate : 'video/webm';
}

/* ----------------------------- feature service ---------------------------- */

@Injectable({ providedIn: 'root' })
export class LiveCaptureFeatureService {
  private readonly liveMode = inject(LiveModeState);
  private readonly liveSync = inject(LiveReportSyncService);
  private readonly clipStore = inject(ClipStore);

  // --- recording engine state ---
  readonly isCapturing = signal(false);
  readonly isStarting = signal(false);
  readonly sourceLabel = signal('');
  readonly bufferSpanMs = signal(0);
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
  private segments: Segment[] = [];
  private segIdx = 0;
  private mimeType = 'video/webm';

  // --- live-sync facade ---
  readonly liveEnabled = this.liveMode.active.asReadonly();
  readonly status = signal('');

  // --- clip flyover state ---
  readonly open = signal(false);
  readonly extracting = signal(false);
  readonly handle = signal<ClipHandle | null>(null);

  private ctx: { reportCode: string; reportStartTime: number; fight: WclFight } | null = null;
  private currentAnchor: ClipAnchor | null = null;
  private readonly roll: ClipRoll = DEFAULT_CLIP_ROLL;

  /* ----------------------- live-sync facade methods ----------------------- */

  setLive(on: boolean): void { this.liveMode.active.set(on); }
  setStatus(message: string): void { this.status.set(message); }
  pollTriggers(): Observable<void> { return this.liveSync.pollTriggers(); }

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

  /** Stop recording and release the display stream; the buffer is kept for pending extraction. */
  stopRecording(): void {
    this.recording = false;
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.isCapturing.set(false);
    this.sourceLabel.set('');
  }

  /** Whether the rolling buffer's span overlaps a wall-clock span. */
  bufferCovers(fromMs: number, toMs: number): boolean {
    return segmentsCover(this.segments, fromMs, toMs);
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
      this.segments.push({ idx: this.segIdx++, start, end: Date.now(), blob: new Blob(chunks, { type: this.mimeType }) });
      this.evictOlderThan(Date.now() - BUFFER_MS);
      this.refreshBufferSpan();
      if (this.recording) this.cycleSegment();
    };
    recorder.start();
    setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, SEG_MS);
  }

  private evictOlderThan(cutoffMs: number): void {
    this.segments = this.segments.filter(segment => segment.end >= cutoffMs);
  }

  private refreshBufferSpan(): void {
    if (!this.segments.length) { this.bufferSpanMs.set(0); return; }
    const first = this.segments[0].start;
    const last = this.segments[this.segments.length - 1].end;
    this.bufferSpanMs.set(last - first);
  }

  /* --------------------------- clip flyover ------------------------------ */

  /**
   * Capture the correlation context for the resolved fight so a clip button can map a
   * bench offset to buffer time. Called from the page on every newly resolved fight.
   * With a buffer long enough to hold a whole fight plus upload lag, footage is still
   * present when the user opens a clip; the clip is then persisted on first view so it
   * also survives a reload (`resolveHandle`).
   */
  prepare(reportCode: string, reportStartTime: number, fight: WclFight): void {
    this.ctx = { reportCode, reportStartTime, fight };
  }

  /** True once recording is active and the buffer covers the prepared fight. Drives the `showClip` gate. */
  clipReady(): boolean {
    // Read the buffer-span signal so this re-evaluates as segments finalize (the buffer
    // grows to cover the fight); `segments` itself is a plain array, not a signal.
    this.bufferSpanMs();
    if (!this.isCapturing() || !this.ctx) return false;
    const { reportStartTime, fight } = this.ctx;
    const fightFrom = reportStartTime + fight.startTime;
    const fightTo = reportStartTime + fight.endTime;
    return this.bufferCovers(fightFrom, fightTo);
  }

  /** Open the clip panel at an anchor emitted by a card: resolve the clip, then show it. */
  async openClip(anchor: ClipAnchor): Promise<void> {
    this.currentAnchor = anchor;
    this.handle.set(null);
    this.open.set(true);
    if (!this.ctx) return;
    this.extracting.set(true);
    try {
      const window = this.clipWindowFor(anchor);
      const handle = await this.resolveHandle(this.ctx.reportCode, this.ctx.fight.id, window);
      this.handle.set(handle);
    } catch (err) {
      logWarn(`LiveCaptureFeatureService.openClip ${anchor.key}`, err);
    } finally {
      this.extracting.set(false);
    }
  }

  /** Export the current clip to one downloadable WebM file. */
  async download(): Promise<void> {
    const anchor = this.currentAnchor;
    if (!this.ctx || !anchor) return;
    try {
      const blob = await this.exportClip(this.clipWindowFor(anchor));
      if (blob) this.triggerDownload(blob, `${anchor.key}.webm`);
    } catch (err) {
      logWarn(`LiveCaptureFeatureService.download ${anchor.key}`, err);
    }
  }

  close(): void { this.open.set(false); }

  /** Drop the flyover context (a new analysis); recording is independent and untouched. */
  clear(): void {
    this.open.set(false);
    this.handle.set(null);
    this.ctx = null;
    this.currentAnchor = null;
  }

  private clipWindowFor(anchor: ClipAnchor): ClipWindow {
    const { reportStartTime, fight } = this.ctx!;
    const [window] = buildClipWindows(reportStartTime, fight.startTime, [anchor], this.roll);
    return window;
  }

  /** Prefer a persisted clip (survives reload); otherwise cut it from the live buffer and persist it. */
  private async resolveHandle(reportCode: string, fightId: number, window: ClipWindow): Promise<ClipHandle | null> {
    const stored = await this.clipStore.get(this.storeKey(reportCode, fightId, window.key));
    if (stored?.blobs.length) {
      const first = stored.segments[0];
      const last = stored.segments[stored.segments.length - 1];
      const durationS = (last.end - first.start) / 1000;
      return this.assemble(stored.blobs, segmentSeekOffset(window, first), durationS);
    }
    const segments = selectSegments(this.segments, window);
    if (!segments.length) return null;
    await this.persist(reportCode, fightId, window, segments);
    const startOffsetS = segmentSeekOffset(window, segments[0]);
    const durationS = (segments[segments.length - 1].end - segments[0].start) / 1000;
    return this.assemble(segments.map(segment => segment.blob), startOffsetS, durationS);
  }

  /** Select the overlapping segments and assemble them into one seekable clip. */
  async extractClip(window: ClipWindow): Promise<ClipHandle | null> {
    const segments = selectSegments(this.segments, window);
    if (!segments.length) return null;
    const startOffsetS = segmentSeekOffset(window, segments[0]);
    const durationS = (segments[segments.length - 1].end - segments[0].start) / 1000;
    return this.assemble(segments.map(segment => segment.blob), startOffsetS, durationS);
  }

  /** Re-record the assembled clip in real time into one clean, downloadable WebM (spec 7.4). */
  async exportClip(window: ClipWindow): Promise<Blob | null> {
    const handle = await this.extractClip(window);
    if (!handle) return null;
    return this.reRecord(handle);
  }

  private async persist(reportCode: string, fightId: number, window: ClipWindow, segments: Segment[]): Promise<void> {
    if (!segments.length) return;
    const blobs = segments.map(segment => segment.blob);
    const clip: StoredClip = {
      key: this.storeKey(reportCode, fightId, window.key),
      fightId, window, blobs,
      segments: segments.map(({ idx, start, end }) => ({ idx, start, end })),
      bytes: blobs.reduce((sum, blob) => sum + blob.size, 0),
      storedAt: Date.now(),
    };
    await this.clipStore.put(clip);
  }

  private storeKey(reportCode: string, fightId: number, windowKey: string): string {
    return `${reportCode}:${fightId}:${windowKey}`;
  }

  /**
   * Append whole self-contained segments to one `MediaSource` in `sequence` mode, which
   * re-bases each segment's timecodes so the assembled timeline starts at 0 with a finite
   * duration. Falls back to a single-blob object URL if any append throws (spec 7.3).
   */
  private async assemble(blobs: Blob[], startOffsetS: number, durationS: number): Promise<ClipHandle> {
    try {
      const source = new MediaSource();
      const url = URL.createObjectURL(source);
      await onceOpen(source);
      const buffer = source.addSourceBuffer(this.mimeType);
      buffer.mode = 'sequence';
      for (const blob of blobs) await appendAndWait(buffer, await blob.arrayBuffer());
      source.endOfStream();
      return { url, startOffsetS, durationS, mode: 'mse' };
    } catch (err) {
      logWarn('LiveCaptureFeatureService.assemble', err);
      const url = URL.createObjectURL(new Blob(blobs, { type: this.mimeType }));
      return { url, startOffsetS, durationS, mode: 'playlist' };
    }
  }

  private reRecord(handle: ClipHandle): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = handle.url;
      video.muted = true;
      video.onerror = () => reject(new Error('clip playback failed'));
      video.onloadedmetadata = () => {
        try {
          const stream = (video as unknown as CapturableMedia).captureStream();
          const recorder = new MediaRecorder(stream, { mimeType: this.mimeType, videoBitsPerSecond: this.captureProfile().bitrateBps });
          const out: Blob[] = [];
          recorder.ondataavailable = event => { if (event.data.size) out.push(event.data); };
          recorder.onstop = () => resolve(new Blob(out, { type: this.mimeType }));
          video.currentTime = handle.startOffsetS;
          recorder.start();
          void video.play();
          video.addEventListener('ended', () => recorder.stop(), { once: true });
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      };
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
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
