/**
 * WowheadTooltipsService
 *
 * Loads the Wowhead tooltip enhancer (the `wh-tooltips-config.js` global plus
 * the zamimg `tooltips.js` script) the first time a spell/item link renders,
 * rather than eagerly on every page. `tooltips.js` installs a DOM observer once
 * loaded, so a single injection decorates every link that renders afterward and
 * across client-side navigations. Loading it on demand keeps the ~100 kB of
 * config CSS + script off pages that render no Wowhead links (the landing page).
 *
 * `wl-game-icon` is the only component that emits a Wowhead link, so it is the
 * sole caller: it invokes `ensureLoaded()` after its first render.
 */
import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { logWarn } from '../log';

const CONFIG_SRC = 'wh-tooltips-config.js';
const TOOLTIPS_SRC = 'https://wow.zamimg.com/js/tooltips.js';

@Injectable({ providedIn: 'root' })
export class WowheadTooltipsService {
  private readonly document = inject(DOCUMENT);
  private loaded = false;

  /** Inject the tooltip scripts once; further calls are no-ops. */
  ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;

    const config = this.document.createElement('script');
    config.src = CONFIG_SRC;
    config.addEventListener('error', (err) => logWarn('wowhead tooltips config load', err));
    // tooltips.js reads the whTooltips global the config sets, so chain it off
    // config's load to guarantee the global exists before tooltips.js runs
    // (dynamically inserted scripts have no ordering guarantee otherwise).
    config.addEventListener('load', () => {
      const tooltips = this.document.createElement('script');
      tooltips.src = TOOLTIPS_SRC;
      tooltips.addEventListener('error', (err) => logWarn('wowhead tooltips script load', err));
      this.document.head.appendChild(tooltips);
    });
    this.document.head.appendChild(config);
  }
}
