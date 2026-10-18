import { inject, Injectable } from '@angular/core';
import { buttonTaken } from '../../analysis/analysis-math';
import { CastCadenceService } from '../../analysis/cast-cadence-service';
import { PullModel } from '../../analysis/pull-model-service';
import { CooldownUseJudgeService } from '../../rotation/cooldown-use-judge-service';
import { CadenceJudgeService, CastsByName } from '../../rotation/cadence-judge-service';
import { DefensiveBench, DefensivePlanMeta } from '../../defensive/defensive-data-source';
import {
  DEFENSIVE_FIRST_USE_FAMILY, DEFENSIVE_GAP_FAMILY, DEFENSIVE_HOLD_FAMILY, DEFENSIVE_USES_FAMILY, DEFENSIVE_WINDOW_FAMILY, DefensiveJudgeService,
} from '../../defensive/defensive-judge-service';
import { PerDefensiveBenchmark } from '../../encounter/encounter.models';
import { HeldOutRow } from './calibration.models';
import { HeldOutRowService } from './held-out-row-service';
import { FoldedDefensiveBench } from './leave-one-out-service';

/** A top log judged as the player on the defensive cards. */
export interface DefensiveHeldOut {
  casts: CastsByName;
  model: PullModel;
  talents: ReadonlyMap<number, number> | null;
  /** Each window the log's own use formed, by its index in the full bench, with the damage it took there. */
  covered: ReadonlyMap<number, number>;
  tank: boolean;
}

/** The Defensives and Defensive windows checks on a held-out top log, through the judges and gates the page runs. */
@Injectable({ providedIn: 'root' })
export class DefensiveHeldOutService {
  private readonly rows = inject(HeldOutRowService);
  private readonly judges = inject(DefensiveJudgeService);
  private readonly cadence = inject(CadenceJudgeService);
  private readonly castCadence = inject(CastCadenceService);
  private readonly uses = inject(CooldownUseJudgeService);

  /** The held-out log's windows and the damage it took in each, read from the members of the full bench. */
  coveredBy(bench: DefensiveBench, i: number): Map<number, number> {
    const covered = new Map<number, number>();
    bench.defensive_windows.forEach((window, index) => {
      const own = window.members.filter(member => member.parse === i);
      if (own.length) covered.set(index, own.reduce((sum, member) => sum + member.damage, 0));
    });
    return covered;
  }

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
    return [
      ...majority ? this.majorityRows(defensive.name, useTimesS, defBench, { model, casts }) : [],
      ...this.gapRows(defensive.name, useTimesS, defBench, { model, casts }),
      ...this.holdRows(useTimesS, defBench, model),
    ];
  }

  private majorityRows(
    name: string, useTimesS: number[], defBench: PerDefensiveBenchmark, pull: { model: PullModel; casts: CastsByName[] },
  ): HeldOutRow[] {
    const firstS = this.cadence.measureOpener(useTimesS);
    const first = firstS === null ? [] : this.rows.row(
      DEFENSIVE_FIRST_USE_FAMILY, this.cadence.judgeOpener(firstS, this.cadence.referenceOpeners(pull.casts, name)),
      pull.model, { fromS: 0, toS: firstS },
    );
    const { uses, expected } = this.uses.measure(useTimesS, pull.model.aliveSpans, defBench);
    if (expected === 0) return first;
    const reference = this.judges.referenceUses(pull.casts, name);
    const evidence = uses < expected
      ? this.judges.judgeUses(uses, expected, reference)
      : { level: 'neutral' as const, n: reference.length, observed: uses, target: null, excess: 0 };
    return [...first, ...this.rows.row(DEFENSIVE_USES_FAMILY, evidence)];
  }

  private gapRows(
    name: string, useTimesS: number[], defBench: PerDefensiveBenchmark, pull: { model: PullModel; casts: CastsByName[] },
  ): HeldOutRow[] {
    const gap = this.cadence.measureGap(useTimesS, pull.model.aliveSpans, defBench.hold_targets);
    if (!gap) return [];
    const reference = this.cadence.referenceGaps(pull.casts, name, defBench.hold_targets);
    return this.rows.row(DEFENSIVE_GAP_FAMILY, this.cadence.judgeGap(gap.gapS, reference), pull.model, { fromS: gap.fromS, toS: gap.toS });
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

  /** The bench bakes damage only where a log's own use formed the window, so an uncovered log counts as taking more than the median: an upper bound on the flag rate. */
  private windowRows(fold: FoldedDefensiveBench, log: DefensiveHeldOut): HeldOutRow[] {
    const n = fold.sources.length;
    return fold.defensive_windows.flatMap(window => {
      const damage = log.covered.get(window.index);
      const evidence = this.judges.judgeWindow(
        { damage: damage ?? Number.POSITIVE_INFINITY, covered: damage !== undefined, tank: log.tank }, this.judges.reference(window, n),
      );
      return this.rows.row(DEFENSIVE_WINDOW_FAMILY, evidence, log.model, { fromS: window.time_s, toS: window.time_s + window.window_length_s });
    });
  }
}
