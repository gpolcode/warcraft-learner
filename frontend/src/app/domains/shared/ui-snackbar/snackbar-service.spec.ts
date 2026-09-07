import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SnackbarService } from './snackbar-service';

const NOTE = 'note text';
const CONFIRMATION = 'Copied to clipboard. Paste it into your Northern Sky note.';
const COPY_FAILED_MESSAGE = 'Clipboard write failed. Retry the copy.';
const CONFIRM_DURATION_MS = 3000;
const WARN_DURATION_MS = 6000;

interface Opened {
  readonly message: string;
  readonly config: MatSnackBarConfig | undefined;
}

interface Harness {
  readonly svc: SnackbarService;
  readonly opened: Opened[];
  readonly copies: string[];
}

function harness(copySucceeds = true): Harness {
  const opened: Opened[] = [];
  const copies: string[] = [];
  const snackBar = {
    open: (message: string, _action?: string, config?: MatSnackBarConfig) => { opened.push({ message, config }); },
  } as unknown as MatSnackBar;
  const clipboard = {
    copy: (text: string) => { copies.push(text); return copySucceeds; },
  } as unknown as Clipboard;

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [
    { provide: MatSnackBar, useValue: snackBar },
    { provide: Clipboard, useValue: clipboard },
  ] });
  return { svc: TestBed.inject(SnackbarService), opened, copies };
}

describe('SnackbarService dismissal', () => {
  it('gives a confirmation a duration, since Material would otherwise leave it up with no way to dismiss it', () => {
    const { svc, opened } = harness();

    svc.confirm(CONFIRMATION);

    expect(opened).toHaveLength(1);
    expect(opened[0]?.config?.duration).toBe(CONFIRM_DURATION_MS);
  });

  it('holds a warning longer than a confirmation, and announces it assertively', () => {
    const { svc, opened } = harness();

    svc.warn(COPY_FAILED_MESSAGE);

    expect(opened[0]?.config?.duration).toBe(WARN_DURATION_MS);
    expect(opened[0]?.config?.politeness).toBe('assertive');
  });
});

describe('SnackbarService copyAndConfirm', () => {
  it('hands the clipboard the text and confirms with the caller\'s paste target', () => {
    const { svc, opened, copies } = harness();

    svc.copyAndConfirm(NOTE, CONFIRMATION);

    expect(copies).toEqual([NOTE]);
    expect(opened.map(entry => entry.message)).toEqual([CONFIRMATION]);
  });

  it('reports the refused write instead of the confirmation', () => {
    const { svc, opened } = harness(false);

    svc.copyAndConfirm(NOTE, CONFIRMATION);

    expect(opened.map(entry => entry.message)).toEqual([COPY_FAILED_MESSAGE]);
    expect(opened[0]?.config?.duration).toBe(WARN_DURATION_MS);
  });
});
