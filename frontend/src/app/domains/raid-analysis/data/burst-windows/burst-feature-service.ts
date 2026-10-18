import { CalibrationCapsService } from '../verdict/calibration/calibration-caps-service';
import { FamilyCaps } from '../verdict/tone.models';
import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import { BurstWindow, PlayerBurstWindow } from '../analysis/analysis.models';
import { ClipAnchor } from '../capture/capture.models';
import { Result, Results } from '../../../shared/util-http/result';
import { WclProjectionsService, TimedEvent } from '../analysis/wcl-projections-service';
import { WindowView, WindowViewAdapter } from '../analysis/window-view-service';
import { PullContextService, PullContext, PullRef } from '../analysis/pull-context-service';
import { BURST_DATA_SOURCE, BurstBench } from './burst-data-source';
import { WindowViewService } from '../analysis/window-view-service';
import { JudgedSpan, PullModel, PullModelService } from '../analysis/pull-model-service';
import { BenchStrip, BenchStripService } from '../analysis/bench-strip-service';
import { SpecRoleService } from '../analysis/spec-role-service';
import { BURST_WINDOW_FAMILY, BurstJudgeService } from './burst-judge-service';
import { NotGradedNote } from '../verdict/calibration/calibration.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';

const HEALER_REASON = 'Top raiders on your spec are ranked on healing, so there are no burst windows to compare your damage with.';

export interface BurstMapAnchor {
  timeS: number;
  windowLengthS: number;
}

/** `judged` is null on a bench-only view, which judges no pull; `bench` is null on a spec the card compares nothing for; `empty` says, with counts, why nothing is flagged; `notGraded` is empty unless a pull is judged. */
export type BurstView = WindowView<BurstMapAnchor> & { judged: JudgedSpan | null; bench: BenchStrip | null; empty: string; notGraded: NotGradedNote[] };

/** The player's damage, measured the way ingest measures a top log's. */
interface PlayerDamage {
  windows: PlayerBurstWindow[];
  ratePerS: number;
  caps?: FamilyCaps;
}

type JudgedWindows = Omit<BurstView, 'bench' | 'notGraded'>;

@Injectable({ providedIn: 'root' })
export class BurstFeatureService {
  private readonly windowView = inject(WindowViewService);
  private readonly pullContext = inject(PullContextService);
  private readonly wclProjections = inject(WclProjectionsService);
  private readonly source = inject(BURST_DATA_SOURCE);
  private readonly calibration = inject(CalibrationCapsService);
  private readonly wclApi = inject(WclApiService);
  private readonly pullModel = inject(PullModelService);
  private readonly benchStrips = inject(BenchStripService);
  private readonly specRoles = inject(SpecRoleService);
  private readonly judge = inject(BurstJudgeService);

  /** Null where the card compares the spec's damage; a healer's top logs are ranked on healing, so none of their damage is a reference. */
  notComparedReason(spec: string): string | null {
    return this.specRoles.isHealer(spec) ? HEALER_REASON : null;
  }

  async loadPlayerView(
    spec: string, encounterId: number, reportCode: string, fightId: number, playerId: number,
  ): Promise<Result<BurstView>> {
    if (this.notComparedReason(spec)) return Results.ok(this.notComparedView());
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;

    const pull: PullRef = { reportCode, fightId, playerId };
    const caps = await this.calibration.load(spec, encounterId);
    const stored = this.withMembers(bench.value);
    const strip = this.benchStrips.strip(stored);
    const notGraded = this.calibration.notGraded(caps, [BURST_WINDOW_FAMILY]);
    return this.pullContext.analyzePull(this.wclApi, pull, {
      logSource: 'BurstFeatureService.loadPlayerView',
      errorId: 'burst.player-view',
      emptyView: () => ({ ...this.benchOnlyView(stored), bench: strip, notGraded }),
      analyze: async context => ({ ...await this.playerView(stored, pull, context, caps), bench: strip, notGraded }),
    });
  }

  /** A bench an older ingest wrote carries no per-log window damage, so every one of its windows is a comparison. */
  private withMembers(bench: BurstBench): BurstBench {
    const windows = bench.windows.map(window => {
      const stored: Partial<BurstWindow> = window;
      return stored.members ? window : { ...window, members: [] };
    });
    return { ...bench, windows };
  }

  private notComparedView(): BurstView {
    return { windows: [], anchors: [], clipAnchors: [], folded: this.pullModel.noFolds(), judged: null, bench: null, empty: '', notGraded: [] };
  }

  private async playerView(bench: BurstBench, pull: PullRef, context: PullContext, caps?: FamilyCaps): Promise<JudgedWindows> {
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
    const damageS = this.wclProjections.withRelativeS(damage, fight.startTime);
    const playerWindows = this.findPlayerBurstWindows(
      bench.windows, damageS, this.wclProjections.withRelativeS(presses, fight.startTime), abilityNames,
      this.wclProjections.relativeS(fight.endTime, fight.startTime),
    );
    const player = { windows: playerWindows, ratePerS: this.judge.aliveRate(damageS, model.aliveSpans), caps };
    return this.buildBurstView(bench, player, model);
  }

  async loadBenchView(spec: string, encounterId: number): Promise<Result<BurstView>> {
    if (this.notComparedReason(spec)) return Results.ok(this.notComparedView());
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;
    return Results.ok({ ...this.benchOnlyView(this.withMembers(bench.value)), bench: this.benchStrips.strip(bench.value), notGraded: [] });
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

  /** A null rate is a bench-only view, which has no player damage to judge. */
  private burstAdapter(cdSpellIds: Record<string, number>, ratePerS: number | null, caps?: FamilyCaps): WindowViewAdapter<BurstMapAnchor> {
    return {
      status: (window, playerDamage) => ratePerS === null
        ? { ...this.judge.benchVerdict(window), benchOnly: true }
        : this.judge.verdict(window, playerDamage ?? 0, ratePerS, caps),
      chips: window => this.splitCommonCds(window.common_cds, cdSpellIds),
      mapAnchor: window => this.burstMapAnchor(window),
      clipAnchor: (window, index) => this.burstClipAnchor(window, index),
      castColumns: true,
    };
  }

  /** A null model is a bench-only view; the player's damage comes with it. */
  protected buildBurstView(bench: BurstBench, player: PlayerDamage | null, model: PullModel | null): JudgedWindows {
    const ratePerS = model && player ? player.ratePerS : null;
    const view = this.windowView.buildWindowView({
      topWindows: bench.windows, playerWindows: player?.windows ?? [], model, abilities: bench.ability_icons,
      adapter: this.burstAdapter(bench.cd_spell_ids, ratePerS, player?.caps),
    });
    return {
      ...view,
      judged: model ? this.pullModel.judgedSpan(model, view.folded) : null,
      empty: this.emptyState(bench, view.windows, ratePerS !== null),
    };
  }

  private benchOnlyView(bench: BurstBench): JudgedWindows {
    return this.buildBurstView(bench, null, null);
  }

  /** Empty where a window is flagged, or on a pre-fight view that has windows. */
  protected emptyState(bench: BurstBench, windows: readonly { status: string; message: string }[], judgesPull: boolean): string {
    const topLogs = `${bench.sample_count} top ${bench.sample_count === 1 ? 'log' : 'logs'}`;
    if (!windows.length) return `No burst window to compare. The biggest bursts of the ${topLogs} do not line up in time.`;
    if (!judgesPull || windows.some(window => window.status === 'amber' || window.status === 'red')) return '';
    const checked = bench.windows.filter((window, index) =>
      windows[index]?.status !== 'muted' && window.members.length >= VERDICT_CHOICES.minReferenceN).length;
    return `Nothing flagged. ${checked} of ${windows.length} ${windows.length === 1 ? 'window' : 'windows'} checked against the ${topLogs}.`;
  }

  protected findPlayerBurstWindows(
    topWindows: BurstWindow[],
    dmgEvents: TimedEvent[],
    castEvents: TimedEvent[],
    abilityNames: Map<number, string>,
    fightLenS: number,
  ): PlayerBurstWindow[] {
    const nameOf = (spellId: number): string => abilityNames.get(spellId) ?? `Spell ${spellId}`;
    const breakdowns = this.windowView.playerWindowDamage(topWindows, dmgEvents, { attribution: { casts: castEvents, nameOf } });
    // The judged figure is the same measure ingest bakes for each top log, so the overview never shows a second number.
    return breakdowns.map((breakdown, index) => {
      const window = topWindows[index];
      if (!window) return breakdown;
      const endS = window.time_s + window.window_length_s;
      return { ...breakdown, window_damage: this.judge.measure(dmgEvents, window.time_s, endS, endS >= fightLenS) };
    });
  }
}
