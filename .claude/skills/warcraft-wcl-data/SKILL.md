---
name: warcraft-wcl-data
description: warcraft-learner Warcraft Logs (WCL) integration - the intentional public client-credentials pair and how it reaches a build, and the WCL API quirks that bite when reading gear, spec, talent, enchant, event, and position data. Load this before touching WCL queries, wcl-auth, the client pair, or reading any new WCL field.
---

# warcraft-learner WCL integration

**What good looks like:** every WCL read anticipates the quirks table below. Check it before fetching a new stream or field.

## Browser auth model (intentional public pair)

The browser authenticates with the **client-credentials** grant against `/api/v2/client`, using a client id + secret from a gitignored client file under `src/environments/` (a committed example beside it shows the shape; CI writes it from the repository secrets), and therefore public in the shipped JS bundle. A deliberate trade-off, not a leak to fix:

- The token reads only **public** WCL report data, and a client token has no user-scoped budget to lose.
- The **only** risk is a stolen pair draining the shared hourly rate-limit budget. Rotation is manual, at `warcraftlogs.com/api/clients/`: WCL exposes **no API to rotate a client secret**; after rotating, update the two Actions secrets.
- There is **no login UI, callback route, or PKCE flow**: a client token has no current user, so users always supply a report code or character name.
- The deployed site, the E2E run and the hourly CI ingest share the repository's pair and its budget; a developer's client file holds their own pair, so local runs and local ingestion spend their own budget. The pair never reaches the repository: code reads it through the injected environment and refuses a blank pair.
- Both workflows read that budget before their setup through `frontend/scripts/wcl-budget.mjs`: the ingest skips an hour that cannot cover `INGEST_POINTS_MARGIN`, and E2E fails when one analysis (`E2E_POINTS_NEEDED`) does not fit.

## WCL API quirks

The API facts a correct read depends on, and how to read each one.

| Quirk | Detail |
|---|---|
| **Two separate limits, one visible to `rateLimitData`** | `rateLimitData` reports only the hourly points, is their only source (no response header carries them) and costs one point per read, so ingest reuses each encounter's closing read as the next budget check. WCL also caps requests per minute (the `x-ratelimit-limit: 800` response header, its counter refilling within the minute), and past that cap answers every request with 429, `rateLimitData` included, while the points still read plenty left. WCL's CORS exposes neither that header nor `Retry-After` to the browser. Ingest waits a full minute after a 429 and resends (`WclRateLimitWaitInterceptor`), for up to two minutes; the hourly points stay the budget check's. |
| **`actor.subType` is class-only** | Returns the class (`Rogue`), never the spec. Spec comes from `playerDetails(fightIDs:[...])`. |
| **The API carries no class or spec icon** | `gameData.classes` returns names and slugs only. WCL's asset host serves the spec art by those slugs, `assets.rpglogs.com/img/warcraft/icons/<ClassSlug>-<SpecSlug>.jpg` (`DeathKnight-Blood`, `Hunter-BeastMastery`), so a new spec gets its icon with no data change; the class art is zamimg's `class_<slug>`. |
| **`Debuffs` tables do not narrow by caster** | `table(dataType:Debuffs fightIDs:[F] sourceID:S)` can return auras sitting **on** that actor, not ones it applied to enemies. Treat a row as an aura id and confirm the direction elsewhere before reading it as the player's dot. |
| **A single parse's `Casts` table can be partial** | A top log routinely lists a dozen cast entries and omits core buttons, and resource-gated form entries are never logged as casts. Sample several parses before calling an ability unused. |
| **Gear array is positionally indexed** | WCL returns gear as a bare array; the 0-based index IS the slot number. There is no `slot` field. |
| **Weapon slots are 15/16** | The array has 17 entries (0-16): index 15 is MH, 16 is OH, 14 is Back/Cloak. |
| **Trinket slots are 12 and 13** | Confirmed from `encounterRankings` responses. |
| **`permanentEnchant` is a string** | Numeric id returned as a string; `permanentEnchantName` is never populated. Resolve names through `gameData.enchant(id)`. |
| **`gameData.enchant(id).name` is the enchantment effect, not the item** | The id is a `SpellItemEnchantment` row and WCL exposes only its `{id name}`, which is the effect text: an armor kit reads `+41 Agility/Strength & +115 Stamina` (`Forest Hunter's Armor Kit`) and a weapon rite drops its `Enchant Weapon - ` prefix, while a scroll happens to match its item. WCL has no enchant-to-item link: map the enchant `id` to an item id through Raidbots' `enchantments.json`, then take the in-game name and icon from `gameData.item(id)`. |
| **The partition decides which parses you see** | Without one WCL answers from its default, whose top parses can be months old. Query the `partition` argument newest-first. |
| **A raid zone can have a frozen twin** | WCL keeps a frozen copy of a zone under the same name, carrying different encounter ids. Match unfrozen zones only. |
| **Nothing marks a zone as the current raid** | A finished tier stays unfrozen and ranked, and each patch gives it a fresh partition, so even its top parses look recent. Name the raids to bench explicitly. |
| **Two incompatible talent formats** | `characterRankings` -> old format (`{talentID, points}` list) -> `v1:` key. `encounterRankings` -> nested `nodeId` dict -> `v2:` key. The id spaces are incompatible; the keys cannot be compared. |
| **Resolving the talent key** | Each parse's CombatantInfo `talentTree` (the nested `nodeID` dict) yields the `v2:` form, so keys built from it compare directly. |
| **`server.region` may be a string** | In the `characterRankings` JSON blob, `server.region` is sometimes `"EU"` rather than `{slug: "eu"}`. Handle both forms. |
| **No `gameData.spell()`; use `masterData.abilities`** | Spell icons and names come from `masterData.abilities` in the report response, or from `gameData.ability(id)`, which resolves any real id and returns `null` for a nonexistent one. |
| **Melee auto-attack is event ability id `1`** | Physical auto-attacks carry `abilityGameID: 1`, so melee legitimately appears in a damage breakdown. Id 1 is not a real spell: `gameData.ability(1)` and `wowhead.com/spell=1` both land on the stale game spell 1, "Word of Recall (OLD)". Map id 1 to the real Auto Attack spell `6603` before any name, icon, or link lookup. |
| **Negative ability ids are synthetic, sourceless events** | Some event `abilityGameID`s are negative (e.g. `-32` on a priest log): WCL synthesizes them, undocumented, for sourceless / spell-less events (pet melee, environmental damage) that no game spell backs, so `gameData.ability` resolves none of them. Fold every negative id onto one real, resolvable id (game spell `291807`, literally named "I Don't Know") before any lookup. |
| **A derived cast carries `fake: true`** | WCL logs some casts the player never pressed: each Divine Hymn channel tick (64844) and The Hunt's landing (370966) arrive as `cast` events with `fake: true`, sometimes a ms before the real press. A press never carries the flag, so drop a fake cast before counting presses. |
| **`Buffs` filter is aura-target, not caster** | A `Buffs` events fetch with `sourceID` = the player returns the auras that are ON the player, whoever applied them: Bloodlust/Heroism/Time Warp cast by another raider appears on a non-shaman's own stream. |
| **Event positions need `includeResources: true`** | The default `events` response carries no coordinates. `includeResources: true` attaches the actor's resource snapshot, position included; it costs bandwidth, so ask for it only on a stream that reads positions. |
| **`classResources` is pre-cost and per-power** | With `includeResources: true` a `cast` event carries `classResources: [{amount, max, type, cost?}]`. `amount` is the pool **before** `cost` is deducted, so "spend at 5 combo points" reads `amount` directly. Only the powers a cast touches appear (a Subtlety finisher carries energy `type: 3` and combo points `type: 4`; a costless cooldown, energy only). Scales differ wildly per power (combo points 7/7, energy 100/100, mana 250000/250000), so compare against the event's own `max`. |
| **Enemy auras cannot be narrowed to one caster** | A `Debuffs` fetch with `hostilityType: Enemies` **and** a `sourceID` returns zero rows (hostility applies first, and the player is not an enemy), as does `filterExpression: "source.id = N"`. The only working shape is `hostilityType: Enemies` with no `sourceID`, filtered client-side on `sourceID === playerId`, which pulls every raider's debuffs (~30k events over ~7 pages for a 7-minute pull). Fetch it only when something reads enemy auras. |
| **A `death` event names the victim as its target** | The source is whatever dealt the killing blow, so a `Deaths` fetch with `sourceID` = the player returns nothing useful. Fetch it raid-wide (one small page) and filter `targetID === playerId`; `killingAbilityGameID` carries the killing blow. |
| **`targetInstance` separates copies of one NPC** | Adds from the same NPC share a `targetID` and differ only by `targetInstance`, absent on single-target events. Counting by `targetID` alone collapses them: one measured pull gave 5 distinct `targetID` against 18 distinct `(targetID, targetInstance)` pairs. Key any enemy count on both. |
| **Position is flattened onto the event, not nested** | With resources on, `x`, `y`, `facing`, `mapID` (plus `hitPoints`) sit at the **top level**; there is no `sourceResources`/`targetResources` object. Each event describes **one** actor, named by `resourceActor` (`1` = source, `2` = target): attribute the coords to `resourceActor === 2 ? targetID : sourceID`. |
| **Events default to friendly only** | The `events` query defaults to `hostilityType: Friendlies`, so ANY enemy-side fetch returns nothing without `hostilityType: Enemies` - even one naming an enemy `sourceID`, since hostility applies first. |
| **Position/facing units** | `x`/`y` are hundredths of a yard (`/100` -> yards). `facing` is milliradians (`/1000` -> radians) with a zero-point that does not match a screen "up" axis: apply a `-π/2` offset so "behind the boss" renders behind. |
| **`mapID` marks the phase/sub-map** | Coordinates compare only between actors sharing a `mapID`, which changes across phases that swap maps. Filter to a common `mapID` before computing relative positions. |

Stored positions keep these raw WCL units; their on-disk shape lives in `domains/raid-analysis/data/encounter/positioning.models.ts`.

## External APIs

Every host and endpoint below is an environment default, read through the `ENVIRONMENT` token. Warcraft Logs v2 GraphQL at `/api/v2/client`, authenticated with the built-in pair (see the auth section above). Raidbots static JSON at `raidbots.com/static/data/live/*.json` needs no auth and is read only during ingest: `talents.json` for talent names and icons, `enchantments.json` for the enchant-id-to-item-id map.
