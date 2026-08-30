import { Injectable, signal } from '@angular/core';

/** Open state of the one benchmark flyover every card subtitle triggers; per-component state would stack a second identical panel over the first. */
@Injectable({ providedIn: 'root' })
export class BenchmarkExplainerStore {
  readonly open = signal(false);

  show(): void {
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }
}
