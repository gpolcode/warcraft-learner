import { describe, it, expect, vi, afterEach } from 'vitest';
import { Clipboard } from '@angular/cdk/clipboard';
import { provideRouter } from '@angular/router';
import { mountVm } from '../../../../testing/component-harness';
import { PageNavComponent } from './page-nav';

const DISCORD_HANDLE = 'elsahr';
const DISCORD_URL = 'https://discord.com/channels/@me';

function mount(copySucceeds: boolean) {
  const copied: string[] = [];
  const opened = vi.spyOn(window, 'open').mockReturnValue(null);
  const clipboard = { copy: (text: string) => (copied.push(text), copySucceeds) } as unknown as Clipboard;
  const { vm } = mountVm(PageNavComponent, {}, [
    provideRouter([]),
    { provide: Clipboard, useValue: clipboard },
  ]);
  return {
    messageOnDiscord: () => (vm['messageOnDiscord'] as () => void).call(vm),
    toggleFeedback: () => (vm['toggleFeedback'] as () => void).call(vm),
    feedbackOpen: () => (vm['feedbackOpen'] as () => boolean)(),
    copiedState: () => (vm['discordCopied'] as () => boolean)(),
    failedState: () => (vm['discordCopyFailed'] as () => boolean)(),
    copied,
    opened,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PageNavComponent Discord handle', () => {
  it('opens Discord and copies the handle when the clipboard write succeeds', () => {
    const nav = mount(true);

    nav.messageOnDiscord();

    expect(nav.opened).toHaveBeenCalledWith(DISCORD_URL, '_blank', 'noopener');
    expect(nav.copied).toEqual([DISCORD_HANDLE]);
    expect(nav.copiedState()).toBe(true);
    expect(nav.failedState()).toBe(false);
  });

  it('still opens Discord and shows the failure state when the clipboard write fails', () => {
    const nav = mount(false);

    nav.messageOnDiscord();

    expect(nav.opened).toHaveBeenCalledWith(DISCORD_URL, '_blank', 'noopener');
    expect(nav.copied).toEqual([DISCORD_HANDLE]);
    expect(nav.copiedState()).toBe(false);
    expect(nav.failedState()).toBe(true);
  });

  it('clears the confirmation when the submenu is toggled shut', () => {
    const nav = mount(true);
    nav.toggleFeedback();
    nav.messageOnDiscord();

    nav.toggleFeedback();

    expect(nav.feedbackOpen()).toBe(false);
    expect(nav.copiedState()).toBe(false);
    expect(nav.failedState()).toBe(false);
  });
});
