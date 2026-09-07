import { describe, expect, it } from 'vitest';
import { signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mountDom, MountedDom } from '../../../../testing/component-harness';
import { whenStable } from '../../../../testing/when-stable';
import { ClipHandle, DownloadOutcome, LiveCaptureFeatureService } from '../data/live/live-capture-feature-service';
import { ClipPlayer } from './clip-player';

const FULL_PULL_BUTTON = 'button[mat-stroked-button]';
const NO_FOOTAGE_MESSAGE = 'No footage for this pull.';
const DOWNLOAD_FAILED_MESSAGE = 'Download failed. Retry it.';
const HANDLE: ClipHandle = { blob: new Blob([]), startOffsetS: 0, endOffsetS: 1 };

interface Mounted {
  readonly dom: MountedDom;
  readonly messages: string[];
}

function mount(outcome: DownloadOutcome): Mounted {
  const messages: string[] = [];
  const clip = {
    playbackFailed: signal(false),
    preparing: signal(false),
    handle: signal<ClipHandle | null>(HANDLE),
    clipReady: signal(true),
    downloadFullPull: async (): Promise<DownloadOutcome> => outcome,
    download: () => undefined,
    onPlaybackError: () => undefined,
  };

  const dom = mountDom(ClipPlayer, {}, [
    { provide: LiveCaptureFeatureService, useValue: clip },
    { provide: MatSnackBar, useValue: { open: (message: string) => { messages.push(message); } } },
  ]);
  return { dom, messages };
}

async function saveFullPull(outcome: DownloadOutcome): Promise<string[]> {
  const { dom, messages } = mount(outcome);
  dom.click(FULL_PULL_BUTTON);
  await whenStable();
  return messages;
}

describe('ClipPlayer full-pull download', () => {
  it('says the buffer holds nothing for the pull, so the reader does not retry a download that cannot work', async () => {
    expect(await saveFullPull('no-footage')).toEqual([NO_FOOTAGE_MESSAGE]);
  });

  it('names the failure and the retry when the footage will not remux', async () => {
    expect(await saveFullPull('failed')).toEqual([DOWNLOAD_FAILED_MESSAGE]);
  });

  it('stays silent on a saved file, which the browser reports on its own', async () => {
    expect(await saveFullPull('ok')).toEqual([]);
  });
});
