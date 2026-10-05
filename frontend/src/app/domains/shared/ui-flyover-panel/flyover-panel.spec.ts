import { afterEach, describe, expect, it } from 'vitest';
import { Component, WritableSignal, signal } from '@angular/core';
import { TUI_BREAKPOINT, TuiBreakpointMediaKey } from '@taiga-ui/core';
import { mountDom, MountedDom } from '../../../../testing/component-harness';
import { whenStable } from '../../../../testing/when-stable';
import { FlyoverPanel } from './flyover-panel';

@Component({
  selector: 'wl-video-flyover',
  imports: [FlyoverPanel],
  template: '<wl-flyover-panel heading="Replay" intro="Plays the moment." closeLabel="Close replay"><video></video></wl-flyover-panel>',
})
class VideoFlyover {}

interface Mounted {
  readonly dom: MountedDom;
  readonly window: WritableSignal<TuiBreakpointMediaKey>;
}

function mount(width: TuiBreakpointMediaKey): Mounted {
  const window = signal(width);
  const dom = mountDom(VideoFlyover, {}, [{ provide: TUI_BREAKPOINT, useValue: window }], { portals: true });
  return { dom, window };
}

function video(dom: MountedDom): HTMLElement {
  const element = dom.portal.query('video');
  if (!element) throw new Error('video: the panel is not in the portal layer');
  return element;
}

async function settle(): Promise<void> {
  await whenStable();
}

async function enterFullscreen(element: HTMLElement): Promise<void> {
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: element });
  element.dispatchEvent(new Event('fullscreenchange', { bubbles: true }));
  await settle();
}

async function exitFullscreen(element: HTMLElement): Promise<void> {
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
  element.dispatchEvent(new Event('fullscreenchange', { bubbles: true }));
  await settle();
}

async function resize({ window }: Mounted, width: TuiBreakpointMediaKey): Promise<void> {
  window.set(width);
  await settle();
}

describe('FlyoverPanel', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'fullscreenElement');
  });

  it('keeps its drawer open while the video inside it plays fullscreen', async () => {
    const { dom } = mount('desktopSmall');

    await enterFullscreen(video(dom));

    expect(dom.portal.query('tui-drawer video')).not.toBeNull();
  });

  it('keeps its drawer open once the video leaves fullscreen', async () => {
    const { dom } = mount('desktopSmall');
    const player = video(dom);

    await enterFullscreen(player);
    await exitFullscreen(player);

    expect(dom.portal.query('tui-drawer video')).not.toBeNull();
  });

  it('keeps its sheet while fullscreen widens a narrow window past the mobile breakpoint', async () => {
    const mounted = mount('mobile');

    await enterFullscreen(video(mounted.dom));
    await resize(mounted, 'desktopLarge');

    expect(mounted.dom.portal.query('tui-sheet-dialog video')).not.toBeNull();
  });

  it('swaps its sheet for the drawer when a window widens outside fullscreen', async () => {
    const mounted = mount('mobile');

    await resize(mounted, 'desktopLarge');

    expect(mounted.dom.portal.query('tui-drawer video')).not.toBeNull();
  });

  it('follows the window again once fullscreen ends', async () => {
    const mounted = mount('mobile');
    const player = video(mounted.dom);

    await enterFullscreen(player);
    await exitFullscreen(player);
    await resize(mounted, 'desktopLarge');

    expect(mounted.dom.portal.query('tui-drawer video')).not.toBeNull();
  });
});
