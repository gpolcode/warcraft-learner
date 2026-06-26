/**
 * Transform: reshape the generic encounter bench into the burst card's own tailored
 * slice file (`data/specs/{spec}/burst/{enc}.json`). Pure - no IO, no WCL.
 *
 * Keep this shape in sync with the frontend consumer `BurstBench`
 * (`pages/post-raid/burst-windows/burst-data-source.ts`).
 */
import type { EncounterBench, ClusteredBurstWindow } from '../models/bench.models.ts';
import type { RulebookCooldown, RulebookDefensive } from '../../../src/app/core/models/rulebook.models.ts';

export interface BurstSliceFile {
  spec: string;
  encounter_id: number;
  encounter_name: string;
  sample_count: number;
  windows: ClusteredBurstWindow[];
  cd_spell_ids: Record<string, number>;
}

/** Cooldown / defensive name -> spell id, for the burst window header icons. */
export function buildCdSpellIds(cooldowns: RulebookCooldown[], defensives: RulebookDefensive[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const cooldown of cooldowns) if (cooldown.spell_id) map[cooldown.name] = cooldown.spell_id;
  for (const defensive of defensives) if (defensive.spell_id) map[defensive.name] = defensive.spell_id;
  return map;
}

/** Reshape a generic encounter bench into the burst slice file. */
export function buildBurstSlice(
  bench: EncounterBench,
  cooldowns: RulebookCooldown[],
  defensives: RulebookDefensive[],
): BurstSliceFile {
  return {
    spec: bench.spec,
    encounter_id: bench.encounter_id,
    encounter_name: bench.encounter_name,
    sample_count: bench.sample_count,
    windows: bench.burst_windows,
    cd_spell_ids: buildCdSpellIds(cooldowns, defensives),
  };
}
