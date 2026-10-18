import { inject, Injectable } from '@angular/core';
import { CastCadenceService } from '../../analysis/cast-cadence-service';
import { BurstJudgeService } from '../../burst-windows/burst-judge-service';
import { InjectedMistake } from '../finding-family.models';
import { IdleStretch } from '../../rotation/rotation-data-source';
import { VERDICT_CHOICES } from '../verdict-choices';
import { HeldOutCase } from './held-out-case-service';
import { HeldOutRowService } from './held-out-row-service';
import { DefensiveJudgeService } from '../../defensive/defensive-judge-service';
import { PullModelService } from '../../analysis/pull-model-service';
import { DeadSpan } from '../../analysis/death-timeline-service';
import { BloodlustJudgeService } from '../../rotation/bloodlust-judge-service';
import { AuraSpan } from '../../defensive/defensive-data-source';

type RotationCase = Extract<HeldOutCase, { card: 'rotation' }>;
type DefensiveCase = Extract<HeldOutCase, { card: 'defensive' }>;
type GearCase = Extract<HeldOutCase, { card: 'gear' }>;
type BurstCase = Extract<HeldOutCase, { card: 'burst' }>;

const CHOICES = VERDICT_CHOICES.calibration;
/** An entry id no talent tree uses, so the swapped build matches no top log's. */
const SWAPPED_ENTRY = 'x';
/** A press opens its aura within a second either way, as the effect spans pair them. */
const OPENED_WITHIN_S = 1;

/** Puts one known mistake into a held-out top log's measures; the harness checks that the family claiming it flags the result. */
@Injectable({ providedIn: 'root' })
export class InjectedMistakeService {
  private readonly castCadence = inject(CastCadenceService);
  private readonly bursts = inject(BurstJudgeService);
  private readonly defensives = inject(DefensiveJudgeService);
  private readonly pullModel = inject(PullModelService);
  private readonly rows = inject(HeldOutRowService);
  private readonly lust = inject(BloodlustJudgeService);

  /** Each way the mistake fits this log; none when the log has nothing it applies to, or the bench bakes nothing it changes. */
  variants(mistake: InjectedMistake, heldOut: HeldOutCase): HeldOutCase[] {
    if (heldOut.card === 'rotation') return this.rotationVariants(mistake, heldOut);
    if (heldOut.card === 'defensive') return this.defensiveVariants(mistake, heldOut);
    if (heldOut.card === 'burst') return mistake === 'shift-burst-15s' ? this.shiftedBursts(heldOut) : [];
    return this.gearVariants(mistake, heldOut);
  }

  private rotationVariants(mistake: InjectedMistake, heldOut: RotationCase): RotationCase[] {
    switch (mistake) {
      case 'drop-major-cooldown-cast': return this.onMajorCooldown(heldOut, casts => casts.length ? [casts.slice(0, -1)] : []);
      case 'delay-cooldown-30s': return this.onMajorCooldown(heldOut, casts => [0, 1].flatMap(index => index < casts.length ? [this.delayed(casts, index)] : []));
      case 'move-cooldown-out-of-lust': return this.outOfLust(heldOut);
      case 'idle-5-gcds': return this.idle(heldOut);
      case 'press-off-list': return this.offList(heldOut);
      default: return [];
    }
  }

  /** The first cooldown most of the other top logs use, the kind every cooldown family judges. */
  private onMajorCooldown(heldOut: RotationCase, change: (casts: number[]) => number[][]): RotationCase[] {
    const cooldown = heldOut.fold.major_cooldowns.find(entry => {
      const cdBench = heldOut.fold.per_cd_benchmarks[entry.name];
      return cdBench && this.castCadence.usedByMajority(cdBench) && (heldOut.log.measures.cd_casts_s[entry.name]?.length ?? 0) > 0;
    });
    if (!cooldown) return [];
    return change([...heldOut.log.measures.cd_casts_s[cooldown.name] ?? []]).map(casts => this.withCasts(heldOut, cooldown.name, casts));
  }

  private delayed(casts: readonly number[], index: number): number[] {
    return casts.map((castS, at) => at === index ? castS + CHOICES.delayS : castS).sort((a, b) => a - b);
  }

  /** The first cooldown up during the lust has each effect that overlaps it, and the press that opened it, moved to start after the lust, as if pressed on cooldown instead. */
  private outOfLust(heldOut: RotationCase): RotationCase[] {
    const { measures, model } = heldOut.log;
    const lust = this.lust.lustOf(measures.lust_s, model);
    if (!lust || !measures.cd_up_s) return [];
    const during = (span: AuraSpan): boolean => this.lust.measureOverlap([span], lust).up;
    const entry = Object.entries(measures.cd_up_s).find(([, spans]) => spans.some(during));
    if (!entry) return [];
    const [name, spans] = entry;
    const moved = spans.filter(during);
    const shiftOf = (fromS: number): number => lust.toS + CHOICES.delayS - fromS;
    const up = spans.map(([fromS, toS]): AuraSpan => during([fromS, toS]) ? [fromS + shiftOf(fromS), toS + shiftOf(fromS)] : [fromS, toS]);
    const casts = (measures.cd_casts_s[name] ?? []).map(castS => {
      const opened = moved.find(([fromS, toS]) => fromS - OPENED_WITHIN_S <= castS && castS <= toS);
      return opened ? castS + shiftOf(opened[0]) : castS;
    });
    const changed = this.withCasts(heldOut, name, casts.sort((a, b) => a - b));
    const cd_up_s = { ...measures.cd_up_s, [name]: up.sort((a, b) => a[0] - b[0]) };
    return [{ ...changed, log: { ...changed.log, measures: { ...changed.log.measures, cd_up_s } } }];
  }

  /** Five global cooldowns of idle time on the stretch idle at mid-pull or the first after it, the rest of the pull playing that much later and its tail cut at the kill. */
  private idle(heldOut: RotationCase): RotationCase[] {
    const stretches = heldOut.log.measures.idle_s;
    const durationS = heldOut.log.model.fightDurationS;
    if (!stretches || durationS <= 0) return [];
    const pauseS = CHOICES.idleGcds * CHOICES.gcdS;
    const midS = durationS / 2;
    const at = stretches.findIndex(([, toS]) => toS >= midS);
    const idle_s: IdleStretch[] = at === -1
      ? [...stretches, [midS, midS + pauseS]]
      : stretches.flatMap(([fromS, toS], index): IdleStretch[] => {
        if (index < at) return [[fromS, toS]];
        return index === at ? [[fromS, toS + pauseS]] : [[fromS + pauseS, toS + pauseS]];
      });
    const kept = idle_s.filter(([fromS]) => fromS < durationS).map(([fromS, toS]): IdleStretch => [fromS, Math.min(durationS, toS)]);
    return [{ ...heldOut, log: { ...heldOut.log, measures: { ...heldOut.log.measures, idle_s: kept } } }];
  }

  /** A run of presses off the list turns that many right moments of the most-judged button into misses. */
  private offList(heldOut: RotationCase): RotationCase[] {
    const [action, counts] = Object.entries(heldOut.log.measures.buttons).sort((a, b) => b[1].moments - a[1].moments)[0] ?? [];
    if (!action || !counts || counts.right <= 0) return [];
    const buttons = { ...heldOut.log.measures.buttons, [action]: { ...counts, right: Math.max(0, counts.right - CHOICES.offListPresses) } };
    return [{ ...heldOut, log: { ...heldOut.log, measures: { ...heldOut.log.measures, buttons } } }];
  }

  private withCasts(heldOut: RotationCase, name: string, casts: number[]): RotationCase {
    const cd_casts_s = { ...heldOut.log.measures.cd_casts_s, [name]: casts };
    return { ...heldOut, log: { ...heldOut.log, measures: { ...heldOut.log.measures, cd_casts_s } } };
  }

  /** Each cadence variant changes the first defensive most of the other top logs use; each window variant one window. */
  private defensiveVariants(mistake: InjectedMistake, heldOut: DefensiveCase): DefensiveCase[] {
    if (mistake === 'uncover-window') return this.uncoveredWindows(heldOut);
    if (mistake === 'die-in-window') return this.deathsInWindows(heldOut);
    const defensive = heldOut.fold.defensives.find(entry => {
      const defBench = heldOut.fold.per_defensive_benchmarks[entry.name];
      return defBench && this.castCadence.usedByMajority(defBench) && (heldOut.log.casts[entry.name]?.length ?? 0) > 0;
    });
    if (!defensive) return [];
    if (mistake === 'strip-defensive') return this.stripDefensive(heldOut, defensive.name);
    if (mistake !== 'delay-cooldown-30s') return [];
    const uses = heldOut.log.casts[defensive.name] ?? [];
    return [0, 1].flatMap(index => index < uses.length
      ? [{ ...heldOut, log: { ...heldOut.log, casts: { ...heldOut.log.casts, [defensive.name]: this.delayed(uses, index) } } }]
      : []);
  }

  /** The first defensive most of the other top logs use goes unpressed: no use, and no aura of it up. */
  private stripDefensive(heldOut: DefensiveCase, name: string): DefensiveCase[] {
    const up = heldOut.log.up ? { ...heldOut.log.up, [name]: [] } : null;
    return [{ ...heldOut, log: { ...heldOut.log, casts: { ...heldOut.log.casts, [name]: [] }, up } }];
  }

  /** Per window the log covered, every aura up at it is gone; the damage it took stays, so the mistake costs it no extra damage. */
  private uncoveredWindows(heldOut: DefensiveCase): DefensiveCase[] {
    const { up } = heldOut.log;
    if (!up) return [];
    return heldOut.fold.defensive_windows.flatMap(window => {
      const cover = this.defensives.measureCover(window, up);
      if (!cover.length) return [];
      const kept = Object.fromEntries(Object.entries(up).map(([name, spans]) => [
        name, cover.includes(name) ? spans.filter(span => !this.defensives.measureCover(window, { [name]: [span] }).length) : spans,
      ]));
      return [{ ...heldOut, log: { ...heldOut.log, up: kept } }];
    });
  }

  /** Per window the log was alive through, it dies halfway in and is not brought back. */
  private deathsInWindows(heldOut: DefensiveCase): DefensiveCase[] {
    const { model } = heldOut.log;
    return heldOut.fold.defensive_windows.flatMap(window => {
      const endS = window.time_s + window.window_length_s;
      if (this.pullModel.causeOf(model, window.time_s, endS)) return [];
      const diedS = window.time_s + window.window_length_s / 2;
      const deadSpans = [...model.deadSpans.filter(([fromS]) => fromS < diedS), [diedS, model.fightDurationS] as DeadSpan];
      return [{ ...heldOut, log: { ...heldOut.log, model: this.rows.withDeaths(model.fightDurationS, model.judgedEndS, deadSpans) } }];
    });
  }

  /** One variant per window: the log's own burst there lands later by the shift, and the damage it displaced comes earlier, so the pull's total stays. */
  private shiftedBursts(heldOut: BurstCase): BurstCase[] {
    const perS = heldOut.log.damagePerS;
    return heldOut.fold.windows.flatMap(window => {
      const measured = this.bursts.measure(perS, window, heldOut.log.model.aliveSpans);
      if (!measured || measured.startS + measured.lengthS + CHOICES.burstShiftS > perS.length) return [];
      const { startS: fromS, lengthS } = measured;
      const burst = perS.slice(fromS, fromS + lengthS);
      const displaced = perS.slice(fromS + lengthS, fromS + lengthS + CHOICES.burstShiftS);
      const damagePerS = [...perS.slice(0, fromS), ...displaced, ...burst, ...perS.slice(fromS + lengthS + CHOICES.burstShiftS)];
      return [{ ...heldOut, log: { ...heldOut.log, damagePerS } }];
    });
  }

  private gearVariants(mistake: InjectedMistake, heldOut: GearCase): GearCase[] {
    const { picks } = heldOut;
    if (mistake === 'swap-talent-node') {
      return picks.talent_key ? [{ ...heldOut, picks: { ...picks, talent_key: `${picks.talent_key},${SWAPPED_ENTRY}.1` } }] : [];
    }
    if (mistake !== 'remove-enchant') return [];
    const [slot] = Object.keys(picks.enchant_ids);
    if (slot === undefined) return [];
    const enchant_ids = Object.fromEntries(Object.entries(picks.enchant_ids).filter(([key]) => key !== slot));
    return [{ ...heldOut, picks: { ...picks, enchant_ids } }];
  }
}
