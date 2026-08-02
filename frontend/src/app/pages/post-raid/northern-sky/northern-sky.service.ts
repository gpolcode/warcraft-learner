import { Injectable, inject } from '@angular/core';
import { Result, LoadError } from '../../../core/result';
import { NORTHERN_SKY_DATA_SOURCE, NorthernSkyBench } from './northern-sky-data-source';

const MYTHIC_DIFFICULTY = 'Mythic';
// The raid lead re-assigns lines to their roster on import; no Blizzard spec id is exposed to tag with.
const EVERYONE_TAG = 'everyone';

// Assembles the plain-text NSRT note (Mythic, no phase) chronologically for the selected abilities.
export function buildNorthernSkyNote(bench: NorthernSkyBench, selectedSpellIds: ReadonlySet<number>): string {
  const header = `EncounterID:${bench.encounter_id};Name:${bench.encounter_name};Difficulty:${MYTHIC_DIFFICULTY}`;
  const lines: { time_s: number; text: string }[] = [];
  for (const ability of bench.abilities) {
    if (!selectedSpellIds.has(ability.spell_id)) continue;
    for (const time_s of ability.cast_times_s) {
      lines.push({ time_s, text: `time:${time_s};tag:${EVERYONE_TAG};spellid:${ability.spell_id};text:${ability.name}` });
    }
  }
  lines.sort((a, b) => a.time_s - b.time_s);
  return [header, ...lines.map(line => line.text)].join('\n');
}

@Injectable({ providedIn: 'root' })
export class NorthernSkyFeatureService {
  private readonly source = inject(NORTHERN_SKY_DATA_SOURCE);

  getExport(spec: string, encounterId: number): Promise<Result<NorthernSkyBench, LoadError>> {
    return this.source.getBench(spec, encounterId);
  }
}
