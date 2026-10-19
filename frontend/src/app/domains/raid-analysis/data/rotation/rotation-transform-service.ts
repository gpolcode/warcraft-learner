import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import { SpecPlanLoaderService } from '../simc/spec-plan-loader-service';
import { TopParseSelection, WclAbility } from '../wcl/wcl.models';
import { AuraSpan } from '../defensive/defensive-data-source';
import { PlanCooldown, PlanItem, PriorityList } from '../plan/plan.models';
import { PerCdBenchmark } from '../encounter/encounter.models';
import { group } from 'd3-array';
import { round } from '../analysis/analysis-math';
import { HoldWindow } from '../analysis/hold-targets-service';
import { WclProjectionsService, TimedEvent, PhaseStart } from '../analysis/wcl-projections-service';
import { BenchPipelineService, BenchParse } from '../analysis/bench-pipeline-service';
import { DataSource } from '../data-source/data-source';
import { Result } from '../../../shared/util-http/result';
import { SpecPlan } from '../simc/spec-plan-service';
import { ListBenchService } from './priority-list/list-bench-service';
import { ListCheckService, LogReading } from './priority-list/list-check-service';
import { ListContext, ListLogService } from './priority-list/list-log-service';
import { EnemyTimelineService } from './priority-list/enemy-timeline-service';
import type { EnemyTimeline } from './priority-list/priority-list.models';
import { ItemDataService } from '../simc/item-data-service';
import { RotationBloodlustService } from './rotation-bloodlust-service';
import { AuraWindowsService } from '../analysis/aura-windows-service';
import { IdleStretch, RotationBench, RotationParseMeasures } from './rotation-data-source';
import type { ButtonCounts } from './priority-list/list-check-service';
import { CastCadenceService } from '../analysis/cast-cadence-service';
import { CooldownUseJudgeService } from './cooldown-use-judge-service';
import { DowntimeJudgeService } from './downtime-judge-service';
import { BloodlustJudgeService } from './bloodlust-judge-service';

export interface CdSummary {
  name: string;
  total_uses: number;
  first_cast_s: number | null;
  cast_times_s: number[];
  hold_windows: HoldWindow[];
  cast_pattern: 'hold' | 'on_cooldown';
  fight_duration_s: number;
  up_s: AuraSpan[];
}

interface ParseRotation {
  summaries: CdSummary[];
  idleS: IdleStretch[] | null;
  /** Read only once every top log is in, against the others' encounter timeline. */
  list: ListContext | null;
  lustS: number | null;
  phaseStarts: PhaseStart[];
}

@Injectable({ providedIn: 'root' })
export class RotationTransformService implements DataSource<RotationBench> {
  private readonly castCadence = inject(CastCadenceService);
  private readonly bloodlust = inject(RotationBloodlustService);
  private readonly auraWindows = inject(AuraWindowsService);
  private readonly benchPipeline = inject(BenchPipelineService);
  private readonly wclProjections = inject(WclProjectionsService);
  private readonly wclApi = inject(WclApiService);
  private readonly specPlanLoader = inject(SpecPlanLoaderService);
  private readonly listLogs = inject(ListLogService);
  private readonly itemData = inject(ItemDataService);
  private readonly listBench = inject(ListBenchService);
  private readonly cooldownUses = inject(CooldownUseJudgeService);
  private readonly downtime = inject(DowntimeJudgeService);
  private readonly lust = inject(BloodlustJudgeService);
  private readonly checks = inject(ListCheckService);
  private readonly enemyTimeline = inject(EnemyTimelineService);

  async getBench(spec: string, encounterId: number, selection?: TopParseSelection): Promise<Result<RotationBench>> {
    return this.benchPipeline.benchFromTopParses(this.wclApi, { spec, encounterId, selection }, {
      logSource: 'RotationTransformService',
      errorId: 'rotation.bench',
      noRankingsMessage: 'No top logs for this encounter.',
      plan: {
        plans: this.specPlanLoader,
        pick: plan => (plan.cooldowns.length || plan.lines.length ? plan : null),
        missingMessage: 'No cooldowns or rotation for this spec.',
      },
      iconSpellIds: bench => [...Object.values(bench.cd_spell_ids), ...bench.buttons.map(button => button.spell_id)],
      parse: (parse, plan) => this.parseRotation(parse, plan),
      bench: ({ parses }, plan) => {
        const series = parses.map(parse => (parse.list ? this.enemyTimeline.series(parse.list.ctx) : []));
        // Each top log is read as the runtime reads a player: against a timeline it is not part of.
        const readings = parses.map((parse, index) => this.reading(parse.list, this.enemyTimeline.timeline(series.filter((_, other) => other !== index))));
        const buttonCounts = this.listBench.counts(plan, readings);
        return {
          per_cd_benchmarks: this.aggregateCdBenchmarks(parses.map(parse => parse.summaries), plan.cooldowns),
          major_cooldowns: plan.cooldowns,
          list: this.listWithItems(plan, readings),
          buttons: this.listBench.bench(plan, readings),
          cd_spell_ids: this.benchPipeline.spellIdsByName([...plan.cooldowns, ...plan.defensives]),
          per_parse: parses.map((parse, index) => this.parseMeasures(parse, buttonCounts[index] ?? {})),
          enemy_timeline: this.enemyTimeline.timeline(series),
        };
      },
    });
  }

  private reading(list: ListContext | null, enemyTimeline: EnemyTimeline | null): LogReading {
    return list ? { ...this.checks.read({ ...list.ctx, enemyTimeline }), items: list.items } : { casts: new Map(), missed: [], ids: new Map() };
  }

  /** A trinket's use spell joins `spells` under its item's token, so the bench reads it like any button. */
  private listWithItems(plan: SpecPlan, readings: LogReading[]): PriorityList {
    const items = readings.reduce<Record<string, PlanItem>>((all, reading) => ({ ...all, ...reading.items?.items }), {});
    const spells = readings.reduce((all, reading) => ({ ...all, ...reading.items?.spells }), plan.spells);
    return { lines: plan.lines, variables: plan.variables, spells, talents: plan.talents, ...(Object.keys(items).length ? { items } : {}) };
  }

  private async parseRotation({ ranking, report, fight, player }: BenchParse, plan: SpecPlan): Promise<ParseRotation> {
    const abilities = report.masterData?.abilities ?? [];
    const folds = this.wclProjections.pressFolds(plan.cooldowns);
    const [casts, buffs, list] = await Promise.all([
      this.wclApi.getAllEvents(ranking.report_code, fight.id, 'Casts', fight.startTime, fight.endTime, player.id, true),
      this.wclApi.getAllEvents(ranking.report_code, fight.id, 'Buffs', fight.startTime, fight.endTime, player.id),
      this.listLogs.context(plan, { reportCode: ranking.report_code, fight, playerId: player.id, abilities, folds, items: trinkets => this.itemData.items(trinkets) }),
    ]);
    const fightDurS = this.wclProjections.relativeS(fight.endTime, fight.startTime);
    const castsTimed = this.wclProjections.withRelativeS(this.wclProjections.presses(casts, folds, { buffs, abilities }), fight.startTime);
    const buffsTimed = this.wclProjections.withRelativeS(buffs, fight.startTime);
    return {
      lustS: this.bloodlust.detectBloodlust(buffsTimed),
      phaseStarts: this.wclProjections.phaseStarts(fight),
      summaries: this.summarizeCooldownCasts(castsTimed, plan.cooldowns, fightDurS, { buffs: buffsTimed, abilities }),
      idleS: this.downtime.idleStretches(castsTimed, { ...plan.spells, ...list?.items.spells }),
      list,
    };
  }

  protected parseMeasures(parse: ParseRotation, buttons: Record<string, ButtonCounts>): RotationParseMeasures {
    return {
      idle_s: parse.idleS,
      lust_s: parse.lustS == null ? null : round(parse.lustS, 2),
      phase_starts: parse.phaseStarts.map(phase => ({ id: phase.id, start_s: round(phase.startS, 2) })),
      cd_casts_s: Object.fromEntries(parse.summaries.map(summary => [summary.name, summary.cast_times_s])),
      cd_up_s: Object.fromEntries(parse.summaries.map(summary => [summary.name, summary.up_s])),
      buttons,
    };
  }

  protected summarizeCooldownCasts(
    castEvents: TimedEvent[], cooldowns: PlanCooldown[], fightDurS: number, auras: { buffs: TimedEvent[]; abilities: readonly WclAbility[] },
  ): CdSummary[] {
    const upAtPull = this.auraWindows.upAtPull(auras.buffs);
    const windows = this.auraWindows.buildAuraWindows(auras.buffs);
    return cooldowns.map(cooldown => {
      const castTimesS = this.cooldownUses.castTimesS(castEvents, cooldown.spell_id, upAtPull, fightDurS);
      const spans = this.auraWindows.spansNamed(windows, cooldown, auras.abilities);
      return {
        name: cooldown.name,
        total_uses: castTimesS.length,
        up_s: this.lust.effectSpans(spans, castTimesS, cooldown.duration ?? 0, fightDurS),
        ...this.castCadence.entry(castTimesS, fightDurS, cooldown.cooldown),
      };
    });
  }

  protected buildCdBenchmark(entries: CdSummary[], effectiveCd: number): PerCdBenchmark {
    return this.castCadence.buildCadenceBenchmark(entries.filter(entry => entry.total_uses > 0), effectiveCd, entries.length);
  }

  protected aggregateCdBenchmarks(
    perParse: CdSummary[][], cooldowns: PlanCooldown[],
  ): Record<string, PerCdBenchmark> {
    const cdSecondsByName = new Map(cooldowns.map(cooldown => [cooldown.name, cooldown.cooldown]));
    const byCd = group(perParse.flat(), summary => summary.name);
    const result: Record<string, PerCdBenchmark> = {};
    for (const [name, entries] of byCd.entries()) {
      result[name] = this.buildCdBenchmark(entries, cdSecondsByName.get(name) ?? 90);
    }
    return result;
  }
}
