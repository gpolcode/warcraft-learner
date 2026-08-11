import { describe, it, expect } from 'vitest';
import { Clipboard } from '@angular/cdk/clipboard';
import { provideRouter } from '@angular/router';
import { mountVm } from '../../../../testing/component-harness';
import { PageNavComponent } from './page-nav';

const DISCORD_HANDLE = 'elsahr';

function mount(copySucceeds: boolean) {
  const copied: string[] = [];
  const clipboard = { copy: (text: string) => (copied.push(text), copySucceeds) } as unknown as Clipboard;
  const { vm } = mountVm(PageNavComponent, {}, [
    provideRouter([]),
    { provide: Clipboard, useValue: clipboard },
  ]);
  return {
    copyDiscordHandle: () => (vm['copyDiscordHandle'] as () => void).call(vm),
    toggleFeedback: () => (vm['toggleFeedback'] as () => void).call(vm),
    feedbackOpen: () => (vm['feedbackOpen'] as () => boolean)(),
    copiedState: () => (vm['discordCopied'] as () => boolean)(),
    failedState: () => (vm['discordCopyFailed'] as () => boolean)(),
    copied,
  };
}

describe('PageNavComponent Discord handle copy', () => {
  it('copies the handle and confirms it when the clipboard write succeeds', () => {
    const nav = mount(true);

    nav.copyDiscordHandle();

    expect(nav.copied).toEqual([DISCORD_HANDLE]);
    expect(nav.copiedState()).toBe(true);
    expect(nav.failedState()).toBe(false);
  });

  it('shows the failure state and not the confirmation when the clipboard write fails', () => {
    const nav = mount(false);

    nav.copyDiscordHandle();

    expect(nav.copied).toEqual([DISCORD_HANDLE]);
    expect(nav.copiedState()).toBe(false);
    expect(nav.failedState()).toBe(true);
  });

  it('clears the confirmation when the submenu is toggled shut', () => {
    const nav = mount(true);
    nav.toggleFeedback();
    nav.copyDiscordHandle();

    nav.toggleFeedback();

    expect(nav.feedbackOpen()).toBe(false);
    expect(nav.copiedState()).toBe(false);
    expect(nav.failedState()).toBe(false);
  });
});
