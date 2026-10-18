import { CalibrationCapsService } from '../verdict/calibration/calibration-caps-service';
import { FamilyCaps } from '../verdict/tone.models';
import { NotGradedNote } from '../verdict/calibration/calibration.models';
import { ROTATION_BUTTON_FAMILY } from './priority-list/button-judge-service';
import { NEVER_USED_FAMILY } from './cooldown-use-judge-service';
import { COOLDOWN_HOLD_FAMILY } from './cadence-judge-service';
import { READY_TIME_FAMILY, ReadyTimeJudgeService, ReadyVoice } from './ready-time-judge-service';
import { DOWNTIME_FAMILY } from './downtime-judge-service';
import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import { AnalysisFinding, CAT_LABEL } from '../analysis/analysis.models';
import { FindingRow, FindingRowsService, OnPlanChip } from '../analysis/finding-rows-service';
import { PerCdBenchmark } from '../encounter/encounter.models';
import { PlanCooldown } from '../plan/plan.models';
import { Result, Results } from '../../../shared/util-http/result';
import { sortBySeverity, buttonTaken } from '../analysis/analysis-math';
import { WclProjectionsService, AbilityIcons, TimedEvent } from '../analysis/wcl-projections-service';
import { PullContextService, PullContext, PullRef } from '../analysis/pull-context-service';
import { ListLogService } from './priority-list/list-log-service';
import { ButtonRow, ListFindingService } from './priority-list/list-finding-service';
import { ROTATION_DATA_SOURCE, RotationBench, RotationParseMeasures } from './rotation-data-source';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { CastCadenceService } from '../analysis/cast-cadence-service';
import { AuraWindowsService } from '../analysis/aura-windows-service';
import { GearExtractService } from '../gear/gear-extract-service';
import { FoldCounts, JudgedSpan, PullModel, PullModelService } from '../analysis/pull-model-service';
import { BenchStrip, BenchStripService } from '../analysis/bench-strip-service';
import { SpecRoleService } from '../analysis/spec-role-service';
import { CooldownUseJudgeService } from './cooldown-use-judge-service';
import { CadenceJudgeService, CastsByName } from './cadence-judge-service';
import { DowntimeJudgeService } from './downtime-judge-service';
import { BLOODLUST_FAMILY, BloodlustJudgeService } from './bloodlust-judge-service';
import { AuraSpan } from '../defensive/defensive-data-source';
import { WclAbility } from '../wcl/wcl.models';

export interface CdPlanRow {
  name: string;
  spellId: number | null;
  icon: string;
  firstCastS: number | null;
  /** Median casts among the parses that used it at least once; null when none did. */
  typicalUses: number | null;
  usedSampleCount: number;
  sampleCount: number;
  usesPerMin: number | null;
  /** At least half of the top logs whose raid lusted mid-fight had it up during their lust. */
  bloodlust: boolean;
  holds: { castIndex: number; targetS: number }[];
}

/** An `ok` result implies the top-parse bench exists. */
export interface RotationPlayerView {
  buttonRows: ButtonRow[];
  downtimeRows: FindingRow[];
  offensiveRows: FindingRow[];
  onPlan: OnPlanChip[];
  /** Null on the empty view, where no pull was judged. */
  downtimeSpan: JudgedSpan | null;
  offensiveSpan: JudgedSpan | null;
  /** The bench judges at least one button, so the Rotation rules card renders even when the pull settled none. */
  buttonsBenched: boolean;
  /** The Rotation rules card's empty state, with how many buttons the list judges. */
  buttonsEmpty: string;
  /** The Offensives card's empty state, with how many cooldowns were checked against how many top logs. */
  offensivesEmpty: string;
  /** The Downtime card's empty state, with how many top logs the idle time was checked against. */
  downtimeEmpty: string;
  bench: BenchStrip | null;
  notGraded: RotationNotGraded;
}

/** Each rotation card's checks calibration leaves without a color. */
interface RotationNotGraded {
  buttons: NotGradedNote[];
  downtime: NotGradedNote[];
  offensives: NotGradedNote[];
}

const OFFENSIVE_FAMILIES = [
  READY_TIME_FAMILY, NEVER_USED_FAMILY, COOLDOWN_HOLD_FAMILY, BLOODLUST_FAMILY,
];

export interface RotationPlanView {
  rows: CdPlanRow[];
}

export interface RotationScanInput {
  model: PullModel;
  castEvents: TimedEvent[];
  buffEvents: TimedEvent[];
  abilities: readonly WclAbility[];
  cooldowns: PlanCooldown[];
  bench: RotationBench;
  talents: ReadonlyMap<number, number> | null;
  caps?: FamilyCaps;
}

interface CooldownScan { issues: AnalysisFinding[]; holds: AnalysisFinding[]; folded: FoldCounts; }

/** The bench's top logs as the cooldown checks read them: their measures and each kill's length, both in the order of `sources`. */
interface TopLogs { perParse: readonly RotationParseMeasures[]; killsS: readonly (number | null)[]; }

const NO_TOP_LOGS: TopLogs = { perParse: [], killsS: [] };

const OFFENSIVE_VOICE: ReadyVoice = { remedy: name => `Press ${name} as soon as it is ready.` };

interface RotationScan { findings: AnalysisFinding[]; folded: FoldCounts; checked: number; downtimeEmpty: string; }

interface FindingBucket { issues: AnalysisFinding[]; holds: AnalysisFinding[]; }

interface ResolvedCd { spellId: number | null; icon: string; rowName: string }

interface PartitionedFindings {
  downtimeFindings: AnalysisFinding[];
  byName: Record<string, FindingBucket>;
  onPlanNames: Set<string>;
}

type CdPlanUsage = Pick<
  CdPlanRow, 'firstCastS' | 'typicalUses' | 'usedSampleCount' | 'sampleCount' | 'usesPerMin' | 'bloodlust'
>;

@Injectable({ providedIn: 'root' })
export class RotationFeatureService {
  private readonly logger = inject(LoggerService);
  private readonly castCadence = inject(CastCadenceService);
  private readonly auraWindows = inject(AuraWindowsService);
  private readonly listLogs = inject(ListLogService);
  private readonly listFindings = inject(ListFindingService);
  private readonly pullContext = inject(PullContextService);
  private readonly wclProjections = inject(WclProjectionsService);
  private readonly source = inject(ROTATION_DATA_SOURCE);
  private readonly wclApi = inject(WclApiService);
  private readonly gearExtract = inject(GearExtractService);
  private readonly pullModel = inject(PullModelService);
  private readonly benchStrips = inject(BenchStripService);
  private readonly specRoles = inject(SpecRoleService);
  private readonly cooldownUses = inject(CooldownUseJudgeService);
  private readonly cadence = inject(CadenceJudgeService);
  private readonly readyTime = inject(ReadyTimeJudgeService);
  private readonly downtime = inject(DowntimeJudgeService);
  private readonly lust = inject(BloodlustJudgeService);
  private readonly findingRows = inject(FindingRowsService);
  private readonly calibration = inject(CalibrationCapsService);

  async loadPlayerView(
    spec: string, encounterId: number, reportCode: string, fightId: number, playerId: number,
  ): Promise<Result<RotationPlayerView>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;

    const pull: PullRef = { reportCode, fightId, playerId };
    const caps = await this.calibration.load(spec, encounterId);
    const strip = this.benchStrips.strip(bench.value);
    const notGraded: RotationNotGraded = {
      buttons: this.calibration.notGraded(caps, [ROTATION_BUTTON_FAMILY]),
      downtime: this.calibration.notGraded(caps, [DOWNTIME_FAMILY]),
      offensives: this.calibration.notGraded(caps, OFFENSIVE_FAMILIES),
    };
    return this.pullContext.analyzePull(this.wclApi, pull, {
      logSource: 'RotationFeatureService.loadPlayerView',
      errorId: 'rotation.player-view',
      emptyView: () => ({
        buttonRows: [], downtimeRows: [], offensiveRows: [], onPlan: [], downtimeSpan: null, offensiveSpan: null,
        buttonsBenched: false, buttonsEmpty: this.buttonsEmpty(bench.value), offensivesEmpty: this.offensivesEmpty(0, bench.value),
        downtimeEmpty: this.downtimeEmpty(null, bench.value), bench: strip, notGraded,
      }),
      analyze: async context => ({ ...await this.playerView(this.withList(bench.value), pull, context, caps), bench: strip, notGraded }),
    });
  }

  /** A healer's top logs heal, so no damage priority list describes how they press their buttons. */
  judgesButtons(spec: string): boolean {
    return !this.specRoles.isHealer(spec);
  }

  /** A bench an older ingest wrote carries no list, and judges no button until the next ingest re-benches it; without per-log measures every check is a comparison. */
  private topLogs(bench: RotationBench): TopLogs {
    const stored: Partial<RotationBench> = bench;
    return { perParse: bench.per_parse, killsS: (stored.sources ?? []).map(source => source.duration_s) };
  }

  private withList(bench: RotationBench): RotationBench {
    const stored: Partial<RotationBench> = bench;
    const listed = stored.list && stored.buttons ? bench : { ...bench, list: { lines: [], variables: [], spells: {}, talents: {} }, buttons: [] };
    return stored.per_parse ? listed : { ...listed, per_parse: [] };
  }

  private buttonsEmpty(bench: RotationBench): string {
    const stored: Partial<RotationBench> = bench;
    const count = stored.buttons?.length ?? 0;
    return `Your log shows no judged moment for any of the ${count} buttons the list judges.`;
  }

  private offensivesEmpty(checked: number, bench: RotationBench): string {
    if (!checked) return 'Nothing flagged. No cooldown on the plan was checked in this pull.';
    const stored: Partial<RotationBench> = bench;
    const n = stored.sources?.length ?? bench.sample_count;
    return `Nothing flagged. ${checked} ${checked === 1 ? 'cooldown' : 'cooldowns'} checked against ${n} top logs.`;
  }

  /** `judged` is the count of top logs the idle time was compared with, or null when the pull had under two casts to measure. */
  private downtimeEmpty(judged: number | null, bench: RotationBench): string {
    if (judged === null) return 'Nothing flagged. No idle time was judged in this pull.';
    if (!judged) return `Nothing flagged. None of the ${bench.sample_count} top logs carries its idle time to compare with.`;
    return `Nothing flagged. Your idle time was checked against ${judged} top logs.`;
  }

  private async playerView(bench: RotationBench, pull: PullRef, context: PullContext, caps?: FamilyCaps): Promise<Omit<RotationPlayerView, 'bench' | 'notGraded'>> {
    const { reportCode, fightId, playerId } = pull;
    const { report, fight, model } = context;
    const abilities = report.masterData?.abilities ?? [];
    const folds = this.wclProjections.pressFolds(bench.major_cooldowns);
    const [casts, buffs, reading, combatants] = await Promise.all([
      this.wclApi.getAllEvents(reportCode, fightId, 'Casts', fight.startTime, fight.endTime, playerId, true),
      this.wclApi.getAllEvents(reportCode, fightId, 'Buffs', fight.startTime, fight.endTime, playerId),
      this.listLogs.read(bench.list, { reportCode, fight, playerId, abilities, folds }),
      this.wclApi.getCombatantInfo(reportCode, fightId, playerId),
    ]);
    const { findings, folded, checked, downtimeEmpty } = this.analyzeRotationFindings({
      model,
      castEvents: this.wclProjections.withRelativeS(this.wclProjections.presses(casts, folds, { buffs, abilities }), fight.startTime),
      buffEvents: this.wclProjections.withRelativeS(buffs, fight.startTime), abilities,
      cooldowns: bench.major_cooldowns, bench,
      talents: this.gearExtract.pickedTalents(this.gearExtract.selectCombatantInfo(combatants, playerId)), caps,
    });
    const { downtimeRows, offensiveRows, onPlan } = this.bucketRotationFindings(findings, bench.cd_spell_ids, bench.ability_icons);
    return {
      buttonRows: this.listFindings.rows(bench, reading, model, caps), downtimeRows, offensiveRows, onPlan,
      downtimeSpan: this.pullModel.judgedSpan(model), offensiveSpan: this.pullModel.judgedSpan(model, folded),
      buttonsBenched: bench.buttons.length > 0, buttonsEmpty: this.buttonsEmpty(bench), offensivesEmpty: this.offensivesEmpty(checked, bench),
      downtimeEmpty,
    };
  }

  async loadPlanView(spec: string, encounterId: number): Promise<Result<RotationPlanView>> {
    const bench = await this.source.getBench(spec, encounterId);
    if (!bench.ok) return bench;
    return Results.ok({ rows: this.buildCdPlan(bench.value.major_cooldowns, bench.value.per_cd_benchmarks, bench.value.ability_icons, this.topLogs(this.withList(bench.value))) });
  }

  /** `events` are the casts and begincasts inside the judged span; the empty state names how many top logs judged it. */
  protected checkCastEfficiency(
    events: TimedEvent[], model: PullModel, bench: RotationBench, caps?: FamilyCaps,
  ): { finding: AnalysisFinding | null; empty: string } {
    const casting = this.downtime.measure(this.downtime.idleStretches(events, bench.list.spells), model.aliveSpans);
    const reference = this.downtime.reference(bench.per_parse, this.topLogs(bench).killsS);
    if (!casting) return { finding: null, empty: this.downtimeEmpty(null, bench) };
    return { finding: this.downtime.finding(casting, reference, model.fightDurationS, caps), empty: this.downtimeEmpty(reference.length, bench) };
  }

  /** `castTimesS` are fight-relative seconds, ascending, inside the judged span. Null when the cooldown went unused and the player's talents do not show it. */
  protected analyzeOneCooldown(
    cd: PlanCooldown, castTimesS: number[], cdBench: PerCdBenchmark | undefined,
    model: PullModel, talents: ReadonlyMap<number, number> | null, top: TopLogs = NO_TOP_LOGS, caps?: FamilyCaps, upS: readonly AuraSpan[] = [],
  ): { onPlan: AnalysisFinding | null; scan: CooldownScan } | null {
    const cdName = cd.name;
    const actual = castTimesS.length;
    if (actual === 0 && !buttonTaken(cd, talents)) return null;

    const onPlan = actual > 0 ? this.findingRows.onPlanFinding(cdName) : null;
    if (!cdBench) return { onPlan, scan: { issues: [], holds: [], folded: this.pullModel.noFolds() } };

    const uses = this.majorityChecks(cd, castTimesS, cdBench, { model, talents, top, caps });
    const checked = this.lust.findings(cdName, upS, this.lust.lustOf(model.lust?.startS ?? null, model), top, caps);
    const checkedHolds = this.cadence.holdFindings(cdName, castTimesS, cdBench.hold_targets, caps);
    const { kept, folded } = this.pullModel.foldFindings(model, checked);
    // Ready time and never-used checks are measured on alive time, so they carry no span to fold.
    const issues = [...uses, ...kept];
    const { kept: holds, folded: foldedHolds } = this.pullModel.foldFindings(model, checkedHolds);

    return { onPlan: issues.length ? null : onPlan, scan: { issues, holds, folded: this.pullModel.addFolds(folded, foldedHolds) } };
  }

  /** A cooldown most top logs skip has a noisy reference, so it is not checked; a used one is judged on ready time, an unused one as never used. */
  private majorityChecks(
    cd: PlanCooldown, castTimesS: number[], cdBench: PerCdBenchmark,
    pull: { model: PullModel; talents: ReadonlyMap<number, number> | null; top: TopLogs; caps?: FamilyCaps },
  ): AnalysisFinding[] {
    if (!this.castCadence.usedByMajority(cdBench)) return [];
    const casts = pull.top.perParse.map(parse => parse.cd_casts_s);
    const finding = castTimesS.length
      ? this.readyTimeFinding(cd, castTimesS, cdBench, casts, pull)
      : this.cooldownUses.finding(cd, castTimesS, cdBench, pull.model, casts, buttonTaken(cd, pull.talents), pull.caps);
    return finding ? [finding] : [];
  }

  private readyTimeFinding(
    cd: PlanCooldown, castTimesS: number[], cdBench: PerCdBenchmark, casts: CastsByName[],
    pull: { model: PullModel; top: TopLogs; caps?: FamilyCaps },
  ): AnalysisFinding | null {
    const { model } = pull;
    const cooldown = this.readyTime.readyCooldown(cd, casts, cd.name);
    const ready = this.readyTime.measure(castTimesS, model.aliveSpans, cooldown, cdBench.hold_targets);
    if (!ready) return null;
    const reference = this.readyTime.reference(casts, pull.top.killsS, cd.name, cooldown, cdBench.hold_targets, model.aliveSpans);
    return this.readyTime.finding(READY_TIME_FAMILY, OFFENSIVE_VOICE, cd.name, { ready, reference, cooldown, fightDurationS: model.fightDurationS, caps: pull.caps });
  }

  protected analyzeRotationFindings(input: RotationScanInput): RotationScan {
    const { model, castEvents, buffEvents, abilities, cooldowns, bench, talents, caps } = input;
    const findings: AnalysisFinding[] = [];
    let folded = this.pullModel.noFolds();
    let checked = 0;

    const upAtPull = this.auraWindows.upAtPull(buffEvents);
    const auras = this.auraWindows.buildAuraWindows(buffEvents);

    const perCdBench = bench.per_cd_benchmarks;
    for (const cd of cooldowns) {
      const castTimesS = this.cooldownUses.castTimesS(castEvents, cd.spell_id, upAtPull, model.judgedEndS);
      const upS = this.lust.effectSpans(this.auraWindows.spansNamed(auras, cd, abilities), castTimesS, cd.duration ?? 0, model.fightDurationS);
      const result = this.analyzeOneCooldown(cd, castTimesS, perCdBench[cd.name], model, talents, this.topLogs(bench), caps, upS);
      if (!result) continue;
      checked += 1;
      folded = this.pullModel.addFolds(folded, result.scan.folded);
      if (result.scan.issues.length) findings.push(...result.scan.issues);
      else if (result.onPlan) findings.push(result.onPlan);
      if (castTimesS.length) findings.push(...result.scan.holds);
    }

    const efficiency = this.checkCastEfficiency(castEvents.filter(event => event.atS <= model.judgedEndS), model, bench, caps);
    if (efficiency.finding) findings.push(efficiency.finding);

    sortBySeverity(findings);
    return { findings, folded, checked, downtimeEmpty: efficiency.empty };
  }

  private resolveCd(name: string, cdSpellIds: Record<string, number>, abilities: AbilityIcons): ResolvedCd {
    const spellId = cdSpellIds[name] ?? null;
    const ability = spellId != null ? abilities[spellId] : undefined;
    if (spellId != null && !ability) this.logger.logWarn('resolveCd: ability id missing from ability map', spellId);
    return spellId != null
      ? { spellId, icon: ability?.icon ?? '', rowName: ability?.name ?? name }
      : { spellId: null, icon: '', rowName: name };
  }

  protected partitionRotationFindings(findings: AnalysisFinding[]): PartitionedFindings {
    const downtimeFindings: AnalysisFinding[] = [];
    const byName: Record<string, FindingBucket> = {};
    const onPlanNames = new Set<string>();
    const bucketFor = (name: string): FindingBucket => (byName[name] ??= { issues: [], holds: [] });
    for (const finding of findings) {
      if (finding.onPlan) { if (finding.cd_name) onPlanNames.add(finding.cd_name); continue; }
      const holdName = finding.category === 'cooldown_hold' ? finding.details?.cd_name : undefined;
      if (holdName) bucketFor(holdName).holds.push(finding);
      else if (!finding.cd_name) downtimeFindings.push(finding);
      else bucketFor(finding.cd_name).issues.push(finding);
    }
    return { downtimeFindings, byName, onPlanNames };
  }

  protected buildDowntimeRows(downtimeFindings: AnalysisFinding[]): FindingRow[] {
    return downtimeFindings.map(finding => ({
      severity: finding.severity,
      name: '',
      icon: '',
      what: finding.label,
      chip: CAT_LABEL[finding.category],
      measured: finding.measured ?? { value: '-' },
      timestampS: finding.timestamp_s ?? null,
      message: finding.message,
      fix: finding.details?.remedy,
      occurrences: finding.occurrences,
    }));
  }

  protected buildOffensiveRows(
    byName: Record<string, FindingBucket>, cdSpellIds: Record<string, number>, abilities: AbilityIcons,
  ): FindingRow[] {
    const offensiveRows: FindingRow[] = [];
    for (const [name, bucket] of Object.entries(byName)) {
      if (!bucket.issues.length && !bucket.holds.length) continue;
      const { spellId, icon, rowName } = this.resolveCd(name, cdSpellIds, abilities);
      for (const finding of [...bucket.issues, ...bucket.holds]) {
        offensiveRows.push({
          severity: finding.severity,
          name: rowName,
          spellId,
          icon,
          timestampS: finding.timestamp_s ?? null,
          chip: CAT_LABEL[finding.category],
          measured: finding.measured ?? { value: '-' },
          message: finding.message,
          fix: finding.details?.remedy,
          ...(finding.unjudged ? { unjudged: finding.unjudged } : {}),
          occurrences: finding.occurrences,
        });
      }
    }
    return offensiveRows;
  }

  protected buildOnPlanChips(
    partition: PartitionedFindings, cdSpellIds: Record<string, number>, abilities: AbilityIcons,
  ): OnPlanChip[] {
    const { byName, onPlanNames } = partition;
    const onPlan: OnPlanChip[] = [];
    for (const name of onPlanNames) {
      if (!byName[name] || (!byName[name].issues.length && !byName[name].holds.length)) {
        const { spellId, icon, rowName } = this.resolveCd(name, cdSpellIds, abilities);
        onPlan.push({ name: rowName, spellId, icon });
      }
    }
    return onPlan;
  }

  protected bucketRotationFindings(
    findings: AnalysisFinding[], cdSpellIds: Record<string, number>, abilities: AbilityIcons,
  ): { downtimeRows: FindingRow[]; offensiveRows: FindingRow[]; onPlan: OnPlanChip[] } {
    const partition = this.partitionRotationFindings(findings);
    return {
      downtimeRows: this.buildDowntimeRows(partition.downtimeFindings),
      offensiveRows: this.buildOffensiveRows(partition.byName, cdSpellIds, abilities),
      onPlan: this.buildOnPlanChips(partition, cdSpellIds, abilities),
    };
  }

  private cdPlanUsageOf(name: string, cdBench: PerCdBenchmark | undefined, top: TopLogs): CdPlanUsage {
    const usage = this.castCadence.cadencePlanUsage(cdBench);
    if (!cdBench) return { ...usage, usesPerMin: null, bloodlust: false };
    return {
      ...usage,
      usesPerMin: this.castCadence.usedByMajority(cdBench) ? cdBench.uses_per_min.avg : null,
      bloodlust: this.lust.wantsLust(this.lust.reference(top.perParse, top.killsS, name)),
    };
  }

  private cdPlanRow(
    cd: PlanCooldown, cdBench: PerCdBenchmark | undefined, abilities: AbilityIcons, top: TopLogs,
  ): CdPlanRow {
    const ability = abilities[cd.spell_id];
    if (!ability) this.logger.logWarn('buildCdPlan: ability id missing from ability map', cd.spell_id);
    return {
      name: cd.name, spellId: cd.spell_id, icon: ability?.icon ?? '', ...this.cdPlanUsageOf(cd.name, cdBench, top),
      holds: this.castCadence.holdsOf(cdBench),
    };
  }

  protected buildCdPlan(
    cooldowns: PlanCooldown[], benchmarks: Record<string, PerCdBenchmark>, abilities: AbilityIcons,
    top: TopLogs = NO_TOP_LOGS,
  ): CdPlanRow[] {
    const ordered = [...cooldowns].sort((a, b) => {
      const pa = a.opener_priority ?? 99;
      const pb = b.opener_priority ?? 99;
      return pa !== pb ? pa - pb : a.name.localeCompare(b.name);
    });
    return ordered.map(cd => this.cdPlanRow(cd, benchmarks[cd.name], abilities, top));
  }
}
