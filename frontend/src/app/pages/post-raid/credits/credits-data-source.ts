import { InjectionToken } from '@angular/core';
import { DataSource } from '../../../core/data-source/data-source';
import { TopParseCredit, RulebookSource } from '../../../core/models/credits.models';

/**
 * The tailored credits bench for one encounter, read from
 * `data/specs/{spec}/credits/{enc}.json`. It carries the attribution shown in the
 * contextual "Sources" section: the top parses the encounter's benchmarks drew from
 * (`parses`) and the guides the spec's rulebook was built from (`sources`). Both are
 * baked ready-to-render, so the card needs nothing else from disk.
 */
export interface CreditsBench {
  spec: string;
  encounter_id: number;
  parses: TopParseCredit[];
  sources: RulebookSource[];
}

/**
 * The credits slice's data-source token. `provideDataSource` binds it to a
 * `FileDataSource<CreditsBench>` (production: reads the tailored file) or
 * `CreditsTransformService` (the dev `useLiveTransform` flag / ingestion: computes it
 * live from WCL rankings + the scraped guides) - both `DataSource<CreditsBench>`.
 */
export const CREDITS_DATA_SOURCE = new InjectionToken<DataSource<CreditsBench>>('CREDITS_DATA_SOURCE');
