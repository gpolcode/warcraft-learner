import { Injectable, inject } from '@angular/core';
import { Result } from '../../../shared/util-http/result';
import { round } from '../analysis/analysis-math';
import { NORTHERN_SKY_DATA_SOURCE, NorthernSkyBench, NorthernSkyAbility } from './northern-sky-data-source';
import { NorthernSkyPhase } from './northern-sky-phases';

const MYTHIC_DIFFICULTY = 'Mythic';
// The raid lead re-assigns lines to their roster on import; no Blizzard spec id is exposed to tag with.
const EVERYONE_TAG = 'everyone';
const REMINDER_LEAD_S = 5;
const PULL_PHASE: NorthernSkyPhase = { phase: 1, start_s: 0 };

@Injectable({ providedIn: 'root' })
export class NorthernSkyFeatureService {
  private readonly source = inject(NORTHERN_SKY_DATA_SOURCE);

  getExport(spec: string, encounterId: number): Promise<Result<NorthernSkyBench>> {
    return this.source.getBench(spec, encounterId);
  }

  buildNorthernSkyNote(bench: NorthernSkyBench, selectedSpellIds: ReadonlySet<number>): string {
    const header = `EncounterID:${bench.encounter_id};Name:${bench.encounter_name};Difficulty:${MYTHIC_DIFFICULTY}`;
    const lines: { time_s: number; text: string }[] = [];
    for (const ability of bench.abilities) {
      if (!selectedSpellIds.has(ability.spell_id)) continue;
      for (const time_s of ability.cast_times_s) {
        const phase = this.phaseAt(bench.phases, time_s);
        lines.push({ time_s, text: `tag:${EVERYONE_TAG};time:${round(time_s - phase.start_s)};spellid:${ability.spell_id};ph:${phase.phase};dur:${REMINDER_LEAD_S}` });
      }
    }
    lines.sort((a, b) => a.time_s - b.time_s);
    return [header, ...lines.map(line => line.text)].join('\n');
  }

  // Northern Sky re-arms reminders per phase and drops the outgoing phase's unfired lines, so a pull-relative time goes silent at the first transition.
  protected phaseAt(phases: readonly NorthernSkyPhase[], time_s: number): NorthernSkyPhase {
    let current = PULL_PHASE;
    for (const phase of phases) {
      if (phase.start_s <= time_s) current = phase;
    }
    return current;
  }

  abilitiesByKind(abilities: NorthernSkyAbility[]): { cooldowns: NorthernSkyAbility[]; defensives: NorthernSkyAbility[] } {
    return {
      cooldowns: abilities.filter(ability => ability.kind === 'cooldown'),
      defensives: abilities.filter(ability => ability.kind === 'defensive'),
    };
  }

  // A spell id counts as selected unless the user excluded it, so an ability new to the list defaults on.
  selectedIds(abilities: NorthernSkyAbility[], excluded: ReadonlySet<number>): Set<number> {
    return new Set(abilities.map(ability => ability.spell_id).filter(id => !excluded.has(id)));
  }

  isAllSelected(abilities: NorthernSkyAbility[], excluded: ReadonlySet<number>): boolean {
    return abilities.length > 0 && abilities.every(ability => !excluded.has(ability.spell_id));
  }

  toggleExclusion(excluded: ReadonlySet<number>, spellId: number, selected: boolean): Set<number> {
    const next = new Set(excluded);
    if (selected) next.delete(spellId);
    else next.add(spellId);
    return next;
  }

  // An empty ability list has nothing to select, so it must return the exclusions untouched rather than falling into isAllSelected's "not all selected" branch and clearing them.
  toggleAllExclusion(abilities: NorthernSkyAbility[], excluded: ReadonlySet<number>): Set<number> {
    if (abilities.length === 0) return new Set(excluded);
    return this.isAllSelected(abilities, excluded) ? new Set(abilities.map(ability => ability.spell_id)) : new Set();
  }

  // The panel stays mounted across encounter switches, so a stale open request must not render once the bench has nothing to export.
  isPanelOpen(requestedOpen: boolean, available: boolean): boolean {
    return requestedOpen && available;
  }
}
