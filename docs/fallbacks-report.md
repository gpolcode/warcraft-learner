# Fallback & Secondary Implementations Report

This document catalogs every fallback / secondary code path in **warcraft-learner**:
when it is triggered, why it exists, and what function it serves. It is grouped by
the concern each fallback addresses, because the same theme often recurs across the
client engine (`analysis-core.ts`), the services, and the ingest CLI.

The codebase has two structural reasons for so many fallbacks:

1. **No backend.** Everything runs client-side against a third-party API (Warcraft
   Logs) whose response shapes change between game expansions. The app must degrade
   gracefully rather than crash when WCL returns an unexpected shape.
2. **Statistical benchmarks may be missing or thin.** Analysis prefers data-derived
   thresholds (top-parse mean ± σ). When an encounter has no bench file, too few
   samples, or a missing per-CD field, the engine falls back to hand-tuned constants
   so analysis still produces useful output.

---

## 1. Statistical thresholds → hard-coded constants

These are the "designed" fallbacks documented in `CLAUDE.md`'s *Analysis thresholds*
table. The **primary** path uses top-parse `avg ± 2σ` from the encounter bench file;
the **fallback** fires when the bench (or a specific per-CD benchmark field) is absent.

| Concern | Primary (data-derived) | Fallback constant | Location |
|---|---|---|---|
| First-cast / opener delay (offensive CD) | `avg_first_cast_s + 2·(stddev_first_cast_s ?? 10)` | flag if `firstS > 30s` | `analysis-core.ts:146-155` |
| First-use delay (defensive) | `avg_first_cast_s + 2·(stddev_first_cast_s ?? 15)` | flag if `firstS > 90s` | `analysis-core.ts:347-358` |
| Bloodlust alignment | `|offset − avg_bl_offset_s| > 2·(stddev_bl_offset_s ?? 5)` | binary in/out-of-BL-window check | `analysis-core.ts:159-176` |
| Gap between CD uses (held past reset) | `avg_gap_s + 2·(stddev_gap_s ?? cooldown·0.2)` | flag if `gap > cooldown · 1.2` | `analysis-core.ts:181-190` (offensive), `362-373` (defensive) |
| Downtime gap floor | `bench.downtime_threshold_ms` (p90 of pooled gaps) | `1500` ms | `analysis-core.ts:121` |
| Cast-efficiency severity | `delta < −top_efficiency_stddev` → critical | `warning` severity (no benchmark) | `analysis-core.ts:223-230` |
| Hold-suggestion tolerance | `target.stddev_s ?? 20`, floored at `15s` | `Math.max(… ?? 20, 15)` | `analysis-core.ts:198, 381` |

**Why:** A late opener or a held cooldown is only meaningfully "late" relative to how
top parsers play. When that comparison data is missing, the engine still wants to flag
egregious cases, so it uses a conservative absolute threshold (30s opener, 90s
defensive, cooldown×1.2 gap) chosen to only fire on clearly bad play.

**Note on the `?? N` inside the primary path** (e.g. `stddev_first_cast_s ?? 10`):
this is a *secondary* fallback — the bench has an average but is missing the standard
deviation. A default σ keeps the ±2σ band from collapsing to zero (which would flag
everything) or exploding.

---

## 2. WCL response-shape normalization (API quirk fallbacks)

WCL changed several response shapes in the Midnight expansion. These fallbacks let one
code path handle both the old and new shapes.

### 2.1 Spec resolution — 4-level cascade
- **`analysis-engine.ts:42-49`** (client) and **`ingest.mjs:655-680`** (CLI).
- Primary: resolve spec from `playerDetails` keyed by actor ID.
- Fallbacks, in order: (1) match actor by `subType`/name; (2) literal `'Unknown'`;
  (3) skip rulebook/bench fetch entirely when spec is `'Unknown'`; (4) ingest returns
  `null` to skip the parse.
- **Why:** `actor.subType` now returns class-only (`Rogue`), so `playerDetails` is the
  reliable source — but it can still be incomplete. The cascade keeps analysis running
  with a degraded ("unsupported spec") result instead of failing. See the
  `unsupported_spec` info finding at `analysis-core.ts:124-125`.

### 2.2 `playerDetails` string-vs-object parsing
- **`wcl-api.ts:108-123`.** `playerDetails` may arrive as a JSON **string** or an
  already-parsed **object**, and the payload may be at `data.playerDetails` or at the
  root. Fallback chain: `JSON.parse` if string → try nested path → use root → `{}`.
  Per-role arrays default to `[]`; entries missing class **or** spec are skipped.

### 2.3 Talent format: `v1:` vs `v2:`
- **`wcl-api.ts:239-258`** (client) and **`ingest.mjs:326-356`** (CLI).
- Three shapes handled: pre-serialized string → old array `[{talentID, points}]`
  (prefixed `v1:`) → Midnight nested `{class, spec}` node tree (prefixed `v2:`).
- **Why:** `characterRankings` returns the old format, `encounterRankings` the new one,
  and their ID spaces are incompatible. The prefix records which format produced the key
  so they are never compared directly.

### 2.4 Character spec lookup — retry across reports
- **`wcl-api.ts:160-184`.** Tries up to 3 of the character's recent reports; per-report
  failures are caught and skipped. If none resolve a spec, returns `spec: null` while
  still surfacing a `source_report`.
- **Why:** Any single report may have no fights or an unresolvable actor; trying a few
  tolerates bad reports without failing the whole lookup.

### 2.5 Nested GraphQL field defaults
- **`wcl-api.ts:143-154`** (`fetchUserCharacters`): every nesting level defaults
  (`?.characters || []`, `server?.slug || ''`, `server?.region?.slug || ''`).
- **`wcl-api.ts:220-221`** (`_extractCombatantInfo`): null entry →
  `{ talent_key: '', trinkets: [], enchants: [] }`.
- **`ingest.mjs:149-151`**: OAuth `expires_in ?? 3600` — default 1h token TTL if WCL
  omits the field.

---

## 3. Burst-window detection → 8s sliding window

- **`ingest.mjs:475-504`.**
- Primary: build burst windows from each CD's cast times × the CD `duration` from the
  rulebook.
- Fallback: if no CD has duration data (`rawWins.length === 0`), run a blind **8-second
  sliding window** significance scan and tag the windows with `active_cds: []`.
- Client mirror at **`analysis-core.ts:307, 411`**: `window_length_s ?? 8` when sizing a
  window for player damage attribution.
- **Why:** Without rulebook durations there is no CD-anchored window to measure, so the
  tool falls back to a purely statistical "where did damage spike" heuristic so the
  Burst Windows card is never empty.

## 3b. Defensive window detection → cast-event fallback

- **`analysis-core.ts:448-463`** (`_analyzeDefensives`).
- Primary: derive each defensive's active window from buff **apply→remove** pairs.
- Fallback: if a defensive has no buff windows (`!windows.length`), reconstruct windows
  from **cast events** instead, using `duration || 5s` as the window length.
- **Why:** Some defensives don't emit a trackable buff (or it's filtered); cast events
  still mark when the defensive was used so it isn't reported as "never used."

---

## 4. Graceful-degradation try/catch & empty returns

These never substitute a *different algorithm* — they swallow an error and return an
empty/neutral value so the UI keeps working.

| Location | Primary | Fallback | Why |
|---|---|---|---|
| `encounter.ts:13-32` | HTTP-fetch `encounters.json` / bench / rulebook | `[]` / `null` | Missing static data file (404) must not crash the page |
| `wcl-api.ts:83-101` | GraphQL POST returns `data` | 401 → `auth.logout()` + "session expired"; other → "WCL API error (status)"; GraphQL errors → first message | Distinguish auth failure (needs re-login) from transient errors |
| `wcl-api.ts:205-215` | `gameData.enchant(id)` name lookup | leave name `''` | Enchant **names** are cosmetic; analysis works on IDs |
| `wcl-api.ts:152, 156-158` | `localStorage` read/write of cached chars | `'[]'` → `[]`; silent write failure | Private-mode / quota-denied browsers |
| `analysis.worker.ts:6-11` | `computeAnalysis(input)` | `postMessage({ error })` | A compute exception reports back instead of killing the worker |
| `icon-cache.ts:29-36` | cached icon URL | `null` | Spell not in `masterData.abilities` → UI renders text instead of an icon |

---

## 5. Arithmetic & field-presence guards

Pervasive small fallbacks that prevent `NaN`/`undefined` from propagating:

- **Divide-by-zero guards:** `… || 1` on denominators — `analysis-core.ts:304, 318,
  408, 422` (`winTotal || 1`, `totalDmg … || 1`).
- **Missing damage fields:** `(e.amount || 0) + (e.absorbed || 0)` throughout damage
  aggregation (`analysis-core.ts:302, 312-318, 406-422, 474`).
- **Optional result fields:** `player_fight_duration_s ?? (fEnd − fStart)/1000`
  (`analysis-core.ts:63`); bench arrays only copied to the result `if (… .length)`
  (`analysis-core.ts:67-72, 88-91`).
- **Rule defaults:** `window_s ?? 5`, `context_window_s ?? 20`, `hold_window_s ?? 15`
  (`analysis-core.ts:255, 264, 275`).
- **Spell-name fallback:** `spell_names?.[i] ?? String(spell_ids[i])` so violation
  messages always have a label (`analysis-core.ts:283`).
- **Rulebook section defaults:** `major_cooldowns ?? null`, `rules ?? []`,
  `defensives ?? []`, `per_cd_benchmarks ?? {}`, `per_defensive_benchmarks ?? {}`
  (`analysis-core.ts:56-58, 82, 122`).
- **Ingest efficiency:** if per-sample efficiency can't be computed from gaps, fall back
  to the pre-stored `cast_efficiency_pct`; if no gaps at all, p90 threshold defaults to
  `1500ms` (`ingest.mjs:1156-1188`).

---

## Summary of "real" algorithmic fallbacks

Most entries above are defensive guards. The ones that genuinely swap in a *different
strategy* (and are therefore the most important to understand) are:

1. **Statistical → constant thresholds** (§1) — the core "no benchmark" story.
2. **Spec resolution cascade** (§2.1) — `playerDetails` → `subType`/name → Unknown → skip.
3. **Talent `v1:`/`v2:` format branching** (§2.3).
4. **Burst windows: CD-anchored → 8s sliding scan** (§3).
5. **Defensive windows: buff pairs → cast events** (§3b).
6. **Character lookup: retry across 3 reports** (§2.4).

Everything else is graceful degradation (empty returns, divide-by-zero guards, field
defaults) whose only job is to keep a fully client-side app from crashing on imperfect
third-party data.
