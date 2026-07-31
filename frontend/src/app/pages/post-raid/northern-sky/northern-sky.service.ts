import { Injectable, inject } from '@angular/core';
import { Result, LoadError } from '../../../core/result';
import { NORTHERN_SKY_DATA_SOURCE, NorthernSkyBench } from './northern-sky-data-source';

/** Every exported line carries this difficulty; the export targets Mythic plans. */
const MYTHIC_DIFFICULTY = 'Mythic';

/**
 * Build the Northern Sky (NSRT) note for the selected cooldowns: a plain-text header line plus
 * one `time:...;tag:...;spellid:...;text:...` reminder per selected cooldown per consensus cast
 * time, all lines sorted chronologically. Difficulty is fixed to Mythic and the phase field is
 * omitted. An empty selection yields the header alone.
 */
export function buildNorthernSkyNote(bench: NorthernSkyBench, selectedSpellIds: ReadonlySet<number>): string {
  const header = `EncounterID:${bench.encounter_id};Name:${bench.encounter_name};Difficulty:${MYTHIC_DIFFICULTY}`;
  const lines: { time_s: number; text: string }[] = [];
  for (const cooldown of bench.cooldowns) {
    if (!selectedSpellIds.has(cooldown.spell_id)) continue;
    for (const time_s of cooldown.cast_times_s) {
      lines.push({ time_s, text: `time:${time_s};tag:${bench.spec_id};spellid:${cooldown.spell_id};text:${cooldown.name}` });
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
