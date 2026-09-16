import { Injectable, inject } from '@angular/core';
import type { WclApiService } from '../wcl/wcl-api-service';
import type { TopParseSelection } from '../wcl/wcl.models';
import { ParseSampleService } from './parse-sample-service';
import { RulebookBuildService, type RulebookBuild } from './rulebook-build-service';
import type { RulebookSources } from './rulebook-build.models';

export interface EncounterRulebookInputs {
  sources: RulebookSources;
  encounterId: number;
  selection: TopParseSelection;
}

@Injectable({ providedIn: 'root' })
export class EncounterRulebookService {
  private readonly samples = inject(ParseSampleService);
  private readonly builder = inject(RulebookBuildService);

  /** One encounter's rules, read from the same top parses its benches measure, so the stamp's parse set and sources fix them. */
  async derive(wclApi: WclApiService, inputs: EncounterRulebookInputs): Promise<RulebookBuild> {
    const query = { spec: inputs.sources.spec.spec, encounterId: inputs.encounterId, selection: inputs.selection };
    const samples = await this.samples.sample(wclApi, query, this.builder.readsEnemyAuras(inputs.sources.apl));
    return this.builder.build(inputs.sources, samples);
  }
}
