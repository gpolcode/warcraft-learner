import { InjectionToken, inject } from '@angular/core';
import type { FactReader } from './priority-list.models';
import { TalentFacts } from './facts/talent-facts';
import { EnemyFacts } from './facts/enemy-facts';
import { BuffFacts } from './facts/buff-facts';
import { CooldownFacts } from './facts/cooldown-facts';
import { ClockFacts } from './facts/clock-facts';
import { ResourceFacts } from './facts/resource-facts';
import { TimingFacts } from './facts/timing-facts';
import { DebuffFacts } from './facts/debuff-facts';
import { PriorCastFacts } from './facts/prior-cast-facts';
import { HealthFacts } from './facts/health-facts';
import { PetFacts } from './facts/pet-facts';
import { FightStyleFacts } from './facts/fight-style-facts';

/** Every fact family a log can answer; a name none of them matches reads as unknown. */
export const FACT_READERS = new InjectionToken<readonly FactReader[]>('FACT_READERS', {
  factory: () => [
    TalentFacts, EnemyFacts, BuffFacts, CooldownFacts, ClockFacts, ResourceFacts, TimingFacts, DebuffFacts, PriorCastFacts,
    HealthFacts, PetFacts, FightStyleFacts,
  ].map(reader => inject(reader)),
});
