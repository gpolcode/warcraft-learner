import { Provider } from '@angular/core';
import { DataFileApiService } from '../app/domains/raid-analysis/data/data-files/data-file-api-service';
import { TalentDataService } from '../app/domains/raid-analysis/data/http/talent-data-service';
import { WclApiService } from '../app/domains/raid-analysis/data/wcl/wcl-api-service';

export function provideApiFakes(fakes: { wcl: unknown; files?: unknown; talents?: unknown }): Provider[] {
  return [
    { provide: WclApiService, useValue: fakes.wcl as WclApiService },
    { provide: DataFileApiService, useValue: (fakes.files ?? {}) as DataFileApiService },
    ...(fakes.talents === undefined ? [] : [{ provide: TalentDataService, useValue: fakes.talents as TalentDataService }]),
  ];
}
