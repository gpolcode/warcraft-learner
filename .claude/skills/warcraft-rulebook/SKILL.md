---
name: warcraft-rulebook
description: Generate or refresh warcraft-learner spec rulebooks on demand, driven by Claude (no external LLM, no stored guide corpus). Fetches SimulationCraft action-priority lists and grounds every spell id against live Warcraft Logs, fanning out one subagent per spec. Load this whenever creating or refreshing rulebook.json for one, several, or all specs - at a new patch or tier, when onboarding a new spec, or when the ingest integrity gate rejects a spec's ids. Knows the SimC profile source and its per-tier path discovery, the WCL grounding queries, the healer exception (no SimC profile exists), the rulebook.schema.json contract, and the on-disk output path. Author rulebooks with this skill; it needs no external LLM and no CLI of its own.
---

# warcraft-learner rulebook generation

A rulebook (`rulebook.json`) is the per-spec contract the ingestion transforms consume: the spec's major offensive cooldowns, personal defensives, and a handful of machine-checkable usage rules, each with a **real WoW spell id**. One file per spec under `frontend/public/data/specs/{spec}/rulebook.json`. This skill produces it directly - Claude reads the sources, extracts the JSON, self-validates, and writes the file. No copy-paste, no `guides.json`, no external LLM key.

The schema is the authoritative shape: **`.claude/skills/warcraft-ingestion/rulebook.schema.json`**. Read it first and make the output validate against it. The field meanings live in the schema's own `description` strings - follow them exactly (especially: `usage_rule` is user-facing coaching copy and must never carry spell-id uncertainty; put that in `id_note`).

## When to use

- A new patch/tier reshapes cooldowns, adds tier-set-driven timing, or churns spell ids -> refresh the affected specs.
- Onboarding a new spec (e.g. a new class or 4th spec) -> generate its first rulebook. Note: a genuinely new spec also needs a row in the two registries (`frontend/src/app/core/spec-meta.ts` and `frontend/scripts/ingest/wcl-mappers.ts`) before it can be ranked or iconed; this skill covers only the rulebook.
- The ingest integrity gate logged `rulebook references N spell id(s) WCL cannot resolve` -> regenerate that spec with grounding.

## Step 1 - pick the specs

The spec universe is the 39-row table in `frontend/scripts/ingest/wcl-mappers.ts` (`SPEC_TO_WCL_FORWARD`): each folder key maps to `[className, specName]`. Ask the user which specs to do - accept "all", a class ("all three rogue specs"), a role ("the casters", "healers"), or explicit names. Resolve their answer to a concrete list of folder keys against that table. Confirm the resolved list before fanning out.

## Step 2 - the sources (per spec)

Ground every rulebook in real data; never author spell ids from memory alone. Two sources, combined with your own WoW domain knowledge:

### A. SimulationCraft APL - primary for DPS and tanks

SimC ships an action-priority list per DPS/tank spec: the exact cast priority, cooldown pairings, BL syncs, and the opener, plus a `talents=` string. It is the highest-signal mechanical source. Fetch the raw profile:

```
https://raw.githubusercontent.com/simulationcraft/simc/<branch>/profiles/<TIER>/<TIER>_<ClassName>_<SpecName>.simc
```

- `<branch>` is the current-expansion dev branch: **`midnight`** now. If it 404s, fall back to `thewarwithin`.
- `<TIER>` is the latest tier profile dir on that branch, e.g. **`MID1`**. Do not hard-trust this string across tiers - list `https://api.github.com/repos/simulationcraft/simc/contents/profiles?ref=<branch>` and pick the highest-numbered `MID<n>` (or `TWW<n>`) dir. The path moves every tier; discover it, do not assume.
- `<ClassName>_<SpecName>` are the no-space forms from `SPEC_TO_WCL_FORWARD` (e.g. `Rogue_Subtlety`, `Hunter_BeastMastery`, `DeathKnight_Frost`, `DemonHunter_Havoc`). Confirm the exact filename by listing the tier dir if a fetch 404s (SimC sometimes suffixes hero-talent variants; take the base spec file).

Read the `actions*` lines: `call_action_list` names reveal the cooldown groups; conditions like `racial_sync,value=buff.shadow_blades.up&buff.shadow_dance.up` or `if=cooldown.X.remains` directly encode pairing/hold rules and BL syncs. Translate those into `major_cooldowns`, `align_with_bloodlust`, `opener_priority`, and the two machine-readable `rule` conditions.

### B. Warcraft Logs - spell-id grounding and the healer source

SimC has **no healer profiles** (Holy Paladin, Discipline Priest, Holy Priest, Restoration Druid, Restoration Shaman, Mistweaver Monk, Preservation Evoker). For those seven, and to verify ids for everyone, use WCL - the same public data the app ships.

Auth: client-credentials, id+secret embedded in `frontend/src/app/core/services/wcl-auth.ts` (or `WCL_CLIENT_ID`/`WCL_CLIENT_SECRET` if set). POST `grant_type=client_credentials` (HTTP Basic) to `https://www.warcraftlogs.com/oauth/token`, then POST GraphQL to `https://www.warcraftlogs.com/api/v2/client` with `Authorization: Bearer <token>`.

Two uses:
1. **Verify every id.** Batch-resolve with `query{ a<ID>: ability(id:<ID>){id name icon} ... }` under `gameData`. A `null` result means the id does not exist - fix it before writing. This is exactly the check the ingest gate runs; catching it here means Claude fixes it, instead of the spec being silently skipped at ingest.
2. **Enumerate the real kit (healers especially).** Get the spec's top parses (`worldData{encounter(id:E){characterRankings(className:C specName:S metric:dps)}}` - or `metric:hps` for healers; pick any current encounter id from `frontend/public/data/specs/<spec>/encounters.json` if present), take a top `report.code`+`fightID`, then read that report's `masterData{abilities{gameID name icon}}` and the player's `Casts` to see which cooldowns and defensives top players actually press, with their real ids. This anchors the rulebook to logs, not memory - the uniform source that also covers healers.

## Step 3 - fan out one subagent per spec

Spawn one subagent per selected spec (batch to a sane concurrency, ~5-8 at a time). Give each subagent: its spec folder key, its `[className, specName]`, the schema path, the source recipe above, and the output path. Each subagent independently:

1. Fetches its SimC profile (skip for the seven healers - go straight to WCL kit enumeration).
2. Grounds/enumerates ids against WCL and verifies each resolves.
3. Extracts the rulebook JSON to the schema (all `major_cooldowns`, all `defensives` with cooldown >= 15s, 5-10 high-signal `rules`, `source_summary`). Spec-only abilities - never another spec of the same class.
4. Self-validates (Step 4) and writes the file.
5. Returns a one-line report: spec, counts (cooldowns/defensives/rules), and any id it could not ground.

Keep the extraction contract identical across subagents so the output is uniform. The schema's `description` fields are the contract; the two supported `condition` kinds (`cast_without_prior`, `hold_cooldown_for_anchor`) have worked examples in the schema's `$defs`.

## Step 4 - validate before writing

A rulebook that fails schema validation or references an unresolvable id is worse than none (the ingest gate skips the whole spec, leaving it with no data). Each subagent must, before writing:

- **Schema-validate.** The repo's compiled validator is `validateRulebook` in `frontend/scripts/lib.ts` (ajv against the schema). Run it, e.g. `tsx --tsconfig frontend/tsconfig.scripts.json -e "import{validateRulebook,readJson}from'./frontend/scripts/lib.ts';console.log(await validateRulebook(await readJson(process.argv[1])))" <path>` and require an empty error array. The schema demands at least one `major_cooldowns` and one `defensives` entry.
- **Id-resolvability.** Confirm every `spell_id`, `required_spell_id`, `anchor_spell_id`, and `spell_ids[]` resolved non-null in Step 2's `gameData.ability` batch.

Only then write to `frontend/public/data/specs/{spec}/rulebook.json` (pretty-printed - rulebooks are hand-reviewable, unlike the minified bench data). Set `spec` to the folder key. Leave `guide_count`/`saved_at` out (or stamp `saved_at` with a real date if you have one; there is no clock in this environment by default).

## Step 5 - what happens next

The written rulebook is the ingest contract. On the next ingestion run the orchestrator schema-validates it, runs the spell-id integrity gate, then drives the transforms to (re)build that spec's benches. The rulebook does not need to be perfect on the first pass - iterate on any spec the run rejects.

Deployment note: rulebooks are the source of truth for a spec's analysis. Keep them reviewable (a PR diff), and let the ingest workflow carry them into the served dataset - do not treat a rulebook edit as throwaway. If a rulebook change should re-tailor already-cached data, the ingest signature must account for it (see the **warcraft-ingestion** skill).
