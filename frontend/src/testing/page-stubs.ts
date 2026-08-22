/** Stubs the services and slice tokens a page shell needs before its template will render. */
import { InjectionToken, Provider, signal } from '@angular/core';
import { Result, missing } from '../app/core/result';

/** Callers pass their own `*_DATA_SOURCE` tokens: only the page layer may name a slice. */
export function stubBenchTokens(
  tokens: readonly InjectionToken<unknown>[],
  bench: Result<never> = missing('Not yet ingested.'),
): Provider[] {
  return tokens.map(token => ({
    provide: token,
    useValue: { getBench: () => Promise.resolve(bench) },
  }));
}

/** The surface both page templates read through the embedded map panel; the map has its own specs. */
export function mapFeatureStub(): unknown {
  return {
    clear: () => undefined,
    loadBench: () => Promise.resolve(),
    prepare: () => Promise.resolve(),
    openAt: () => undefined,
    close: () => undefined,
    ready: () => false,
    open: signal(false),
    overlayLoading: signal(false),
  };
}
