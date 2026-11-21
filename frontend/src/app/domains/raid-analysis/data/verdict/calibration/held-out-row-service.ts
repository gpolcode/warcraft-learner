import { inject, Injectable } from '@angular/core';
import { AliveSpan } from '../../analysis/analysis-math';
import { PullModel, PullModelService } from '../../analysis/pull-model-service';
import { DeadSpan } from '../../analysis/death-timeline-service';
import { FindingFamily } from '../finding-family.models';
import { ToneService } from '../tone-service';
import { Evidence, Tone, TONE_LEVELS } from '../tone.models';
import { VERDICT_CHOICES } from '../verdict-choices';
import { HeldOutRow } from './calibration.models';

/** Turns a judge's evidence on a held-out top log into one counted test, the way the page would tone it before calibration. */
@Injectable({ providedIn: 'root' })
export class HeldOutRowService {
  private readonly tones = inject(ToneService);
  private readonly pullModel = inject(PullModelService);

  /** Evidence under `minReferenceN` top logs is context the page never colors, so it is no test; neither is a span death or the pull's end explains. */
  row(family: FindingFamily, evidence: Evidence, model?: PullModel, span?: { fromS: number; toS: number }): HeldOutRow[] {
    if (evidence.n < VERDICT_CHOICES.minReferenceN) return [];
    if (model && span && this.pullModel.causeOf(model, span.fromS, span.toS)) return [];
    const tone = this.tones.tone(family, evidence);
    return [{ family: family.id, level: TONE_LEVELS.find(level => level === tone) ?? 'neutral' }];
  }

  /** A verdict a judge already toned, such as a gear check; `n` is its reference count. */
  toneRow(familyId: string, tone: Tone, n: number): HeldOutRow[] {
    if (n < VERDICT_CHOICES.minReferenceN) return [];
    return [{ family: familyId, level: TONE_LEVELS.find(level => level === tone) ?? 'neutral' }];
  }

  /** A top log as the player: alive from the pull to its kill. */
  wholePull(durationS: number): PullModel {
    return this.withDeaths(durationS, durationS, []);
  }

  /** A pull cut at `endS` as a wipe, or carrying deaths; the alive spans are the complement of the dead ones before the judged end. */
  withDeaths(durationS: number, judgedEndS: number, deadSpans: DeadSpan[]): PullModel {
    const aliveSpans: AliveSpan[] = [];
    let fromS = 0;
    for (const [diedS, backS] of deadSpans) {
      if (diedS > fromS) aliveSpans.push([fromS, Math.min(diedS, judgedEndS)]);
      fromS = backS;
    }
    if (judgedEndS > fromS) aliveSpans.push([fromS, judgedEndS]);
    return {
      fightDurationS: durationS, judgedEndS, judgedEndCause: judgedEndS < durationS ? 'wipe' : 'kill',
      deadSpans, aliveSpans, lust: null, phases: [], role: 'dps',
    };
  }
}
