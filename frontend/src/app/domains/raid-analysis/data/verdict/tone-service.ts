import { Injectable } from '@angular/core';
import { CostClass, Evidence, Tone, TONE_LEVELS, ToneLevel } from './tone.models';

/** The one place a tone is made: min(tier, evidence, cost class), so no producer can grade its own finding. */
@Injectable({ providedIn: 'root' })
export class ToneService {
  tone(family: { tier: ToneLevel; costClass: CostClass }, evidence: Evidence): Tone {
    const caps = [family.tier, evidence.level, this.costCap(family.costClass, evidence.level)];
    return this.brand(caps.reduce((weakest, level) => TONE_LEVELS.indexOf(level) < TONE_LEVELS.indexOf(weakest) ? level : weakest));
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
