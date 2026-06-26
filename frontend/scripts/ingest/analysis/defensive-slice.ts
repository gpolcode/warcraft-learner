/**
 * Transform: reshape the generic encounter bench into the defensive card's own
 * tailored slice file (`data/specs/{spec}/defensive/{enc}.json`). Pure - no IO,
 * no WCL. Bakes the rulebook defensive metadata and per-ability icon/name so the
 * runtime never needs the icon cache.
 *
 * Keep this shape in sync with the frontend consumer `DefensiveBench`
 * (`pages/post-raid/defensive/defensive-data-source.ts`). Mirrors burst-slice.ts.
 */
import type { EncounterBench, ClusteredDefensiveWindow, BaseBenchmark, DefensiveSummary } from '../models/bench.models.ts';
import type { RulebookDefensive } from '../../../src/app/core/models/rulebook.models.ts';

/** Minimal ability art used to bake icon/name onto a window's abilities (and defensives). */
export interface AbilityMeta { gameID: number; name: string; icon: string; }

/** One defensive's static plan metadata, carried so /pre needs nothing but this file. */
export interface DefensivePlanMeta {
  name: string;
  spell_id: number;
  cooldown: number;
  duration: number | null;
  usage_rule: string | null;
  talent_gated: boolean;
}

/** Baked icon + name for one spell id, looked up at runtime by `ability_icons[id]`. */
export interface BakedAbility { icon: string; name: string; }

export interface DefensiveSliceFile {
  spec: string;
  encounter_id: number;
  encounter_name: string;
  sample_count: number;
  /** Per-defensive usage benchmarks (the lost/held/hold-suggestion thresholds). */
  per_defensive_benchmarks: Record<string, BaseBenchmark>;
  /** Clustered top-parse defensive windows (buff-window-centric). */
  defensive_windows: ClusteredDefensiveWindow[];
  /** Top-parse defensive usage summary (uses per defensive). */
  top_defensives_summary: DefensiveSummary[];
  /** Rulebook defensive metadata, drives the /pre defensive plan. */
  defensives: DefensivePlanMeta[];
  /** Defensive name -> spell id, for the window header icons. */
  cd_spell_ids: Record<string, number>;
  /** Baked spell-id -> {icon, name}, so the runtime renders art without the icon cache. */
  ability_icons: Record<number, BakedAbility>;
}

/** Defensive name -> spell id, for the defensive window header icons. */
export function buildDefensiveSpellIds(defensives: RulebookDefensive[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const defensive of defensives) if (defensive.spell_id) map[defensive.name] = defensive.spell_id;
  return map;
}

/** Rulebook defensives -> the static plan metadata carried in the slice file. */
export function buildDefensivePlanMeta(defensives: RulebookDefensive[]): DefensivePlanMeta[] {
  return defensives.map(defensive => ({
    name: defensive.name,
    spell_id: defensive.spell_id,
    cooldown: defensive.cooldown,
    duration: defensive.duration ?? null,
    usage_rule: defensive.usage_rule ?? null,
    talent_gated: !!defensive.talent_gated,
  }));
}

/**
 * Bake icon/name for every spell id referenced by the slice: each defensive's own
 * spell, plus every ability in any defensive window's breakdown. Drops `.jpg` from
 * the icon name to match the runtime icon-cache convention.
 */
export function buildAbilityIcons(
  defensives: RulebookDefensive[],
  windows: ClusteredDefensiveWindow[],
  abilityMeta: AbilityMeta[],
): Record<number, BakedAbility> {
  const metaById = new Map<number, AbilityMeta>();
  for (const meta of abilityMeta) if (meta.gameID) metaById.set(meta.gameID, meta);

  const wanted = new Set<number>();
  for (const defensive of defensives) if (defensive.spell_id) wanted.add(defensive.spell_id);
  for (const window of windows) for (const ability of window.ability_breakdown) wanted.add(ability.spell_id);

  const icons: Record<number, BakedAbility> = {};
  for (const spellId of wanted) {
    const meta = metaById.get(spellId);
    if (!meta) continue;
    icons[spellId] = { icon: (meta.icon || '').replace(/\.jpg$/i, ''), name: meta.name || '' };
  }
  return icons;
}

/** Reshape a generic encounter bench + rulebook defensives into the defensive slice file. */
export function buildDefensiveSlice(
  bench: EncounterBench,
  defensives: RulebookDefensive[],
  abilityMeta: AbilityMeta[],
): DefensiveSliceFile {
  return {
    spec: bench.spec,
    encounter_id: bench.encounter_id,
    encounter_name: bench.encounter_name,
    sample_count: bench.sample_count,
    per_defensive_benchmarks: bench.per_defensive_benchmarks,
    defensive_windows: bench.defensive_windows,
    top_defensives_summary: bench.top_defensives_summary,
    defensives: buildDefensivePlanMeta(defensives),
    cd_spell_ids: buildDefensiveSpellIds(defensives),
    ability_icons: buildAbilityIcons(defensives, bench.defensive_windows, abilityMeta),
  };
}
