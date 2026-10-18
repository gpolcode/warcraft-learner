import { inject, Injectable } from '@angular/core';
import { buttonTaken } from '../../analysis/analysis-math';
import { CastCadenceService } from '../../analysis/cast-cadence-service';
import { PullModel } from '../../analysis/pull-model-service';
import { PerCdBenchmark } from '../../encounter/encounter.models';
import { PlanCooldown } from '../../plan/plan.models';
import { ButtonJudgeService, ROTATION_BUTTON_FAMILY } from '../../rotation/priority-list/button-judge-service';
import { CooldownUseJudgeService, NEVER_USED_FAMILY } from '../../rotation/cooldown-use-judge-service';
import { CadenceJudgeService, COOLDOWN_HOLD_FAMILY } from '../../rotation/cadence-judge-service';
import { READY_TIME_FAMILY, ReadyTimeJudgeService } from '../../rotation/ready-time-judge-service';
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
  private readonly readyTime = inject(ReadyTimeJudgeService);
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
      ...this.holdRows(model, castTimesS, cdBench),
    ];
  }

  /** A used cooldown is a ready-time test, an unused one a never-used test. */
  private majorityRows(
    fold: RotationBench, log: RotationHeldOut,
    check: { cooldown: PlanCooldown; castTimesS: number[]; cdBench: PerCdBenchmark; taken: boolean },
  ): HeldOutRow[] {
    const { cooldown, castTimesS, cdBench, taken } = check;
    const { model } = log;
    const casts = fold.per_parse.map(parse => parse.cd_casts_s);
    if (!castTimesS.length) {
      const uses = this.uses.measure(castTimesS, model.aliveSpans, cdBench);
      const evidence = uses.expected === 0 ? null : this.uses.judge(uses, this.uses.referenceFirstUses(casts, cooldown.name), model.aliveSpans, { taken, cooldownS: cooldown.cooldown });
      return evidence ? this.rows.row(NEVER_USED_FAMILY, evidence) : [];
    }
    const ready = this.readyTime.readyCooldown(cooldown, casts, cooldown.name);
    const measured = this.readyTime.measure(castTimesS, model.aliveSpans, ready, cdBench.hold_targets);
    if (!measured) return [];
    const killsS = fold.sources.map(source => source.duration_s);
    const reference = this.readyTime.reference(casts, killsS, cooldown.name, ready, cdBench.hold_targets, model.aliveSpans);
    return this.rows.row(READY_TIME_FAMILY, this.readyTime.judge(measured, reference, ready));
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

  private downtimeRows(fold: RotationBench, log: RotationHeldOut): HeldOutRow[] {
    const casting = this.downtime.measure(log.measures.idle_s ?? null, log.model.aliveSpans);
    if (!casting) return [];
    const reference = this.downtime.reference(fold.per_parse, fold.sources.map(source => source.duration_s));
    return this.rows.row(DOWNTIME_FAMILY, this.downtime.judge(casting, reference));
  }
}
