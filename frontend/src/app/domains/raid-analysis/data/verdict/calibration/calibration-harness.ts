import { BurstWindow } from '../../analysis/analysis.models';
import { RotationParseMeasures } from '../../rotation/rotation-data-source';
import { DefensiveParseMeasures } from '../../defensive/defensive-data-source';
import { DeadSpan } from '../../analysis/death-timeline-service';
import { GearBench, GearParseMeasures } from '../../gear/gear-data-source';
import { BurstBench, BurstParseMeasures } from '../../burst-windows/burst-data-source';
import { benchSources } from '../../../../../../testing/builders/bench-sources';

export const SB = 'Shadow Blades';
export const CLOAK = 'Cloak of Shadows';
/** Every fixture top log's kill, and the fight a held-out log is judged over. */
export const FIGHT_S = 300;
/** Ninety seconds apart, the cooldown's own cadence, from a 5s opener. */
export const ON_CADENCE = [5, 95, 185, 275];

/** A top log's rotation measures: on cadence, idle 60s (a fifth) of the pull, no lust. */
export function rotationLog(over: Partial<RotationParseMeasures> = {}): RotationParseMeasures {
  return { idle_s: [[100, 160]], lust_s: null, phase_starts: [], cd_casts_s: { [SB]: ON_CADENCE }, buttons: {}, ...over };
}

/** Every fixture defensive window's start; it runs five seconds. */
export const WINDOW_AT_S = 30;
/** Damage a fixture top log takes in the window, all in its first second. */
export const WINDOW_DAMAGE = 1000;

/** A top log with Cloak of Shadows up through the window at 30s unless `covered` is false. */
export function defensiveLog(
  casts: number[] = [10, 130], { covered = true, damage = WINDOW_DAMAGE, dead = [] }: { covered?: boolean; damage?: number; dead?: DeadSpan[] } = {},
): DefensiveParseMeasures {
  return {
    def_casts_s: { [CLOAK]: casts },
    def_up_s: { [CLOAK]: covered ? [[WINDOW_AT_S - 1, WINDOW_AT_S + 6]] : [] },
    taken_per_s: Array.from({ length: FIGHT_S }, (_unused, second) => second === WINDOW_AT_S ? damage : 0),
    dead_s: dead,
  };
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
export function defensiveWindow(parses: number[], damage = WINDOW_DAMAGE, timeS = WINDOW_AT_S): BurstWindow {
  return {
    time_s: timeS, window_length_s: 5, dmg_avg: damage, dmg_min: damage, dmg_max: damage, dmg_stddev: 0,
    defensive_name: CLOAK, common_cds: [CLOAK], ability_breakdown: [],
    members: parses.map(parse => ({ parse, time_s: timeS, window_length_s: 5, damage })),
  };
}

/** Every fixture burst window's start and length: ten seconds from 40s. */
export const BURST_AT_S = 40;
export const BURST_S = 10;
const STEADY_PER_S = 10;
const BURST_PER_S = 30;

/** A top log dealing steady damage all pull and three times as much for the burst's ten seconds from `burstAtS`. */
export function burstLog(burstAtS = BURST_AT_S): BurstParseMeasures {
  return { damage_per_s: Array.from({ length: FIGHT_S }, (_unused, second) => second >= burstAtS && second < burstAtS + BURST_S ? BURST_PER_S : STEADY_PER_S) };
}

/** A burst window formed by `parses`, each at its own start. */
export function burstWindow(parses: number[], memberStartsS: number[] = parses.map(() => BURST_AT_S)): BurstWindow {
  return {
    time_s: BURST_AT_S, window_length_s: BURST_S, dmg_avg: 0, dmg_min: 0, dmg_max: 0, dmg_stddev: 0, common_cds: [], ability_breakdown: [],
    members: parses.map((parse, index) => ({ parse, time_s: memberStartsS[index] ?? BURST_AT_S, window_length_s: BURST_S, damage: 0 })),
  };
}

export function burstBench(perParse: BurstParseMeasures[], windows: BurstWindow[]): BurstBench & { per_parse: BurstParseMeasures[] } {
  return {
    spec: 'SubtletyRogue', encounter_id: 1, encounter_name: 'Boss', metric: 'dps',
    sample_count: perParse.length, sources: benchSources(perParse.length), per_parse: perParse,
    windows, cd_spell_ids: {}, ability_icons: {},
  };
}
