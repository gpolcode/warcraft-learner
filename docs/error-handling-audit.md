# Error-handling coverage audit

A deep scan of the repository against the fallible-load contract in
`.claude/skills/warcraft-error-handling/SKILL.md`: every load that can fail returns
`Result<T, LoadError>`, every failure lands in one of four distinct render states
(content / waiting / transient / permanent), and nothing degrades to silence.

**Scope:** all of `frontend/src` (core services, transports, the six post-raid slices,
the live recording slice, the pre-fight page, shared components and pipes) plus
`frontend/scripts/ingest/**` and the `ingest-parses` workflow.
**Method:** four parallel area audits, with every High and Medium finding re-verified
line-by-line against the source before inclusion. Line numbers reference the current
`main` (commit `dbe9d1e`).

Severity is user impact; confidence is how directly the failure path was verified
(certain = traced end to end in code, likely = mechanism verified but trigger
environment-dependent, speculative = plausible but unproven trigger).

## Summary

| # | Area | Severity | Confidence | Gap |
|---|---|---|---|---|
| 1.1 | WCL error channel | High | certain | `WclApiService` re-wraps `WclTransportError`, so every WCL failure classifies as `permanent`; the `transient` state is unreachable for WCL loads |
| 1.2 | WCL auth | Medium | certain | Token-grant failures throw a bare `Error`; a network outage during auth renders as "bugged, do not retry" |
| 1.3 | WCL auth | Medium | certain | A mid-session 401 surfaces as `permanent` with no in-place retry |
| 2.1 | Post-raid shell | Medium | certain | Report/spec/poll failures render raw `Error.message` strings, outside the taxonomy |
| 2.2 | Post-raid shell | High | certain | A valid-format but nonexistent/private report code surfaces a raw `TypeError` message |
| 2.3 | Post-raid shell | Medium | certain | A report with zero boss pulls loads to complete silence |
| 3.1 | Pre-fight plan cards | Medium | certain | `loadPlanView`/`loadPlan` flatten the taxonomy to `{ available: false }`; failures render as the waiting state |
| 3.2 | Slice transforms | Medium | certain | Unguarded `abilities[id].icon` lookups in paths with no `try/catch`; a rejection is swallowed by `LatestLoad` and leaves a blank or stale card |
| 3.3 | Pull overview | Medium | certain | A malformed (non-null) damage-table blob yields a measured `ok(0)` DPS instead of `permanent` |
| 3.4 | Map | Medium | likely | `MapFeatureService.prepare` has no latest-wins guard; rapid selection switches can apply a stale overlay |
| 4.1 | Live recording | High | certain | The recording engine has no user-facing error state at all; several failures leave the toggle stuck on "Recording" while nothing records |
| 5.1 | Shared icons | Low | certain | Boss icons have no unknown-id guard and no `<img>` error fallback (broken-image glyph) |
| 5.2 | Shared pipes | Low | certain | `signedPercent(NaN)` renders the literal text `NaN%`; one NaN blanks the window-comparison overview bar |
| 6.1 | Ingest workflow | High | likely | The gh-pages publish step has no empty-tree guard; a failed data overlay on a green run would `clean: true` away all published data and rulebooks |
| 6.2 | Ingestion | High | certain | Transiently-failed parses are silently dropped, then the thin bench is signature-locked and never repaired; ingestion runs with zero retries |
| 6.3 | Ingestion | Medium | certain | A corrupt `rulebook.json` silently drops the spec from ingestion and blanks its icon, with no log |
| 6.4 | Ingestion | Medium | certain | No per-spec failure isolation and no end-of-run failure summary; one stray throw aborts the whole run |

Sections 1-6 detail these; section 7 lists the minor findings and section 8 what was
checked and found correct.

---

## 1. Cross-cutting: WCL failures never reach the taxonomy

### 1.1 `WclApiService` re-wraps `WclTransportError`, so `toLoadError` classifies every WCL failure as `permanent` (High, certain)

`frontend/src/app/core/services/wcl-api.ts:56`:

```ts
throw error instanceof WclTransportError ? new Error(error.message, { cause: error }) : error;
```

`toLoadError` (`core/http-load-error.ts:17-24`) inspects only the top-level thrown
value (`instanceof HttpErrorResponse` / `instanceof WclTransportError`); it never
unwraps `.cause`. Every error leaving `WclApiService.query` is a plain `Error`, so
status resolves to `-1` and the result is `permanent('Analysis data could not be
loaded.', ...)`.

Consequence: for the 11 feature-service catch sites that call `toLoadError` around
WCL calls (rotation, burst, defensive, gear, map, pull-overview), the `transient`
variant is unreachable in production. A WCL 503/429/network drop during a card load
renders the "this analysis is bugged, do not retry" state instead of "retry in a
moment". The `WclTransportError` branch inside `toLoadError` is effectively dead
code in the browser.

Why the test suite does not catch it: the slice specs exercise the transient path by
throwing `WclTransportError` directly from a fake WCL service (for example
`rotation.service.spec.ts:537`), bypassing the real `WclApiService.query` wrap. A
test that drives a failure through the real `WclApiService` against a stubbed
transport would expose the misclassification.

Same-root corollary: `apollo-wcl-transport.ts:37-39` maps a 200-with-`errors`
GraphQL response (report not found, private report, permission denied) to
`WclTransportError(status 0)`, which the design intends as `transient` ("WCL is
unreachable right now") even though retrying can never help. Both the current
behavior (permanent via the wrap) and the designed mapping (transient) are wrong for
these cases in different ways; the GraphQL error message itself is the signal that
would let them classify correctly.

### 1.2 Token-grant failures throw a bare `Error` and classify as `permanent` (Medium, certain)

`frontend/src/app/core/services/wcl-auth.ts:120-126` collapses the typed
`HttpErrorResponse` into `new Error("WCL token request failed (...)")`, discarding
the status. `WclApiService.query` awaits the token outside its try/catch
(`wcl-api.ts:46`), so the rejection propagates to the feature-service catch and
`toLoadError` returns `permanent`. When the WCL OAuth endpoint is down or the
network drops, every card fails at once with the "do not retry" state, for an outage
that is transient by definition.

### 1.3 A mid-session 401 surfaces as `permanent` with no in-place retry (Medium, certain)

`wcl-api.ts:50-55`: on a 401 the cached token is invalidated and a plain `Error` is
thrown. The current request is not re-run with a fresh token, and the plain `Error`
classifies as `permanent`. A token rejected early (secret rotation, clock skew past
the 60s pre-expiry guard) shows the user "bugged, do not retry" when the very next
click would succeed.

### 1.4 Token response body is not validated (Low, likely)

`wcl-auth.ts:127-128` assigns `data.access_token` without checking it is a
non-empty string. A 200 with a garbage body (captive portal, proxy interstitial)
either caches a junk token for an hour (every query then 401-loops) or stores
`undefined` and refetches on every call. No typed error exists for the
malformed-response case.

## 2. Report loading and the post-raid page shell

### 2.1 The shell's error channel bypasses the taxonomy and leaks raw strings (Medium, certain)

`post-raid.ts:374`, `:413`, `:468` set `this.error` to `err.message` verbatim, and
`post-raid.html:77-79` renders that string in the banner. Users can see strings like
`WCL API error (503)`, `WCL token request failed (401): ...`, or a raw `TypeError`
message (see 2.2). There is no missing/transient/permanent distinction and no retry
guidance; report loading, spec resolution, and live polling all share this untyped
string signal while every card below them uses `wl-load-state`.

### 2.2 A nonexistent/private/expired report code surfaces a `TypeError` (High, certain)

`wcl-api.ts:65` returns `result.reportData.report` unguarded; WCL returns
`report: null` for a code it cannot serve without a GraphQL error in some cases.
`post-raid.ts:382` then dereferences `report.fights` (not optional-chained, unlike
`report.masterData?.actors` on the next line), throwing
`Cannot read properties of null (reading 'fights')`, which 2.1 renders verbatim in
the banner. During live sync, a report that expires mid-session hits the same
TypeError on every poll. `getPlayerDetails` (`wcl-api.ts:74`) has the same unguarded
deep dereference (`result.reportData.report.playerDetails.data.playerDetails`),
in contrast to its siblings that guard with `?.` and `?? []`.

### 2.3 A report with zero boss pulls loads to silence (Medium, certain)

`post-raid.ts:365-371` with `post-raid.html:15`: when `buildFights` yields `[]`
(an all-trash log), the fight dropdown is hidden, no cards render, and no message is
set. The manual `loadReport` path emits nothing (the live-poll path does set
"No boss pulls found." at `post-raid.ts:396`). The user gets a successful load that
looks like the app did nothing.

### 2.4 A failed live poll leaves the status line stuck (Low, certain)

`post-raid.ts:390` sets the live status to "Checking for new pulls..." before the
fetch; the catch at `:411-414` sets the error banner but never updates the status,
which keeps claiming an in-flight check until the next poll tick.

## 3. Slice-level gaps

### 3.1 The pre-fight plan loaders flatten the taxonomy to `{ available: false }` (Medium, certain)

- `rotation.service.ts:574-578` (`loadPlanView`) returns
  `{ available: boolean; rows: CdPlanRow[] }`, not a `Result`.
- `defensive.service.ts:472-475` (`loadPlan`) does the same.

Both collapse a `transient` or `permanent` bench failure into `available: false`,
discarding the error. Their components have no error signal and no error branch:

- `rotation-cd-plan.ts:33-48` + `rotation-cd-plan.html` render only the waiting
  state or content.
- `defensive-plan.ts` + `defensive-plan.html` are the same shape.

Consequence: on the pre-fight page, a retriable WCL/data-host outage renders the
"Waiting for top parses" ingest-waiting state, pixel-identical to a genuinely
un-ingested spec. This is the exact conflation the four-state contract exists to
prevent, and a direct violation of rule 1 (no `{ found: false }` placeholders).

### 3.2 Unguarded ability-map lookups in paths with no `try/catch`, silently absorbed by `LatestLoad` (Medium, certain mechanism / likely trigger)

Three pure builders index the baked ability map without a guard:

- `rotation.service.ts:523` - `abilities[cd.spell_id].icon` in `buildCdPlan`
  (line 522 acknowledges `spell_id` can be null: `spellId: cd.spell_id ?? null`).
- `defensive.service.ts:407` - `bench.ability_icons[defensive.spell_id].icon` in
  `buildDefensivePlanRows` (same acknowledged-null `spell_id` on line 406).
- `burst.service.ts:67-68` - `abilities[ability.spell_id].name/.icon` in
  `burstDetailRows`.

The shared `windowSpells` helper (`wcl-projections.ts:65-79`) guards this exact case
with a labelled placeholder plus `logWarn`; these three builders skip that guard.
Callers matter: `buildCdPlan` runs in `loadPlanView` (no `try/catch`),
`buildDefensivePlanRows` in `loadPlan` (no `try/catch`), and `burstDetailRows` in
`loadBenchView` (`burst.service.ts:209-213`, no `try/catch`). A null or unmapped
spell id makes the load promise reject, and `LatestLoad.run`
(`shared/latest-load.ts:18`) catches rejections with only a `logWarn` and keeps the
current view state. The card shows nothing on first load, or the previous
encounter's rows after a switch, with no error state.

`LatestLoad`'s keep-stale-state backstop is itself worth a decision: under the
contract no load should ever reject, so any rejection reaching it is a bug, and
rendering nothing/stale is the exact symptom the contract eliminates. Applying a
`permanent` error state (or at least clearing the view) on rejection would make
such bugs visible instead of silent.

### 3.3 `dpsFromTable` returns a measured `ok(0)` for a malformed damage-table blob (Medium, certain)

`pull-overview.service.ts:92-99` guards only a literally null blob with
`permanent('Damage table missing for this pull.')`. A non-null but unparseable
string blob (or valid JSON without `data.entries`) flows through
`tableEntries` -> `safeJson` (which swallows the parse error to null,
`:78-85`) -> `[]` -> `.find` misses -> `ok(0)`. A player who did real damage shows a
measured 0 DPS, pixel-identical to a healer's legitimate 0. The function's own doc
comment ("A null/failed blob is a load failure") promises `permanent` for exactly
this case.

### 3.4 `MapFeatureService.prepare` has no latest-wins guard (Medium, likely)

`map.service.ts:173-202`, invoked fire-and-forget from `post-raid.ts:463`. Unlike
every card (which routes loads through `LatestLoad`), concurrent `prepare` calls
from rapid fight/player switches race: whichever `getBench` resolves last wins the
`positions`/`pendingOverlay` state, which can be the earlier, stale selection.
Opening the map then draws the previous player's trail or the previous encounter's
bench.

### 3.5 `unwrapRankings` parses JSON unguarded in a pure transform (Low, certain mechanism)

`wcl-projections.ts:32`: `JSON.parse(blob)` with no try/catch, in a function the
contract requires to be total (rule 4). A malformed rankings string throws; today
every caller happens to sit inside a shell `try/catch` (so it degrades to
`permanent`), but the function is one refactor away from an escaping throw, and the
sibling `safeJson` in pull-overview shows the intended guarded pattern.

## 4. Live recording slice: no error surface at all

The recording engine (`live/live-capture.service.ts`) exposes `isStarting`,
`isCapturing`, `sourceLabel`, `status` - but no error signal, and
`live-controls.html` renders exactly three states with no error branch. Every
failure below is `logWarn`-only (High overall, individual confidence as noted):

- **4.1 Real `getDisplayMedia` failures are conflated with picker-cancel (certain).**
  The single catch at `live-capture.service.ts:221-226` treats insecure context
  (`navigator.mediaDevices` undefined), unsupported browser, and policy-denied
  `NotAllowedError` identically to a benign picker dismiss: the toggle silently
  flips back off with zero feedback. A user on an unsupported browser can never
  learn why recording will not start.
- **4.2 A `MediaRecorder` construction failure leaves the toggle stuck on
  "Recording" (certain).** `startRecording` sets `this.recording = true` and
  `isCapturing.set(true)` (`:218-219`) before `cycleSegment()` constructs the
  recorder (`:245`, can throw `NotSupportedError`; `mimeFor` falls back to a bare
  `'video/webm'` that is not guaranteed supported). The throw lands in the same
  catch, which resets neither flag: the strip shows "Recording ... in the
  background" indefinitely while nothing records and no clips ever appear.
- **4.3 No `MediaRecorder.onerror` handler (certain).** `cycleSegment` wires only
  `ondataavailable` and `onstop` (`:247-253`). A runtime encoder failure mid-raid
  either stalls the buffer or busy-loops, silently, with the toggle still on.
- **4.4 All-empty segments still count as clip coverage (likely).** Segments whose
  chunks are all empty are stored as zero-byte blobs with valid wall-clock bounds
  (`:249`), so `clipReady()` offers a clip whose blob cannot decode.
- **4.5 `clip-player`'s `<video>` binds no `(error)` handler (certain).**
  `clip-player.html:3-9`. When MSE assembly fails and the single-blob fallback
  (`:414-417`) is also undecodable, the flyover shows a dead black player; the
  "No footage for this window." branch only covers a null handle.
- **4.6 `download()` failure is silent (certain).** `:291-300` - the catch only
  logs; the button gives no feedback when `reRecord` rejects (for example
  `captureStream()` unsupported).
- **4.7 `reRecord` never stops the captured stream's tracks (likely, minor leak).**
  `:362-370` releases the blob URL but not `stream.getTracks()`.

## 5. Shared components and pipes

- **5.1 Boss icons: no unknown-id guard, no image-error fallback (Low, certain).**
  `boss-icon.ts:6-8` builds a URL for any encounter id, and `art-icon.html` renders
  `<img>` with no `(error)` handler, so a 404 (brand-new boss before rpglogs
  publishes art) shows the broken-image glyph in the fight dropdown. Contrast
  `classIconUrl`/`specIconUrl` (`spec-meta.ts:61-70`), which return `''` for unknown
  ids so the icon degrades to name-only. `game-icon` (`game-icon.ts:46-49`) has the
  same missing `(error)` fallback with lower impact (the name renders alongside).
- **5.2 `signedPercent(NaN)` renders `NaN%` (Low, certain mechanism, speculative
  reach).** `signed-percent-pipe.ts:7` guards only `== null`; `NaN.toFixed(0)` is
  `"NaN"`. In `window-comparison.ts`, `overviewDelta` (`:167-173`) passes NaN
  through its null guards and `overviewMax` (`:156-161`) filters null but not NaN,
  so one NaN playerPct renders a `NaN%` badge and blanks the whole overview bar.

## 6. Ingestion pipeline and publish workflow

### 6.1 The publish step has no empty-tree guard; a failed overlay on a green run replaces all published data (High, consequence certain / trigger likely)

`.github/workflows/ingest-parses.yml:47-53` and `:80-88`. The overlay step guards
both the fetch (`git fetch origin gh-pages || true`) and the extraction
(`git archive ... | tar -x ... || echo "No existing data..."`) so the legitimate
first-run case passes - but those guards cannot distinguish "no data exists yet"
from "the overlay failed while data exists". The `|| echo` also swallows a partial
or failed tar extraction (with `2>/dev/null` hiding the cause). If the working tree
ends up empty or partial and the run otherwise exits 0, the publish step's
`clean: true` makes gh-pages `data/specs` match it: specs that were neither overlaid
nor re-ingested that hour are deleted, including every hand-authored
`rulebook.json` - which exists only on gh-pages (gitignored on main) and is not
recoverable from history (`single-commit: true` squashes it).

Two mitigating and one aggravating detail: `fetch-depth: 0` at checkout fetches all
branches, so `origin/gh-pages` normally survives a failed explicit fetch (stale but
present); the publish step is gated on run success. But the comment justifying
`fetch-depth: 0` (`:36-39`) references a `git-mtime.ts` mechanism that does not
exist anywhere in the repo, which invites exactly the "clean up the full clone"
change that would make the fetch-failure path live. A cheap invariant (abort before
publish when the working tree has zero spec directories while `origin/gh-pages`
has many, or a minimum-file-count guard) would close the whole class.

### 6.2 Transiently-failed parses silently thin the bench, and the signature then locks the thin bench in forever (High, certain mechanism / likely occurrence)

Every transform's per-parse loop swallows any fetch error to `null` and skips the
parse (for example `burst-transform.service.ts:392-395`; the same shape exists in
rotation, defensive, gear, and map). The bench still returns `ok(...)` built from
whatever subset succeeded. The orchestrator stamps it with a signature keyed on the
full top-N parse set minus only permission-denied codes
(`node-wcl-transport.ts:62-67`, `signature.ts:118-124`,
`orchestrator.ts:127-132`) - transient failures are not excluded. On the next run
the rankings are unchanged, the signature matches, and the encounter is skipped: a
bench built from 7 of 10 parses is published as complete and never repaired until
the rankings themselves change or `INGEST_VERSION` bumps.

Compounding it: the headless runtime registers no retry interceptor
(`angular-runtime.ts:94` provides `provideHttpClient(withFetch())` with no
interceptors) and WCL goes through the plain-fetch transport, so ingestion gets
zero retries. The taxonomy's premise that a `transient` error was already retried
once does not hold in ingestion at all.

### 6.3 A corrupt `rulebook.json` silently freezes the spec (Medium, certain)

`node-data-file-transport.ts:27-31` correctly distinguishes ENOENT (`missing`) from
a malformed file (`permanent`), but both orchestrator consumption sites collapse the
two with no log: `orchestrator.ts:300-303` bakes `specIcon = ''` (shipping a blank
icon), and `:330-333` drops the spec from the ingest set entirely. Net effect of a
rulebook that becomes corrupt: green run, spec silently frozen on stale data, blank
icon shipped, nothing in the logs.

### 6.4 No per-spec failure isolation and no run summary (Medium, certain)

`orchestrator.ts:258-266` catches only `BudgetExceededError`; the orchestrator's own
WCL calls (`assertBudget` at `:231`, `rankingPool` at `:233`) and file writes throw
plain errors that abort the whole multi-spec run (`:367-370` has no per-spec
try/catch). Nothing bad is published (the publish step is success-gated), but the
hour's remaining specs are discarded, and there is no end-of-run summary
distinguishing "clean quiet hour" from "aborted after 2 of 30 specs" - failures
exist only as scattered log lines.

### 6.5 Naive `writeFile` with no write-then-rename (Low, speculative)

`node-data-file-transport.ts:34-40` writes JSON directly to the destination path. A
hard kill mid-write leaves truncated JSON in the working tree. Currently neutralized
because a crash fails the run and the tree is discarded with the runner; latent risk
if partial trees ever become publishable.

## 7. Minor findings

- **Pre-fight class dropdown can render zero options with no error.** The bootstrap
  spec-meta initializer deliberately folds a failed read to an empty universe
  (`app.config.ts:49-52`, commented as intentional), but pre-fight's empty-state
  gate keys off `index.json` (`specs()`) while the dropdown options come from
  `spec-meta.json` (the META cache). A transient failure of one file but not the
  other yields a dead-looking dropdown with no banner (`pre-fight.ts:92-98`,
  `pre-fight.html:9`).
- **Pull-overview renders nothing for a `missing` result** (`pull-overview.ts:65-66`,
  commented as deliberate). Reachable only in unusual paths, but it is a fifth,
  undocumented render state (blank).
- **A live overlay whose player has no position samples is silent**
  (`map.service.ts:143`, `:240-241`): the map opens with bench trails and no "you"
  marker, indistinguishable from not-yet-loaded.
- **Doc drift:** `provide-data-source.ts:36,41` comments describe `getBench` as
  returning null, which contradicts its `Result` signature;
  `ingest-parses.yml:36-39` justifies `fetch-depth: 0` with a `git-mtime.ts` that
  does not exist in the repo. Both violate the describe-current-behavior rule and
  actively mislead maintenance (see 6.1).
- **No browser-side schema/version guard on data files:** `readJson<T>` casts
  unvalidated JSON to `T`, and `INGEST_VERSION` is not checked anywhere under
  `frontend/src`, so a code deploy racing a data-shape change flows drifted data
  into transforms typed for the current shape. Arguably by design (single shared
  dataset, transforms assume complete ingested data), noted for awareness.

## 8. Checked and found correct

The pattern's core is solid where PR-scope work applied it:

- `result.ts`, `http-load-error.ts`, and the retry interceptor match the skill
  exactly; `RETRYABLE_STATUSES` and `TRANSIENT_STATUSES` are identical sets;
  401/403/404 pass through un-retried.
- The data-file read path is fully compliant end to end: transport catch ->
  `logWarn` -> `toLoadError` (404 -> missing, 5xx -> transient, corrupt JSON ->
  permanent), manifest reads fold missing -> empty, `FileDataSource`/
  `EmptyDataSource` propagate `Result` cleanly.
- All six post-raid player-view loads (`loadPlayerView`/`loadAnalysisView`/
  `loadView`) return `Result`, propagate the bench error, wrap WCL in
  try/catch -> `toLoadError`, and their components apply the four states correctly
  (view cleared on failure, `missing` narrowed to the waiting state, `permanent`
  `logWarn`ed) - the gap class is the WCL error's runtime type (1.1), not the
  slice plumbing.
- The pre-fight page's spec/encounter dropdowns surface load errors through
  `wl-load-state`; the report-code validator keeps junk input from ever reaching
  WCL; live polling recovers on the next tick instead of stopping.
- `LatestLoad`'s race-guarding is correct for all card loads; busy flags always
  clear.
- Pipes and pure helpers broadly guard null/unknown-enum/empty input
  (`formatDuration`, `formatDamage`, class/spec icon pipes, `finding-table`'s
  unknown-cooldown surfacing, `gear-comparison`, `analysis-math`).
- Live slice: stop-share-from-chrome, picker-cancel toggle reset, buffer-coverage
  gating, and the pure clip-correlation functions are all correct; object-URL
  hygiene is right on the handled paths.
- Ingestion: `Result` arms are consumed with `.ok` guards everywhere (no err JSON is
  ever written), budget exhaustion stops cleanly, a total WCL outage aborts red
  before publish, prune is guarded against empty discovery, manifests are rebuilt
  after slice writes from on-disk truth, and the three gh-pages writers serialize
  under one concurrency group.
