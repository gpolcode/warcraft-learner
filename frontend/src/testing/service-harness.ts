import { InjectionToken, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataSource } from '../app/domains/raid-analysis/data/data-source/data-source';
import { Result } from '../app/domains/shared/util-http/result';
import { WclApiService } from '../app/domains/raid-analysis/data/wcl/wcl-api-service';

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
      { provide: WclApiService, useValue: wcl as WclApiService },
    ],
  });
  return TestBed.inject(service);
}
