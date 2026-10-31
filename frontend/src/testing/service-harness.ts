import { InjectionToken, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataSource } from '../app/domains/raid-analysis/data/data-source/data-source';
import { Result } from '../app/domains/shared/util-http/result';
import { WclApiService } from '../app/domains/raid-analysis/data/wcl/wcl-api-service';

/** The reads every pull model makes beyond a card's own; a fake that leaves them out sees no roles and no resurrects. */
const PULL_MODEL_READS = {
  getPlayerDetails: async () => ({}),
  getResurrects: async () => [],
};

// Delegates to the fake instead of copying it, so a class fake keeps its prototype methods and its own `this`.
function withPullModelReads(wcl: object): object {
  const merged = Object.create(wcl) as Record<string, unknown>;
  for (const [name, read] of Object.entries(PULL_MODEL_READS)) if (!(name in wcl)) merged[name] = read;
  return merged;
}

export function featureService<T, S>(
  token: InjectionToken<DataSource<T>>,
  service: Type<S>,
  bench: Result<T>,
  wcl: unknown = {},
): S {
  const source: DataSource<T> = { getBench: () => Promise.resolve(bench) };
  TestBed.configureTestingModule({
    providers: [
      { provide: token, useValue: source },
      { provide: WclApiService, useValue: withPullModelReads(wcl as object) as WclApiService },
    ],
  });
  return TestBed.inject(service);
}
