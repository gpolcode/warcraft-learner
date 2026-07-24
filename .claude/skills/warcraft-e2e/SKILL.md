---
name: warcraft-e2e
description: warcraft-learner Playwright e2e suite - how the two page suites run and the hard WCL-budget rules they obey. Covers the @playwright/test setup (frontend/playwright.config.ts, specs under frontend/e2e/, the production-configuration webServer, the data:pull prerequisite), the one-load-per-page discipline (serial mode on one shared page, zero retries, the sticky-player localStorage seed, bench-only pre-fight), the pinned immutable report vs shape-matched bench values, the readable assertion vocabulary in e2e/support.ts, the raw-text regex matching quirk, and the dispatch-only CI workflow. Load this before writing, changing, or debugging anything under frontend/e2e/**, playwright.config.ts, or .github/workflows/e2e.yml.
---

# warcraft-learner e2e testing

The e2e suite drives the built app in a real Chromium against live WCL and the pulled dataset. The goals are the same as the unit suite - assertions read like statements of the page's behavior - plus one extra constraint that shapes everything: **a run must spend at most one WCL analysis**.

**Framework and layout.** [Playwright Test](https://playwright.dev) (`@playwright/test`, pinned to the same version as the `playwright` package the ingest harness uses). `frontend/playwright.config.ts` is the config; specs live in `frontend/e2e/` - one spec file per page (`post-raid.spec.ts`, `pre-fight.spec.ts`), the shared assertion vocabulary in `e2e/support.ts`, and `e2e/tsconfig.json` for editor/type support. `npm run e2e` (from `frontend/`) runs the suite; `npm run lint` covers `e2e/**` and the config. Playwright's `webServer` starts `npm start -- --configuration production` on :4200 itself - never start a dev server for it by hand (locally a running server on :4200 is reused).

**Production configuration on purpose (hard rule).** The suite serves the `production` build so every slice reads its ingested tailored file via the file data sources. Never point it at the `development` configuration: `useLiveTransform` recomputes every bench from the top parses in the browser and drains the shared WCL budget. Under `production`, the only WCL traffic in a run is the post-raid page's single analysis.

**Dataset prerequisite.** Run `npm run data:pull` (from `frontend/`) first. The config refuses to start without `public/data/specs/index.json` so a missing dataset fails with that hint instead of as confusing empty-bench cards.

**One load per page (hard rules).** The WCL budget discipline is structural, not a convention to remember:

- Each spec file sets `test.describe.configure({ mode: 'serial' })` over **one shared `page`** created in `beforeAll`; the page is loaded/analyzed exactly once there and every test asserts against that single load. Never `goto`/re-analyze inside a test.
- `retries` stays `0` in the config: a retry re-runs the file's whole serial chain, spending a second analysis on an already-failing run.
- The post-raid `beforeAll` seeds the sticky player name into localStorage (`wl.sel.postRaid`, mirroring `POST_RAID_KEY` in `core/services/selection-store.ts`) **before** the app boots, so the one analysis targets the test character directly. Without the seed the shell auto-selects the roster's first player and switching players afterwards costs a second full analysis.
- The pre-fight page is bench-only, so `pre-fight.spec.ts` spends zero WCL budget - its selection flow (class, spec, encounter) is exercised through the real dropdowns.
- CI: `.github/workflows/e2e.yml` is `workflow_dispatch`-only, so no push or PR spends budget automatically. Run it on demand from the Actions tab.

**The pinned report.** `post-raid.spec.ts` analyzes one fixed, finished WCL report (the `REPORT_URL` constant): player Elsahr, a Subtlety Rogue, whose last boss pull is a Crown of the Cosmos kill at 7:34. A finished report is immutable, so stats derived from the player's own log are pinned exactly in the assertions (the fight label, the 65K DPS, the kill outcome). Bench-derived values are **never** pinned - the gh-pages dataset refreshes hourly, so findings, window times, window damage, and consensus percentages are asserted by shape via the named patterns (`CLOCK_VALUE`, `DAMAGE_VALUE`, `CONSENSUS_PCT`, `WINDOW_RANGE`) or by structural presence (a chip, an ability row).

**Scope: happy path, key stats.** One test per use-case card, asserting the card's key stat - not broad coverage. Post-raid: shell selection, pull overview (DPS/duration/outcome), rotation, burst windows, defensive windows, gear, and the positioning map flyover. Pre-fight: the selection flow, gear consensus, cooldown plan, defensive plan, bench burst windows, and the map flyover. The live slice (recording/clip replay) is not e2e-covered: it needs a `getDisplayMedia` capture the harness cannot grant meaningfully.

**Assertions read as sentences.** `e2e/support.ts` carries the locator mechanics so a test line states visible behavior:

```ts
const gear = page.locator('wl-gear');
await shows(gear, 'Top-parse gear consensus.');
await shows(gear, CONSENSUS_PCT);
await showsAnAbility(cooldownPlan);
await showsAWindowChip(burstWindows);
await opensThePositioningMap(page, MAP_READY_TIMEOUT_MS);
```

Inline the on-screen copy directly in assertions - the literal text IS the documentation. Named constants exist only where they beat the literal: opaque values (the report URL, the localStorage key), timeout budgets, and the format regexes. A card's scope is its `wl-*` component tag; inside a scope prefer user-facing locators (`getByRole`, `getByLabel`, `getByText`, `getByAltText`) over CSS.

**Matching quirks.** `shows` matches strings as whole-element text (`exact: true`, whitespace-normalized) and takes the first hit, so repeated stats never trip strict mode. Playwright matches **regexes against the element's raw text**, template newlines included - an `^...$`-anchored pattern only works when the interpolation is the element's entire single-line content, which is why `WINDOW_RANGE` is unanchored.

**Timeouts.** Long waits are named constants in the spec that needs them. The post-raid reveal gate (cards stay `hidden` until every card settles) means one visibility wait on the pull-overview heading covers the entire analysis (`ANALYZE_TIMEOUT_MS`); the map button appears later because the map prepare is unawaited by the shell (`MAP_READY_TIMEOUT_MS`). Tests that wait longer than Playwright's default call `test.setTimeout(...)` with those constants plus `SLACK_MS`.

**Environment-specific launch tweaks stay local.** Proxies, custom CA handling, or a pinned Chromium `executablePath` never go into the committed config. Put them in an untracked local file that extends it (`defineConfig(base, { use: { ... } })`) and run `npx playwright test --config=<that file>`.
