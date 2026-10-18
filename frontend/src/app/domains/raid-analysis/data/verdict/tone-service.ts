import { Injectable } from '@angular/core';
import { CostClass, Evidence, FamilyCaps, Tone, TONE_LEVELS, ToneLevel } from './tone.models';

/** The one place a tone is made: min(tier, evidence, cost class, calibration), so no producer can grade its own finding. */
@Injectable({ providedIn: 'root' })
export class ToneService {
  /** Without `calibration` the tone is the rules' alone, which is what the harness measures; every page passes the caps it loaded. */
  tone(family: { id?: string; tier: ToneLevel; costClass: CostClass }, evidence: Evidence, calibration?: FamilyCaps): Tone {
    const calibrated = calibration && family.id !== undefined ? [calibration.capOf(family.id)] : [];
    const caps = [family.tier, evidence.level, this.costCap(family.costClass, evidence.level), ...calibrated];
    return this.brand(caps.reduce((weakest, level) => TONE_LEVELS.indexOf(level) < TONE_LEVELS.indexOf(weakest) ? level : weakest));
  }

  /** Amber and red claim a mistake; only they may carry an imperative. */
  graded(tone: Tone): boolean {
    return tone === 'amber' || tone === 'red';
  }

  /** A measurement shown with no rule behind it, such as a pre-fight window. */
  neutral(): Tone {
    return this.brand('neutral');
  }

  /** A check the pull could not judge: dead, after the wipe, not reached. */
  muted(): Tone {
    return this.brand('muted');
  }

  /** Red needs a high cost; a low-cost row turns amber only on red-level evidence and otherwise keeps at most a consensus count. */
  private costCap(costClass: CostClass, level: ToneLevel): ToneLevel {
    if (costClass === 'high') return 'red';
    if (costClass === 'medium') return 'amber';
    if (level === 'red') return 'amber';
    return level === 'blue' ? 'blue' : 'neutral';
  }

  private brand(level: ToneLevel | 'muted'): Tone {
    return level as Tone;
  }
}
