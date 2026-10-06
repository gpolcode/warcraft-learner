import { InjectionToken, Type, inject } from '@angular/core';
import type { FactReader } from './priority-list.models';
import { AuraFacts } from './facts/aura-facts';
import { CooldownFacts } from './facts/cooldown-facts';
import { PoolFacts } from './facts/pool-facts';
import { FightFacts } from './facts/fight-facts';
import { PressFacts } from './facts/press-facts';
import { GearFacts } from './facts/gear-facts';
import { BuildFacts } from './facts/build-facts';

const READERS: Type<FactReader>[] = [AuraFacts, CooldownFacts, PoolFacts, FightFacts, PressFacts, GearFacts, BuildFacts];

/** One reader per kind of state a SimC name reads; a kind none claims reads as unknown. */
export const FACT_READERS = new InjectionToken<readonly FactReader[]>('FACT_READERS', {
  factory: () => READERS.map(reader => inject(reader)),
});
