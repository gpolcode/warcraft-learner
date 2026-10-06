---
name: warcraft-change
description: warcraft-learner change contract - what a code change must deliver, end to end. Covers the four change kinds (finding, SimC condition, feature, page), the conventions no lint rule or type checks (architecture roles, failure handling, UI, testing, e2e), and the verification steps. Load this before writing, changing, or reviewing any code under frontend/src.
---

# warcraft-learner change

**What good looks like:** a change is playable end to end - the analysis computes it, ingestion bakes it, the page renders it, the copy coaches it, and a spec pins it. Testing is not a phase; it is part of the deliverable.

Layer access, the two HTTP chokepoints, method shape, styling syntax, and file naming are eslint-enforced (`frontend/eslint.config.js`); this skill holds only what no tool checks. Two sibling skills govern parts of a change: **warcraft-writing** for every string a user sees, **warcraft-wcl-data** before reading a new event stream or gear/talent/position field.

## Change kinds

### New finding on an existing feature

Deliver: the pure check in the feature's `data/<feature>/` service, `occurrences` populated on the finding (all `wl-finding-occurrences` needs to render the drill-down), message + remedy copy, boundary-paired specs. No bench change means no `INGEST_VERSION` bump.

### New SimC condition

Follow the aura reader (`data/rotation/priority-list/facts/aura-facts.ts`), its block in `fact-table.ts` and its spec as the reference. Deliver: the name's row in its kind's block, derived as SimC text over the kind's other fields wherever arithmetic can say it, else a primitive in the kind's reader; a row in `fact-table.spec.ts` for a derivation, boundary-paired rows in the reader's spec for a primitive; its sentence pinned in `list-text-service.spec.ts`. Bump `INGEST_VERSION`.

### New feature

Follow the Burst feature (`domains/raid-analysis/feature-burst-windows/` + `data/burst-windows/`) as the reference. Deliver: the `*TransformService` + `*DataSource` token pair and the `*FeatureService` in `data/<feature>/`, feature-local math beside them, the smart component in `feature-<feature>/`, the bench registered in `feature-ingest/bench-registry.ts` and the component in the page shell, specs at both altitudes. Bump `INGEST_VERSION`.

### New page or shared component

Deliver: the shell (injecting only its selection service, `SelectionStore`, and the overlay feature services) or leaf (inputs/outputs only), specs per the testing rules below, and - for a page - an e2e card test per the e2e rules below.

## Ingest version

`INGEST_VERSION` (`data/ingest/ingest-version.ts`) bumps exactly when what ingestion bakes changes: a feature's `*Bench` interface in its `data/<feature>/*-data-source.ts`, or measured values. A change to what a spec's plan derives needs no bump: the plan key in each bench's signature re-benches it. SimC edits each spec's list in place across raid tiers and moves its default branch to each new expansion, both of which re-bench the same way.

## Architecture roles

- **`*DataSource` interface + `*_DATA_SOURCE` token** - the only swap point between production (`*DataFileService`) and ingest (`*TransformService`).
- **`*FeatureService`** - one per feature component, in `data/<feature>/`; exposes signals and owns its feature-local math as protected methods, or delegates to a sibling `data/<feature>/` service.
- **Feature components are thin** - inject their `*FeatureService`, load through `LoadResourceService`, render content or one `wl-load-state`.
- **Page shells** (`src/app/post-raid/`, `src/app/pre-fight/`) resolve selection through a page-local selection service (`pre-fight/encounter-selection-service.ts`, `post-raid/report-selection-service.ts`) that wraps the API services and owns the pure selection helpers.
  They compose feature components, pass selection as inputs, and route card anchors to the page-level overlays through `MapFeatureService` and `LiveCaptureFeatureService`.
- **Presentational leaves** - inputs/outputs only, no services beyond framework tokens.
- **Configuration** - a value that names something outside the app (a host, URL, port, id, secret) or differs per build is a field of `Environment` under `src/environments/`, with its default in the schema and any per-build override in that build's file, read through `inject(ENVIRONMENT)`, never as a literal in a service and never by importing the swapped environment file. A method, game, parser or copy constant stays a named `const` beside its code.

## Failure handling

- A card's loader returns `Result<T>`; the `LoadResourceService.loadResource` signature enforces it. The variants and the HTTP status mapping are documented in `shared/util-http/result.ts` and `data/http/http-load-error.ts`.
- `try/catch` lives in the imperative shell only: the catch `logWarn`s, then returns `HttpLoadErrors.toLoadError(cause, id)`. Pure functions signal failure with `Results.missing(...)` / `Results.permanent(...)`, never by throwing.

## UI

- Templates style text through one type role plus, where the color differs from the body default, one color token from `frontend/src/styles.scss`; the `theme-utilities-only` lint message lists them. `text-accent` doubles as the informational severity; there is no info token.
- Each text role has one position. A title names a row and sits on top. A label (`text-label`) names a field and sits directly above it; a label repeated on every row becomes a desktop column header. A qualifier (`text-caption`, "of top logs") follows its value. A state tag is a `tuiBadge` after the title.
- `computed()` exposes semantic state only; the template maps that state to a class.
- All formatting goes through Angular pipes (`shared/ui-format/` and the `raid-analysis/ui-*` pipes).

## Testing

- **Altitude rule:** test behavior exhaustively at the lowest altitude that owns it. A composite gets exactly one composition test; never re-test shared helpers from feature specs. Feature components are covered by their service spec, not by mounting them.
- **Titles, setup, and assertions read as sentences:** `describe` names the unit, `it` finishes the sentence - no arrows, colon prefixes, or labels. The body keeps that voice: setup is a few named fixtures that spell out the scenario (`events: onBoss`, `atS: RUPTURE_S - PANDEMIC_S`), and each `expect` states one claim from the title, so a reviewer reads the test top to bottom without decoding it. The aura facts spec (`data/rotation/priority-list/facts/aura-facts.spec.ts`) is the reference for setup; the e2e specs (`frontend/e2e/*.spec.ts`) with their `support.ts` verbs (`shows`, `showsFindingRows`, `showsOnPlan`) for assertions.
- **Boundary pairs:** every "triggers" case has a "does not trigger at the boundary" partner, and comparisons are strict: a value exactly at `mean + 2*stddev` is not an outlier.
- **Named constants, never magic numbers or raw ids.** Spell/item ids come from `src/testing/spell-ids.ts`; every computed value gets a named `const` with a one-line derivation.
- **Never load a WCL JSON blob** - build minimal event streams from the factories in `src/testing/builders/events.ts`.
- **Bench fixtures are local to each feature spec:** a small `bench(over: Partial<...Bench>)` factory that defaults every field and spreads overrides.
- A service under test is resolved with `TestBed.inject`, protected members read through bracket access. Presentational leaves read `computed()` signals via `mountVm` (`src/testing/component-harness.ts`), no DOM assertions.

## E2E (page changes)

- One WCL analysis per run: the suite is serial over one shared `page`, so a new card test reuses it rather than analyzing again.
- Static copy exact, computed values by shape or existence - never pin a number, name, or timestamp that comes from the log or bench.
- One happy-path test per use-case card, located by its `wl-*` tag.

## Verification

```bash
cd frontend
npm run lint
npm run knip
npm test
npm run build
```

All four resolve the gitignored WCL client file under `src/environments/`; a blank copy of its example satisfies everything but a real WCL call.

Then check what no tool does: every new behavior has a spec at the lowest altitude, every "triggers" case has its boundary partner, `INGEST_VERSION` bumped exactly per the ingest-version rule, every finding populates `occurrences`.

E2e runs in the PR's E2E workflow and spends one WCL analysis per run - read the check there; never run `npm run e2e` locally.
