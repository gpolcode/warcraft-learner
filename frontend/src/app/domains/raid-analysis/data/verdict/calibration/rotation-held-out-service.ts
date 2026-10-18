import { inject, Injectable } from '@angular/core';
import { buttonTaken } from '../../analysis/analysis-math';
import { CastCadenceService } from '../../analysis/cast-cadence-service';
import { PullModel } from '../../analysis/pull-model-service';
import { PerCdBenchmark } from '../../encounter/encounter.models';
import { PlanCooldown } from '../../plan/plan.models';
import { ButtonJudgeService, ROTATION_BUTTON_FAMILY } from '../../rotation/priority-list/button-judge-service';
import { CooldownUseJudgeService, LOST_CAST_FAMILY, NEVER_USED_FAMILY } from '../../rotation/cooldown-use-judge-service';
import { CadenceJudgeService, COOLDOWN_GAP_FAMILY, COOLDOWN_HOLD_FAMILY, LATE_OPENER_FAMILY } from '../../rotation/cadence-judge-service';
import { DOWNTIME_FAMILY, DowntimeJudgeService } from '../../rotation/downtime-judge-service';
import { BLOODLUST_ALIGNMENT_FAMILY, BLOODLUST_TIMING_FAMILY, BloodlustJudgeService } from '../../rotation/bloodlust-judge-service';
import { RotationBench, RotationParseMeasures } from '../../rotation/rotation-data-source';
import { VERDICT_CHOICES } from '../verdict-choices';
import { HeldOutRow } from './calibration.models';
import { HeldOutRowService } from './held-out-row-service';

/** A top log judged as the player: its measures, the pull it is judged over and its talents. */
export interface RotationHeldOut {
  measures: RotationParseMeasures;
  model: PullModel;
  talents: ReadonlyMap<number, number> | null;
}

/** The rotation card's checks on a held-out top log, through the judges and gates the page runs. */
@Injectable({ providedIn: 'root' })
export class RotationHeldOutService {
  private readonly rows = inject(HeldOutRowService);
  private readonly buttons = inject(ButtonJudgeService);
  private readonly uses = inject(CooldownUseJudgeService);
  private readonly cadence = inject(CadenceJudgeService);
  private readonly castCadence = inject(CastCadenceService);
  private readonly downtime = inject(DowntimeJudgeService);
  private readonly lust = inject(BloodlustJudgeService);

  /** `fold` is the bench rebuilt without the held-out log. */
  judge(fold: RotationBench, log: RotationHeldOut): HeldOutRow[] {
    return [
      ...this.buttonRows(fold, log),
      ...fold.major_cooldowns.flatMap(cooldown => this.cooldownRows(fold, log, cooldown)),
      ...this.downtimeRows(fold, log),
    ];
  }

  /** Button counts carry no times, so a pull cut short keeps them whole. */
  private buttonRows(fold: RotationBench, log: RotationHeldOut): HeldOutRow[] {
    return fold.buttons.flatMap(button => {
      const counts = log.measures.buttons[button.action];
      if (!counts) return [];
      return this.rows.row(ROTATION_BUTTON_FAMILY, this.buttons.judge(counts, this.buttons.reference(fold.per_parse, button.action)));
    });
  }

  private cooldownRows(fold: RotationBench, log: RotationHeldOut, cooldown: PlanCooldown): HeldOutRow[] {
    const { model } = log;
    const castTimesS = (log.measures.cd_casts_s[cooldown.name] ?? []).filter(castS => castS <= model.judgedEndS);
    const taken = buttonTaken(cooldown, log.talents);
    const cdBench = fold.per_cd_benchmarks[cooldown.name];
    if ((!castTimesS.length && !taken) || !cdBench) return [];
    return [
      ...this.castCadence.usedByMajority(cdBench) ? this.majorityRows(fold, log, { cooldown, castTimesS, cdBench, taken }) : [],
      ...this.lustRows(fold, log, cooldown.name, castTimesS),
      ...this.gapRows(fold, model, cooldown.name, castTimesS, cdBench),
      ...this.holdRows(model, castTimesS, cdBench),
    ];
  }

  private majorityRows(
    fold: RotationBench, log: RotationHeldOut,
    check: { cooldown: PlanCooldown; castTimesS: number[]; cdBench: PerCdBenchmark; taken: boolean },
  ): HeldOutRow[] {
    const { cooldown, castTimesS, cdBench, taken } = check;
    const name = cooldown.name;
    const firstS = this.cadence.measureOpener(castTimesS);
    const opener = firstS === null ? [] : this.rows.row(
      LATE_OPENER_FAMILY, this.cadence.judgeOpener(firstS, this.cadence.referenceOpeners(fold.per_parse.map(parse => parse.cd_casts_s), name)),
      log.model, { fromS: 0, toS: firstS },
    );
    const uses = this.uses.measure(castTimesS, log.model.aliveSpans, cdBench);
    if (uses.expected === 0) return opener;
    const reference = this.uses.referenceUses(fold.per_parse, name);
    const judgement = this.uses.judge(uses, reference, taken);
    const family = uses.uses === 0 ? NEVER_USED_FAMILY : LOST_CAST_FAMILY;
    const evidence = judgement?.evidence ?? { level: 'neutral' as const, n: reference.length, observed: uses.uses, target: null, excess: 0 };
    return [...opener, ...this.rows.row(family, evidence)];
  }

  /** Inside the band every lust is an alignment test, and a pressed one also a timing test; outside it nothing is judged. */
  lustRows(fold: RotationBench, log: RotationHeldOut, name: string, castTimesS: readonly number[]): HeldOutRow[] {
    const lustS = log.measures.lust_s;
    const reference = this.lust.reference(fold.per_parse, name);
    if (lustS === null || !this.lust.wantsLust(reference)) return [];
    const band = this.lust.judgeBand(lustS, reference);
    if (!band.inside) return [];
    const offsetS = this.lust.measureOffset(castTimesS, lustS);
    const window = { fromS: lustS - VERDICT_CHOICES.lustWindow.beforeS, toS: lustS + VERDICT_CHOICES.lustWindow.afterS };
    const alignment = this.rows.row(BLOODLUST_ALIGNMENT_FAMILY, this.lust.judgeAlignment(offsetS, reference, band), log.model, window);
    if (offsetS === null) return alignment;
    const castS = lustS + offsetS;
    const span = { fromS: Math.min(lustS, castS), toS: Math.max(lustS, castS) };
    return [...alignment, ...this.rows.row(BLOODLUST_TIMING_FAMILY, this.lust.judgeTiming(offsetS, reference), log.model, span)];
  }

  private gapRows(fold: RotationBench, model: PullModel, name: string, castTimesS: readonly number[], cdBench: PerCdBenchmark): HeldOutRow[] {
    const gap = this.cadence.measureGap(castTimesS, model.aliveSpans, cdBench.hold_targets);
    if (!gap) return [];
    const reference = this.cadence.referenceGaps(fold.per_parse.map(parse => parse.cd_casts_s), name, cdBench.hold_targets);
    return this.rows.row(COOLDOWN_GAP_FAMILY, this.cadence.judgeGap(gap.gapS, reference), model, { fromS: gap.fromS, toS: gap.toS });
  }

  /** A hold target is a test on every log that used the cooldown; only an early use flags it. */
  private holdRows(model: PullModel, castTimesS: readonly number[], cdBench: PerCdBenchmark): HeldOutRow[] {
    if (!castTimesS.length) return [];
    return Object.values(cdBench.hold_targets).flatMap(target => {
      const castS = this.cadence.measureHold(castTimesS, target);
      const evidence = this.cadence.judgeHold(target);
      if (castS === null) return this.rows.row(COOLDOWN_HOLD_FAMILY, { ...evidence, level: 'neutral' });
      return this.rows.row(COOLDOWN_HOLD_FAMILY, evidence, model, { fromS: castS, toS: target.target_s });
    });
  }

  /** The baked share covers the whole pull, so a pull cut short or a death leaves no casting time to judge. */
  private downtimeRows(fold: RotationBench, log: RotationHeldOut): HeldOutRow[] {
    const pct = log.measures.efficiency_pct;
    const { model } = log;
    const whole = model.aliveSpans.length === 1 && model.judgedEndS >= model.fightDurationS;
    if (pct === null || !whole) return [];
    const aliveS = model.fightDurationS;
    const casting = { pct, aliveS, idleS: (100 - pct) / 100 * aliveS };
    return this.rows.row(DOWNTIME_FAMILY, this.downtime.judge(casting, this.downtime.reference(fold.per_parse)));
  }
}
