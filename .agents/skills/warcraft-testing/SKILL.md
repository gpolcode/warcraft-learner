---
name: warcraft-testing
description: warcraft-learner unit-testing philosophy and harness. Covers the goal (tests read as statements of the business rule, run in milliseconds, need no ceremony), the functional-core/imperative-shell per-slice spec layout, tests-as-documentation naming, the hard no-magic-numbers/named-constants rule, the shared fixture factories under src/testing, the fake-service end-to-end pattern, the mountVm signal harness, and the lowest-altitude rule. Load this before writing, changing, or debugging any *.spec.ts or test setup.
---

# warcraft-learner testing

**What good looks like:** a test reads like a statement of the business rule, runs in milliseconds, and needs no ceremony. The reader learns the domain rule from the spec, not from the implementation.

**Deliverable:** every behavior change ships specs at the lowest altitude that owns it - pure math as table-driven tests over the colocated functions, each "triggers" case paired with a "does not trigger at the boundary" case, and one end-to-end pass through the service with fakes.

## Framework and layout

Vitest via Angular's `@angular/build:unit-test` builder (`npm test`, one suite over all of `src/**`, ingest specs included). The app is zoneless; there is no global setup file. Specs cannot run under bare `npx vitest` - the builder sets up the `TestBed` environment.

Specs are colocated next to the unit. Per slice (**warcraft-architecture** defines the two layers):

| Spec | Covers |
|---|---|
| `*-transform.service.spec.ts` | the slice's bench math as pure fns, plus one end-to-end pass through the `*TransformService` with a fake `WclApiService` |
| `*.service.spec.ts` | the `*FeatureService`'s pure view-model fns, plus one end-to-end pass with a fake `*_DATA_SOURCE` (and fake `WclApiService` where the slice fetches the player log) |

A slice-local shared module (`rotation-rules.ts`, `gear-extract.ts`) carries its own colocated spec, so behavior is pinned once at the altitude that owns it. Ingest specs cover only orchestration helpers - the transforms are the same services the runtime specs already cover.

**Altitude rule:** test behavior exhaustively at the lowest altitude that owns it; a composite gets exactly one composition test; never re-test shared helpers from slice specs.

## Hard rules

- **Named constants, never magic numbers or raw ids.** Spell/item ids come from `src/testing/spell-ids.ts`; every computed threshold/timing/damage value gets a named `const` with a one-line derivation. A bare `279043` or unexplained `48` in a spec is a defect.
- **Boundary comparisons are strict** and tested as such: a value exactly at `mean + 2*stddev` is not an outlier - pair the cases.
- **Never load a WCL JSON blob** - build minimal event streams from the factories so the fixture shows only what the test exercises.

## Fixture cheat sheet (`src/testing` barrel)

- `cast(spellId, atS, opts?)`, `applyBuff` / `removeBuff`, `buffWindow(spellId, fromS, toS)` (the apply+remove pair), `damage(...)` (player deals), `damageTaken(...)` - times in fight-relative **seconds**; an omitted opt leaves the field absent.
- `rulebook({ cooldowns, defensives, ... })` from `src/testing/builders/rulebook` defaults every field - state only what the test exercises.
- Bench fixtures are local to each slice spec: a small `bench(over: Partial<RotationBench>)` factory that defaults every field and spreads overrides.
- Map specs build raw wire-unit events on purpose (hundredths of a yard, milliradians) to pin the WCL wire format.
- Presentational leaves: read `computed()` signals via `mountVm` (`src/testing/component-harness.ts`) - zoneless `TestBed`, inputs via `setInput`, no DOM assertions.
- Feature components are thin (they delegate to their `*FeatureService` in an `effect`) - their logic is covered by the service spec, not by mounting them.
