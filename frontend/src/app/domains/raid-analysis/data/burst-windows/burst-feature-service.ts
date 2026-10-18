import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import { BurstWindow, PlayerBurstWindow } from '../analysis/analysis.models';
import { WindowStatus } from '../analysis/window-comparison.models';
import { ClipAnchor } from '../capture/capture.models';
import { Result, Results } from '../../../shared/util-http/result';
import { WclProjectionsService, AbilityIcons, TimedEvent } from '../analysis/wcl-projections-service';
import { WindowView, WindowViewAdapter } from '../analysis/window-view-service';
import { PullContextService, PullContext, PullRef } from '../analysis/pull-context-service';
import { BURST_DATA_SOURCE, BurstBench } from './burst-data-source';
import { WindowViewService } from '../analysis/window-view-service';
import { JudgedSpan, PullModel, PullModelService } from '../analysis/pull-model-service';

export interface BurstMapAnchor {
  timeS: number;
  windowLengthS: number;
}

/** `judged` is null on a bench-only view, which judges no pull. */
export type BurstView = WindowView<BurstMapAnchor> & { judged: JudgedSpan | null };

@Injectable({ providedIn: 'root' })
export class BurstFeatureService {
  private readonly windowView = inject(WindowViewService);
  private readonly pullContext = inject(PullContextService);
  private readonly wclProjections = inject(WclProjectionsService);
  private readonly source = inject(BURST_DATA_SOURCE);
  private readonly wclApi = inject(WclApiService);
  private readonly pullModel = inject(PullModelService);

  async loadPlayerView(
    spec: string, encounterId: number, reportCode: string, fightId: number, playerId: number,
  ): Promise<Result<BurstView>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;

    const pull: PullRef = { reportCode, fightId, playerId };
    return this.pullContext.analyzePull(this.wclApi, pull, {
      logSource: 'BurstFeatureService.loadPlayerView',
      errorId: 'burst.player-view',
      emptyView: () => this.benchOnlyView(bench.value),
      analyze: context => this.playerView(bench.value, pull, context),
    });
  }

  private async playerView(bench: BurstBench, pull: PullRef, context: PullContext): Promise<BurstView> {
    const { reportCode, fightId, playerId } = pull;
    const { report, fight, model } = context;
    const abilities = report.masterData?.abilities ?? [];
    // Names only, to attribute the player's casts by ability name in each window.
    const abilityNames = new Map<number, string>();
    for (const ability of abilities) abilityNames.set(ability.gameID, ability.name);

    // With resources, the same reads the rotation card makes, so one fetch serves both.
    const [casts, buffs, damage] = await Promise.all([
      this.wclApi.getAllEvents(reportCode, fightId, 'Casts', fight.startTime, fight.endTime, playerId, true),
      this.wclApi.getAllEvents(reportCode, fightId, 'Buffs', fight.startTime, fight.endTime, playerId),
      this.wclApi.getAllEvents(reportCode, fightId, 'DamageDone', fight.startTime, fight.endTime, playerId, true),
    ]);
    const presses = this.wclProjections.presses(casts, bench.press_folds ?? [], { buffs, abilities });
    const playerWindows = this.findPlayerBurstWindows(
      bench.windows, this.wclProjections.withRelativeS(damage, fight.startTime), this.wclProjections.withRelativeS(presses, fight.startTime), abilityNames,
    );
    return this.buildBurstView(bench.windows, playerWindows, model, bench.cd_spell_ids, bench.ability_icons);
  }

  async loadBenchView(spec: string, encounterId: number): Promise<Result<BurstView>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;
    return Results.ok(this.benchOnlyView(bench.value));
  }

  /** Higher player damage is better, so falling short of the top-parse range is the problem. */
  protected burstWindowStatus(
    playerDamage: number | null,
    topAvg: number,
    topMin: number,
    stddev: number,
    benchOnly = false,
  ): { status: WindowStatus; icon: string } {
    // Pre-fight has no player log to compare, so the window is purely informational.
    if (benchOnly) return { status: 'info', icon: 'insights' };
    if (playerDamage === null) return { status: 'muted', icon: 'help_outline' };
    if (playerDamage < topMin - stddev) return { status: 'bad', icon: 'error' };
    if (topAvg > 0 && playerDamage < topAvg - stddev) return { status: 'warn', icon: 'warning_amber' };
    return { status: 'good', icon: 'check_circle' };
  }

  protected splitCommonCds(
    commonCds: string[],
    cdSpellIds: Record<string, number>,
  ): { spellIds: number[]; labels: string[] } {
    const spellIds: number[] = [];
    const labels: string[] = [];
    for (const name of commonCds) {
      const spellId = cdSpellIds[name];
      if (spellId) spellIds.push(spellId);
      else labels.push(name);
    }
    return { spellIds, labels };
  }

  protected burstMapAnchor(window: BurstWindow): BurstMapAnchor {
    return { timeS: window.time_s, windowLengthS: window.window_length_s };
  }

  /** The `key` is the stable id clips are memoized under. */
  protected burstClipAnchor(window: BurstWindow, index: number): ClipAnchor {
    return { timeS: window.time_s, windowLengthS: window.window_length_s, key: `burst-${index}` };
  }

  private burstAdapter(cdSpellIds: Record<string, number>, benchOnly: boolean): WindowViewAdapter<BurstMapAnchor> {
    return {
      status: (window, playerDamage) =>
        this.burstWindowStatus(playerDamage, window.dmg_avg, window.dmg_min, window.dmg_stddev, benchOnly),
      chips: window => this.splitCommonCds(window.common_cds, cdSpellIds),
      mapAnchor: window => this.burstMapAnchor(window),
      clipAnchor: (window, index) => this.burstClipAnchor(window, index),
      castColumns: true,
    };
  }

  protected buildBurstView(
    topWindows: BurstWindow[],
    playerWindows: PlayerBurstWindow[],
    model: PullModel | null,
    cdSpellIds: Record<string, number>,
    abilities: AbilityIcons,
  ): BurstView {
    const view = this.windowView.buildWindowView({
      topWindows, playerWindows, model, abilities, adapter: this.burstAdapter(cdSpellIds, model === null),
    });
    return { ...view, judged: model ? this.pullModel.judgedSpan(model, view.folded) : null };
  }

  private benchOnlyView(bench: BurstBench): BurstView {
    return this.buildBurstView(bench.windows, [], null, bench.cd_spell_ids, bench.ability_icons);
  }

  protected findPlayerBurstWindows(
    topWindows: BurstWindow[],
    dmgEvents: TimedEvent[],
    castEvents: TimedEvent[],
    abilityNames: Map<number, string>,
  ): PlayerBurstWindow[] {
    const nameOf = (spellId: number): string => abilityNames.get(spellId) ?? `Spell ${spellId}`;
    return this.windowView.playerWindowDamage(topWindows, dmgEvents, { attribution: { casts: castEvents, nameOf } });
  }
}
