import { CalibrationCapsService } from '../verdict/calibration/calibration-caps-service';
import { FamilyCaps } from '../verdict/tone.models';
import { Injectable, inject } from '@angular/core';
import { max, mean, min } from 'd3-array';
import { WclApiService } from '../wcl/wcl-api-service';
import { WclAbility } from '../wcl/wcl.models';
import {
  AnalysisFinding, BurstWindow, PlayerBurstWindow, PlayerDefensive,
} from '../analysis/analysis.models';
import { FindingRow, FindingRowsService, OnPlanChip } from '../analysis/finding-rows-service';
import { PerDefensiveBenchmark } from '../encounter/encounter.models';
import { ComparisonWindow } from '../analysis/window-comparison.models';
import { ClipAnchor } from '../capture/capture.models';
import { Result, Results } from '../../../shared/util-http/result';
import { buttonTaken, round, sortBySeverity } from '../analysis/analysis-math';
import { WclProjectionsService, AbilityIcons, TimedEvent } from '../analysis/wcl-projections-service';
import { WindowView, WindowViewAdapter } from '../analysis/window-view-service';
import { PullContextService, PullContext, PullRef } from '../analysis/pull-context-service';
import {
  DEFENSIVE_DATA_SOURCE, DefensiveBench, DefensivePlanMeta,
} from './defensive-data-source';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { AuraWindowsService } from '../analysis/aura-windows-service';
import { CastCadenceService } from '../analysis/cast-cadence-service';
import { CastsByName } from '../rotation/cadence-judge-service';
import { GearExtractService } from '../gear/gear-extract-service';
import { WindowViewService } from '../analysis/window-view-service';
import { FoldCounts, JudgedSpan, PullModel, PullModelService } from '../analysis/pull-model-service';
import { DefensiveUsesService } from './defensive-uses-service';
import {
  DEAD_IN_WINDOW_FAMILY, DEFENSIVE_HOLD_FAMILY, DEFENSIVE_READY_TIME_FAMILY, DEFENSIVE_USES_FAMILY, DEFENSIVE_WINDOW_FAMILY,
  DefensiveJudgeService,
} from './defensive-judge-service';
import { NotGradedNote } from '../verdict/calibration/calibration.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { BenchStrip, BenchStripService } from '../analysis/bench-strip-service';
import { CardRankingService } from '../analysis/card-ranking-service';
import { CardRanking, RowOrderService } from '../verdict/row-order-service';

export interface DefensiveMapAnchor {
  timeS: number;
  refGameId: number | null;
  windowLengthS?: number;
}

export interface DefensiveView {
  findingRows: FindingRow[];
  onPlan: OnPlanChip[];
  windows: ComparisonWindow[];
  anchors: DefensiveMapAnchor[];
  clipAnchors: ClipAnchor[];
  /** Null on the empty view, where no pull was judged. */
  findingsSpan: JudgedSpan | null;
  windowsSpan: JudgedSpan | null;
  bench: BenchStrip | null;
  /** Each defensive card's checks calibration leaves without a color. */
  notGraded: { defensives: NotGradedNote[]; windows: NotGradedNote[] };
  /** Both cards' judged rows, for the page-wide order. */
  ranking: CardRanking;
  /** Why the Defensives card flags nothing, with counts. */
  findingsEmpty: string;
  /** Why the Defensive windows card flags nothing, with counts; empty where a window is flagged. */
  windowsEmpty: string;
}

export interface DefensivePlanRow {
  name: string;
  spellId: number | null;
  icon: string;
  /** Median casts among the parses that used it at least once; null when none did. */
  typicalUses: number | null;
  usedSampleCount: number;
  sampleCount: number;
  firstCastS: number | null;
  windowsS: number[];
  holds: { castIndex: number; targetS: number }[];
}

export interface DefensivePlanView {
  rows: DefensivePlanRow[];
}

const TOP_DAMAGE_SOURCES = 6;

export interface DefensiveWindowsInput {
  topWindows: BurstWindow[];
  playerWindows: PlayerBurstWindow[];
  playerDefensives: PlayerDefensive[];
  model: PullModel;
  abilities: AbilityIcons;
  /** Damage the player took in each whole second, the measure every top log's is baked in. */
  takenPerS: number[];
  /** The bench's top logs as the window checks read them. */
  top: Pick<DefensiveBench, 'per_parse' | 'sources'>;
  caps?: FamilyCaps;
}

interface DefensiveScan { findings: AnalysisFinding[]; folded: FoldCounts; checked: number; }

/** The bench's top logs as the defensive checks read them: their uses and each kill's length, both in the order of `sources`. */
interface DefensiveTopLogs { perParse: readonly CastsByName[]; killsS: readonly (number | null)[]; }

const NO_TOP_LOGS: DefensiveTopLogs = { perParse: [], killsS: [] };

@Injectable({ providedIn: 'root' })
export class DefensiveFeatureService {
  private readonly logger = inject(LoggerService);
  private readonly findingRows = inject(FindingRowsService);
  private readonly judge = inject(DefensiveJudgeService);
  private readonly auraWindows = inject(AuraWindowsService);
  private readonly defensiveUses = inject(DefensiveUsesService);
  private readonly castCadence = inject(CastCadenceService);
  private readonly windowView = inject(WindowViewService);
  private readonly pullModel = inject(PullModelService);
  private readonly pullContext = inject(PullContextService);
  private readonly wclProjections = inject(WclProjectionsService);
  private readonly source = inject(DEFENSIVE_DATA_SOURCE);
  private readonly wclApi = inject(WclApiService);
  private readonly gearExtract = inject(GearExtractService);
  private readonly benchStrips = inject(BenchStripService);
  private readonly calibration = inject(CalibrationCapsService);
  private readonly cardRanking = inject(CardRankingService);
  private readonly rowOrder = inject(RowOrderService);

  /** The view's judged rows, or none on a failed load. */
  ranking(view: DefensiveView | null): CardRanking {
    return view?.ranking ?? this.cardRanking.ranking([]);
  }

  // A WCL fetch failure surfaces as an err, never a silent bench-only degrade.
  async loadAnalysisView(
    spec: string,
    encounterId: number,
    reportCode: string,
    fightId: number,
    playerId: number,
  ): Promise<Result<DefensiveView>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;

    const pull: PullRef = { reportCode, fightId, playerId };
    const caps = await this.calibration.load(spec, encounterId);
    const strip = this.benchStrips.strip(bench.value);
    const notGraded = {
      defensives: this.calibration.notGraded(caps, [DEFENSIVE_USES_FAMILY, DEFENSIVE_READY_TIME_FAMILY, DEFENSIVE_HOLD_FAMILY]),
      windows: this.calibration.notGraded(caps, [DEFENSIVE_WINDOW_FAMILY, DEAD_IN_WINDOW_FAMILY]),
    };
    return this.pullContext.analyzePull(this.wclApi, pull, {
      logSource: 'DefensiveFeatureService.loadAnalysisView',
      errorId: 'defensive.player-view',
      emptyView: () => ({
        findingRows: [], onPlan: [], windows: [], anchors: [], clipAnchors: [], findingsSpan: null, windowsSpan: null, bench: strip, notGraded,
        ranking: this.cardRanking.ranking([]),
        findingsEmpty: this.findingsEmpty(0, bench.value), windowsEmpty: this.windowsEmpty(bench.value, []),
      }),
      analyze: async context => ({ ...await this.analysisView(bench.value, pull, context, caps), bench: strip, notGraded }),
    });
  }

  private async analysisView(bench: DefensiveBench, pull: PullRef, context: PullContext, caps?: FamilyCaps): Promise<Omit<DefensiveView, 'bench' | 'notGraded'>> {
    const { reportCode, fightId, playerId } = pull;
    const { fight, model } = context;

    const [casts, buffs, dtEvents, combatants] = await Promise.all([
      // With resources, the same read the rotation card makes, so one fetch serves both.
      this.wclApi.getAllEvents(reportCode, fightId, 'Casts', fight.startTime, fight.endTime, playerId, true),
      this.wclApi.getAllEvents(reportCode, fightId, 'Buffs', fight.startTime, fight.endTime, playerId),
      this.wclApi.getAllEvents(reportCode, fightId, 'DamageTaken', fight.startTime, fight.endTime, playerId),
      this.wclApi.getCombatantInfo(reportCode, fightId, playerId),
    ]);

    const dtEventsTimed = this.wclProjections.withRelativeS(dtEvents, fight.startTime);
    const abilities = context.report.masterData?.abilities ?? [];
    const presses = this.wclProjections.presses(casts, this.wclProjections.pressFolds(bench.defensives), { buffs, abilities });
    const playerDefensives = this.analyzeDefensives(
      bench.defensives, this.wclProjections.withRelativeS(presses, fight.startTime), this.wclProjections.withRelativeS(buffs, fight.startTime), model.judgedEndS,
      abilities,
      this.gearExtract.pickedTalents(this.gearExtract.selectCombatantInfo(combatants, playerId)),
    );
    const { findings, folded, checked } = bench.defensives.length && playerDefensives.length
      ? this.analyzeDefensiveFindings(playerDefensives, this.withPerParse(bench), model, caps)
      : { findings: [], folded: this.pullModel.noFolds(), checked: 0 };

    const takenPerS = this.judge.takenSeries(dtEventsTimed, model.fightDurationS);
    const playerWindows = this.computePlayerDefensiveWindows(bench.defensive_windows, dtEventsTimed, takenPerS);
    const iconByName: Record<string, string> = {};
    for (const [name, spellId] of Object.entries(bench.cd_spell_ids)) {
      const ability = bench.ability_icons[spellId];
      if (!ability) this.logger.logWarn('loadAnalysisView: ability id missing from ability map', spellId);
      iconByName[name] = ability?.icon ?? '';
    }
    const { windows, anchors, clipAnchors, folded: windowsFolded } = this.buildDefensiveWindows({
      topWindows: bench.defensive_windows, playerWindows, playerDefensives, model, abilities: bench.ability_icons, takenPerS, top: this.withPerParse(bench), caps,
    });
    const entries = this.findingRows.bucketFindings(findings, {
      spellId: name => bench.cd_spell_ids[name] ?? null,
      icon: name => iconByName[name] ?? '',
    });
    const findingRows = this.rowOrder.order(this.findingRows.rowsFromEntries(entries), row => ({ ...row, tone: row.severity }));
    return {
      findingRows,
      onPlan: this.findingRows.onPlanFromEntries(entries),
      windows, anchors, clipAnchors,
      ranking: this.cardRanking.ranking(
        [...this.cardRanking.findings('Defensives', findingRows), ...this.cardRanking.windows('Defensive windows', windows)],
        this.pullModel.addFolds(folded, windowsFolded),
      ),
      findingsSpan: this.pullModel.judgedSpan(model, folded),
      windowsSpan: this.pullModel.judgedSpan(model, windowsFolded),
      findingsEmpty: this.findingsEmpty(checked, bench),
      windowsEmpty: this.windowsEmpty(bench, windows),
    };
  }

  private topLogs(bench: DefensiveBench): number {
    const stored: Partial<DefensiveBench> = bench;
    return stored.sources?.length ?? 0;
  }

  /** A bench baked before per-log measures reads as no top log, so every check is a comparison. */
  private withPerParse(bench: DefensiveBench): DefensiveBench {
    const stored: Partial<DefensiveBench> = bench;
    return { ...bench, per_parse: stored.per_parse ?? [], sources: stored.sources ?? [] };
  }

  private findingsEmpty(checked: number, bench: DefensiveBench): string {
    if (!checked) return 'Nothing flagged. No defensive on the plan was checked in this pull.';
    return `Nothing flagged. ${checked} ${checked === 1 ? 'defensive' : 'defensives'} checked against ${this.topLogs(bench)} top logs.`;
  }

  /** Empty where a window is flagged. */
  protected windowsEmpty(bench: DefensiveBench, windows: readonly ComparisonWindow[]): string {
    const n = this.topLogs(bench);
    const topLogs = `${n} top ${n === 1 ? 'log' : 'logs'}`;
    if (!windows.length) return `No defensive window to compare. The defensives of the ${topLogs} do not line up in time.`;
    if (windows.some(window => window.status === 'amber' || window.status === 'red')) return '';
    const top = this.withPerParse(bench);
    const killsS = top.sources.map(source => source.duration_s);
    const checked = bench.defensive_windows.filter((window, index) => {
      const reference = this.judge.reference(window, top.per_parse, killsS);
      return windows[index]?.status !== 'muted' && reference.n >= VERDICT_CHOICES.minReferenceN && reference.k > 0;
    }).length;
    return `Nothing flagged. ${checked} of ${windows.length} ${windows.length === 1 ? 'window' : 'windows'} checked against the ${topLogs}.`;
  }

  async loadPlan(spec: string, encounterId: number): Promise<Result<DefensivePlanView>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;
    return Results.ok({ rows: this.buildDefensivePlanRows(bench.value) });
  }

  protected analyzeDefensives(
    defensives: DefensivePlanMeta[],
    castEvents: TimedEvent[],
    buffEvents: TimedEvent[],
    fightEndS: number,
    abilities: readonly WclAbility[],
    talents: ReadonlyMap<number, number> | null,
  ): PlayerDefensive[] {
    if (!defensives.length) return [];
    const buffWin = this.auraWindows.buildAuraWindows(buffEvents);

    return defensives.map(defensive => {
      const windows = this.defensiveUses.uses(
        this.auraWindows.spansNamed(buffWin, defensive, abilities), this.defensiveUses.castTimesS(castEvents, defensive.spell_id), fightEndS,
      ).map(use => ({ start_s: round(use.start_s), end_s: round(use.end_s) }));
      const cast_times_s = this.judge.measureUseTimes(windows);
      const entry: PlayerDefensive = { name: defensive.name, cooldown: defensive.cooldown, uses: windows.length, cast_times_s, windows };
      if (defensive.charges !== undefined) entry.charges = defensive.charges;
      if (!buttonTaken(defensive, talents)) entry.talent_gated = true;
      return entry;
    });
  }

  /** A defensive used with no top-log figure to compare is on plan only as a chip. */
  private onPlan(name: string, uses: number): AnalysisFinding[] {
    return uses ? [this.findingRows.onPlanFinding(name)] : [];
  }

  protected analyzeOneDefensive(
    defensive: PlayerDefensive,
    defBench: PerDefensiveBenchmark | undefined,
    model: PullModel,
    top: DefensiveTopLogs = NO_TOP_LOGS,
    caps?: FamilyCaps,
  ): DefensiveScan {
    const { name, uses } = defensive;
    const none = this.pullModel.noFolds();

    if (defensive.talent_gated && uses === 0) return { findings: [], folded: none, checked: 0 };

    if (!defBench) return { findings: this.onPlan(name, uses), folded: none, checked: 0 };

    const useTimesS = defensive.cast_times_s ?? [];
    const external = this.judge.isExternal(defensive.windows);
    const majority = this.castCadence.usedByMajority(defBench);
    const counted = majority ? this.judge.usesFinding(name, useTimesS, defBench, model, top.perParse, external, caps) : null;
    // Who receives an external and when is an assignment, so only its count is shown.
    const timing = external ? { ready: null, holds: [] } : this.timingFindings(defensive, defBench, { model, top, majority, caps });
    const { kept: holds, folded } = this.pullModel.foldFindings(model, timing.holds);

    const issues = [counted, timing.ready].filter(finding => finding !== null);
    const findings = issues.length ? issues : this.onPlan(name, uses);
    return { findings: [...findings, ...holds], folded, checked: 1 };
  }

  /** A defensive most top logs skip has a noisy reference, so only its holds are checked. */
  private timingFindings(
    defensive: PlayerDefensive, defBench: PerDefensiveBenchmark,
    pull: { model: PullModel; top: DefensiveTopLogs; majority: boolean; caps?: FamilyCaps },
  ): { ready: AnalysisFinding | null; holds: AnalysisFinding[] } {
    const useTimesS = defensive.cast_times_s ?? [];
    const ready = pull.majority && useTimesS.length
      ? this.judge.readyTimeFinding(defensive, useTimesS, pull.model, pull.top, defBench.hold_targets, pull.caps)
      : null;
    return { ready, holds: this.judge.holdFindings(defensive.name, useTimesS, defBench.hold_targets, pull.caps) };
  }

  protected analyzeDefensiveFindings(
    playerDefensives: PlayerDefensive[],
    bench: Pick<DefensiveBench, 'per_defensive_benchmarks' | 'per_parse'> & Partial<Pick<DefensiveBench, 'sources'>>,
    model: PullModel,
    caps?: FamilyCaps,
  ): DefensiveScan {
    const top: DefensiveTopLogs = { perParse: bench.per_parse.map(parse => parse.def_casts_s), killsS: (bench.sources ?? []).map(source => source.duration_s) };
    const findings: AnalysisFinding[] = [];
    let folded = this.pullModel.noFolds();
    let checked = 0;
    for (const defensive of playerDefensives) {
      const scan = this.analyzeOneDefensive(defensive, bench.per_defensive_benchmarks[defensive.name], model, top, caps);
      findings.push(...scan.findings);
      folded = this.pullModel.addFolds(folded, scan.folded);
      checked += scan.checked;
    }
    sortBySeverity(findings);
    return { findings, folded, checked };
  }

  /** The judged figure is the same measure ingest bakes for each top log, so the overview never shows a second number. */
  protected computePlayerDefensiveWindows(topDefWindows: BurstWindow[], dtEvents: TimedEvent[], takenPerS: readonly number[]): PlayerBurstWindow[] {
    const breakdowns = this.windowView.playerWindowDamage(topDefWindows, dtEvents, { maxAbilities: TOP_DAMAGE_SOURCES });
    return breakdowns.map((breakdown, index) => {
      const window = topDefWindows[index];
      return window ? { ...breakdown, window_damage: this.judge.measureTaken(takenPerS, window) } : breakdown;
    });
  }

  protected defensiveMapAnchor(window: BurstWindow): DefensiveMapAnchor {
    return {
      timeS: window.time_s,
      refGameId: window.ref_game_id ?? null,
      windowLengthS: window.window_length_s,
    };
  }

  protected defensiveClipAnchor(window: BurstWindow, index: number): ClipAnchor {
    return { timeS: window.time_s, windowLengthS: window.window_length_s, key: `defensive-${index}` };
  }

  /** Point anchor keyed by the exact cast second, so two findings in one second stay distinct. */
  defensiveFindingClipAnchor(timestampS: number): ClipAnchor {
    return { timeS: timestampS, windowLengthS: 0, key: `defensive-find-${timestampS}` };
  }

  private defensiveAdapter(
    { topWindows, playerDefensives, model, takenPerS, top, caps }: Omit<DefensiveWindowsInput, 'playerWindows' | 'abilities'>,
  ): WindowViewAdapter<DefensiveMapAnchor> {
    const up = this.judge.coverSpans(playerDefensives);
    const killsS = top.sources.map(source => source.duration_s);
    const references = topWindows.map(window => this.judge.reference(window, top.per_parse, killsS));
    const deaths = this.judge.deathHomes(topWindows, model.deadSpans);
    return {
      status: (window, _playerDamage, index) => this.judge.windowVerdict(window, {
        damage: this.judge.measureTaken(takenPerS, window), cover: this.judge.measureCover(window, up), tank: model.role === 'tank',
      }, references[index] ?? this.judge.reference(window, [], []), caps),
      overview: (window, index) => {
        const damages = references[index]?.damages ?? [];
        if (!damages.length) return { playerPct: this.judge.measureTaken(takenPerS, window), topAvg: window.dmg_avg, topMin: window.dmg_min, topMax: window.dmg_max };
        return { playerPct: this.judge.measureTaken(takenPerS, window), topAvg: Math.round(mean(damages) ?? 0), topMin: min(damages) ?? 0, topMax: max(damages) ?? 0 };
      },
      claim: (_window, cause, index) => {
        const diedS = deaths.get(index);
        return cause === 'dead' && diedS !== undefined ? this.judge.deathVerdict(diedS, caps) : null;
      },
      chips: window => ({
        spellIds: window.spell_id != null ? [window.spell_id] : [],
        labels: window.spell_id == null && window.defensive_name ? [window.defensive_name] : [],
      }),
      mapAnchor: window => this.defensiveMapAnchor(window),
      clipAnchor: (window, index) => this.defensiveClipAnchor(window, index),
    };
  }

  protected buildDefensiveWindows(
    { topWindows, playerWindows, playerDefensives, model, abilities, takenPerS, top, caps }: DefensiveWindowsInput,
  ): WindowView<DefensiveMapAnchor> {
    return this.windowView.buildWindowView({
      topWindows, playerWindows, model, abilities, adapter: this.defensiveAdapter({ topWindows, playerDefensives, model, takenPerS, top, caps }),
    });
  }

  private defensivePlanRow(
    defensive: DefensivePlanMeta,
    benchmark: PerDefensiveBenchmark | undefined,
    windowsS: number[],
    abilities: AbilityIcons,
  ): DefensivePlanRow {
    const spellId = defensive.spell_id;
    const ability = abilities[spellId];
    if (!ability) this.logger.logWarn('buildDefensivePlanRows: ability id missing from ability map', spellId);
    return {
      name: defensive.name,
      spellId,
      icon: ability?.icon ?? '',
      ...this.castCadence.cadencePlanUsage(benchmark),
      windowsS,
      holds: this.castCadence.holdsOf(benchmark),
    };
  }

  protected buildDefensivePlanRows(bench: DefensiveBench | null): DefensivePlanRow[] {
    if (!bench?.defensives.length) return [];
    const windows = bench.defensive_windows;
    return bench.defensives.map(defensive => this.defensivePlanRow(
      defensive,
      bench.per_defensive_benchmarks[defensive.name],
      windows.filter(window => window.defensive_name === defensive.name).map(window => window.time_s).sort((a, b) => a - b),
      bench.ability_icons,
    ));
  }
}
