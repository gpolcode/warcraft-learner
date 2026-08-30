import { signal } from '@angular/core';
import { FirstRunPage, FirstRunStore } from '../../core/state/first-run-store';

/** One page's first-run strip: shown until that page first puts a result on screen, then retired for good in this browser. */
export class FirstRunGate {
  private readonly store: FirstRunStore;
  private readonly page: FirstRunPage;
  private readonly _visible = signal(false);

  readonly visible = this._visible.asReadonly();

  constructor(store: FirstRunStore, page: FirstRunPage) {
    this.store = store;
    this.page = page;
    this._visible.set(!store.isDone(page));
  }

  settleWhen(resultOnScreen: boolean): void {
    if (!resultOnScreen || !this._visible()) return;
    this._visible.set(false);
    this.store.markDone(this.page);
  }
}
