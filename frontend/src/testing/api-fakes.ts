import { Provider } from '@angular/core';
import { DataFileApiService } from '../app/domains/raid-analysis/data/data-files/data-file-api-service';
import { NorthernSkyPhaseDataService } from '../app/domains/raid-analysis/data/http/northern-sky-phase-data-service';
import { TalentDataService } from '../app/domains/raid-analysis/data/http/talent-data-service';
import { EnchantItemDataService } from '../app/domains/raid-analysis/data/http/enchant-item-data-service';
import { WclApiService } from '../app/domains/raid-analysis/data/wcl/wcl-api-service';

// The data-file service is stubbed empty: a transform never reads a file, and the stub keeps its transport token out of every spec.
export function provideApiFakes(fakes: { wcl: unknown; talents?: unknown; enchantItems?: unknown; northernSkyPhases?: unknown }): Provider[] {
  return [
    { provide: WclApiService, useValue: fakes.wcl as WclApiService },
    { provide: DataFileApiService, useValue: {} as DataFileApiService },
    ...(fakes.talents === undefined ? [] : [{ provide: TalentDataService, useValue: fakes.talents as TalentDataService }]),
    ...(fakes.enchantItems === undefined ? [] : [{ provide: EnchantItemDataService, useValue: fakes.enchantItems as EnchantItemDataService }]),
    ...(fakes.northernSkyPhases === undefined ? [] : [{ provide: NorthernSkyPhaseDataService, useValue: fakes.northernSkyPhases as NorthernSkyPhaseDataService }]),
  ];
}
