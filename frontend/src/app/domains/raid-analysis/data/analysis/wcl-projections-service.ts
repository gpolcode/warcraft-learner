import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WclProjectionsService {
  private readonly json = inject(JsonCodecService);
  private readonly logger = inject(LoggerService);

  /** Copies of one NPC share a targetID, so identity needs the instance too; an event naming no target folds into a single bucket. */
  targetKey(event: WclEvent): string {
    return `${event.targetID ?? 0}:${event.targetInstance ?? 0}`;
  }

  relativeS(laterMs: number, earlierMs: number): number {
    return (laterMs - earlierMs) / 1000;
  }

  /** Stamps a WCL event stream with `atS` in one pass, so nothing past this point needs `fightStartMs` again. */
  withRelativeS(events: WclEvent[], fightStartMs: number): TimedEvent[] {
    return events.map(event => ({ ...event, atS: this.relativeS(event.timestamp, fightStartMs) }));
  }

  /** A merged duration can outlast the button's own aura (Anti-Magic Shell reads 45 on a 60s button), and a talent never shortens a cooldown below half. */
  pressFolds(buttons: readonly FoldButton[]): PressFold[] {
    return buttons.flatMap(({ name, spell_id, cooldown, duration = 0, charges = 1 }) => {
      const window_s = Math.min(duration, cooldown / 2);
      return charges <= 1 && cooldown >= FOLDING_COOLDOWN_S && window_s > 0 ? [{ name, spell_id, window_s }] : [];
    });
  }

  /** WCL logs one press of some buttons as several casts: Power Infusion once per target, The Hunt's leap and landing, each Divine Hymn tick. */
  presses(casts: WclEvent[], folds: readonly PressFold[], { buffs, abilities }: PressLog): WclEvent[] {
    const foldOf = this.foldsById(folds, abilities);
    const refreshes = this.secondPressRefreshes(buffs, foldOf);
    const kept = new Map<string, { index: number; press: WclEvent }>();
    const out: WclEvent[] = [];
    for (const event of casts) {
      const fold = event.type === 'cast' ? foldOf.get(event.abilityGameID) : undefined;
      if (!fold) { out.push(event); continue; }
      const key = `${event.sourceID ?? 0}:${fold.name}`;
      const last = kept.get(key);
      if (last && this.samePress(event, last.press, fold, refreshes.get(fold) ?? [])) {
        // WCL can log a channel's first tick a ms before its press (Divine Hymn), so the kept cast may carry the tick's id.
        if (event.abilityGameID === fold.spell_id) {
          last.press = { ...last.press, abilityGameID: fold.spell_id };
          out[last.index] = last.press;
        }
        continue;
      }
      kept.set(key, { index: out.length, press: event });
      out.push(event);
    }
    return out;
  }

  private foldsById(folds: readonly PressFold[], abilities: readonly WclAbility[]): Map<number, PressFold> {
    const foldOf = new Map<number, PressFold>();
    for (const fold of folds) {
      for (const ability of abilities) if (ability.name === fold.name) foldOf.set(ability.gameID, fold);
      foldOf.set(fold.spell_id, fold);
    }
    return foldOf;
  }

  /** An aura that stacks refreshes as it gains a stack (Divine Hymn), so only a refresh of one that never stacks in the log shows a second press. */
  private secondPressRefreshes(buffs: readonly WclEvent[], foldOf: ReadonlyMap<number, PressFold>): Map<PressFold, WclEvent[]> {
    const stacking = new Set(buffs.filter(event => event.type === 'applybuffstack').map(event => event.abilityGameID));
    const byFold = new Map<PressFold, WclEvent[]>();
    for (const event of buffs) {
      const fold = event.type === 'refreshbuff' && !stacking.has(event.abilityGameID) ? foldOf.get(event.abilityGameID) : undefined;
      if (fold) getOrInsert(byFold, fold, (): WclEvent[] => []).push(event);
    }
    return byFold;
  }

  /** Inside the window, a one-charge button refreshes its own aura only when a second charge the spell data leaves out (Obsidian Bulwark) is pressed while the first still runs. */
  private samePress(cast: WclEvent, press: WclEvent, fold: PressFold, refreshes: readonly WclEvent[]): boolean {
    return this.relativeS(cast.timestamp, press.timestamp) < fold.window_s
      && !refreshes.some(refresh => refresh.sourceID === cast.sourceID && Math.abs(refresh.timestamp - cast.timestamp) <= CAST_AURA_SKEW_MS);
  }

  normalizeAbilityId(id: number): number {
    if (id === WCL_MELEE_EVENT_ABILITY_ID) return WOW_AUTO_ATTACK_SPELL_ID;
    if (id < 0) return WCL_SYNTHETIC_SOURCE_FALLBACK_ID;
    return id;
  }

  unwrapRankings(blob: WclRankingsBlob | null | undefined): WclRawRanking[] {
    if (!blob) return [];
    const parsed = typeof blob === 'string'
      ? this.json.parseJson(RANKINGS_BLOB_SCHEMA, blob, 'unwrapRankings: malformed rankings blob')
      : blob;
    return parsed?.rankings ?? [];
  }

  abilityIcons(raw: Record<string, WclRawAbility | null>): AbilityIcons {
    const icons: AbilityIcons = {};
    for (const entry of Object.values(raw)) {
      if (entry) icons[entry.id] = { icon: entry.icon?.replace(/\.jpg$/i, '') ?? '', name: entry.name };
    }
    return icons;
  }

  toParseRankings(raw: WclRawRanking[], count: number): ParseRanking[] {
    return raw
      .filter(ranking => ranking.report?.code && !ANONYMIZED_NAME.test(ranking.name ?? ''))
      .slice(0, count)
      .map(ranking => ({
        player: ranking.name ?? '',
        server: ranking.server?.name ?? '',
        report_code: ranking.report?.code ?? '',
        fight_id: ranking.report?.fightID ?? 0,
      }));
  }

  // A rankings row spells a realm "Twisting Nether" where a report actor spells it "Twisting-Nether", so identity is the alphanumerics.
  private realmKey(server: string): string {
    return server.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /** Binds a ranking to the actor it names; same-named raiders the realm cannot separate yield null, so no parse is bound to a coin-flip actor. */
  findParseActor(actors: ReportActor[] | undefined, ranking: ParseRanking): ReportActor | null {
    const named = (actors ?? []).filter(actor => actor.name === ranking.player);
    if (named.length < 2) return named[0] ?? null;
    const rankedRealm = this.realmKey(ranking.server);
    const [onlyOnRealm, ambiguous] = rankedRealm ? named.filter(actor => this.realmKey(actor.server) === rankedRealm) : [];
    return onlyOnRealm !== undefined && ambiguous === undefined ? onlyOnRealm : null;
  }

  /** WCL can leave an ability unnamed and a bench can miss the id outright; both render as a labelled placeholder, and only the missing id is worth a warning. */
  resolveAbility(
    abilities: AbilityIcons, id: number, source: string,
  ): { icon: string; name: string } {
    const ability = abilities[id];
    if (!ability) this.logger.logWarn(`${source}: ability id missing from ability map`, id);
    return { icon: ability?.icon ?? '', name: ability?.name ?? `Ability #${id}` };
  }

  windowSpells(spellIds: number[], abilities: AbilityIcons): WindowSpell[] {
    return spellIds.map(id => ({ id, ...this.resolveAbility(abilities, id, 'windowSpells') }));
  }
}

import * as z from '../../../shared/util-validation/zod-mini';
import { ParseRanking, WclAbility, WclEvent, WclRankingsBlob, WclRawAbility, WclRawRanking, WclReport } from '../wcl/wcl.models';
import { WindowSpell } from './window-comparison.models';
import { JsonCodecService } from '../../../shared/util-validation/json-codec-service';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { getOrInsert } from './analysis-math';
import type { PlanCooldown } from '../plan/plan.models';

export type TimedEvent = WclEvent & { atS: number };

export interface PressFold {
  name: string;
  spell_id: number;
  window_s: number;
}

type FoldButton = Pick<PlanCooldown, 'name' | 'spell_id' | 'cooldown' | 'duration' | 'charges'>;

/** The player's own auras show a second charge refreshing a button's aura, and the report's names tie a button's ids together. */
export interface PressLog {
  buffs: readonly WclEvent[];
  abilities: readonly WclAbility[];
}

// WCL anonymizes a privacy-protected parse's player name to "Character <id>-<id>", unfetchable since it can never match a report actor.
const ANONYMIZED_NAME = /^Character \d+-\d+$/;

// A button on a shorter cooldown can gain a second charge from a talent the spell data leaves out (Healing Stream Totem) or come back in under half of it (Preservation's Fire Breath).
const FOLDING_COOLDOWN_S = 60;

// WCL can stamp the aura change a cast causes a few tens of ms off the cast itself.
const CAST_AURA_SKEW_MS = 50;

// WCL reports the physical auto-attack as event ability id 1; the real spell is Auto Attack.
const WCL_MELEE_EVENT_ABILITY_ID = 1;
const WOW_AUTO_ATTACK_SPELL_ID = 6603;

// Negative ability ids are WCL's unresolvable synthetic sources (pet melee, environmental); 291807 is the spell "I Don't Know", used as the catch-all.
const WCL_SYNTHETIC_SOURCE_FALLBACK_ID = 291807;

// A per-field fallback keeps a row carrying one unreadable value usable instead of voiding the whole ranking list.
const OPTIONAL_STRING = z.catch(z.optional(z.string()), undefined);

const RAW_RANKING_SCHEMA = z.looseObject({
  name: OPTIONAL_STRING,
  server: z.catch(z.optional(z.looseObject({ name: OPTIONAL_STRING })), undefined),
  report: z.catch(z.optional(z.looseObject({
    code: OPTIONAL_STRING,
    fightID: z.catch(z.optional(z.number()), undefined),
  })), undefined),
});

const RANKINGS_BLOB_SCHEMA = z.looseObject({ rankings: z.optional(z.array(RAW_RANKING_SCHEMA)) });

export type AbilityIcons = Record<number, { icon: string; name: string }>;

export type ReportActor = NonNullable<WclReport['masterData']>['actors'][number];
