/**
 * Slice-local persistence for extracted clips (not the raw rolling buffer).
 *
 * A clip is the ordered set of WebM segments overlapping a bench window, copied out of
 * the rolling buffer while it still covers that fight so it survives a reload and the
 * buffer rolling on. Storage is OPFS: one sub-directory per clip key holding a
 * `manifest.json` plus `0.webm`, `1.webm`, ... The impure OPFS surface is kept thin;
 * the eviction decision is the pure, tested `planEviction` below (lowest-altitude rule).
 *
 * Keyed by `reportCode:fightId:windowKey`. A total-size cap evicts oldest-fight-first.
 */
import { Injectable, signal } from '@angular/core';
import { ClipWindow, CLIP_STORE_CAP_BYTES } from '../../../core/models/capture.models';
import { logWarn } from '../../../core/log';

/** Wall-clock bounds of one stored segment, so playback offsets survive a reload. */
export interface SegmentBounds {
  idx: number;
  start: number;
  end: number;
}

/** Lightweight record describing a stored clip, without its blobs. */
export interface StoredClipMeta {
  key: string;
  fightId: number;
  window: ClipWindow;
  bytes: number;
  storedAt: number;
  segments: SegmentBounds[];
}

/** A stored clip plus the ordered segment blobs that make it up. */
export interface StoredClip extends StoredClipMeta {
  blobs: Blob[];
}

/** Root directory name under OPFS for all persisted clips. */
const CLIP_DIR = 'clips';
const MANIFEST = 'manifest.json';

/**
 * Which existing keys to evict so `incomingBytes` fits under `capBytes`. Oldest fight
 * first (then oldest stored), matching the raid-night lifecycle: last night's early
 * pulls go before tonight's. Total function - returns `[]` when nothing must go.
 */
export function planEviction(existing: StoredClipMeta[], incomingBytes: number, capBytes: number): string[] {
  const total = existing.reduce((sum, meta) => sum + meta.bytes, 0);
  let over = total + incomingBytes - capBytes;
  if (over <= 0) return [];
  const oldestFirst = [...existing].sort((a, b) => a.fightId - b.fightId || a.storedAt - b.storedAt);
  const evict: string[] = [];
  for (const meta of oldestFirst) {
    if (over <= 0) break;
    evict.push(meta.key);
    over -= meta.bytes;
  }
  return evict;
}

/** Turn a `reportCode:fightId:windowKey` clip key into a safe OPFS directory name. */
export function clipDirName(key: string): string {
  return key.replace(/[^A-Za-z0-9_-]/g, '_');
}

@Injectable({ providedIn: 'root' })
export class ClipStore {
  private readonly capBytes = CLIP_STORE_CAP_BYTES;

  /** Remaining budget in bytes, refreshed after each put/evict for the UI quota hint. */
  readonly remainingBytes = signal(this.capBytes);

  private async root(): Promise<FileSystemDirectoryHandle> {
    const opfs = await navigator.storage.getDirectory();
    return opfs.getDirectoryHandle(CLIP_DIR, { create: true });
  }

  /** Persist a clip, evicting oldest-fight-first to stay under the size cap. */
  async put(clip: StoredClip): Promise<void> {
    try {
      const existing = await this.list();
      for (const key of planEviction(existing, clip.bytes, this.capBytes)) await this.evict(key);

      const root = await this.root();
      const dir = await root.getDirectoryHandle(clipDirName(clip.key), { create: true });
      for (let i = 0; i < clip.blobs.length; i++) await this.writeFile(dir, `${i}.webm`, clip.blobs[i]);
      const meta: StoredClipMeta = {
        key: clip.key, fightId: clip.fightId, window: clip.window,
        bytes: clip.bytes, storedAt: clip.storedAt, segments: clip.segments,
      };
      await this.writeFile(dir, MANIFEST, new Blob([JSON.stringify(meta)], { type: 'application/json' }));
      await this.refreshBudget();
    } catch (err) {
      logWarn(`ClipStore.put ${clip.key}`, err);
    }
  }

  /** Read a stored clip back (blobs + window), or null when absent. */
  async get(key: string): Promise<StoredClip | null> {
    try {
      const root = await this.root();
      const dir = await root.getDirectoryHandle(clipDirName(key));
      const meta = await this.readManifest(dir);
      if (!meta) return null;
      const blobs: Blob[] = [];
      for (let i = 0; i < meta.segments.length; i++) {
        const handle = await dir.getFileHandle(`${i}.webm`);
        blobs.push(await handle.getFile());
      }
      return { ...meta, blobs };
    } catch (err) {
      logWarn(`ClipStore.get ${key}`, err);
      return null;
    }
  }

  /** Metadata for every stored clip (no blobs). */
  async list(): Promise<StoredClipMeta[]> {
    const out: StoredClipMeta[] = [];
    try {
      const root = await this.root();
      for await (const [, handle] of entriesOf(root)) {
        if (handle.kind !== 'directory') continue;
        const meta = await this.readManifest(handle as FileSystemDirectoryHandle);
        if (meta) out.push(meta);
      }
    } catch (err) {
      logWarn('ClipStore.list', err);
    }
    return out;
  }

  /** Delete one stored clip. */
  async evict(key: string): Promise<void> {
    try {
      const root = await this.root();
      await root.removeEntry(clipDirName(key), { recursive: true });
      await this.refreshBudget();
    } catch (err) {
      logWarn(`ClipStore.evict ${key}`, err);
    }
  }

  private async refreshBudget(): Promise<void> {
    const used = (await this.list()).reduce((sum, meta) => sum + meta.bytes, 0);
    this.remainingBytes.set(Math.max(0, this.capBytes - used));
  }

  private async readManifest(dir: FileSystemDirectoryHandle): Promise<StoredClipMeta | null> {
    try {
      const handle = await dir.getFileHandle(MANIFEST);
      const text = await (await handle.getFile()).text();
      return JSON.parse(text) as StoredClipMeta;
    } catch {
      return null;
    }
  }

  private async writeFile(dir: FileSystemDirectoryHandle, name: string, blob: Blob): Promise<void> {
    const handle = await dir.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  }
}

/**
 * Iterate a directory's entries. OPFS exposes async iteration via `entries()`, which
 * the DOM lib does not yet type on `FileSystemDirectoryHandle`; this narrows it once.
 */
function entriesOf(dir: FileSystemDirectoryHandle): AsyncIterable<[string, FileSystemHandle]> {
  return (dir as unknown as { entries(): AsyncIterable<[string, FileSystemHandle]> }).entries();
}
