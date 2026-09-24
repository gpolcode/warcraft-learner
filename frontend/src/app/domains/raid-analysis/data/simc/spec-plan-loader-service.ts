import { Injectable, inject } from '@angular/core';
import type { SpecMeta } from '../data-files/spec-meta.models';
import { Result, Results } from '../../../shared/util-http/result';
import { getOrInsert } from '../analysis/analysis-math';
import { WclApiService } from '../wcl/wcl-api-service';
import { CurrentRaidsService } from '../ingest/current-raids-service';
import { SimcDataService } from '../http/simc-data-service';
import { SpecPlan, SpecPlanService } from './spec-plan-service';

/** Fetches a spec's SimulationCraft sources and keeps its plan for the session, so ingest and the dev build share one path. */
@Injectable({ providedIn: 'root' })
export class SpecPlanLoaderService {
  private readonly simc = inject(SimcDataService);
  private readonly specPlans = inject(SpecPlanService);
  private readonly currentRaids = inject(CurrentRaidsService);
  private readonly wclApi = inject(WclApiService);
  // Every bench of a spec asks for the same plan, and every spec of a class reads the same 1 MB dump.
  private readonly plans = new Map<string, Promise<Result<SpecPlan>>>();
  private readonly dumps = new Map<string, Promise<Result<string>>>();
  private metas: Promise<SpecMeta[]> | null = null;

  async planFor(spec: string): Promise<Result<SpecPlan>> {
    const plan = await getOrInsert(this.plans, spec, () => this.load(spec));
    // Keeping a failed read would deny the spec a plan for the rest of the session over one blip.
    if (!plan.ok) this.plans.delete(spec);
    return plan;
  }

  private async load(spec: string): Promise<Result<SpecPlan>> {
    this.metas ??= this.currentRaids.discoverSpecMetas(this.wclApi);
    const meta = (await this.metas).find(entry => entry.spec === spec);
    if (!meta) return Results.missing(`No spec metadata for ${spec}.`);
    const [profile, dump] = await Promise.all([
      this.simc.getProfile(meta.classLabel, meta.specLabel),
      getOrInsert(this.dumps, meta.className, () => this.simc.getSpellDump(meta.className)),
    ]);
    if (!dump.ok) {
      this.dumps.delete(meta.className);
      return dump;
    }
    if (!profile.ok && profile.error.kind !== 'missing') return profile;
    return Results.ok(this.specPlans.build({ profile: profile.ok ? profile.value : null, dump: dump.value, specLabel: meta.specLabel }));
  }
}
