import { inject, Injectable } from '@angular/core';
import { LoggerService } from '../observability/logger-service';

/** Which page's first-run copy a stored flag retires. */
export type FirstRunPage = 'postRaid';

const KEYS: Record<FirstRunPage, string> = {
  postRaid: 'wl.firstRun.postRaid',
};

const DONE = 'done';

@Injectable({ providedIn: 'root' })
export class FirstRunStore {
  private readonly logger = inject(LoggerService);

  isDone(page: FirstRunPage): boolean {
    try {
      return localStorage.getItem(KEYS[page]) !== null;
    } catch (err) {
      this.logger.logWarn('FirstRunStore.isDone', err);
      // Unreadable storage answers "done": flipping this to false pins the caption on every visit for anyone whose browser blocks site data.
      return true;
    }
  }

  markDone(page: FirstRunPage): void {
    try {
      localStorage.setItem(KEYS[page], DONE);
    } catch (err) {
      this.logger.logWarn('FirstRunStore.markDone', err);
    }
  }
}
