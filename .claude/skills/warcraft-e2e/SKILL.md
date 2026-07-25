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
- CI: `.github/workflows/e2e.yml` runs on pull requests, on pushes to `main`, and on demand, so the suite reports into a PR's checks next to the unit tests. It holds a `cancel-in-progress` concurrency group keyed on the ref, so a rapid re-push cancels the superseded run instead of spending a second analysis on a stale commit.

**The pinned report.** `post-raid.spec.ts` analyzes one fixed, finished WCL report (the `REPORT_URL` constant): player Elsahr, a Subtlety Rogue, whose last boss pull is a Crown of the Cosmos kill at 7:34.

**Every test asserts the card's static copy AND at least one value the card computed (hard rule).** A test that only checks headings and "some row exists" passes on an empty card, so it proves nothing. Each test pins the real rendered figures - Elsahr's 65K DPS, the 356K killing blow, `1 / 20` Secret Technique casts outside Shadow Dance, the 121s Feint gap, the 507K taken in the 0:58 defensive window, the 15.6M bench opener - alongside the labels around them. Pin the exact rendered string, and give each a one-line comment saying what it is (`// 29,487,085 damage done over the 454.4s pull: 64,892 DPS renders as 65K.`).

**Two tiers of pinned value, and the maintenance that follows.** Values off the player's own log (DPS, deaths, cast counts, their gear) are fixed forever - the report is finished. Values that compare against, or come from, the top-parse bench (findings, window boundaries and damage, consensus percentages, plan first-use/avg-uses) move when the ingested dataset changes, so a bench refresh can legitimately turn a run red. That is accepted: a stale pin is a visible, one-line fix, whereas a shape-matched `/^\d+%$/` would have hidden the change. To re-pin, dump what the app actually renders rather than guessing - a temporary spec that loads the page and writes each card's `innerText` to a file (`writeFileSync` works, specs run in Node), then read the exact strings out of it and delete the spec.

**Match the template's text, not the rendered text.** Playwright matches `textContent`, so CSS `uppercase` labels are asserted in their template casing (`'window'`, `'burst'`, `'measured'`), not as they look on screen. Multi-node interpolations are fine as one whole-element string - `shows` leans on Playwright's whitespace normalization to match `'6:37 - 6:41'` and `'Bursting Emptiness - 356K'` across the template's line breaks. The same reason makes whole-element matching wrong for a cell that carries a responsive `md:hidden` label: the hidden label is still in `textContent`, so the figure is never an element's whole text. Scope to the row and assert containment instead, which is what `showsAbility` does for the window ability breakdown.

**Scope: happy path, key stats.** One test per use-case card, asserting the card's key stat - not broad coverage. Post-raid: shell selection, pull overview (DPS/death/kill), rotation, burst windows, defensive windows, gear, and the positioning map flyover. Pre-fight: the selection flow, gear consensus, cooldown plan, defensive plan, bench burst windows, and the map flyover. The map tests assert the anchor the flyover opened at (`anchor 7:33` from the death row, `anchor 0:08` from the active burst window) so the canvas is proven to be showing the right moment. The live slice (recording/clip replay) is not e2e-covered: it needs a `getDisplayMedia` capture the harness cannot grant meaningfully.

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
