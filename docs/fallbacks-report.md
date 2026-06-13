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

## 1. Statistical thresholds — fallbacks REMOVED (now bench-only by design)

> **Status:** The constant fallbacks in this section were **removed**. The goal is to
> support every class/spec end-to-end, so missing-data cases are prevented *by design*
> (every spec/encounter gets a bench file) rather than patched per-feature. These
> findings now fire **only** when the encounter bench carries the relevant
> `avg_*` **and** `stddev_*` values; otherwise the finding is simply skipped.

The **primary** path uses top-parse `avg ± 2σ` from the encounter bench file. There is
no longer a hardcoded-constant fallback for any of these:

| Concern | Primary (data-derived) | Old fallback (removed) | Location |
|---|---|---|---|
| First-cast / opener delay (offensive CD) | `avg_first_cast_s + 2·stddev_first_cast_s` | ~~flag if `firstS > 30s`~~ | `analysis-core.ts` `_analyzeCore` |
| First-use delay (defensive) | `avg_first_cast_s + 2·stddev_first_cast_s` | ~~flag if `firstS > 90s`~~ | `analysis-core.ts` `_analyzeDefensiveFindings` |
| Gap between CD uses (held past reset) | `avg_gap_s + 2·stddev_gap_s` | ~~flag if `gap > cooldown · 1.2`~~ | offensive + defensive |
| Downtime gap floor | `bench.downtime_threshold_ms` (p90 of pooled gaps) | ~~`1500` ms (`?? 1500`)~~ | `_analyzeCore` |
| Cast-efficiency severity | `delta < −top_efficiency_stddev` → critical | ~~flat `warning` "no benchmark"~~ | `_analyzeCore` |
| Hold-suggestion tolerance | `target.stddev_s` | ~~`Math.max(… ?? 20, 15)`~~ | offensive + defensive |

### Secondary `?? N` σ-fallbacks → replaced by ingestion-computed σ

Previously the primary path itself carried a *secondary* fallback (e.g.
`stddev_first_cast_s ?? 10`) for the case where the bench had an average but no standard
deviation. This was caused by ingestion only computing σ when `length > 1`.

**Fix:** ingestion (`ingest.mjs`) now computes σ whenever the matching mean exists —
`stdev()` already returns `0` for a single sample — so `stddev_first_cast_s`,
`stddev_gap_s`, `stddev_bl_offset_s`, hold-target `stddev_s`, and `top_efficiency_stddev`
are non-null whenever their mean is. The engine reads the bench σ directly; all
`?? 10 / ?? 15 / ?? 5 / ?? 20 / ?? cooldown·0.2` secondary fallbacks were removed.

**Still present (intentionally):** the **Bloodlust alignment** binary in/out-of-window
check (`analysis-core.ts` `_analyzeCore`) remains as the fallback when a CD has no
`avg_bl_offset_s` benchmark — this was not in scope for removal.

---

## 2. WCL response-shape normalization (API quirk fallbacks)

WCL changed several response shapes in the Midnight expansion. These fallbacks let one
code path handle both the old and new shapes.

> **Status (§2.1–2.5 updated):** the WCL-shape fallbacks below were reworked toward a
> retail-only, fail-loud design. The remaining notes describe the **current** behaviour.

### 2.1 Spec resolution — fallbacks REMOVED (fail loud)
- **`analysis-engine.ts`** (client) and **`ingest.mjs` `analyzeParse`** (CLI).
- Spec is resolved from `playerDetails` keyed by actor ID. There is **no** `subType`
  fallback and no `'Unknown'` shim: ingest **throws** if the named actor is missing; the
  client **throws** if `playerDetails` can't resolve the player's spec.
- A spec that simply isn't in the rulebook yet still degrades gracefully — `getRulebook`
  returns `null` (404) and the engine emits the `unsupported_spec` info finding. That is
  *missing rulebook*, distinct from *unresolvable player* (which now errors).

### 2.2 `playerDetails` — legacy parsing REMOVED
- **`wcl-api.ts` `getPlayerDetails`.** Now assumes the normal WCL shape
  `report.playerDetails.data.playerDetails`; the string-vs-object / root-vs-nested
  fallback chain is gone. Per-role arrays still default to `[]` (a fight legitimately may
  have no tanks) — that is field presence, not legacy-shape handling.

### 2.3 Talent format: `v1:` vs `v2:` — split into two functions
- **`wcl-api.ts`**: `_talentKeyV2` only (pre-fight uses `encounterRankings` = v2);
  `_extractGear` handles gear.
- **`ingest.mjs`**: `talentKeyV1` (`characterRankings`) and `talentKeyV2`
  (`encounterRankings`) are separate single-format functions; `extractGear` is shared.
  Rankings compute the resolved `talent_key` **value** (prefer v2, fall back to v1 only if
  the per-player v2 query is empty) and store it on `combatant_info` — downstream reads the
  value instead of re-parsing a raw talents object. The ID-space incompatibility note
  still holds; the `v1:`/`v2:` prefix records the source.

### 2.4 Character spec lookup — retained, lightened
- **`wcl-api.ts` `charLookup`.** Still tries up to 3 recent reports (per-report failures
  caught and skipped) — this tolerates private/deleted reports, a real runtime case. The
  heavy `getReport` (masterData + abilities) in the loop was replaced by a minimal
  `FIGHTS_Q`; the player is matched **by name inside `playerDetails`** rather than via
  `masterData.actors`. `gameData` was evaluated and rejected: it proxies localized Blizzard
  armory names that don't match WCL's canonical spec strings.

### 2.5 Nested GraphQL field defaults
- **`wcl-api.ts` `fetchUserCharacters`**: every nesting level defaults
  (`?.characters || []`, `server?.slug || ''`, `server?.region?.slug || ''`).
- **`wcl-api.ts` `_extractGear`**: the null-entry shim was **removed** — `getCharGear`
  already early-exits with `found: false` when there are no ranks, so the entry is always
  present.
- **`ingest.mjs`**: OAuth `expires_in ?? 3600` — default 1h token TTL if WCL omits it.

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

1. ~~**Statistical → constant thresholds** (§1)~~ — **removed**; these findings are now
   bench-only and skipped when no bench data exists (missing data prevented by design).
2. ~~**Spec resolution cascade** (§2.1)~~ — **removed**; spec resolution now fails loud
   (throws) instead of falling back to `subType`/`'Unknown'`.
3. **Talent `v1:`/`v2:`** (§2.3) — now two single-format functions per source API, not one
   branching parser; rankings carry the resolved key value.
4. **Burst windows: CD-anchored → 8s sliding scan** (§3).
5. **Defensive windows: buff pairs → cast events** (§3b).
6. **Character lookup: retry across 3 reports** (§2.4) — retained (tolerates deleted/private
   reports) but lightened to a fights-only query + name match in `playerDetails`.

Everything else is graceful degradation (empty returns, divide-by-zero guards, field
defaults) whose only job is to keep a fully client-side app from crashing on imperfect
third-party data.
