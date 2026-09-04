import { NorthernSkyBench } from './northern-sky-data-source';
import { NorthernSkySchedule } from './northern-sky-feature-service';
import { NorthernSkyPhase } from './northern-sky-phases';

export const NORTHERN_SKY_SPEC = 'SubtletyRogue';
export const NORTHERN_SKY_ENCOUNTER_ID = 3009;

export function bench(over: Partial<NorthernSkyBench> = {}): NorthernSkyBench {
  return {
    spec: NORTHERN_SKY_SPEC, encounter_id: NORTHERN_SKY_ENCOUNTER_ID, encounter_name: 'Boss',
    abilities: [], ...over,
  };
}

export function schedule(over: Partial<NorthernSkyBench> = {}, phases: readonly NorthernSkyPhase[] = []): NorthernSkySchedule {
  return { bench: bench(over), phases };
}
