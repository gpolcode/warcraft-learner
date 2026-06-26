import { Injectable, inject } from '@angular/core';
import { PlayerBurstWindow } from '../../../core/models/analysis.models';
import { BURST_DATA_SOURCE } from './burst-data-source';
import { buildBurstView, BurstView } from './burst.vm';

/** Spell id -> display info, baked from the report's master abilities (AnalysisResult.ability_icons). */
export type AbilityIcons = Record<number, { icon: string; name: string }>;

/**
 * Runtime shell for the burst card. Injects only its data source (swapped file /
 * live by the dev flag), reads the prepared bench windows, then calls the pure
 * `burst.vm` functions to build the view-model. Contains no arithmetic of its own.
 *
 * The player-vs-bench window damage (`playerWindows`) is still produced upstream by
 * the analysis worker and passed in; having the slice fetch the player log itself is
 * a follow-up. Ability names come baked in via `abilityIcons`, so this never touches
 * the icon cache.
 */
@Injectable({ providedIn: 'root' })
export class BurstFeatureService {
  private readonly source = inject(BURST_DATA_SOURCE);

  async loadView(
    spec: string,
    encounterId: number,
    fightDurationS: number,
    playerWindows: PlayerBurstWindow[],
    abilityIcons: AbilityIcons,
  ): Promise<BurstView> {
    const bench = await this.source.getBurstBench(spec, encounterId);
    if (!bench) return { windows: [], anchors: [] };
    const nameOf = (spellId: number): string => abilityIcons[spellId]?.name ?? `Spell ${spellId}`;
    return buildBurstView(bench.windows, playerWindows, fightDurationS, bench.cd_spell_ids, nameOf);
  }
}
