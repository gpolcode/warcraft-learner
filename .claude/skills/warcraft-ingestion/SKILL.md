---
name: warcraft-ingestion
description: warcraft-learner ingestion, rulebook, and scraping pipelines plus the data-file schemas they write. Covers the orchestrator that boots a headless Angular runtime and drives the same five *TransformServices as the browser, the signature-skip + manual INGEST_VERSION bump rule (bump it whenever a change should produce different tailored data), spec/encounter work-ordering, the rulebook CLI (npm run rulebook) and guide scraping (npm run scrape, Supadata for YouTube), and the index.json / guides.json / rulebook.json / signature-stamp schemas and rulebook + rule-condition JSON schema. Load this before touching scripts/ingest/**, the rulebook flow, guide scraping, INGEST_VERSION, or data/specs file shapes.
---

# warcraft-learner ingestion & content pipelines

The CLI scripts are TypeScript run via `tsx` (e.g. `tsx --tsconfig tsconfig.scripts.json scripts/ingest/orchestrator.ts`), not `.mjs`/`node`. `WCL_CLIENT_ID`/`WCL_CLIENT_SECRET` come from the [Warcraft Logs API clients](https://www.warcraftlogs.com/api/clients/) page and are only used server-side (GHA secrets), never in the browser. No Anthropic API key is needed - rulebook generation is a copy-prompt / paste-back flow that works with any LLM. The `npm run ingest` / `npm run scrape` / `npm run rulebook` invocations are listed in CLAUDE.md.

## Ingestion (`npm run ingest`)
Runs `frontend/scripts/ingest/orchestrator.ts`, which boots a headless Angular runtime (`scripts/ingest/angular-runtime.ts`: jsdom + Angular TestBed injector wired to the Node WCL + data-file transports) and drives the SAME five `*TransformService`s the browser uses, persisting through the SAME `DataFileApiService` (Node filesystem transport). There is no separate Node analysis pipeline. Also runs as the `ingest-parses.yml` GHA hourly (cron `23 * * * *`) and on manual `workflow_dispatch`. The same hourly workflow runs `npm run scrape` first to keep guide content fresh, then ingestion.

1. Boots the Angular runtime and authenticates to WCL with client credentials (from `WCL_CLIENT_ID`/`WCL_CLIENT_SECRET` environment variables - server-side secret, only used in GHA, never in the browser).
2. Discovers the specs that have a `rulebook.json` and the current live encounters (`getEncounters`: `worldData` discovery + a cheap rankings liveness probe). **Spec work-order** (`ordering.ts`, all cheap disk + git reads, zero WCL budget): empty specs first, then **old-version** specs (any on-disk file below the current `INGEST_VERSION`), then **current-version** specs, and within each group **oldest git-commit time first** (`git-mtime.ts` reads the last commit touching the spec's data dir - the workflow checks out with `fetch-depth: 0` so this is meaningful). So a budget-bounded run fixes the most out-of-date data first instead of starving the alphabetically-late specs.
3. Per encounter: asserts remaining WCL budget, fetches rankings (cheap), computes a version+ranking `source_signature` (`sha256(INGEST_VERSION + parse-set fingerprint)`), and **skips** the encounter when the signature matches the stored stamp. `INGEST_VERSION` (`ingest-version.ts`) is a **manual integer** that replaced the old transform-source code-hash: bumping it invalidates every cached file. Because transform-file edits no longer auto-invalidate, **Claude bumps `INGEST_VERSION` (or suggests bumping it) as part of any change that should produce different tailored data** (transform math, rulebook semantics, a deliberate refresh). Currently `1` (the `source_id` change).
4. Otherwise runs the five transform services (`burst`/`rotation`/`defensive`/`gear`/`map`) under bounded concurrency. Each fetches the parses it needs (`Casts`/`Buffs`/`DamageDone`/`DamageTaken`, plus `includeResources`/`hostilityType` events for positions) via the shared cached `WclApiService` and computes its slice.
5. Writes the stamped per-slice tailored files (`{spec}/{burst,rotation,defensive,gear}/{enc_id}.json`) and per-parse position timelines (`positions/{enc_id}.json`); every file carries both `source_signature` and the bare `ingest_version` integer.
6. Rebuilds the `{spec}/encounters.json` and top-level `index.json` indexes, then prunes stale encounters.

GHA commits `frontend/public/data/specs/**`, which triggers `deploy-pages.yml` to rebuild and redeploy.

> **Keep data shapes in sync.** Because ingestion runs the very same `*TransformService`s the browser uses, the tailored slice shapes are defined in exactly one place - each slice's `*Bench` interface (its `*-data-source.ts`) plus the relevant `core/models/*` - and ingestion writes precisely those, so the slice shapes stay in sync automatically. Changing a slice's `*Bench`/model therefore updates runtime and ingest at once (one implementation). You still keep the rulebook skill + schema in sync (`prompts/rulebook_skill.md`, `prompts/rulebook.schema.json`) since the transforms consume the rulebook (`duration`, `spell_id`s), and the indexes (`index.json`, `{spec}/encounters.json`) and `positions/{enc}.json` documented in the **Data models** section below. Already-committed JSON under `data/specs/**` keeps stale fields until the next re-ingest - harmless, since consumers ignore unknown fields.

## Rulebook management (`npm run rulebook` / `npm run scrape`)
No web UI for rulebook management. Everything is CLI.

1. **Add + scrape guides** - `npm run scrape` re-scrapes every existing guide across all specs (web/YouTube/SimC APL), refreshing `guides.json`; this is what the hourly ingest workflow runs. To add a new guide, `npm run scrape -- --spec Name --url URL [--type web|youtube|simc]` appends and scrapes it.
   - **YouTube transcripts go through the Supadata API.** YouTube now gates caption/transcript data behind an authenticated, bot-checked session, so anonymous fetching (youtubei.js, yt-dlp) is refused from any IP. `scrapeYouTube` calls the [Supadata](https://supadata.ai) transcript API instead; set `SUPADATA_API_KEY` (env var locally, GHA secret for the hourly run). Transcripts are immutable, so the bulk refresh skips already-scraped YouTube guides - the metered API is only hit once per new/errored video. Without the key, YouTube guides record a non-fatal error; web/SimC are unaffected.
2. **Build AI prompt** - `npm run rulebook` -> "Copy prompt": assembles `prompts/rulebook_skill.md` + all scraped guide content into a clipboard-ready prompt.
3. **Save rulebook** - paste AI output -> `npm run rulebook` -> "Save rulebook": writes to `rulebook.json`. No validation server needed - the CLI validates schema directly.

## Data models (ingestion output)

### `index.json` (`frontend/public/data/specs/index.json`)
Spec manifest rebuilt by the orchestrator (`scripts/ingest/orchestrator.ts` `rebuildSpecIndex`) by scanning each spec's `encounters.json` on disk - safe to run sharded (one spec at a time). Consumed by `DataFileApiService.getSpecs()` to populate the spec dropdown on `/pre`.

| field | notes |
|---|---|
| spec | WCL spec folder name, e.g. `SubtletyRogue` |
| encounter_count | Number of encounters with `sample_count > 0` |

### `guides.json` (`frontend/public/data/specs/{spec}/guides.json`)
| field | notes |
|---|---|
| id | Auto-incrementing integer |
| spec | WCL spec name, e.g. `SubtletyRogue` |
| url | Source URL |
| guide_type | `web`, `youtube`, or `simc` |
| content | Scraped text (up to 60k chars) |
| status | `pending` -> `scraped` -> `error` |

### `rulebook.json` (`frontend/public/data/specs/{spec}/rulebook.json`)
AI-generated rulebook. Extra top-level fields added on save: `guide_count`, `saved_at`.

### Signature stamps (every slice + positions file)
Every tailored file (`{burst,rotation,defensive,gear}/{enc}.json` + `positions/{enc}.json`) carries two ingestion stamps: `source_signature` (the `sha256(INGEST_VERSION + parse-set fingerprint)` skip key) and the bare `ingest_version` integer (the same version, unhashed, read by the work-ordering to tell stale-version data from current). `ingest_version` is required - every write stamps it, and a one-time migration backfilled it onto pre-existing files (v1 where the gear file already carried `source_id`, else v0).

> The `positions/{enc_id}.json` schema lives in the **warcraft-wcl-data** skill (it pairs with the WCL position/facing-unit quirks).

### Rulebook JSON schema

All spell IDs **must** come from the rulebook - never hardcode spec-specific IDs.

```json
{
  "spec": "SubtletyRogue",
  "major_cooldowns": [
    {
      "name": "Shadow Blades",
      "spell_id": 121471,
      "cooldown": 90,
      "duration": 20,
      "align_with_bloodlust": true,
      "opener_priority": 1,
      "usage_rule": "..."
    }
  ],
  "defensives": [
    {
      "name": "Cloak of Shadows",
      "spell_id": 31224,
      "cooldown": 120,
      "duration": 5,
      "usage_rule": "..."
    }
  ],
  "rules": [
    {
      "type": "cooldown_pairing|cd_hold|opener|rotation|positioning|aoe_switch",
      "priority": "critical|high|medium|low",
      "description": "Rule title shown in the UI",
      "condition": null,
      "action": "Prescriptive coaching text shown as remedy"
    }
  ],
  "source_summary": "..."
}
```

### Rule condition schema

**`cast_without_prior`** - spell cast without a required companion within a time window:
```json
{
  "kind": "cast_without_prior",
  "spell_id": 185313, "spell_name": "Shadow Dance",
  "required_spell_id": 280719, "required_spell_name": "Secret Technique",
  "window_s": 5,
  "exception": { "context_spell_id": 121471, "context_window_s": 25, "position": "before" }
}
```

**`hold_cooldown_for_anchor`** - spell(s) used within hold window before an anchor spell:
```json
{
  "kind": "hold_cooldown_for_anchor",
  "spell_ids": [185313, 280719], "spell_names": ["Shadow Dance", "Secret Technique"],
  "anchor_spell_id": 121471, "anchor_spell_name": "Shadow Blades",
  "hold_window_s": 15
}
```

Rules without a `condition` (or `null`) are silently skipped.
