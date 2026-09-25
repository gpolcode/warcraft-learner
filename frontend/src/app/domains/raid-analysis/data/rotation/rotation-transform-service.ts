import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import { SpecPlanLoaderService } from '../simc/spec-plan-loader-service';
import { TopParseSelection } from '../wcl/wcl.models';
import { PlanCooldown } from '../plan/plan.models';
import { PerCdBenchmark } from '../encounter/encounter.models';
import { group, quantile } from 'd3-array';
import {
  round, avgOr, stddevOr, castEfficiencyPct, closestToZero,
} from '../analysis/analysis-math';
import { HoldWindow } from '../analysis/hold-targets-service';
import { WclProjectionsService, TimedEvent } from '../analysis/wcl-projections-service';
import { BenchPipelineService, BenchParse } from '../analysis/bench-pipeline-service';
import { DataSource } from '../data-source/data-source';
import { Result } from '../../../shared/util-http/result';
import { SpecPlan } from '../simc/spec-plan-service';
import { ListBenchService, MIN_MEASURED_PARSES } from './priority-list/list-bench-service';
import { LogReading } from './priority-list/list-check-service';
import { ListLogService } from './priority-list/list-log-service';
import { RotationBloodlustService } from './rotation-bloodlust-service';
import { RotationBench } from './rotation-data-source';
import { HoldTargetsService } from '../analysis/hold-targets-service';
import { CastCadenceService } from '../analysis/cast-cadence-service';

/** The rule engine's own floor, so an encounter never benches a parse count every rule band would then reject. */
const MIN_PARSE_COUNT = MIN_MEASURED_PARSES;
const BL_WINDOW_BEFORE_S = 30;
const BL_WINDOW_AFTER_S = 55;
const DOWNTIME_PERCENTILE = 0.9;
const DEFAULT_DOWNTIME_THRESHOLD_S = 1.5;

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
  gapListS: number[];
  durationS: number;
  reading: LogReading;
}

@Injectable({ providedIn: 'root' })
export class RotationTransformService implements DataSource<RotationBench> {
  private readonly holdTargets = inject(HoldTargetsService);
  private readonly castCadence = inject(CastCadenceService);
  private readonly bloodlust = inject(RotationBloodlustService);
  private readonly benchPipeline = inject(BenchPipelineService);
  private readonly wclProjections = inject(WclProjectionsService);
  private readonly wclApi = inject(WclApiService);
  private readonly specPlanLoader = inject(SpecPlanLoaderService);
  private readonly listLogs = inject(ListLogService);
  private readonly listBench = inject(ListBenchService);

  async getBench(spec: string, encounterId: number, selection?: TopParseSelection): Promise<Result<RotationBench>> {
    return this.benchPipeline.benchFromTopParses(this.wclApi, { spec, encounterId, selection }, {
      logSource: 'RotationTransformService',
      errorId: 'rotation.bench',
      minSamples: MIN_PARSE_COUNT,
      noRankingsMessage: 'No top logs for this encounter.',
      tooFewParsesMessage: usable =>
        `Only ${usable} usable top log(s) for this encounter; ${MIN_PARSE_COUNT} are needed to bench it.`,
      plan: {
        plans: this.specPlanLoader,
        pick: plan => (plan.cooldowns.length || plan.lines.length ? plan : null),
        missingMessage: 'No cooldowns or rotation for this spec.',
      },
      iconSpellIds: bench => [...Object.values(bench.cd_spell_ids), ...bench.buttons.map(button => button.spell_id)],
      parse: (parse, plan) => this.parseRotation(parse, plan),
      bench: ({ parses }, plan) => {
        const { downtimeThresholdS, topAvgEfficiency, topEfficiencyStddev } = this.computeEfficiencyThresholds(parses);
        return {
          downtime_threshold_s: downtimeThresholdS,
          top_avg_efficiency: topAvgEfficiency,
          top_efficiency_stddev: topEfficiencyStddev,
          per_cd_benchmarks: this.aggregateCdBenchmarks(parses.map(parse => parse.summaries), plan.cooldowns),
          major_cooldowns: plan.cooldowns,
          list: { lines: plan.lines, variables: plan.variables, spells: plan.spells, talents: plan.talents },
          buttons: this.listBench.bench(plan, parses.map(parse => parse.reading)),
          cd_spell_ids: this.benchPipeline.spellIdsByName([...plan.cooldowns, ...plan.defensives]),
        };
      },
    });
  }

  private async parseRotation({ ranking, fight, player }: BenchParse, plan: SpecPlan): Promise<ParseRotation> {
    const [casts, buffs, reading] = await Promise.all([
      this.wclApi.getAllEvents(ranking.report_code, fight.id, 'Casts', fight.startTime, fight.endTime, player.id, true),
      this.wclApi.getAllEvents(ranking.report_code, fight.id, 'Buffs', fight.startTime, fight.endTime, player.id),
      this.listLogs.read(plan, { reportCode: ranking.report_code, fight, playerId: player.id }),
    ]);
    const fightDurS = this.wclProjections.relativeS(fight.endTime, fight.startTime);
    const castsTimed = this.wclProjections.withRelativeS(casts, fight.startTime);
    const blTimeS = this.bloodlust.detectBloodlust(this.wclProjections.withRelativeS(buffs, fight.startTime));
    return {
      summaries: this.summarizeCooldownCasts(castsTimed, plan.cooldowns, fightDurS, blTimeS),
      gapListS: this.castGapListS(castsTimed),
      durationS: fightDurS,
      reading,
    };
  }

  protected summarizeCooldownCasts(
    castEvents: TimedEvent[], cooldowns: PlanCooldown[],
    fightDurS: number, blTimeS: number | null,
  ): CdSummary[] {
    return cooldowns.map(cooldown => {
      const castTimesS = castEvents
        .filter(cast => cast.type === 'cast' && cast.abilityGameID === cooldown.spell_id)
        .map(cast => cast.atS)
        .sort((a, b) => a - b);

      let blAligned = false;
      let blOffsetS: number | null = null;
      if (blTimeS != null && castTimesS.length) {
        const windowOffsets = castTimesS
          .filter(timeS => blTimeS - BL_WINDOW_BEFORE_S <= timeS && timeS <= blTimeS + BL_WINDOW_AFTER_S)
          .map(timeS => timeS - blTimeS);
        blAligned = windowOffsets.length > 0;
        if (windowOffsets.length) blOffsetS = round(closestToZero(windowOffsets));
      }

      const holdWindows = this.holdTargets.detectHoldWindows(castTimesS, cooldown.cooldown);

      return {
        name: cooldown.name,
        total_uses: castTimesS.length,
        first_cast_s: castTimesS[0] != null ? round(castTimesS[0]) : null,
        bl_aligned: blAligned,
        bl_offset_s: blOffsetS,
        cast_times_s: castTimesS.map(timeS => round(timeS, 2)),
        hold_windows: holdWindows,
        cast_pattern: holdWindows.length ? 'hold' : 'on_cooldown',
        fight_duration_s: fightDurS,
      };
    });
  }

  protected castGapListS(castEvents: TimedEvent[]): number[] {
    const completed = castEvents.filter(event => event.type === 'cast').sort((a, b) => a.atS - b.atS);
    const gaps: number[] = [];
    let prev: TimedEvent | undefined;
    for (const event of completed) {
      if (prev) gaps.push(round(event.atS - prev.atS, 3));
      prev = event;
    }
    return gaps.sort((a, b) => a - b);
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

  protected computeEfficiencyThresholds(
    parses: { gapListS: number[]; durationS: number }[],
  ): { downtimeThresholdS: number; topAvgEfficiency: number; topEfficiencyStddev: number } {
    const allGaps = parses.flatMap(parse => parse.gapListS).sort((a, b) => a - b);
    let downtimeThresholdS = DEFAULT_DOWNTIME_THRESHOLD_S;
    if (allGaps.length) {
      downtimeThresholdS = quantile(allGaps, DOWNTIME_PERCENTILE) ?? DEFAULT_DOWNTIME_THRESHOLD_S;
    }
    const efficiencies: number[] = [];
    for (const { gapListS, durationS } of parses) {
      if (gapListS.length && durationS > 0) {
        const downtimeS = gapListS.filter(gap => gap > downtimeThresholdS).reduce((sum, gap) => sum + gap, 0);
        efficiencies.push(round(castEfficiencyPct(downtimeS, durationS)));
      }
    }
    return {
      downtimeThresholdS: round(downtimeThresholdS, 3),
      topAvgEfficiency: avgOr(efficiencies, 0),
      topEfficiencyStddev: stddevOr(efficiencies, 0),
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
