import { inject, Injectable } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import { ParseRanking, TopParseSelection, WclFight, WclReport } from '../wcl/wcl.models';
import { SpecPlan, SpecPlanService } from '../simc/spec-plan-service';
import type { SpecPlanLoaderService } from '../simc/spec-plan-loader-service';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from '../http/http-load-error';
import { ReportActor } from './wcl-projections-service';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { WclProjectionsService } from './wcl-projections-service';
import { TopParseSelectionService } from './top-parse-selection-service';

@Injectable({ providedIn: 'root' })
export class BenchPipelineService {
  private readonly logger = inject(LoggerService);
  private readonly projections = inject(WclProjectionsService);
  private readonly topParses = inject(TopParseSelectionService);
  private readonly specPlans = inject(SpecPlanService);

  spellIdsByName(abilities: { name: string; spell_id: number }[]): Record<string, number> {
    const byName: Record<string, number> = {};
    for (const ability of abilities) if (ability.spell_id) byName[ability.name] = ability.spell_id;
    return byName;
  }

  async benchFromTopParses<TParse, TBench, TPlan = undefined>(
    wclApi: WclApiService,
    query: { spec: string; encounterId: number; selection?: TopParseSelection },
    recipe: BenchRecipe<TParse, TBench, TPlan>,
  ): Promise<Result<TBench>> {
    const { spec, encounterId } = query;
    const planned = await this.benchPlan(recipe.plan, spec);
    if (!planned.ok) return planned;
    try {
      const limits = this.recipeLimits(recipe);
      const selection = query.selection ?? await this.topParses.resolveTopParses(wclApi, spec, encounterId);
      const rankings = recipe.candidatePoolCount ? selection.slice(0, recipe.candidatePoolCount) : selection;
      if (!rankings.length) return Results.missing(recipe.noRankingsMessage);

      const payload = await this.collectParses(wclApi, recipe, planned.value, rankings, limits.sampleTarget);
      const accepted = payload.parses.length;
      if (accepted < limits.minSamples) return Results.missing(recipe.tooFewParsesMessage?.(accepted) ?? recipe.noRankingsMessage);

      return await this.benchEnvelope(wclApi, recipe, planned.value, { spec, encounterId }, payload);
    } catch (cause) {
      this.logger.logWarn(`${recipe.logSource}.getBench ${spec}:${encounterId}`, cause);
      return HttpLoadErrors.toLoadError(cause, recipe.errorId);
    }
  }

  private async benchPlan<TPlan>(step: BenchPlanStep<TPlan> | undefined, spec: string): Promise<Result<SpecPlan | null>> {
    if (!step) return Results.ok(null);
    const plan = await step.plans.planFor(spec);
    if (!plan.ok) return plan;
    return step.pick(plan.value) === null ? Results.missing(step.missingMessage) : plan;
  }

  /** The full plan already passed `pick`, so the slice names something. */
  private logPlan<TParse, TBench, TPlan>(
    recipe: BenchRecipe<TParse, TBench, TPlan>, plan: SpecPlan | null, castIds: Record<string, number>,
  ): TPlan {
    return (plan && recipe.plan ? recipe.plan.pick(this.specPlans.inLog(plan, castIds)) : undefined) as TPlan;
  }

  /** Null when the top logs cast none of what the recipe names. */
  private topLogPlan<TParse, TBench, TPlan>(
    recipe: BenchRecipe<TParse, TBench, TPlan>, plan: SpecPlan | null, castIds: Record<string, number>[],
  ): TPlan | null {
    return plan && recipe.plan ? recipe.plan.pick(this.specPlans.inTopLogs(plan, castIds)) : undefined as TPlan;
  }

  private async benchEnvelope<TParse, TBench, TPlan>(
    wclApi: WclApiService,
    recipe: BenchRecipe<TParse, TBench, TPlan>,
    plan: SpecPlan | null,
    query: { spec: string; encounterId: number },
    { castIds, ...payload }: CollectedParses<TParse>,
  ): Promise<Result<TBench>> {
    const benchPlan = this.topLogPlan(recipe, plan, castIds);
    if (benchPlan === null) return Results.missing(recipe.plan?.missingMessage ?? recipe.noRankingsMessage);
    const body = await recipe.bench(payload, benchPlan);
    const identity: BenchIdentity = {
      spec: query.spec, encounter_id: query.encounterId, encounter_name: payload.encounterName,
    };
    const header = recipe.header === 'identity' ? identity : { ...identity, sample_count: payload.parses.length };
    const icons = recipe.iconSpellIds
      ? { ability_icons: this.projections.abilityIcons(await wclApi.getAbilities(recipe.iconSpellIds(body))) }
      : {};
    return Results.ok({ ...header, ...body, ...icons } as TBench);
  }

  private recipeLimits<TParse, TBench, TPlan>(recipe: BenchRecipe<TParse, TBench, TPlan>): RecipeLimits {
    return {
      sampleTarget: recipe.sampleTarget ?? TOP_PARSE_COUNT,
      minSamples: recipe.minSamples ?? MIN_SAMPLE_COUNT,
    };
  }

  private async collectParses<TParse, TBench, TPlan>(
    wclApi: WclApiService, recipe: BenchRecipe<TParse, TBench, TPlan>, plan: SpecPlan | null,
    rankings: ParseRanking[], sampleTarget: number,
  ): Promise<CollectedParses<TParse>> {
    const collected: CollectedParses<TParse> = { encounterName: '', parses: [], castIds: [] };
    for (const ranking of rankings) {
      const accepted = await this.parseCandidate(wclApi, recipe, plan, ranking);
      if (!accepted) continue;
      collected.parses.push(accepted.parse);
      collected.castIds.push(accepted.castIds);
      collected.encounterName ||= accepted.encounterName;
      if (collected.parses.length >= sampleTarget) break;
    }
    return collected;
  }

  // An unfetchable or unbindable report drops the parse, never the bench.
  private async parseCandidate<TParse, TBench, TPlan>(
    wclApi: WclApiService, recipe: BenchRecipe<TParse, TBench, TPlan>, plan: SpecPlan | null, ranking: ParseRanking,
  ): Promise<{ parse: TParse; encounterName: string; castIds: Record<string, number> } | null> {
    try {
      const report = await wclApi.getReport(ranking.report_code);
      const fight = report.fights.find(entry => entry.id === ranking.fight_id);
      const player = this.projections.findParseActor(report.masterData?.actors, ranking);
      if (!fight || !player) return null;

      const castIds = plan
        ? this.specPlans.castIds(plan, await wclApi.getAllEvents(ranking.report_code, fight.id, 'Casts', fight.startTime, fight.endTime, player.id))
        : {};
      const parse = await recipe.parse({ ranking, report, fight, player }, this.logPlan(recipe, plan, castIds));
      return parse === null ? null : { parse, encounterName: fight.name, castIds };
    } catch (cause) {
      this.logger.logWarn(`${recipe.logSource} parse ${ranking.report_code}:${ranking.fight_id}`, cause);
      return null;
    }
  }
}

const TOP_PARSE_COUNT = 10;
const MIN_SAMPLE_COUNT = 1;

export interface BenchParse {
  ranking: ParseRanking;
  report: WclReport;
  fight: WclFight;
  player: ReportActor;
}

interface BenchPayload<TParse> {
  encounterName: string;
  parses: TParse[];
}

interface CollectedParses<TParse> extends BenchPayload<TParse> {
  /** Per accepted parse, the id each plan button was cast under. */
  castIds: Record<string, number>[];
}

export interface BenchIdentity {
  spec: string;
  encounter_id: number;
  encounter_name: string;
}

export interface BenchHeader extends BenchIdentity {
  sample_count: number;
}

/** What a recipe's bench callback returns: the pipeline spreads the header before it and bakes the icon map after it. */
type BenchBody<TBench> = Omit<TBench, keyof BenchHeader | 'ability_icons'>;

interface BenchPlanStep<TPlan> {
  plans: SpecPlanLoaderService;
  /** Returning null stops the bench with `missingMessage`, for a spec whose plan names nothing this recipe benches. */
  pick: (plan: SpecPlan) => TPlan | null;
  missingMessage: string;
}

export interface BenchRecipe<TParse, TBench, TPlan = undefined> {
  logSource: string;
  errorId: string;
  /** Trims the resolved pool for a recipe that benches fewer candidates; it cannot deepen one. */
  candidatePoolCount?: number;
  sampleTarget?: number;
  minSamples?: number;
  noRankingsMessage: string;
  tooFewParsesMessage?: (accepted: number) => string;
  /** 'identity' bakes no sample_count, for a file that exports one named parse rather than a sampled benchmark. */
  header?: 'sampled' | 'identity';
  plan?: BenchPlanStep<TPlan>;
  /** Every spell id the baked file renders, so its icon map is complete and no card falls back. */
  iconSpellIds?: (bench: BenchBody<TBench>) => number[];
  /** Returning null drops the parse so the next candidate backfills it. */
  parse: (parse: BenchParse, plan: TPlan) => Promise<TParse | null>;
  bench: (payload: BenchPayload<TParse>, plan: TPlan) => Promise<BenchBody<TBench>> | BenchBody<TBench>;
}

interface RecipeLimits {
  sampleTarget: number;
  minSamples: number;
}
