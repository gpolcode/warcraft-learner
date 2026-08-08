---
name: warcraft-e2e
description: warcraft-learner Playwright e2e philosophy and harness. Covers the one-WCL-analysis-per-run budget that shapes everything, the production-configuration + data:pull prerequisites, the one-load-per-page serial discipline, and the core assertion rule (static copy exact, computed values by shape or existence only). Load this before writing, changing, or debugging anything under frontend/e2e/**, playwright.config.ts, or .github/workflows/e2e.yml.
---

# warcraft-learner e2e testing

**What good looks like:** assertions read like statements of the page's behavior, and the suite stays green across ingestion refreshes, rulebook regens, and run-to-run log differences - only an actual rendering regression turns it red.

**Deliverable:** one happy-path test per use-case card that proves a real figure rendered (by shape or existence, never a pinned value) under the one-analysis budget.

## The constraint that shapes everything: one WCL analysis per run

A run drives the built app in real Chromium against live WCL and the pulled dataset, sharing the app's hourly rate-limit budget. Hence the hard rules:

- **Production configuration** - `playwright.config.ts` serves `npm start -- --configuration production` so every slice reads its ingested file. The development configuration recomputes every bench live and drains the shared budget.
- **`npm run data:pull` first** - the config refuses to start without `public/data/specs/index.json`.
- **One load per page** - each spec is `mode: 'serial'` over one shared `page` built and analyzed once in `beforeAll`; never `goto` or re-analyze inside a test. `retries` stays `0` (a retry spends a second analysis).
- The post-raid `beforeAll` seeds the sticky player name into localStorage before the app boots, so the one analysis targets the test character.
- The pre-fight page is bench-only and spends nothing. The live slice is not covered (needs a `getDisplayMedia` capture the harness cannot grant).
- `.github/workflows/e2e.yml` uses a `cancel-in-progress` concurrency group so a re-push cannot spend a second analysis on a stale commit.

## Assertion rule: static copy exact, computed values by shape

Player-log figures (DPS, deaths, gear) and bench figures (findings, window boundaries, consensus percentages, ranked ability/item names) change from run to run without any regression. So:

- Static UI copy the app itself defines (headings, subtitles, category chips) is asserted as the exact literal string via `shows` (`e2e/support.ts`).
- Every computed value is asserted only by shape (the `DAMAGE` / `CLOCK` / `PERCENT` / `RATIO` / `DECIMAL` regexes in `support.ts`) or existence (`showsEntity` proves a row rendered a real `wl-game-icon`; `not.toHaveText('')` proves a remedy cell is non-empty).
- A row selected by bench ranking is found generically - `.first()`, or filtered only by a static category chip - never by the name it happens to carry this run.

## Locators and matching quirks

Inline the literal copy in the assertion - the text is the documentation; constants are for opaque values (report URL, storage key, timeouts) and the shared shape regexes. Scope a card by its `wl-*` tag; inside it prefer `getByRole`/`getByLabel`/`getByText` over CSS, falling back to a structural class (`div.border-t`, `.chip-onplan`) only for a row whose content is not pinned.

Playwright matches `textContent`: assert CSS-uppercased labels in template casing; `shows` matches whole-element (whitespace-normalized) and takes the first hit; a shape regex matches across multi-node interpolations; a responsive `md:hidden` label stays in `textContent`, so scope to the row and assert containment there.

## Timeouts and local tweaks

The post-raid reveal gate holds every card hidden until all settle, so one visibility wait covers the analysis (`ANALYZE_TIMEOUT_MS`); the map loads unawaited (`MAP_READY_TIMEOUT_MS`). Proxy/CA/pinned-Chromium tweaks stay in an untracked config extending the base (`defineConfig(base, ...)`) - never in the committed config.
