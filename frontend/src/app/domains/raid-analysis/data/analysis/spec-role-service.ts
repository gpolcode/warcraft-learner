import { Injectable } from '@angular/core';
import type { RankingMetric } from '../wcl/wcl.models';

@Injectable({ providedIn: 'root' })
export class SpecRoleService {
  isHealer(spec: string): boolean {
    return HEALER_SPECS.has(spec);
  }

  role(spec: string): SpecRole {
    if (HEALER_SPECS.has(spec)) return 'healer';
    return TANK_SPECS.has(spec) ? 'tank' : 'dps';
  }

  /** Tanks stay on damage, which is WCL's own default ranking for them. */
  rankingMetric(spec: string): RankingMetric {
    return this.isHealer(spec) ? 'hps' : 'dps';
  }
}

export type SpecRole = 'dps' | 'tank' | 'healer';

/** Spec folder keys (`spec.slug + class.slug`). */
const HEALER_SPECS: ReadonlySet<string> = new Set([
  'DisciplinePriest', 'HolyPaladin', 'HolyPriest', 'MistweaverMonk', 'PreservationEvoker', 'RestorationDruid', 'RestorationShaman',
]);

const TANK_SPECS: ReadonlySet<string> = new Set([
  'BloodDeathKnight', 'BrewmasterMonk', 'GuardianDruid', 'ProtectionPaladin', 'ProtectionWarrior', 'VengeanceDemonHunter',
]);
