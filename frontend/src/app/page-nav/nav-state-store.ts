import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { LoggerService } from '../domains/shared/util-logging/logger-service';

const NAV_COLLAPSED_KEY = 'wl.nav.collapsed';

@Injectable({ providedIn: 'root' })
export class NavStateStore {
  private readonly logger = inject(LoggerService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  saveCollapsed(collapsed: boolean): void {
    try {
      localStorage.setItem(NAV_COLLAPSED_KEY, JSON.stringify(collapsed));
    } catch (err) {
      this.logger.logWarn('NavStateStore.saveCollapsed', err);
    }
  }

  loadCollapsed(): boolean {
    // A prerendered page has no visitor, so it ships the default expanded rail.
    if (!this.isBrowser) return false;
    try {
      return localStorage.getItem(NAV_COLLAPSED_KEY) === 'true';
    } catch (err) {
      this.logger.logWarn('NavStateStore.loadCollapsed', err);
      return false;
    }
  }
}
