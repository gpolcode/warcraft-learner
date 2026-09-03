import { inject, Injectable } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import type { DataFileApiService } from '../data-files/data-file-api-service';
import { ParseRanking, TopParseSelection, WclFight, WclReport } from '../wcl/wcl.models';
import { Rulebook } from '../rulebook/rulebook.models';
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
    const planned = await this.benchPlan(recipe.rulebook, spec);
    if (!planned.ok) return planned;
    try {
      const limits = this.recipeLimits(recipe);
      const selection = query.selection ?? await this.topParses.resolveTopParses(wclApi, spec, encounterId);
      const rankings = recipe.candidatePoolCount ? selection.slice(0, recipe.candidatePoolCount) : selection;
      if (!rankings.length) return Results.missing(recipe.noRankingsMessage);

      const payload = await this.collectParses(wclApi, recipe, planned.value, rankings, limits.sampleTarget);
      const accepted = payload.parses.length;
      if (accepted < limits.minSamples) return Results.missing(recipe.tooFewParsesMessage?.(accepted) ?? recipe.noRankingsMessage);

      return Results.ok(await this.benchEnvelope(wclApi, recipe, planned.value, { spec, encounterId }, payload));
    } catch (cause) {
      this.logger.logWarn(`${recipe.logSource}.getBench ${spec}:${encounterId}`, cause);
      return HttpLoadErrors.toLoadError(cause, recipe.errorId);
    }
  }

  private async benchPlan<TPlan>(step: BenchRulebookStep<TPlan> | undefined, spec: string): Promise<Result<TPlan>> {
    if (!step) return Results.ok(undefined as TPlan);
    const rulebook = await step.dataFiles.getRulebook(spec);
    if (!rulebook.ok) return rulebook;
    const plan = step.plan(rulebook.value);
    return plan === null ? Results.missing(step.missingMessage) : Results.ok(plan);
  }

  private async benchEnvelope<TParse, TBench, TPlan>(
    wclApi: WclApiService,
    recipe: BenchRecipe<TParse, TBench, TPlan>,
    plan: TPlan,
    query: { spec: string; encounterId: number },
    payload: BenchPayload<TParse>,
  ): Promise<TBench> {
    const body = await recipe.bench(payload, plan);
    const identity: BenchIdentity = {
      spec: query.spec, encounter_id: query.encounterId, encounter_name: payload.encounterName,
    };
    const header = recipe.header === 'identity' ? identity : { ...identity, sample_count: payload.parses.length };
    const icons = recipe.iconSpellIds
      ? { ability_icons: this.projections.abilityIcons(await wclApi.getAbilities(recipe.iconSpellIds(body))) }
      : {};
    return { ...header, ...body, ...icons } as TBench;
  }

  private recipeLimits<TParse, TBench, TPlan>(recipe: BenchRecipe<TParse, TBench, TPlan>): RecipeLimits {
    return {
      sampleTarget: recipe.sampleTarget ?? TOP_PARSE_COUNT,
      minSamples: recipe.minSamples ?? MIN_SAMPLE_COUNT,
    };
  }

  private async collectParses<TParse, TBench, TPlan>(
    wclApi: WclApiService, recipe: BenchRecipe<TParse, TBench, TPlan>, plan: TPlan,
    rankings: ParseRanking[], sampleTarget: number,
  ): Promise<BenchPayload<TParse>> {
    const parses: TParse[] = [];
    let encounterName = '';
    for (const ranking of rankings) {
      const accepted = await this.parseCandidate(wclApi, recipe, plan, ranking);
      if (!accepted) continue;
      parses.push(accepted.parse);
      encounterName ||= accepted.encounterName;
      if (parses.length >= sampleTarget) break;
    }
    return { encounterName, parses };
  }

  // An unfetchable or unbindable report drops the parse, never the bench.
  private async parseCandidate<TParse, TBench, TPlan>(
    wclApi: WclApiService, recipe: BenchRecipe<TParse, TBench, TPlan>, plan: TPlan, ranking: ParseRanking,
  ): Promise<{ parse: TParse; encounterName: string } | null> {
    try {
      const report = await wclApi.getReport(ranking.report_code);
      const fight = report.fights.find(entry => entry.id === ranking.fight_id);
      const player = this.projections.findParseActor(report.masterData?.actors, ranking);
      if (!fight || !player) return null;

      const parse = await recipe.parse({ ranking, report, fight, player }, plan);
      return parse === null ? null : { parse, encounterName: fight.name };
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

interface BenchRulebookStep<TPlan> {
  dataFiles: DataFileApiService;
  /** Returning null stops the bench with `missingMessage`, for a spec whose rulebook names nothing this recipe benches. */
  plan: (rulebook: Rulebook) => TPlan | null;
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
  rulebook?: BenchRulebookStep<TPlan>;
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
