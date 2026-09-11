import { Injectable, inject } from '@angular/core';
import type { WclApiService } from '../wcl/wcl-api-service';
import type { ParseRanking } from '../wcl/wcl.models';
import type { SpecMeta } from '../data-files/spec-meta.models';
import type { SpecTalents } from '../gear/talent.models';
import type { SimcText, SimcTier } from '../http/simc-data-service';
import { ParseSampleService } from './parse-sample-service';
import { RulebookBuildService, type RulebookBuild } from './rulebook-build-service';

/** Everything a spec's rules derive from besides the parses: fetched once per run, shared by every encounter. */
export interface SpecSources {
  meta: SpecMeta;
  profile: SimcText;
  spellData: SimcText;
  talents: SpecTalents;
}

export interface EncounterRulebookInputs {
  sources: SpecSources;
  tier: SimcTier;
  rankings: ParseRanking[];
}

@Injectable({ providedIn: 'root' })
export class EncounterRulebookService {
  private readonly samples = inject(ParseSampleService);
  private readonly builder = inject(RulebookBuildService);

  /** One encounter's rules, read from the same top parses its benches measure, so the stamp's parse set and sources fix them. */
  async derive(wclApi: WclApiService, inputs: EncounterRulebookInputs): Promise<RulebookBuild> {
    const { sources, tier } = inputs;
    const enemyAuras = this.builder.readsEnemyAuras(this.builder.resolveProfile(sources.profile.text, tier));
    const samples = await this.samples.sample(wclApi, inputs.rankings, enemyAuras);
    return this.builder.build({
      spec: sources.meta, tier, profile: sources.profile, spellData: sources.spellData, samples, talents: sources.talents,
    });
  }
}
