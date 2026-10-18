import { BurstWindow } from '../../analysis/analysis.models';
import { RotationParseMeasures } from '../../rotation/rotation-data-source';
import { DefensiveParseMeasures } from '../../defensive/defensive-data-source';
import { GearBench, GearParseMeasures } from '../../gear/gear-data-source';
import { benchSources } from '../../../../../../testing/builders/bench-sources';

export const SB = 'Shadow Blades';
export const CLOAK = 'Cloak of Shadows';
/** Every fixture top log's kill, and the fight a held-out log is judged over. */
export const FIGHT_S = 300;
/** Ninety seconds apart, the cooldown's own cadence, from a 5s opener. */
export const ON_CADENCE = [5, 95, 185, 275];

/** A top log's rotation measures: on cadence, casting 80% of the pull, no lust. */
export function rotationLog(over: Partial<RotationParseMeasures> = {}): RotationParseMeasures {
  return { efficiency_pct: 80, lust_s: null, phase_starts: [], cd_casts_s: { [SB]: ON_CADENCE }, buttons: {}, ...over };
}

export function defensiveLog(casts: number[] = [10, 130]): DefensiveParseMeasures {
  return { def_casts_s: { [CLOAK]: casts } };
}

export function gearLog(over: Partial<GearParseMeasures> = {}): GearParseMeasures {
  return { talent_key: 'v3:1.1,2.1', trinket_ids: [10, 20], enchant_ids: { 5: 500 }, ...over };
}

export function gearBench(perParse: GearParseMeasures[]): GearBench {
  return {
    spec: 'SubtletyRogue', encounter_id: 1, encounter_name: 'Boss', metric: 'dps',
    sample_count: perParse.length, sources: benchSources(perParse.length), per_parse: perParse,
    talent_builds: [], talent_nodes: [], talent_sample_count: perParse.length, trinket_sets: [],
    enchants: { 5: [{ id: 500, name: 'Chest Enchant', icon: '', item_id: null, pct: 100 }] },
  };
}

/** A defensive window formed by `parses`, each taking `damage` there. */
export function defensiveWindow(parses: number[], damage = 1000, timeS = 30): BurstWindow {
  return {
    time_s: timeS, window_length_s: 5, dmg_avg: damage, dmg_min: damage, dmg_max: damage, dmg_stddev: 0,
    defensive_name: CLOAK, common_cds: [CLOAK], ability_breakdown: [],
    members: parses.map(parse => ({ parse, time_s: timeS, window_length_s: 5, damage })),
  };
}
