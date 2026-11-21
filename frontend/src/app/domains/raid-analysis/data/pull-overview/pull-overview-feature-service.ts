import { Injectable, inject } from '@angular/core';
import * as z from '../../../shared/util-validation/zod-mini';
import { WclApiService } from '../wcl/wcl-api-service';
import { RankingMetric, WclFight, WclReport, WclTableBlob } from '../wcl/wcl.models';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from '../http/http-load-error';
import { WclProjectionsService, TimedEvent } from '../analysis/wcl-projections-service';
import { JsonCodecService } from '../../../shared/util-validation/json-codec-service';
import { DeathTimelineService } from '../analysis/death-timeline-service';
import { SpecRoleService } from '../analysis/spec-role-service';
import { BenchStripService, ValueRange } from '../analysis/bench-strip-service';
import { spansS } from '../analysis/analysis-math';
import { GEAR_DATA_SOURCE, GearBench } from '../gear/gear-data-source';

type PullResult = 'kill' | 'wipe';

export interface PullDeathRow {
  index: number;
  timeS: number;
  ability: string;
}

export interface PullOverviewView {
  attempt: number;
  result: PullResult;
  durationS: number;
  bossPercentage: number;
  /** What the spec's top logs are ranked on, so the player's figure and the reference measure the same thing. */
  metric: RankingMetric;
  /** Per second over the whole pull, WCL's own figure. */
  amount: number;
  /** Per second over the time the player was alive; null when they never died. */
  aliveAmount: number | null;
  /** The top logs' ranked figures, every one a kill; null without a bench ranked on the same metric. */
  reference: ValueRange | null;
  deaths: PullDeathRow[];
  outcomeTimeS: number;
}

const WIPE_DEATHS = 3;

const DAMAGE_TABLE_SCHEMA = z.looseObject({
  data: z.optional(z.looseObject({
    entries: z.optional(z.array(z.looseObject({ id: z.number(), total: z.number() }))),
  })),
});

@Injectable({ providedIn: 'root' })
export class PullOverviewFeatureService {
  private readonly json = inject(JsonCodecService);
  private readonly logger = inject(LoggerService);
  private readonly wclProjections = inject(WclProjectionsService);
  private readonly deathTimeline = inject(DeathTimelineService);
  private readonly wclApi = inject(WclApiService);
  private readonly specRoles = inject(SpecRoleService);
  private readonly benchStrips = inject(BenchStripService);
  private readonly gearBench = inject(GEAR_DATA_SOURCE);

  async loadView(
    pull: { spec: string; encounterId: number; reportCode: string; playerId: number }, fight: WclFight,
  ): Promise<Result<PullOverviewView>> {
    const { spec, encounterId, reportCode, playerId } = pull;
    const result: PullResult = fight.kill ? 'kill' : 'wipe';
    const metric = this.specRoles.rankingMetric(spec);

    try {
      const report = await this.wclApi.getReport(reportCode);
      const names = this.abilityNameMap(report);

      const [table, deathEvents, bench] = await Promise.all([
        this.wclApi.getTable(reportCode, fight.id, metric === 'hps' ? 'Healing' : 'DamageDone'),
        this.wclApi.getAllEvents(reportCode, fight.id, 'Deaths', fight.startTime, fight.endTime),
        this.gearBench.getBench(spec, encounterId),
      ]);

      const total = this.totalFromTable(table, playerId, metric);
      if (!total.ok) return total;

      const deathEventsTimed = this.wclProjections.withRelativeS(deathEvents, fight.startTime);
      const deaths = this.buildDeathRows(deathEventsTimed, playerId, names);
      // A wipe needs them for its outcome and a death for the alive time; a clean kill reads neither.
      const resurrectsTimed = result === 'wipe' || deaths.length ? await this.resurrects(reportCode, fight) : [];
      const { outcomeTimeS, aliveS } = this.timeline(fight, playerId, deathEventsTimed, resurrectsTimed);

      return Results.ok({
        attempt: fight.attempt,
        result,
        durationS: fight.duration_s,
        bossPercentage: fight.fightPercentage,
        metric,
        amount: this.perSecond(total.value, fight.duration_s),
        aliveAmount: deaths.length ? this.perSecond(total.value, aliveS) : null,
        reference: this.reference(bench, metric),
        deaths,
        outcomeTimeS,
      });
    } catch (cause) {
      this.logger.logWarn('PullOverviewFeatureService.loadView', cause);
      return HttpLoadErrors.toLoadError(cause, 'pull-overview.view');
    }
  }

  // null means an unusable table (absent/unparseable/no entries array); a valid table can still have an empty entry list (a real 0-damage pull).
  private tableEntries(blob: WclTableBlob | null): { id: number; total: number }[] | null {
    if (!blob) return null;
    const parsed = typeof blob === 'string'
      ? this.json.parseJson(DAMAGE_TABLE_SCHEMA, blob, 'pull-overview.tableEntries')
      : blob;
    const entries = parsed?.data?.entries;
    return Array.isArray(entries) ? entries : null;
  }

  // An unusable table is a permanent load failure (a played pull would show a bogus 0); a player absent from a valid table is a real 0.
  protected totalFromTable(blob: WclTableBlob | null, playerId: number, metric: RankingMetric): Result<number> {
    const entries = this.tableEntries(blob);
    if (!entries) {
      return Results.permanent(`${metric === 'hps' ? 'Healing' : 'Damage'} table missing for this pull.`, 'pull-overview.damage-table');
    }
    return Results.ok(entries.find(row => row.id === playerId)?.total ?? 0);
  }

  private timeline(fight: WclFight, playerId: number, deaths: TimedEvent[], resurrects: TimedEvent[]): { outcomeTimeS: number; aliveS: number } {
    const durationS = fight.duration_s;
    return {
      outcomeTimeS: fight.kill ? durationS : this.deathTimeline.firstDeadAtOnceS(deaths, resurrects, WIPE_DEATHS) ?? durationS,
      aliveS: durationS - spansS(this.deathTimeline.deadSpans(deaths, resurrects, durationS).get(playerId) ?? []),
    };
  }

  private async resurrects(reportCode: string, fight: WclFight): Promise<TimedEvent[]> {
    return this.wclProjections.withRelativeS(await this.wclApi.getResurrects(reportCode, fight.id, fight.startTime, fight.endTime), fight.startTime);
  }

  /** A bench ranked on another figure measures something else, so it is no reference. */
  private reference(bench: Result<GearBench>, metric: RankingMetric): ValueRange | null {
    return bench.ok && bench.value.metric === metric ? this.benchStrips.amountRange(bench.value) : null;
  }

  /** An empty span measures nothing, not a failure. */
  protected perSecond(total: number, seconds: number): number {
    return seconds > 0 ? total / seconds : 0;
  }

  protected abilityNameMap(report: WclReport): Map<number, string> {
    const map = new Map<number, string>();
    for (const ability of report.masterData?.abilities ?? []) map.set(ability.gameID, ability.name);
    return map;
  }

  protected buildDeathRows(
    deathEvents: TimedEvent[],
    playerId: number,
    names: Map<number, string>,
  ): PullDeathRow[] {
    return deathEvents
      .filter(event => event.targetID === playerId)
      .sort((a, b) => a.atS - b.atS)
      .map((event, i) => {
        const abilityId = event.killingAbilityGameID ?? 0;
        return {
          index: i + 1,
          timeS: event.atS,
          ability: abilityId ? (names.get(abilityId) ?? '') : '',
        };
      });
  }
}
