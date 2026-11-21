import { NorthernSkyBench } from './northern-sky-data-source';
import { parseRanking } from '../../../../../testing/builders/bench-sources';

export const NORTHERN_SKY_SPEC = 'SubtletyRogue';
export const NORTHERN_SKY_ENCOUNTER_ID = 3009;

export function bench(over: Partial<NorthernSkyBench> = {}): NorthernSkyBench {
  return {
    spec: NORTHERN_SKY_SPEC, encounter_id: NORTHERN_SKY_ENCOUNTER_ID, encounter_name: 'Boss', metric: 'dps', source: parseRanking(),
    abilities: [], phases: [], ...over,
  };
}
