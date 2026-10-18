import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import { WclAbility } from '../wcl/wcl.models';
import {
  AnalysisFinding, BurstWindow, PlayerBurstWindow, PlayerDefensive,
} from '../analysis/analysis.models';
import { FindingRow, FindingRowsService, OnPlanChip } from '../analysis/finding-rows-service';
import { PerDefensiveBenchmark } from '../encounter/encounter.models';
import { ComparisonWindow, WindowStatus } from '../analysis/window-comparison.models';
import { ClipAnchor } from '../capture/capture.models';
import { Result, Results } from '../../../shared/util-http/result';
import { benchExpectedUses, buttonTaken, round, sortBySeverity } from '../analysis/analysis-math';
import { CadenceVoice } from '../analysis/cast-cadence-service';
import { WclProjectionsService, AbilityIcons, TimedEvent } from '../analysis/wcl-projections-service';
import { WindowView, WindowViewAdapter } from '../analysis/window-view-service';
import { PullContextService, PullContext, PullRef } from '../analysis/pull-context-service';
import {
  DEFENSIVE_DATA_SOURCE, DefensiveBench, DefensivePlanMeta,
} from './defensive-data-source';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { HoldTargetsService } from '../analysis/hold-targets-service';
import { AuraWindowsService } from '../analysis/aura-windows-service';
import { CastCadenceService } from '../analysis/cast-cadence-service';
import { GearExtractService } from '../gear/gear-extract-service';
import { WindowViewService } from '../analysis/window-view-service';
import { FoldCounts, JudgedSpan, PullModel, PullModelService } from '../analysis/pull-model-service';
import { DefensiveUsesService } from './defensive-uses-service';
import { BenchStrip, BenchStripService } from '../analysis/bench-strip-service';

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

const DEFENSIVE_VOICE: CadenceVoice = {
  unit: 'use(s)',
  firstCastPhrase: 'was first used at',
  gapNoun: 'uses',
  underuseRemedy: (name, missing) => `Use ${name} ${missing}x more.`,
  firstCastRemedy: name => `Use ${name} earlier.`,
  gapRemedy: name => `Use ${name} sooner after it resets.`,
};

const TOP_DAMAGE_SOURCES = 6;

const WINDOW_NEAR_S = 3;

/** Annotations naming whether the expected defensive was pressed; do not set the status. */
const NOTE_COVERED = 'covered';
const NOTE_NO_DEFENSIVE = 'no defensive used';
const NOTE_USED_WRONGLY = 'defensive used wrongly';
const NOTE_NEEDED_UNUSED = 'defensive needed, unused';

export interface DefensiveWindowsInput {
  topWindows: BurstWindow[];
  playerWindows: PlayerBurstWindow[];
  playerDefensives: PlayerDefensive[];
  model: PullModel;
  abilities: AbilityIcons;
}

interface DefensiveScan { findings: AnalysisFinding[]; folded: FoldCounts; }

@Injectable({ providedIn: 'root' })
export class DefensiveFeatureService {
  private readonly logger = inject(LoggerService);
  private readonly findingRows = inject(FindingRowsService);
  private readonly holdTargets = inject(HoldTargetsService);
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
    const strip = this.benchStrips.strip(bench.value);
    return this.pullContext.analyzePull(this.wclApi, pull, {
      logSource: 'DefensiveFeatureService.loadAnalysisView',
      errorId: 'defensive.player-view',
      emptyView: () => ({ findingRows: [], onPlan: [], windows: [], anchors: [], clipAnchors: [], findingsSpan: null, windowsSpan: null, bench: strip }),
      analyze: async context => ({ ...await this.analysisView(bench.value, pull, context), bench: strip }),
    });
  }

  private async analysisView(bench: DefensiveBench, pull: PullRef, context: PullContext): Promise<Omit<DefensiveView, 'bench'>> {
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
    const { findings, folded } = bench.defensives.length && playerDefensives.length
      ? this.analyzeDefensiveFindings(playerDefensives, bench.per_defensive_benchmarks, model)
      : { findings: [], folded: this.pullModel.noFolds() };

    const playerWindows = this.computePlayerDefensiveWindows(bench.defensive_windows, dtEventsTimed);
    const iconByName: Record<string, string> = {};
    for (const [name, spellId] of Object.entries(bench.cd_spell_ids)) {
      const ability = bench.ability_icons[spellId];
      if (!ability) this.logger.logWarn('loadAnalysisView: ability id missing from ability map', spellId);
      iconByName[name] = ability?.icon ?? '';
    }
    const { windows, anchors, clipAnchors, folded: windowsFolded } = this.buildDefensiveWindows({
      topWindows: bench.defensive_windows, playerWindows, playerDefensives, model, abilities: bench.ability_icons,
    });
    const entries = this.findingRows.bucketFindings(findings, {
      spellId: name => bench.cd_spell_ids[name] ?? null,
      icon: name => iconByName[name] ?? '',
    });
    return {
      findingRows: this.findingRows.rowsFromEntries(entries),
      onPlan: this.findingRows.onPlanFromEntries(entries),
      windows, anchors, clipAnchors,
      findingsSpan: this.pullModel.judgedSpan(model, folded),
      windowsSpan: this.pullModel.judgedSpan(model, windowsFolded),
    };
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
      const cast_times_s = windows.map(window => window.start_s);
      const entry: PlayerDefensive = { name: defensive.name, uses: windows.length, cast_times_s, windows };
      if (!buttonTaken(defensive, talents)) entry.talent_gated = true;
      return entry;
    });
  }

  private usageSuccessFindings(name: string, uses: number, expected: number): AnalysisFinding[] {
    if (uses === 0) return [];
    return [{ severity: 'success', category: 'cooldown_usage', cd_name: name,
      message: `${name} - ${uses}/${expected} uses.`, occurrences: [] }];
  }

  private unbenchedFindings(name: string, uses: number): AnalysisFinding[] {
    if (uses === 0) return [];
    return [{ severity: 'success', category: 'cooldown_usage', cd_name: name,
      message: `${name} was used ${uses} times. No top-parse data to compare against.`, occurrences: [] }];
  }

  protected analyzeOneDefensive(
    defensive: PlayerDefensive,
    defBench: PerDefensiveBenchmark | undefined,
    model: PullModel,
  ): DefensiveScan {
    const { name, uses } = defensive;
    const none = this.pullModel.noFolds();

    if (defensive.talent_gated && uses === 0) return { findings: [], folded: none };

    if (!defBench) return { findings: this.unbenchedFindings(name, uses), folded: none };

    const { expected, floor } = benchExpectedUses(model.aliveSpans, defBench);
    const castTimesS = defensive.cast_times_s ?? [];

    const checked = this.castCadence.usedByMajority(defBench)
      ? this.castCadence.checkUseCount(DEFENSIVE_VOICE, name, castTimesS, defBench, { expected, floor, model })
      : [];
    checked.push(...this.castCadence.checkGaps(DEFENSIVE_VOICE, name, castTimesS, defBench));
    if (uses > 0) checked.push(...this.holdTargets.holdSuggestionFindings(name, castTimesS, defBench.hold_targets, model.judgedEndS));
    const { kept, folded } = this.pullModel.foldFindings(model, checked);

    const issues = kept.filter(finding => finding.category !== 'hold_suggestion');
    const holds = kept.filter(finding => finding.category === 'hold_suggestion');
    const findings = issues.length ? issues : this.usageSuccessFindings(name, uses, expected);
    return { findings: [...findings, ...holds], folded };
  }

  protected analyzeDefensiveFindings(
    playerDefensives: PlayerDefensive[],
    perDefBench: Record<string, PerDefensiveBenchmark>,
    model: PullModel,
  ): DefensiveScan {
    const findings: AnalysisFinding[] = [];
    let folded = this.pullModel.noFolds();
    for (const defensive of playerDefensives) {
      const scan = this.analyzeOneDefensive(defensive, perDefBench[defensive.name], model);
      findings.push(...scan.findings);
      folded = this.pullModel.addFolds(folded, scan.folded);
    }
    sortBySeverity(findings);
    return { findings, folded };
  }

  protected computePlayerDefensiveWindows(topDefWindows: BurstWindow[], dtEvents: TimedEvent[]): PlayerBurstWindow[] {
    return this.windowView.playerWindowDamage(topDefWindows, dtEvents, { maxAbilities: TOP_DAMAGE_SOURCES });
  }

  protected playerCoveredWindow(
    window: BurstWindow, playerDefensive: PlayerDefensive | undefined,
  ): boolean {
    if (!playerDefensive) return false;
    const lo = window.time_s - WINDOW_NEAR_S;
    const hi = window.time_s + window.window_length_s + WINDOW_NEAR_S;
    return playerDefensive.windows.some(span => span.start_s <= hi && span.end_s >= lo);
  }

  // Status is driven by damage TAKEN vs the band (less is better); coverage only annotates, never gates.
  protected defensiveWindowStatus(
    playerDamage: number | null,
    topMax: number,
    stddev: number,
    covered: boolean,
  ): { status: WindowStatus; icon: string; note: string } {
    if (playerDamage === null) return { status: 'muted', icon: 'help_outline', note: '' };
    const aboveBand = playerDamage > topMax + stddev;
    if (aboveBand) {
      return { status: 'bad', icon: 'error', note: covered ? NOTE_USED_WRONGLY : NOTE_NEEDED_UNUSED };
    }
    return { status: 'good', icon: 'check_circle', note: covered ? NOTE_COVERED : NOTE_NO_DEFENSIVE };
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

  private defensiveAdapter(playerDefensives: PlayerDefensive[]): WindowViewAdapter<DefensiveMapAnchor> {
    const coveredBy = (window: BurstWindow): boolean =>
      this.playerCoveredWindow(window, playerDefensives.find(entry => entry.name === (window.defensive_name ?? '')));
    return {
      status: (window, playerDamage) => this.defensiveWindowStatus(playerDamage, window.dmg_max, window.dmg_stddev, coveredBy(window)),
      chips: window => ({
        spellIds: window.spell_id != null ? [window.spell_id] : [],
        labels: window.spell_id == null && window.defensive_name ? [window.defensive_name] : [],
      }),
      mapAnchor: window => this.defensiveMapAnchor(window),
      clipAnchor: (window, index) => this.defensiveClipAnchor(window, index),
    };
  }

  protected buildDefensiveWindows(
    { topWindows, playerWindows, playerDefensives, model, abilities }: DefensiveWindowsInput,
  ): WindowView<DefensiveMapAnchor> {
    return this.windowView.buildWindowView({
      topWindows, playerWindows, model, abilities, adapter: this.defensiveAdapter(playerDefensives),
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
