import { Result } from '../../../shared/util-http/result';
import { TopParseSelection } from '../wcl/wcl.models';
import type { SimcTier } from '../simc/simc.models';
import type { WclApiService } from '../wcl/wcl-api-service';
import type { LiveRulebookService } from '../rulebook-build/live-rulebook-service';
import { DataSource, RulebookDataSource } from './data-source';

// The live environment instantiates one per *_DATA_SOURCE token, so it is not providedIn root.
export class LiveRulebookDataSource<T> implements DataSource<T> {
  constructor(
    private readonly transform: RulebookDataSource<T>,
    private readonly rulebooks: LiveRulebookService,
    private readonly wclApi: WclApiService,
    private readonly tier: SimcTier | null,
  ) {}

  /** Derives the encounter's rulebook before the bench runs, so an analysis reads the rules from SimulationCraft instead of from an ingested file. */
  async getBench(spec: string, encounterId: number, selection?: TopParseSelection): Promise<Result<T>> {
    const rulebook = this.tier ? await this.rulebooks.rulebookFor(this.wclApi, spec, encounterId, this.tier) : null;
    return this.transform.getBench(spec, encounterId, selection, rulebook);
  }
}
