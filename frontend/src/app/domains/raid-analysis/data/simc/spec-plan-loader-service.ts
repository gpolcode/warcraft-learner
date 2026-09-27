import { Injectable, inject } from '@angular/core';
import type { SpecMeta } from '../data-files/spec-meta.models';
import { Result, Results } from '../../../shared/util-http/result';
import { getOrInsert } from '../analysis/analysis-math';
import { WclApiService } from '../wcl/wcl-api-service';
import { CurrentRaidsService } from '../ingest/current-raids-service';
import { SimcDataService } from '../http/simc-data-service';
import { TalentDataService, TalentTree } from '../http/talent-data-service';
import { SpecPlan, SpecPlanService } from './spec-plan-service';

@Injectable({ providedIn: 'root' })
export class SpecPlanLoaderService {
  private readonly simc = inject(SimcDataService);
  private readonly specPlans = inject(SpecPlanService);
  private readonly currentRaids = inject(CurrentRaidsService);
  private readonly wclApi = inject(WclApiService);
  private readonly talentData = inject(TalentDataService);
  // Every bench of a spec asks for the same plan, and every spec of a class reads the same 1 MB dump.
  private readonly plans = new Map<string, Promise<Result<SpecPlan>>>();
  private readonly dumps = new Map<string, Promise<Result<string>>>();
  private readonly sources = new Map<string, Promise<Result<string>>>();
  private metas: Promise<SpecMeta[]> | null = null;
  // One Raidbots file names every spec's talents.
  private trees: Promise<Result<Map<string, TalentTree>>> | null = null;

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
    const [apl, dump, trees, code] = await Promise.all([
      this.simc.getApl(meta.className, meta.specLabel),
      getOrInsert(this.dumps, meta.className, () => this.simc.getSpellDump(meta.className)),
      (this.trees ??= this.talentData.getTalentTrees()),
      this.code(meta.className),
    ]);
    if (!dump.ok) {
      this.dumps.delete(meta.className);
      return dump;
    }
    if (!trees.ok) {
      this.trees = null;
      return trees;
    }
    if (!apl.ok && apl.error.kind !== 'missing') return apl;
    return Results.ok(this.specPlans.build({
      apl: apl.ok ? apl.value : null, dump: dump.value, specLabel: meta.specLabel, talents: trees.value.get(spec) ?? null, code,
    }));
  }

  /** A source that fails to load leaves only the names it declares unread, so the plan builds without it. */
  private async code(className: string): Promise<string> {
    const files = await Promise.all(this.simc.sourcePaths(className).map(path => getOrInsert(this.sources, path, () => this.simc.getSource(path))));
    return files.map(file => (file.ok ? file.value : '')).join('\n');
  }
}
