---
name: warcraft-architecture
description: warcraft-learner vertical-slice architecture - the layer rules every slice obeys and the principles behind the analysis. Covers the two symmetric ingest/runtime pipelines meeting at data/specs/**, the hard layer rules (two pass-through API services, self-contained services, the *_DATA_SOURCE token swap, page-shell and presentational-leaf rules), the bench-driven "complete ingested data, no fallbacks" principle, and the no-URL-query-param routing rule. Load this before adding or refactoring a slice, moving logic across layers, or planning any feature or analysis change.
---

# warcraft-learner architecture

**What good looks like:** every slice (map / burst / rotation / defensive / gear) is independent and shaped like the reference slice, Burst (`pages/post-raid/burst-windows/`). Logic sits in exactly one layer, services carry no foreign imports, and every finding derives from bench data with no fallback path. The code of each slice is the source of truth for its math - this file states only the rules that hold across slices.

## Analysis design principles

- **All findings are bench-driven; always assume complete ingested data.** Every analysis finding derives from the top-parse bench for the specific encounter+spec. No fallbacks, null guards, or special-case code for missing bench data - absent data is an ingestion problem, not an analysis problem.
- **A rulebook rule names only what to look at; every magnitude comes from the encounter.** Thresholds are measured from top parses (median plus a forgiving band), never hardcoded in rules. A kind that judges every cast benches the parse's forgiving extreme; a kind that judges an aggregate benches that aggregate. The rule engine is the slice's functional core in `rotation-rules.ts`, shared by ingest and runtime - read it for the condition kinds; `RULE_KINDS` is a mapped type keyed by `kind`, so a new kind must declare all five parts to compile.
- **Every finding reports per-instance `occurrences`** (`core/models/analysis.models.ts`) so the drill-down strip renders - a kind that omits them silently loses that UX.
- **Threshold constants are referenced by name, never copied as literals** - the number lives in code next to the `const`, so docs stay correct when it is tuned.

## URL routing

Selection is **not** persisted in the URL and pages do **not** auto-run from query params: a shared `?report=...` deep-link would auto-run a full analysis on load and drain the shared WCL rate-limit budget. Analysis fires only from an explicit **Analyze** action on a validated report code. Sticky state (post-raid player name, pre-fight spec) lives in localStorage (`core/services/selection-store.ts`).

## The pipeline

```
INGEST (browser, ingest environment)                 RUNTIME (browser)
WclApiService (read, pass-through, cached)           WclApiService (read, pass-through, cached)
   -> *TransformService (the only transform)            DataFileApiService (read, pass-through)
   -> DataFileApiService (write, via the                 -> *DataSource (DI token, env swap)
      local file server)  ->  data/specs/**  ->          -> *FeatureService (runtime shell)
                                                         -> *Component -> page shell -> leaves
```

Ingestion runs the **same** `*TransformService`s as the development environment (driven by `src/app/ingest/`), so ingest and dev live mode are one implementation - there is no second pipeline to keep aligned. In production each slice's `*_DATA_SOURCE` token resolves to its `*DataFileService` reading the ingest-baked tailored file; in development and ingest it resolves to the `*TransformService` recomputing the same bench live from WCL.

## Layer rules (hard)

- **Exactly two pass-through API services at runtime** - `WclApiService` and `DataFileApiService`. Bytes in, typed bytes out; no remapping or aggregation. Every response projection is a small pure function colocated in the consuming slice/shell.
- **Services are self-contained: import only the two API services (or the slice `*DataSource` token) + models + `logWarn`.** Each service owns its math as named, pure, **total** functions (return `0`/`null`/`[]` for empty input, never throw), exported from and colocated in its own `*.service.ts` - no Angular, `inject()`, or IO in the pure layer. Code both services of one slice need lives in a single slice-local module (`rotation-rules.ts`, `gear-extract.ts`) with its own spec. Generic non-domain primitives are blessed in `shared/analysis/` (`analysis-math.ts`, `wcl-projections.ts`, `hold-targets.ts`) and may be imported; domain math may not be shared across slices. Data shapes live in `core/models`, never in components. Never add a separate `*.vm.ts` file - a page shell's pure helpers are colocated in the page's own `*.ts`. Generic statistics primitives from `d3-array` may be called directly like `Math`.
- **`*TransformService` - one per use case.** Builds the slice's prepared data from the two API services using its own colocated pure functions; ingestion writes its output as the slice's tailored file (`data/specs/{spec}/{slice}/{enc}.json`, ready to render).
- **`*DataSource` interface + `*_DATA_SOURCE` InjectionToken - the only swap point.** The per-environment bindings in `core/data-source/provide-data-source.ts` are the only place the data source differs.
- **`*FeatureService` - the runtime shell, one per feature component.** Injects its token + the cached `WclApiService`, calls the colocated pure functions, exposes signals. No arithmetic, no other domain service.
- **Feature components inject exactly one service: their `*FeatureService`.** Cross-feature actions are `output()`s the page wires.
- **Page shells - zero domain services.** Resolve selection from the route, compose feature components, pass selection as inputs.
- **Presentational leaves - inputs/outputs only**, no services beyond framework tokens.

## Key flows

- **Player analysis (`/`)**: the shell validates the report code, fetches the report, resolves spec from `playerDetails` (WCL quirk - see **warcraft-wcl-data**), and passes `spec`/`encounterId`/`report`/`fight`/`player` to each feature card. Each card's `*FeatureService` reads its bench via its token plus the player's log via `WclApiService`, computes its view-model, and exposes the four render states (**warcraft-error-handling**). Ability art resolves from the report's `masterData.abilities`.
- **Pre-fight plan (`/pre`)**: bench-only - no character input, no per-player WCL call. Every card reads only its ingested tailored file.
- **Live slice** (`pages/post-raid/live/`): the exception - it owns live-sync + screen-recording toggles and per-window clip replay (a `getDisplayMedia` rolling buffer, clips memoized in memory), reads no bench data, and keeps all footage in the browser session.
- **Encounter selection**: static `encounters.json`, filtered client-side (current expansion; beta/PTR/mythic+/delves zones excluded - see `getEncounters`).

## Source of truth

Anything this file does not state - threshold values, clustering algorithms, the rule-kind table, window definitions - is defined once in the slice's code (`*-transform.service.ts`, `rotation-rules.ts`, `shared/analysis/`). Read it there; do not transcribe it into docs.
