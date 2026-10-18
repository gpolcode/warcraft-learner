import { inject, Injectable } from '@angular/core';
import { buttonTaken } from '../../analysis/analysis-math';
import { CastCadenceService } from '../../analysis/cast-cadence-service';
import { PullModel } from '../../analysis/pull-model-service';
import { CooldownUseJudgeService } from '../../rotation/cooldown-use-judge-service';
import { CadenceJudgeService, CastsByName } from '../../rotation/cadence-judge-service';
import { AuraSpan, DefensivePlanMeta } from '../../defensive/defensive-data-source';
import { PullModelService } from '../../analysis/pull-model-service';
import { ToneService } from '../tone-service';
import {
  DEAD_IN_WINDOW_FAMILY, DEFENSIVE_HOLD_FAMILY, DEFENSIVE_READY_TIME_FAMILY, DEFENSIVE_USES_FAMILY, DEFENSIVE_WINDOW_FAMILY, DefensiveJudgeService,
} from '../../defensive/defensive-judge-service';
import { ReadyTimeJudgeService } from '../../rotation/ready-time-judge-service';
import { PerDefensiveBenchmark } from '../../encounter/encounter.models';
import { HeldOutRow } from './calibration.models';
import { HeldOutRowService } from './held-out-row-service';
import { FoldedDefensiveBench } from './leave-one-out-service';

/** A top log judged as the player on the defensive cards. */
export interface DefensiveHeldOut {
  casts: CastsByName;
  model: PullModel;
  talents: ReadonlyMap<number, number> | null;
  /** Absent on a bench baked before coverage, which gives the window checks no test. */
  up: Readonly<Record<string, readonly AuraSpan[]>> | null;
  takenPerS: readonly number[] | null;
  tank: boolean;
}

/** The Defensives and Defensive windows checks on a held-out top log, through the judges and gates the page runs. */
@Injectable({ providedIn: 'root' })
export class DefensiveHeldOutService {
  private readonly rows = inject(HeldOutRowService);
  private readonly judges = inject(DefensiveJudgeService);
  private readonly cadence = inject(CadenceJudgeService);
  private readonly readyTime = inject(ReadyTimeJudgeService);
  private readonly castCadence = inject(CastCadenceService);
  private readonly uses = inject(CooldownUseJudgeService);
  private readonly pullModel = inject(PullModelService);
  private readonly tones = inject(ToneService);

  /** `fold` is the bench rebuilt without the held-out log. */
  judge(fold: FoldedDefensiveBench, log: DefensiveHeldOut): HeldOutRow[] {
    const casts = fold.per_parse.map(parse => parse.def_casts_s);
    return [
      ...fold.defensives.flatMap(defensive => this.defensiveRows(fold, log, defensive, casts)),
      ...this.windowRows(fold, log),
    ];
  }

  /** The bench bakes no aura, so a held-out log's defensive counts as its own, never an external. */
  private defensiveRows(fold: FoldedDefensiveBench, log: DefensiveHeldOut, defensive: DefensivePlanMeta, casts: CastsByName[]): HeldOutRow[] {
    const { model } = log;
    const useTimesS = (log.casts[defensive.name] ?? []).filter(useS => useS <= model.judgedEndS);
    const defBench = fold.per_defensive_benchmarks[defensive.name];
    if ((!useTimesS.length && !buttonTaken(defensive, log.talents)) || !defBench) return [];
    const majority = this.castCadence.usedByMajority(defBench);
    const killsS = fold.sources.map(source => source.duration_s);
    return [
      ...majority ? this.majorityRows(defensive.name, useTimesS, defBench, { model, casts }) : [],
      ...majority ? this.readyRows(defensive, useTimesS, defBench, { model, casts, killsS }) : [],
      ...this.holdRows(useTimesS, defBench, model),
    ];
  }

  private majorityRows(
    name: string, useTimesS: number[], defBench: PerDefensiveBenchmark, pull: { model: PullModel; casts: CastsByName[] },
  ): HeldOutRow[] {
    const { uses, expected } = this.uses.measure(useTimesS, pull.model.aliveSpans, defBench);
    if (expected === 0) return [];
    const reference = this.judges.referenceUses(pull.casts, name);
    const evidence = uses < expected
      ? this.judges.judgeUses(uses, expected, reference)
      : { level: 'neutral' as const, n: reference.length, observed: uses, target: null, excess: 0 };
    return this.rows.row(DEFENSIVE_USES_FAMILY, evidence);
  }

  private readyRows(
    defensive: DefensivePlanMeta, useTimesS: number[], defBench: PerDefensiveBenchmark,
    pull: { model: PullModel; casts: CastsByName[]; killsS: (number | null)[] },
  ): HeldOutRow[] {
    if (!useTimesS.length) return [];
    const ready = this.readyTime.readyCooldown(defensive, pull.casts, defensive.name);
    const measured = this.readyTime.measure(useTimesS, pull.model.aliveSpans, ready, defBench.hold_targets);
    if (!measured) return [];
    const reference = this.readyTime.reference(pull.casts, pull.killsS, defensive.name, ready, defBench.hold_targets, pull.model.aliveSpans);
    return this.rows.row(DEFENSIVE_READY_TIME_FAMILY, this.readyTime.judge(measured, reference, ready));
  }

  private holdRows(useTimesS: number[], defBench: PerDefensiveBenchmark, model: PullModel): HeldOutRow[] {
    if (!useTimesS.length) return [];
    return Object.values(defBench.hold_targets).flatMap(target => {
      const castS = this.cadence.measureHold(useTimesS, target);
      const evidence = this.cadence.judgeHold(target);
      if (castS === null) return this.rows.row(DEFENSIVE_HOLD_FAMILY, { ...evidence, level: 'neutral' });
      return this.rows.row(DEFENSIVE_HOLD_FAMILY, evidence, model, { fromS: castS, toS: target.target_s });
    });
  }

  /** A window the log died in is the death's home, as on the page; any other window it was alive through is a coverage test and a death test. */
  private windowRows(fold: FoldedDefensiveBench, log: DefensiveHeldOut): HeldOutRow[] {
    const { up, takenPerS, model } = log;
    if (!up || !takenPerS) return [];
    const killsS = fold.sources.map(source => source.duration_s);
    const deaths = this.judges.deathHomes(fold.defensive_windows, model.deadSpans);
    return fold.defensive_windows.flatMap((window, at) => {
      const reference = this.judges.reference(window, fold.per_parse, killsS);
      const span = { fromS: window.time_s, toS: window.time_s + window.window_length_s };
      const diedS = deaths.get(at);
      if (diedS !== undefined) return this.rows.toneRow(DEAD_IN_WINDOW_FAMILY.id, this.judges.deathVerdict(diedS).status, reference.n);
      if (this.pullModel.causeOf(model, span.fromS, span.toS)) return [];
      const pull = { damage: this.judges.measureTaken(takenPerS, window), covered: this.judges.measureCover(window, up).length > 0, tank: log.tank };
      return [
        ...this.rows.row(DEFENSIVE_WINDOW_FAMILY, this.judges.judgeWindow(pull, reference), model, span),
        ...this.rows.toneRow(DEAD_IN_WINDOW_FAMILY.id, this.tones.neutral(), reference.n),
      ];
    });
  }
}
