---
name: warcraft-rulebook
description: Generate or refresh warcraft-learner spec rulebooks on demand, driven by Claude (no external LLM, no stored guide corpus, no CLI). Fetches SimulationCraft action-priority lists and Wowhead guides and grounds spell ids against live Warcraft Logs, fanning out one subagent per spec. Load this whenever creating or refreshing rulebook.json for one, several, or all specs - at a new patch or tier, when onboarding a new spec, or when the ingest integrity gate rejects a spec's ids. Knows the SimC + Wowhead source URLs and their per-tier discovery, the WCL grounding query, the healer exception, the rulebook.schema.json contract, the output path, and the gh-pages-only publish step.
---

# warcraft-learner rulebook generation

A rulebook (`rulebook.json`) is the per-spec contract the ingestion transforms consume: the spec's
major offensive cooldowns, personal defensives, and a handful of machine-checkable usage rules, each
with a **real WoW spell id**. One file per spec under `frontend/public/data/specs/{spec}/rulebook.json`.
This skill produces it directly - Claude reads the sources and writes the JSON. No copy-paste, no
`guides.json`, no external LLM key, no CLI.

The schema is the authoritative shape: **`.claude/skills/warcraft-ingestion/rulebook.schema.json`**. Read
it first and make the output validate against it. The field meanings live in the schema's own
`description` strings - follow them exactly (especially: `usage_rule` is user-facing coaching copy and
must never carry spell-id uncertainty; put that in `id_note`).

## When to use

- A new patch/tier reshapes cooldowns, adds tier-set-driven timing, or churns spell ids -> refresh the affected specs.
- Onboarding a new spec (e.g. a new class or a 4th spec) -> generate its first rulebook.
- The ingest integrity gate logged `rulebook references N spell id(s) WCL cannot resolve` -> regenerate that spec.

## Step 1 - pick the specs

Enumerate the spec universe live from WCL, so the list is never hardcoded:

```
query { gameData { classes { name slug specs { name slug } } } }
```

Each `spec.slug + class.slug` is the folder key (e.g. `Subtlety` + `Rogue` -> `SubtletyRogue`;
`Devourer` + `DemonHunter` -> `DevourerDemonHunter`). Ask the user which specs to do - accept "all", a
class, a role ("healers"), or explicit names - resolve to folder keys, and confirm the list before
fanning out. (Auth for the query: client-credentials in `frontend/src/app/core/services/wcl-auth.ts`, or
`WCL_CLIENT_ID`/`WCL_CLIENT_SECRET`. POST `grant_type=client_credentials` to
`https://www.warcraftlogs.com/oauth/token`, then POST GraphQL to
`https://www.warcraftlogs.com/api/v2/client` with `Authorization: Bearer <token>`.)

## Step 2 - the sources (per spec)

Ground every rulebook in real data; never author spell ids from memory alone. Three sources, combined
with your own WoW domain knowledge:

### A. SimulationCraft APL - primary for DPS and tanks

SimC ships an action-priority list per DPS/tank spec: the exact cast priority, cooldown pairings, BL
syncs, and the opener, plus a `talents=` string. Fetch the raw profile:

```
https://raw.githubusercontent.com/simulationcraft/simc/<branch>/profiles/<TIER>/<TIER>_<ClassName>_<SpecName>.simc
```

- `<branch>` is the current-expansion dev branch: **`midnight`** now. Fall back to `thewarwithin` if it 404s.
- `<TIER>` is the latest tier profile dir, e.g. **`MID1`**. Do not hard-trust it across tiers - list
  `https://api.github.com/repos/simulationcraft/simc/contents/profiles?ref=<branch>` and pick the highest
  `MID<n>` (or `TWW<n>`). The path moves every tier; discover it.
- `<ClassName>_<SpecName>` are the no-space forms (e.g. `Rogue_Subtlety`, `Hunter_BeastMastery`,
  `DeathKnight_Frost`). If a fetch 404s, list the tier dir to confirm the exact filename (SimC sometimes
  suffixes hero-talent variants; take the base spec file).

APL conditions like `racial_sync,value=buff.shadow_blades.up&buff.shadow_dance.up` or `if=cooldown.X.remains`
translate directly into `major_cooldowns`, `align_with_bloodlust`, `opener_priority`, and the two rule conditions.

### B. Wowhead guide - all specs (the healer source)

SimC has **no healer profiles** (Holy Paladin, Discipline Priest, Holy Priest, Restoration Druid,
Restoration Shaman, Mistweaver Monk, Preservation Evoker). Wowhead covers every spec. Its guide pages are
server-rendered, so a plain fetch returns the full body (no browser needed):

```
https://www.wowhead.com/guide/classes/<class-kebab>/<spec-kebab>/<subpage>-pve-<role>
```

- `<class-kebab>`: `rogue`, `paladin`, `demon-hunter`, `death-knight` (hyphenated for two-word classes).
- `<spec-kebab>`: `subtlety`, `holy`, `devourer`, `beast-mastery`.
- `<subpage>`: `rotation-cooldowns` (the key page), `overview`, `talent-builds`.
- `<role>`: `dps` / `healer` / `tank`. If a role suffix 404s, try the others.

Fetch the raw HTML and strip tags to text (the guide body lives in a `guide-body` block). This is the
primary source for the seven healer specs and a useful cross-check for everyone.

### C. Warcraft Logs - spell-id grounding

Resolve/verify every id you plan to write with a batched `gameData` query
(`query{ a<ID>: ability(id:<ID>){id name icon} ... }`); a `null` means the id does not exist - use a real
one instead. For healers especially, enumerate the spec's actual kit from a top parse's
`masterData{abilities{gameID name icon}}` (get a top `report.code` from
`worldData{encounter(id:E){characterRankings(className:C specName:S metric:hps)}}`), so ids come from real
logs rather than memory. This grounding is a generation aid, not a gate (see Step 4).

## Step 3 - fan out one subagent per spec

Spawn one subagent per selected spec (batch ~5-8 concurrent). Give each: its folder key, its
`[className, specName]`, the schema path, the source recipe above, and the output path. Each subagent:

1. Fetches its SimC profile (skip for the seven healers - go straight to Wowhead + WCL kit enumeration).
2. Fetches its Wowhead guide and grounds ids against WCL.
3. Extracts the rulebook JSON to the schema (all `major_cooldowns`, all `defensives` with cooldown >= 15s,
   5-10 high-signal `rules`, `source_summary`). Spec-only abilities - never another spec of the same class.
4. Writes the file (Step 4).
5. Returns a one-line report: spec, cooldown/defensive/rule counts, and any id it could not ground from logs.

Keep the extraction contract identical across subagents so the output is uniform. The two supported rule
`condition` kinds (`cast_without_prior`, `hold_cooldown_for_anchor`) have worked examples in the schema's `$defs`.

## Step 4 - write (ingest validates, not the skill)

Write to `frontend/public/data/specs/{spec}/rulebook.json` (pretty-printed; set `spec` to the folder key;
leave `guide_count`/`saved_at` out). The skill does **not** run its own validation. The ingest orchestrator
is the single authority: it schema-validates every rulebook and runs the spell-id integrity gate per spec,
loudly skipping any that fails. If a later ingest run rejects a spec, regenerate it.

## Step 5 - publish + re-bench (gh-pages only)

Rulebooks are gitignored on main and live only on gh-pages. After generating:

1. `npm run rulebook:publish` (from `frontend/`) copies the local `rulebook.json` files onto gh-pages under
   `data/specs/`. Run it when no ingest is mid-flight (gh-pages is force-pushed by CI; re-run on a
   non-fast-forward rejection).
2. Re-bench the changed specs: bump `INGEST_VERSION` (`scripts/ingest/ingest-version.ts`) or dispatch the
   ingest workflow. The next ingest run schema-validates + integrity-gates each rulebook and rebuilds that
   spec's benches.
