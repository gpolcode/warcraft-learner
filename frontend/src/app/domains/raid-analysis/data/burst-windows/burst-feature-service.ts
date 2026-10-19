import { CalibrationCapsService } from '../verdict/calibration/calibration-caps-service';
import { FamilyCaps } from '../verdict/tone.models';
import { Injectable, inject } from '@angular/core';
import { extent, mean } from 'd3-array';
import { AliveSpan } from '../analysis/analysis-math';
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
import { CardRankingService } from '../analysis/card-ranking-service';
import { CardRanking } from '../verdict/row-order-service';

const HEALER_REASON = 'Top raiders on your spec are ranked on healing, so there are no burst windows to compare your damage with.';

export interface BurstMapAnchor {
  timeS: number;
  windowLengthS: number;
}

/** `judged` is null on a bench-only view, which judges no pull; `bench` is null on a spec the card compares nothing for; `empty` says, with counts, why nothing is flagged; `notGraded` is empty unless a pull is judged. */
export type BurstView = WindowView<BurstMapAnchor> & { judged: JudgedSpan | null; bench: BenchStrip | null; empty: string; notGraded: NotGradedNote[] };

/** The player's damage, measured the way the harness measures a top log's. */
interface PlayerDamage {
  windows: PlayerBurstWindow[];
  perS: number[];
  aliveSpans: readonly AliveSpan[];
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
  private readonly cardRanking = inject(CardRankingService);

  /** The card's judged windows and the ones it muted, for the page-wide order. */
  ranking(view: BurstView | null): CardRanking {
    return view ? this.cardRanking.ranking(this.cardRanking.windows('Burst windows', view.windows), view.folded) : this.cardRanking.ranking([]);
  }

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

  /** A bench an older ingest wrote carries no per-log damage, so every one of its windows is a comparison. */
  private withMembers(bench: BurstBench): BurstBench {
    const windows = bench.windows.map(window => {
      const stored: Partial<BurstWindow> = window;
      return stored.members ? window : { ...window, members: [] };
    });
    return { ...bench, windows, per_parse: bench.per_parse ?? [] };
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
    );
    const perS = this.judge.series(damageS, this.wclProjections.relativeS(fight.endTime, fight.startTime));
    return this.buildBurstView(bench, { windows: playerWindows, perS, aliveSpans: model.aliveSpans, caps }, model);
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

  /** A null player is a bench-only view, which has no damage of the player's to judge. */
  private burstAdapter(bench: BurstBench, player: PlayerDamage | null): WindowViewAdapter<BurstMapAnchor> {
    const references = bench.windows.map(window => this.judge.reference(window, bench.per_parse ?? [], bench.sources, player?.aliveSpans));
    const measures = bench.windows.map(window => player ? this.judge.measure(player.perS, window, player.aliveSpans) : null);
    return {
      status: (window, _playerDamage, index) => player === null
        ? { ...this.judge.benchVerdict(window), benchOnly: true }
        : this.judge.verdict(window, measures[index] ?? null, references[index] ?? [], player.caps),
      overview: (_window, index) => {
        const reference = references[index] ?? [];
        const [topMin = null, topMax = null] = reference.length ? extent(reference) : [];
        return { playerPct: measures[index]?.amplification ?? null, topAvg: mean(reference) ?? null, topMin, topMax };
      },
      chips: window => this.splitCommonCds(window.common_cds, bench.cd_spell_ids),
      mapAnchor: window => this.burstMapAnchor(window),
      clipAnchor: (window, index) => this.burstClipAnchor(window, index),
      castColumns: true,
    };
  }

  /** A null model is a bench-only view; the player's damage comes with it. */
  protected buildBurstView(bench: BurstBench, player: PlayerDamage | null, model: PullModel | null): JudgedWindows {
    const judged = model ? player : null;
    const view = this.windowView.buildWindowView({
      topWindows: bench.windows, playerWindows: judged?.windows ?? [], model, abilities: bench.ability_icons,
      adapter: this.burstAdapter(bench, judged),
    });
    return {
      ...view,
      judged: model ? this.pullModel.judgedSpan(model, view.folded) : null,
      empty: this.emptyState(bench, view.windows, judged !== null),
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
      windows[index]?.status !== 'muted' && this.judge.reference(window, bench.per_parse ?? [], bench.sources).length >= VERDICT_CHOICES.minReferenceN).length;
    return `Nothing flagged. ${checked} of ${windows.length} ${windows.length === 1 ? 'window' : 'windows'} checked against the ${topLogs}.`;
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
