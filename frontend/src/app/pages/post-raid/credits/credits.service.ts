/**
 * Credits slice runtime shell. The `CreditsComponent` injects only this; it reads the
 * prepared credits bench via the swappable `CREDITS_DATA_SOURCE` (file in prod, live
 * transform under the dev flag) and hands the card its two ready-to-render lists. No
 * arithmetic and no player log - the attribution is entirely bench-side.
 */
import { Injectable, inject } from '@angular/core';
import { TopParseCredit, RulebookSource } from '../../../core/models/credits.models';
import { CREDITS_DATA_SOURCE } from './credits-data-source';

/** The credits card view-model: the top parses credited + the rulebook guide sources. */
export interface CreditsView {
  parses: TopParseCredit[];
  sources: RulebookSource[];
}

@Injectable({ providedIn: 'root' })
export class CreditsFeatureService {
  private readonly source = inject(CREDITS_DATA_SOURCE);

  async loadCredits(spec: string, encounterId: number): Promise<CreditsView> {
    if (!spec || !encounterId) return { parses: [], sources: [] };
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench) return { parses: [], sources: [] };
    return { parses: bench.parses, sources: bench.sources };
  }
}
