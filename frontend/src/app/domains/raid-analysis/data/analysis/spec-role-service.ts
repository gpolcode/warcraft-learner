import { Injectable } from '@angular/core';
import type { RankingMetric } from '../wcl/wcl.models';

@Injectable({ providedIn: 'root' })
export class SpecRoleService {
  isHealer(spec: string): boolean {
    return HEALER_SPECS.has(spec);
  }

  /** Tanks stay on damage, which is WCL's own default ranking for them. */
  rankingMetric(spec: string): RankingMetric {
    return this.isHealer(spec) ? 'hps' : 'dps';
  }
}

/** Spec folder keys (`spec.slug + class.slug`). */
const HEALER_SPECS: ReadonlySet<string> = new Set([
  'DisciplinePriest', 'HolyPaladin', 'HolyPriest', 'MistweaverMonk', 'PreservationEvoker', 'RestorationDruid', 'RestorationShaman',
]);
