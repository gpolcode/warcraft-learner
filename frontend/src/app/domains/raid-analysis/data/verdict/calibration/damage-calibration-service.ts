import { inject, Injectable } from '@angular/core';
import { DowntimeJudgeService } from '../../rotation/downtime-judge-service';
import { DamageEstimateService, DamageSample } from '../damage-estimate-service';
import { ContrastBench } from './calibration.models';
import { EncounterBenches, HeldOutCaseService } from './held-out-case-service';
import { HeldOutRowService } from './held-out-row-service';
import type { DeadSpan } from '../../analysis/death-timeline-service';

/** Each contrast log's damage estimates, made as the page makes a player's, against the gap its ranked figure shows. */
@Injectable({ providedIn: 'root' })
export class DamageCalibrationService {
  private readonly estimates = inject(DamageEstimateService);
  private readonly downtime = inject(DowntimeJudgeService);
  private readonly cases = inject(HeldOutCaseService);
  private readonly rows = inject(HeldOutRowService);

  /** Empty on a bench ranked on anything but damage, or before the cohort is fetched; a log without its ranked figure is left out. */
  samples(benches: EncounterBenches, contrast: ContrastBench | null): DamageSample[] {
    const bench = benches.rotation;
    const card = contrast?.rotation;
    if (!bench || !card || bench.metric !== 'dps' || bench.per_parse.length !== bench.sources.length) return [];
    const reference = this.downtime.reference(bench.per_parse, bench.sources.map(source => source.duration_s));
    const topPerS = (benches.burst?.per_parse ?? []).map(parse => parse.damage_per_s);
    const deadOf = this.deadSpans(contrast);
    return card.per_parse.flatMap((measures, i): DamageSample[] => {
      const source = card.sources[i];
      const gapS = source ? this.estimates.gapS(source, bench.sources) : null;
      if (!source || gapS === null) return [];
      const durationS = source.duration_s ?? 0;
      const model = this.rows.withDeaths(durationS, durationS, deadOf.get(this.cases.sourceKey(source)) ?? []);
      const casting = this.downtime.measure(measures.idle_s ?? null, model.aliveSpans);
      const idle = casting ? this.downtime.damageOf(casting, reference) : null;
      return [[this.estimates.totalS([idle, ...this.estimates.deaths(model.deadSpans, model.judgedEndS, topPerS)]), gapS]];
    });
  }

  private deadSpans(contrast: ContrastBench | null): Map<string, DeadSpan[]> {
    const card = contrast?.defensive;
    const spans = new Map<string, DeadSpan[]>();
    card?.per_parse.forEach((measures, i) => {
      const source = card.sources[i];
      if (source) spans.set(this.cases.sourceKey(source), measures.dead_s ?? []);
    });
    return spans;
  }
}
