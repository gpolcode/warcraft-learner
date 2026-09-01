import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/** Resolves once every load reported to `PendingTasks` has settled, so a fire-and-forget load is awaited rather than a tick guessed at. */
export function whenStable(): Promise<void> {
  return TestBed.inject(ApplicationRef).whenStable();
}

/** `whenStable` alone never reaches the idle callback a `@defer (on idle)` trigger waits on. */
export async function whenDeferred(): Promise<void> {
  await whenStable();
  await new Promise(resolve => { setTimeout(resolve, 0); });
}
