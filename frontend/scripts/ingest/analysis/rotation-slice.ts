/**
 * Transform: reshape the generic encounter bench + rulebook into the rotation
 * card's own tailored slice file (`data/specs/{spec}/rotation/{enc}.json`). Pure -
 * no IO, no WCL.
 *
 * Keep this shape in sync with the frontend consumer `RotationBench`
 * (`pages/post-raid/rotation/rotation-data-source.ts`). The rotation slice carries
 * the per-cd benchmarks + efficiency thresholds the offensive analysis compares
 * against, the rulebook cooldown metadata + rules that drive findings + the plan,
 * a name -> spell-id map, and baked spell icon/name so the pre-fight plan renders
 * art with no report context.
 */
import type { EncounterBench, CdBenchmark } from '../models/bench.models.ts';
import type { RulebookCooldown, RulebookDefensive, RulebookRule } from '../../../src/app/core/models/rulebook.models.ts';

export interface RotationSliceFile {
  spec: string;
  encounter_id: number;
  encounter_name: string;
  sample_count: number;
  avg_duration_s: number;
  downtime_threshold_ms: number;
  top_avg_efficiency: number;
  top_efficiency_stddev: number;
  per_cd_benchmarks: Record<string, CdBenchmark>;
  major_cooldowns: RulebookCooldown[];
  rules: RulebookRule[];
  cd_spell_ids: Record<string, number>;
  ability_icons: Record<number, { icon: string; name: string }>;
}

/** Cooldown / defensive name -> spell id, for row + header icons. */
export function buildRotationCdSpellIds(cooldowns: RulebookCooldown[], defensives: RulebookDefensive[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const cooldown of cooldowns) if (cooldown.spell_id) map[cooldown.name] = cooldown.spell_id;
  for (const defensive of defensives) if (defensive.spell_id) map[defensive.name] = defensive.spell_id;
  return map;
}

/**
 * Bake the icon/name for every cooldown + defensive spell id from the ingest
 * ability metadata (id -> {icon, name}). Skips spell ids absent from the meta so
 * the consumer falls back to a generic label.
 */
export function buildRotationAbilityIcons(
  cooldowns: RulebookCooldown[], defensives: RulebookDefensive[],
  abilityMeta: Record<number, { icon: string; name: string }>,
): Record<number, { icon: string; name: string }> {
  const icons: Record<number, { icon: string; name: string }> = {};
  for (const cooldown of cooldowns) {
    const meta = abilityMeta[cooldown.spell_id];
    if (meta) icons[cooldown.spell_id] = { icon: meta.icon, name: meta.name || cooldown.name };
  }
  for (const defensive of defensives) {
    const meta = abilityMeta[defensive.spell_id];
    if (meta) icons[defensive.spell_id] = { icon: meta.icon, name: meta.name || defensive.name };
  }
  return icons;
}

/** Reshape a generic encounter bench + rulebook into the rotation slice file. */
export function buildRotationSlice(
  bench: EncounterBench,
  cooldowns: RulebookCooldown[],
  rules: RulebookRule[],
  defensives: RulebookDefensive[],
  abilityMeta: Record<number, { icon: string; name: string }> = {},
): RotationSliceFile {
  return {
    spec: bench.spec,
    encounter_id: bench.encounter_id,
    encounter_name: bench.encounter_name,
    sample_count: bench.sample_count,
    avg_duration_s: bench.avg_duration_s,
    downtime_threshold_ms: bench.downtime_threshold_ms,
    top_avg_efficiency: bench.top_avg_efficiency,
    top_efficiency_stddev: bench.top_efficiency_stddev,
    per_cd_benchmarks: bench.per_cd_benchmarks,
    major_cooldowns: cooldowns,
    rules,
    cd_spell_ids: buildRotationCdSpellIds(cooldowns, defensives),
    ability_icons: buildRotationAbilityIcons(cooldowns, defensives, abilityMeta),
  };
}
