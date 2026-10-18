import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import { SpecPlanLoaderService } from '../simc/spec-plan-loader-service';
import { TopParseSelection } from '../wcl/wcl.models';
import { PlanCooldown, PlanItem, PriorityList } from '../plan/plan.models';
import { PerCdBenchmark } from '../encounter/encounter.models';
import { group } from 'd3-array';
import {
  round, avgOr, stddevOr,
} from '../analysis/analysis-math';
import { HoldWindow } from '../analysis/hold-targets-service';
import { WclProjectionsService, TimedEvent, PhaseStart } from '../analysis/wcl-projections-service';
import { BenchPipelineService, BenchParse } from '../analysis/bench-pipeline-service';
import { DataSource } from '../data-source/data-source';
import { Result } from '../../../shared/util-http/result';
import { SpecPlan } from '../simc/spec-plan-service';
import { ListBenchService } from './priority-list/list-bench-service';
import { LogReading } from './priority-list/list-check-service';
import { ListLogService } from './priority-list/list-log-service';
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
  bl_aligned: boolean;
  bl_offset_s: number | null;
  cast_times_s: number[];
  hold_windows: HoldWindow[];
  cast_pattern: 'hold' | 'on_cooldown';
  fight_duration_s: number;
}

interface ParseRotation {
  summaries: CdSummary[];
  idleS: IdleStretch[] | null;
  reading: LogReading;
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
        const buttonCounts = this.listBench.counts(plan, parses.map(parse => parse.reading));
        return {
          per_cd_benchmarks: this.aggregateCdBenchmarks(parses.map(parse => parse.summaries), plan.cooldowns),
          major_cooldowns: plan.cooldowns,
          list: this.listWithItems(plan, parses.map(parse => parse.reading)),
          buttons: this.listBench.bench(plan, parses.map(parse => parse.reading)),
          cd_spell_ids: this.benchPipeline.spellIdsByName([...plan.cooldowns, ...plan.defensives]),
          per_parse: parses.map((parse, index) => this.parseMeasures(parse, buttonCounts[index] ?? {})),
        };
      },
    });
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
    const [casts, buffs, reading] = await Promise.all([
      this.wclApi.getAllEvents(ranking.report_code, fight.id, 'Casts', fight.startTime, fight.endTime, player.id, true),
      this.wclApi.getAllEvents(ranking.report_code, fight.id, 'Buffs', fight.startTime, fight.endTime, player.id),
      this.listLogs.read(plan, { reportCode: ranking.report_code, fight, playerId: player.id, abilities, folds, items: trinkets => this.itemData.items(trinkets) }),
    ]);
    const fightDurS = this.wclProjections.relativeS(fight.endTime, fight.startTime);
    const castsTimed = this.wclProjections.withRelativeS(this.wclProjections.presses(casts, folds, { buffs, abilities }), fight.startTime);
    const buffsTimed = this.wclProjections.withRelativeS(buffs, fight.startTime);
    const blTimeS = this.bloodlust.detectBloodlust(buffsTimed);
    return {
      lustS: blTimeS,
      phaseStarts: this.wclProjections.phaseStarts(fight),
      summaries: this.summarizeCooldownCasts(castsTimed, plan.cooldowns, fightDurS, blTimeS, this.auraWindows.upAtPull(buffsTimed)),
      idleS: this.downtime.idleStretches(castsTimed, { ...plan.spells, ...reading.items?.spells }),
      reading,
    };
  }

  protected parseMeasures(parse: ParseRotation, buttons: Record<string, ButtonCounts>): RotationParseMeasures {
    return {
      idle_s: parse.idleS,
      lust_s: parse.lustS == null ? null : round(parse.lustS, 2),
      phase_starts: parse.phaseStarts.map(phase => ({ id: phase.id, start_s: round(phase.startS, 2) })),
      cd_casts_s: Object.fromEntries(parse.summaries.map(summary => [summary.name, summary.cast_times_s])),
      buttons,
    };
  }

  protected summarizeCooldownCasts(
    castEvents: TimedEvent[], cooldowns: PlanCooldown[],
    fightDurS: number, blTimeS: number | null, upAtPull: ReadonlySet<number>,
  ): CdSummary[] {
    return cooldowns.map(cooldown => {
      const castTimesS = this.cooldownUses.castTimesS(castEvents, cooldown.spell_id, upAtPull, fightDurS);
      const blOffsetS = this.lust.measureOffset(castTimesS, blTimeS);
      return {
        name: cooldown.name,
        total_uses: castTimesS.length,
        bl_aligned: blOffsetS !== null,
        bl_offset_s: blOffsetS === null ? null : round(blOffsetS),
        ...this.castCadence.entry(castTimesS, fightDurS, cooldown.cooldown),
      };
    });
  }

  protected buildCdBenchmark(entries: CdSummary[], effectiveCd: number): PerCdBenchmark {
    const users = entries.filter(entry => entry.total_uses > 0);
    const blOffsets = entries.map(entry => entry.bl_offset_s).filter((value): value is number => value != null);
    const blCount = entries.filter(entry => entry.bl_aligned).length;

    return {
      ...this.castCadence.buildCadenceBenchmark(users, effectiveCd, entries.length),
      avg_bl_offset_s: avgOr(blOffsets, null),
      stddev_bl_offset_s: stddevOr(blOffsets, null),
      bl_pct: entries.length ? Math.round((blCount / entries.length) * 100) : 0,
    };
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
