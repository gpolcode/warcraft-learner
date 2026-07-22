# Unit Test Assertion Audit Report

**Scope:** every spec file under `frontend/src/**` (57 files; the full `npm test` suite passes 844/844 at audit time, so every finding below is a green test that fails to verify the behavior it claims).
**Method:** zero-trust audit. For each system under test, expected behavior was re-derived independently before reading the spec: from the SUT source read critically, from type and interface contracts, from the project contract docs (`.claude/skills/warcraft-architecture`, `warcraft-wcl-data`, `warcraft-error-handling`, `warcraft-ingestion`, `warcraft-testing`), and from first-principles arithmetic (all numeric expectations recomputed by hand, with `node` used to confirm floating-point, `d3-array` quantile/deviation, and rounding semantics). Every flagged assertion was then verified a second time directly against the cited source lines, including mutation analysis (would the assertion fail if the named behavior were broken?).

**Status meanings**
- `INCORRECT`: the expected value contradicts the domain-correct output (a locked-in bug).
- `TAUTOLOGICAL`: the assertion cannot fail for the behavior the test names - pure tautologies (constant vs constant, mock echo, test-authored state read back), vacuous passes (loops over possibly-empty arrays, unreachable guard branches), and under-discriminating setups (range asserts where an exact value is derivable, "boundary" fixtures that do not sit at the boundary, fixtures where the named contract and a broken mutant produce identical output).
- `VALID`: the assertion pins independently re-derived correct behavior.

**Headline result:** 0 INCORRECT, 38 TAUTOLOGICAL-class findings, 1 documentation/code contract mismatch (surfaced separately, not a defective assertion), remainder VALID. No assertion in the suite locks in a mathematically or semantically wrong expected value; the defects found are all assertions that pass regardless of whether the specific behavior they claim to verify works. Deliberate project conventions (strict threshold boundaries, total functions returning `0`/`null`/`[]`, pass-through API services, the embedded WCL secret, raw wire-unit map fixtures) were treated as contracts, not defects, and the suite's boundary tests almost universally honor them - the exceptions are flagged below.

Files with no findings list their audited tests in one consolidated entry; flagged files get one full entry per flagged test plus a consolidated entry for the rest.

---

## Core: Result type, error taxonomy, retry, load rendering

### File: `frontend/src/app/core/result.spec.ts`

#### Tests: all 11 audited (`ok`/`missing`/`transient`/`permanent` builders, `isOk`, `fold`, `mapErr`)
* **Existing Assertion:** independent literal shapes, e.g. `expect(ok(42)).toEqual({ ok: true, value: 42 })`; fold arms recomputed (`42+1=43`).
* **User/Domain Expected Outcome:** the hand-rolled `Result<T, LoadError>` with exactly the three-variant taxonomy (missing / transient / permanent), id + context carried on permanent.
* **Correctness Status:** `VALID`
* **Analysis:** every expected value is an independent literal, none derived from the SUT; `mapErr` leaves-success-untouched genuinely fails on an always-map mutant.

### File: `frontend/src/app/core/http-load-error.spec.ts`

#### Tests: all 10 audited (status-to-variant mapping)
* **Existing Assertion:** `404 -> missing('Not yet ingested.')`; `500/503/429/408/status-0 (HttpErrorResponse and WclTransportError) -> transient`; `403/400/unknown throw -> permanent` with repro id and same-ref cause.
* **User/Domain Expected Outcome:** the documented taxonomy: 404 is the un-ingested signal, retryable statuses `{0, 408, 429, 500, 502, 503, 504}` are transient, everything else permanent.
* **Correctness Status:** `VALID`
* **Analysis:** the asserted classification matches both the SUT's `TRANSIENT_STATUSES` set and sound HTTP semantics; expected `LoadError` values are built via the separately-tested `result.ts` builders, not by calling `toLoadError` itself, so the mapping is genuinely falsifiable.

### File: `frontend/src/app/core/interceptors/retry-transient.interceptor.spec.ts`

#### Tests: all 5 audited (retry-once on transient, pass-through on 404/403)
* **Existing Assertion:** attempt counts pinned structurally - one `expectOne` per expected network attempt plus `afterEach` `verify()`; backoff advance of 400 ms (`BASE_DELAY_MS * 2^0`) between attempts.
* **User/Domain Expected Outcome:** exactly one retry for retryable statuses; non-transient errors propagate immediately with a single underlying request.
* **Correctness Status:** `VALID`
* **Analysis:** under RxJS `retry({count, delay})` semantics a wrongful extra retry leaves an unflushed request (test hangs and `verify()` trips) and a missing retry rejects the await - both directions falsifiable.

### File: `frontend/src/app/shared/latest-load.spec.ts`

#### Tests: all 7 audited (latest-wins token guard)
* **Existing Assertion:** stale resolve after a newer run started applies nothing; settled fires only for the latest run; a stale rejection still logs (`[warcraft-learner] feature.loadView:` + same-ref error) but fires no settled.
* **User/Domain Expected Outcome:** out-of-order async completions never clobber newer state; the busy flag always clears for the run the user is watching.
* **Correctness Status:** `VALID`
* **Analysis:** the specs construct genuine out-of-order interleavings (not just happy paths); the `latestSettled === 1` companion assertion proves the finally ticks ran, so the `staleSettled === 0` observation is not vacuous.

### File: `frontend/src/app/shared/components/load-state/load-state.spec.ts`

#### Tests: all 6 audited (per-variant branch rendering)
* **Existing Assertion:** null error -> waiting branch (schedule icon); transient -> `cloud_off` + retry hint with `not.toContain` proving the waiting branch is absent; permanent -> `error` icon + do-not-retry hint; default caption `'Built from the top-parse bench.'`.
* **User/Domain Expected Outcome:** the three-variant taxonomy drives three distinct renderings.
* **Correctness Status:** `VALID`
* **Analysis:** branch selection is discriminated in both directions (presence of the right branch and absence of the wrong one).

## Core: WCL transport, auth, caching, live sync

### File: `frontend/src/app/core/services/wcl-api.spec.ts`

#### Tests: all 6 audited
* **Existing Assertion:** 401 -> `invalidate()` + retry once with the refreshed token (pinned by the token sequence `['token-1','token-2']`, where the fake only advances on invalidate); non-401 propagates with one attempt; combatant-info envelope unwrap; `data: []` -> `[]`; `report: null` -> `WclTransportError` with status 422.
* **User/Domain Expected Outcome:** the auth layer owns exactly one 401 re-auth retry; unserved reports classify permanent.
* **Correctness Status:** `VALID`
* **Analysis:** skipping invalidate or retrying with the stale token both fail the token-sequence assertion; the envelope unwrap asserts the inner array, not the mock object.

### File: `frontend/src/app/core/services/wcl-auth.spec.ts`

#### Tests: all 8 audited
* **Existing Assertion:** reuse window arithmetic pinned at the exact boundary: reuse at `T0+3,539,999` ms, refetch at exactly `T0+3,540,000` (expiry minus the 60 s margin, strict `<`); in-flight dedup (`match().length === 1`); sessionStorage persist/hydrate/invalidate round-trips asserted on stored bytes and network-call counts.
* **User/Domain Expected Outcome:** client-credentials token cached to just short of expiry, refreshed 60 s early, shared across concurrent callers, persisted across visits.
* **Correctness Status:** `VALID`
* **Analysis:** both sides of the refresh boundary are exercised at millisecond precision; persistence tests assert the stored JSON, not an in-memory echo.

### File: `frontend/src/app/core/services/wcl-caching.spec.ts`

#### Tests: all 3 audited
* **Existing Assertion:** query-to-policy branch selection: report reads get the live-cache lifetime header, discovery/budget reads get `DISALLOW_CACHE`, fight-window reads get `{}`.
* **User/Domain Expected Outcome:** live-refreshable reads capped, budget probes always fresh, event reads on the long default (their cache identity varies by body).
* **Correctness Status:** `VALID`
* **Analysis:** the branch selection (the logic under test) is what the assertions discriminate; citing the lifetime constant by name is the project's named-constant convention, not a tautology, because a wrong branch returns the wrong header entirely.

### File: `frontend/src/app/core/services/http-wcl-transport.spec.ts`

#### Test: `throws WCL_UNUSABLE_STATUS on a 200 with a GraphQL errors array` (line 100)
* **Existing Assertion:** `expect(transport.takeInaccessibleCodes()).toEqual([]);` (spec line 108, under the comment "A non-permission GraphQL error must not mark the report inaccessible.")
* **User/Domain Expected Outcome:** a non-permission GraphQL error on a code-bearing query must record the code in `failedCodes` but not `inaccessibleCodes` - i.e. the `/permission/i` classifier must be selective.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the call under test is `transport.query(UNCACHED_QUERY, {}, TOKEN)` (line 103) - no `code` variable. The SUT derives `code` from `variables` (`http-wcl-transport.ts:43`) and guards the entire classification block with `if (code)` (lines 63-66), so `inaccessibleCodes` is structurally empty on this path no matter what the classifier does; replacing `/permission/i` with `/./` still passes. The falsifiable version of this exact property already exists at lines 145-154 (code-bearing call, `failed=[code]`, `inaccessible=[]`). The `rejects.toEqual` half of this test (line 106) is valid.
* **Recommended Assertion:** delete spec lines 107-108 (the property is proven by the test at lines 145-154), or move the assertion into a code-bearing call: `transport.query(QUERY, { code: REPORT_CODE }, TOKEN)`.

#### Tests: remaining 10 audited
* **Existing Assertion:** POST body/header/`data` unwrap; same-inputs cache reuse (one network request enforced by `verify()`); parallel in-flight dedup via `expectOne`; uncached bypass + control-header strip; HTTP error -> `WclTransportError` with real status; 200-no-data -> 422; permission denial recorded in both sets and `take()` drains; transient HTTP and non-permission GraphQL errors -> failed set only; 401 never recorded.
* **User/Domain Expected Outcome:** as asserted; matches the taxonomy and the auth layer's 401 ownership.
* **Correctness Status:** `VALID`
* **Analysis:** one caveat outside this audit's scope (missing-test, not invalid-assertion): the cache tests only ever exercise one body per cached query, so same-inputs reuse is proven but key discrimination across different variables is not exercised anywhere; the reuse assertion itself is genuinely falsifiable (a broken cache leaves the second await unresolved and trips `verify()`).

### File: `frontend/src/app/core/services/live-report-sync.spec.ts`

#### Tests: all 6 audited
* **Existing Assertion:** no immediate emission; ticks 1/2/3 at exact interval multiples; hidden-tab suppression and resume; refocus cooldown inclusive `>=` at the exact boundary (12000 emits, 6000 dropped, 12000 emits); `exhaustMap` overlap drop; teardown detaches the visibility listener (a leaked listener would pass the filter and break the count).
* **User/Domain Expected Outcome:** poll cadence with tab-visibility gating and refocus cooldown; consumers prepend the immediate tick themselves (`post-raid.ts` merges `of(undefined)`).
* **Correctness Status:** `VALID`
* **Analysis:** all tick counts recomputed; the no-immediate-emission assertion matches both the code (`interval` never fires at t=0) and the consumer contract - a stale SUT doc comment claims otherwise, but the assertion, not the comment, matches shipped behavior and the dependent consumer.

## Core: data plumbing

### File: `frontend/src/app/core/data-source/empty-data-source.spec.ts`

#### Tests: all 2 audited
* **Existing Assertion:** always resolves `missing` with the exact message; the provider binds the token to an `EmptyDataSource` instance through a real `Injector`.
* **User/Domain Expected Outcome:** a fresh un-ingested tier reads as missing (drives the waiting state), never as an error.
* **Correctness Status:** `VALID`
* **Analysis:** kind and message pinned against independent literals.

### File: `frontend/src/app/core/data-source/file-data-source.spec.ts`

#### Tests: all 3 audited
* **Existing Assertion:** positional argument order `(spec, encounterId, slice)` pinned; err arm passed through; the constructor-bound slice directory (`'positions'`) reaches `getSlice`.
* **User/Domain Expected Outcome:** pure delegation adapter per the documented pass-through contract.
* **Correctness Status:** `VALID`
* **Analysis:** the calls-assertion discriminates a spec/slice string swap; result echo is the documented contract for this adapter, not a tautology.

### File: `frontend/src/app/core/services/data-file-api.spec.ts`

#### Tests: all 12 audited
* **Existing Assertion:** every path recomputed character-for-character (`{spec}/{slice}/{enc}.json` read and write symmetric, `{spec}/rulebook.json`, `{spec}/positions/{enc}.json`, `index.json`, `{spec}/encounters.json`, `spec-meta.json`); `foldMissingToEmpty` applied to manifest/encounters/spec-meta (missing -> `ok([])`, transient propagates) and explicitly NOT to per-card `getSlice`; `listSpecs` drops dotted names from the root listing.
* **User/Domain Expected Outcome:** the documented `data/specs` layout and the fresh-tier fold semantics.
* **Correctness Status:** `VALID`
* **Analysis:** the fold arms are the real transformation and all three are exercised; the not-folded `getSlice` sibling pins that error folding does not leak into card reads.

### File: `frontend/src/app/core/services/data-file-transport.spec.ts`

#### Tests: all 4 audited
* **Existing Assertion:** URL join from `dataBaseHref` recomputed; 404 -> `missing('Not yet ingested.')` + warn; 500 -> `transient('WCL is unreachable right now.')` with the message independently redeclared in the spec; write-side methods throw `read-only in the browser`.
* **User/Domain Expected Outcome:** browser transport is read-only; taxonomy conversion at the HTTP boundary.
* **Correctness Status:** `VALID`
* **Analysis:** message literals are redeclared, so taxonomy copy drift fails the test rather than being absorbed.

### File: `frontend/src/app/core/spec-meta.spec.ts`

#### Tests: all 9 audited
* **Existing Assertion:** hydration cache keyed by folder key; WCL `className`/`specName` resolution; classes/specsFor projections; unknown/off-class keys ignored; zamimg icon URLs recomputed char-by-char (`class_rogue.jpg`, `ability_stealth.jpg` - real slugs); unknown -> `''`.
* **User/Domain Expected Outcome:** real WoW class/spec facts and the real zamimg URL scheme.
* **Correctness Status:** `VALID`
* **Analysis:** expected URL strings are independent literals matching the external convention, not the SUT's own constant.

## Core: UI stores and tooltips

### File: `frontend/src/app/core/services/nav-state-store.spec.ts`

#### Test: `round-trips the expanded preference` (line 36)
* **Existing Assertion:** `new NavStateStore().saveCollapsed(false); expect(new NavStateStore().loadCollapsed()).toBe(false);` (sole assertion, on `beforeEach`-cleared storage)
* **User/Domain Expected Outcome:** saving `false` persists the string `'false'` under `wl.nav.collapsed` and a fresh instance loads it back - i.e. the expanded preference actually round-trips through storage.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** on cleared storage, `loadCollapsed()` returns `false` whether or not the save happened (`getItem === 'true'` is false for an absent key, `nav-state-store.ts:26`). A gutted `saveCollapsed` (no-op, wrong key, throw into its catch) or a constant-`false` `loadCollapsed` all pass; the only detectable defect is a literal inversion. The persistence the test names is never verified. The sibling `true` round-trip (line 28) is valid because `true` is distinguishable from the default.
* **Recommended Assertion:**
  ```ts
  new NavStateStore().saveCollapsed(true);
  new NavStateStore().saveCollapsed(false);
  expect(localStorage.getItem(NAV_COLLAPSED_STORAGE_KEY)).toBe(JSON.stringify(false));
  expect(new NavStateStore().loadCollapsed()).toBe(false);
  ```

#### Tests: remaining 4 audited
* **Existing Assertion:** `true` round-trip pins the storage key and the stored bytes and reloads on a fresh instance; default-false on empty; write/read failures logWarn and never throw.
* **Correctness Status:** `VALID`
* **Analysis:** the `true` case is distinguishable from the absent-key default, so those assertions are falsifiable.

### File: `frontend/src/app/core/services/selection-store.spec.ts`

#### Tests: all 6 audited
* **Existing Assertion:** keys `wl.sel.postRaid`/`wl.sel.preFight` with exact JSON payloads `{playerName}`/`{spec}`, reloaded on a fresh instance; null on empty; corrupt JSON -> null + warn; throwing storage -> no throw + warn.
* **User/Domain Expected Outcome:** the documented sticky state - post-raid player name and pre-fight spec, nothing else.
* **Correctness Status:** `VALID`
* **Analysis:** stored-bytes assertions make the round trips falsifiable (unlike the nav-store `false` case).

### File: `frontend/src/app/core/services/wowhead-tooltips.spec.ts`

#### Tests: all 6 audited
* **Existing Assertion:** config script injected first with `tooltips.js` deferred until the config loads; inject-once latch; script error -> warn; `refreshLinks` re-scans via `$WowheadPower` after load, is a no-op before ready, and coalesces a burst (4 requests -> exactly 1 call).
* **Correctness Status:** `VALID`
* **Analysis:** count-based assertions fail on re-append or uncoalesced implementations; the pre-ready no-op is genuinely exercised.

## Pre-fight

### File: `frontend/src/app/pages/pre-fight/encounter-selection.service.spec.ts`

#### Tests: all 7 audited
* **Existing Assertion:** `sample_count > 0` filter with the 0-out/1-in boundary; ingested order preserved; pass-through delegation and error propagation for the spec manifest and encounter index.
* **User/Domain Expected Outcome:** only benched encounters are selectable; ordering is the ingested order. (The current-expansion / `mythic+`/`torghast` exclusion filter is not this SUT - it lives in `ingest/wcl-mappers.ts` and is audited there.)
* **Correctness Status:** `VALID`
* **Analysis:** the strict `> 0` boundary is pinned on both sides.

### File: `frontend/src/app/pages/pre-fight/pre-fight.spec.ts`

#### Tests: all 2 audited
* **Existing Assertion:** encounter-gated cards close (`selectedEncId()` -> 0) on class change and on spec change.
* **User/Domain Expected Outcome:** changing class/spec must never leave a stale encounter's cards rendered against the new spec's data.
* **Correctness Status:** `VALID`
* **Analysis:** the assertions discriminate the `emitEvent` wiring: a missing reset or an auto-re-select regression yields the old encounter id and fails.

## Ingest pipeline

### File: `frontend/src/app/ingest/ingest-data-file-transport.spec.ts`

#### Tests: all 6 audited
* **Existing Assertion:** GET/PUT/DELETE against the exact file-server routes (verified against `scripts/ingest-server.js`); exact 404 -> missing; a future `INGEST_VERSION` stamp -> permanent; directory listing pass-through.
* **Correctness Status:** `VALID`
* **Analysis:** endpoint URLs and methods are pinned with literals matching the server's actual route table, not just flushed blindly.

### File: `frontend/src/app/ingest/wcl-mappers.spec.ts`

#### Tests: all 10 audited
* **Existing Assertion:** first-expansion-only filtering, `beta`/`ptr` name exclusion, partitions sorted descending, frozen zones dropped even when no name pattern matches, zoneId grouping, prune-protection id set, folder key composition (`spec.slug + class.slug`), formulaic class icon, spec icon left `''` for the orchestrator, `[className, specName]` projection.
* **User/Domain Expected Outcome:** the documented encounter-selection rules (current expansion = first in WCL's newest-first response; exclusions) and the spec-universe mapping from `gameData.classes`.
* **Correctness Status:** `VALID`
* **Analysis:** fixtures include a second expansion, name-excluded and frozen zones, and the assertions pin which survive - the filter is falsifiable in both directions.

### File: `frontend/src/app/ingest/wcl-fetchers.spec.ts`

#### Test: `tries partitions newest-first and falls back when one is empty` (line 128)
* **Existing Assertion:** `const ranked = await getRankingsLite(client, 'SubtletyRogue', 100, SPEC_WCL, 10, [3, 2]); expect(ranked).toHaveLength(1); expect(ranked[0].player).toBe('A');` with the fake returning `[]` for `partition === 3` and a ranking for anything else.
* **User/Domain Expected Outcome:** the SUT (`wcl-fetchers.ts:86-94`) must try the partitions in the given newest-first order, sending the partition variable on each try: `query(partition: 3)` -> empty -> `query(partition: 2)` -> ranked.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the fake returns the ranking for ANY partition value other than 3 - including `undefined`. A mutant iterating `[2, 3]` (reversed) returns the ranking on its first try and passes; a mutant that never sets `variables.partition` at all also passes (`undefined !== 3`). Only "give up after the first empty attempt" can fail, so of the two behaviors the name claims, the fallback is verified and the newest-first order is not.
* **Recommended Assertion:** capture the queried partitions in the fake (`queried.push((vars as { partition?: number }).partition)`) and add `expect(queried).toEqual([3, 2]);`.

#### Tests: remaining 7 audited
* **Existing Assertion:** live-zone keep/drop matrix; one probe per live zone (call count 5 recomputed); `BudgetExceededError` propagates; anonymized-only zones dropped via the real `/^Character \d+-\d+$/` pattern; liveness threshold strict below; unknown spec throws; string-blob `characterRankings` parsed.
* **Correctness Status:** `VALID`
* **Analysis:** call counts discriminate per-spec and per-encounter probing bugs; the anonymization fixture matches the real WCL wire pattern.

### File: `frontend/src/app/ingest/ordering.spec.ts`

#### Test: `caps a run at ten specs` (line 75)
* **Existing Assertion:** `expect(SPEC_LIMIT).toBe(10);`
* **User/Domain Expected Outcome:** an ingest run processes at most ten specs - behavior implemented by `orderedSpecsFromDisk`'s `slice(0, SPEC_LIMIT)` in `ingest-orchestrator.service.ts:239`, not by anything in `ordering.ts` (which only exports the constant, `ordering.ts:14`).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the assertion restates a constant's literal value. No capping behavior is exercised: `orderSpecsByVersion` happily returns 11+ specs and this test stays green; deleting the orchestrator's `slice` breaks the documented cap with the whole suite passing. A constant self-pin is a change detector on a number, not a validation of domain behavior.
* **Recommended Assertion:** exercise the cap where it lives - drive `orderedSpecsFromDisk` with `SPEC_LIMIT + 1` rulebook-bearing specs against a fake `DataFileApiService` and assert the returned work list has length `SPEC_LIMIT`; delete the constant pin.

#### Tests: remaining 11 audited
* **Existing Assertion:** empty-first / old-version / current-version bracket order; injected-random-key order within a bracket; priority spec first within its bracket only; input not mutated; encounters-missing-slice first with stable order within groups.
* **Correctness Status:** `VALID`
* **Analysis:** all orderings recomputed against the documented work-ordering policy; the priority-vs-bracket precedence is discriminated.

### File: `frontend/src/app/ingest/signature.spec.ts`

#### Tests: all 37 audited
* **Existing Assertion:** 16-char lowercase hex stamp format; order-independent parse-set fingerprint; signature changes on parse-set or `INGEST_VERSION` change; inaccessible-set exclusion (filter-before-slice with backfill, strict top-N boundary, permission-code mapping, transient failures excluded without persisting); `versionIsFuture` strict `>`; stamp round-trips without mutation; stamp-only-when-every-slice-produced (missing is not a failure); the documented cheap-check residual.
* **User/Domain Expected Outcome:** the signature-skip contract: identical healthy inputs never re-ingest; any change to the used top-N parse identity, the version, or accessibility does.
* **Correctness Status:** `VALID`
* **Analysis:** the two-call stability/inequality tests are the legitimate pattern for a fingerprint (the contract is stability, not a pinned hash); the invalidation levers (version bump, parse churn inside the used window) are each exercised with explicit expected key-sets, and slice-then-filter vs filter-then-slice is explicitly discriminated.

### File: `frontend/src/app/ingest/ingest-orchestrator.service.spec.ts`

#### Tests: all 2 audited
* **Existing Assertion:** budget exhaustion at discovery -> clean `budgetStopped` summary (no fatal, no failed specs); any non-budget error -> null so it propagates to the fatal handler.
* **Correctness Status:** `VALID`
* **Analysis:** the `instanceof` gate is discriminated with both error types.

## Shared analysis math and fixture builders

### File: `frontend/src/app/shared/analysis/analysis-math.spec.ts`

#### Test: `sortBySeverity > orders critical first and success last, stable for equal ranks` (line 123)
* **Existing Assertion:** fixture `[{severity:'success'},{severity:'info'},{severity:'critical'}]`; `expect(findings.map(f => f.severity)).toEqual(['critical','info','success']);`
* **User/Domain Expected Outcome:** `SEVERITY_ORDER` ranks `{critical: 0, warning: 1, info: 2, hold_suggestion: 2, success: 3}` (`analysis-math.ts:85-87`) - the designed behavior includes the `info`/`hold_suggestion` tie at rank 2 and stable order for equal ranks, which the SUT doc comment and the test name both promise.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the fixture's ranks (3/2/0) are all distinct - no comparator tie ever occurs, so the "stable for equal ranks" clause is vacuously untested: re-ranking `hold_suggestion` to sort after `success`, or an unstable sort for ties, passes. The gross critical-before-info-before-success ordering IS genuinely verified; the flagged defect is the tie half of the claim.
* **Recommended Assertion:**
  ```ts
  const findings = [
    { severity: 'success' }, { severity: 'info', category: 'first' },
    { severity: 'hold_suggestion', category: 'second' }, { severity: 'critical' },
  ] as AnalysisFinding[];
  sortBySeverity(findings);
  expect(findings.map(f => `${f.severity}:${f.category ?? ''}`))
    .toEqual(['critical:', 'info:first', 'hold_suggestion:second', 'success:']);
  ```

#### Tests: remaining 19 audited
* **Existing Assertion:** `round` (1.249 -> 1.2; 1.2349@3 -> 1.235, both float-exact); `getOrInsert` identity + factory-not-recalled; `groupByTime` greedy median traces (0/4/6 merge, 20 splits); `isOutlierAbove`/`Beyond`/`Below` with strict boundaries on both sides including explicit sigma; `castEfficiencyPct` 80 exact + clamp at 0; `closestToZero` reduce + 0 on empty; `benchExpectedUses` `round(2 x 2) = 4`, floor clamped at 0; `fmtClock` 65 -> `'01:05'`.
* **Correctness Status:** `VALID`
* **Analysis:** every numeric recomputed by hand and node-checked for float drift; the strict at-the-boundary non-triggers match the documented convention (a value exactly at mean + 2 sigma is not an outlier).

### File: `frontend/src/app/shared/analysis/wcl-projections.spec.ts`

#### Test: `normalizeAbilityId > maps the WCL melee event id ... to Auto Attack` (line 125)
* **Existing Assertion:** `expect(normalizeAbilityId(WCL_MELEE_EVENT_ABILITY_ID)).toBe(WOW_AUTO_ATTACK_SPELL_ID);`
* **User/Domain Expected Outcome:** `normalizeAbilityId(1) === 6603`. Both values are externally fixed wire/game contracts: WCL reports physical auto-attacks as event ability id `1`, and the real Auto Attack game spell is `6603` (documented in the warcraft-wcl-data skill and in the SUT's own comments).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** both sides of the assertion are the SUT's own exported constants (`wcl-projections.ts:17-18`), so the test verifies only that the branch dispatches one constant to the other. Editing either constant (melee id to 2, or the fallback spell to 999) - which silently breaks the wire contract in production - keeps this test green. Externally-fixed values must be pinned with independent literals.
* **Recommended Assertion:** `expect(normalizeAbilityId(1)).toBe(6603); // WCL wire: melee event ability id; the real Auto Attack spell`

#### Tests: remaining 16 audited
* **Existing Assertion:** `unwrapRankings` string/object/null/unparseable arms; `toParseRankings` count cap, anonymized-name drop (`/^Character \d+-\d+$/`, regex-verified), no-code drop; `abilityIcons` case-insensitive `.jpg` strip, null entries skipped, null icon -> `''`; `windowSpells` known/unknown ids + repro warn.
* **Correctness Status:** `VALID`
* **Analysis:** the negative-id fold test uses independent input literals (-32, -5), so the branch is falsifiable; expected projections are hand-written objects, not SUT output.

### File: `frontend/src/testing/builders/events.spec.ts`

#### Test: `buffWindow > forwards the target to both edge events` (line 101)
* **Existing Assertion:** `for (const edge of buffWindow(FEINT, FROM_S, TO_S, { target: PLAYER_ID })) { expect(edge).toMatchObject({ sourceID: PLAYER_ID, targetID: PLAYER_ID }); }`
* **User/Domain Expected Outcome:** the with-opts call returns exactly two events (applybuff + removebuff), each carrying `sourceID === targetID === PLAYER_ID` per the self-buff contract.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the loop asserts nothing if the iterable is empty: a regression in the opts path that returned `[]` (or one event) passes with zero (or one) assertions executed. The pair count is pinned only for the no-opts call (line 95), so this test's own claim ("both edge events") is unfalsifiable. Low severity - the current SUT trivially returns the pair - but a vacuous-pass hazard in the fixture layer every slice depends on.
* **Recommended Assertion:**
  ```ts
  const edges = buffWindow(FEINT, FROM_S, TO_S, { target: PLAYER_ID });
  expect(edges).toHaveLength(2);
  for (const edge of edges) expect(edge).toMatchObject({ sourceID: PLAYER_ID, targetID: PLAYER_ID });
  ```

#### Tests: remaining 25 audited (rows of the `it.each` tables counted individually)
* **Existing Assertion:** seconds-to-ms stamps (0 / 15 -> 15000 / 90.5 -> 90500, all float-exact); wire `type` strings (`cast`/`applybuff`/`removebuff`/`damage`, with `damageTaken` also `damage` - matching what the analysis filters on); omitted opts leave fields ABSENT (`not.toHaveProperty`, which fails on present-but-undefined); cast/damage actor combinations; self-buff sets both actor ids; `damageTaken` sets the attacker and never a target; absorbed passed through.
* **Correctness Status:** `VALID`
* **Analysis:** the builder contract from the testing skill is pinned clause by clause; `not.toHaveProperty` is the correct absent-vs-undefined discriminator.

## Shared components

### File: `frontend/src/app/shared/components/bench-empty-banner/bench-empty-banner.spec.ts`

#### Test: `uses the post-raid copy by default (Comparisons unlock)` (line 32)
* **Existing Assertion:** `const text = render({ encounter: 'Boss', variant: 'post' }); expect(text).toContain('Comparisons unlock'); ...`
* **User/Domain Expected Outcome:** an omitted `variant` input renders the post-raid copy, because the declared input default is `'post'` (`bench-empty-banner.ts:21`). That default is the contract the test name claims.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the setup passes `variant: 'post'` explicitly, so only the explicit-post branch is exercised; changing the declared default to `'pre'` keeps this test (and the whole file - the other omitted-variant tests assert only variant-independent copy) green. The "by default" clause is unfalsifiable as written.
* **Recommended Assertion:** `const text = render({ encounter: 'Boss' }); expect(text).toContain('Comparisons unlock');` (omit the variant so the declared default is what renders)

#### Tests: remaining 3 audited
* **Existing Assertion:** encounter name interpolated in the headline; the ingest-steps copy present; the pre variant renders the pre-fight copy.
* **Correctness Status:** `VALID`
* **Analysis:** the pre-variant test genuinely selects the `@if (variant() === 'pre')` branch.

### File: `frontend/src/app/shared/components/collapsible-text/collapsible-text.spec.ts`

#### Tests: all 2 audited
* **Existing Assertion:** starts collapsed (`signal(false)`); `toggle()` flips both ways.
* **Correctness Status:** `VALID`
* **Analysis:** both transitions asserted, not just one.

### File: `frontend/src/app/shared/components/compact-ability-row/compact-ability-row.spec.ts`

#### Tests: all 14 audited
* **Existing Assertion:** damage rows: +50 -> success, -40 -> critical (beyond 10% of topAvg), -8 -> warning (within 10%), sign inversion for lower-is-better in both directions, null player -> critical, null topAvg -> muted; cast rows: at/above top -> success, deficit 1 -> warning, deficit 2 -> critical, null top -> muted; passive normalization both ways.
* **Correctness Status:** `VALID`
* **Analysis:** all gap arithmetic and band boundaries recomputed; the lower-is-better inversion is discriminated with both good and bad directions.

### File: `frontend/src/app/shared/components/finding-table/finding-table.utils.spec.ts`

#### Test: `routes rule_violation to ruleFindings when collectRules is true` (line 58)
* **Existing Assertion:** `const finding = f('warning', 'rule_violation'); ... expect(entries).toHaveLength(0); expect(ruleFindings).toHaveLength(1);`
* **User/Domain Expected Outcome:** the documented routing (`finding-table.utils.ts:97-98`): with `collectRules`, findings with category `rule_violation` OR no `cd_name` are peeled into `ruleFindings`. A `rule_violation` must route by its CATEGORY - including when it carries a `cd_name`.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the fixture omits `cd_name`, so the routing succeeds through the `!finding.cd_name` disjunct (`finding-table.utils.ts:119`) regardless of category; deleting `finding.category === 'rule_violation'` from the SUT keeps this test green. No test in the file exercises the only case that isolates the category clause (rule_violation WITH a `cd_name` under `collectRules: true` - line 66 has the cd_name but `collectRules: false`, line 74 has no cd_name and a non-rule category), so this test duplicates line 74's coverage instead of testing what it names.
* **Recommended Assertion:** `const finding = f('warning', 'rule_violation', 'Shadow Blades'); const { entries, ruleFindings } = bucketFindings([finding], { spellId, icon, collectRules: true }); expect(entries).toHaveLength(0); expect(ruleFindings).toHaveLength(1);`

#### Tests: remaining 16 audited
* **Existing Assertion:** cd_name bucketing with `hasCritical`/`hasIssue` rollups; `hold_suggestion` routed by `details.cd_name` (discriminated by the `'1 hold'` metaItem only the holds path emits); collectRules-false keeps rule findings as entries; metaItem dedupe; `'2 holds'` pluralization; unknown-cooldown routing + repro warn; row generation with the `hasIssue` gate, `'-'` placeholder, severity-to-state ternary; on-plan filter and complement.
* **Correctness Status:** `VALID`
* **Analysis:** the hold-vs-issue routing is discriminated by output the wrong path cannot produce.

### File: `frontend/src/app/shared/components/window-comparison/window-comparison.spec.ts`

#### Test: `exposes the showCasts input value` (line 209)
* **Existing Assertion:** `const { vm } = mountVm(WindowComparisonComponent, { windows: [], showCasts: false }); expect((vm['showCasts'] as () => boolean)()).toBe(false);`
* **User/Domain Expected Outcome:** none beyond Angular's own `input()` plumbing - the component's TypeScript never reads `showCasts` (`window-comparison.ts:31` declares it; only the template forwards it).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the test writes an input via `setInput` and reads the same signal back; no component logic participates, so no SUT defect can make it fail - it verifies the framework, not the component. The sibling `defaults showCasts to true` (line 214) IS meaningful (it pins the declared default callers rely on).
* **Recommended Assertion:** delete this test; keep the default-value test.

#### Tests: remaining 26 audited
* **Existing Assertion:** overview scale = max over `topAvg`/`topMax`/`playerPct` (300 recomputed; `topMin` correctly excluded), null/NaN filtered, 0.01 floor; signed gap exact; worst-window pick by min ratio (higher-is-better) / max ratio (lower-is-better) with muted/no-data skips and 0 fallback; manual selection overriding auto; `linkedSignal` dropping a stale manual pick on windows swap; info-treated-as-muted; detail-row sorts in both directions incl. null-player ranking by top damage; gap slots `floor(pause/20)` with the inclusive boundary, uncapped; interleaving; empty contract.
* **Correctness Status:** `VALID`
* **Analysis:** every scale/ratio/sort recomputed from the fixtures; both boundary sides of the gap-slot arithmetic exercised.

### File: `frontend/src/app/shared/gear/gear-comparison.spec.ts`

#### Tests: all 22 audited
* **Existing Assertion:** enchant rows: slot 15 = Main Hand (positional map), `Enchant #id` fallback for the never-populated wire name, < 40% excluded and exactly 40% included (the documented `>= 40%` pre-fight consensus boundary pinned on both sides), slot-number sort; trinket rows: two distinct most-used merged across slots 12/13 (40+30=70 vs 30+25=55 recomputed), dominance dedupe, swapped-slot acceptance via set match, per-slot switch/suggest/info notes, duplicate-worn handling; player-enchant checks: 90 >= 70 warns, on-plan ok, no-bench player enchant ok.
* **User/Domain Expected Outcome:** the documented gear consensus (pre-fight >= 40% enchant consensus; post-raid missing-enchant warning at >= 70%; two distinct trinkets merged across slots 12/13).
* **Correctness Status:** `VALID`
* **Analysis:** all consensus fractions recomputed; the 40% boundary is pinned exactly. (Missing-test note, outside this audit's scope: no test sits exactly at the 70% warning boundary - 90 is the only consensus exercised against it.)

## Pipes

### File: `frontend/src/app/shared/pipes/boss-icon-pipe.spec.ts`

#### Tests: all 6 audited
* **Existing Assertion:** null/undefined/0 (the trash-fight encounter id) -> `''`; 3176 -> the exact rpglogs boss-icon URL; negative and non-integer ids -> `''`.
* **Correctness Status:** `VALID`
* **Analysis:** the URL literal matches the external rpglogs convention and the CSP img-src allowlist; guard boundaries (`<= 0`, `Number.isInteger`) node-verified.

### File: `frontend/src/app/shared/pipes/class-icon-pipe.spec.ts` / `spec-icon-pipe.spec.ts`

#### Tests: all 5 + 5 audited
* **Existing Assertion:** falsy/unknown -> `''`; known class/spec -> the exact zamimg URL (`class_rogue.jpg` / `ability_stealth.jpg`) after `hydrateSpecMeta` seeding.
* **Correctness Status:** `VALID`
* **Analysis:** expected URLs are independent literals matching the real zamimg scheme; the unknown-after-hydration cases prove the seeding is load-bearing rather than decorative.

### File: `frontend/src/app/shared/pipes/format-duration-pipe.spec.ts`

#### Tests: all 11 audited
* **Existing Assertion:** null/undefined -> `'-'`; 0 -> `'0:00'`; 65 -> `'1:05'`; 3661 -> `'61:01'` (no hour capping by design); 9.9 floored; negative times keep the sign (`-1 -> '-0:01'`, `-71 -> '-1:11'`); NaN -> `'0:00'`.
* **Correctness Status:** `VALID`
* **Analysis:** every string recomputed (floor-vs-round and `NaN == null` semantics node-checked); the pre-pull negative-time convention is the pipe's documented intent.

### File: `frontend/src/app/shared/pipes/format-spec-pipe.spec.ts`

#### Tests: all 7 audited
* **Existing Assertion:** falsy -> `''`; `SubtletyRogue -> 'Subtlety Rogue'`; `BeastMasteryHunter -> 'Beast Mastery Hunter'`; `FrostDeathKnight -> 'Frost Death Knight'`.
* **Correctness Status:** `VALID`
* **Analysis:** matches the documented WCL compound-name display convention; regex + trim behavior node-verified.

### File: `frontend/src/app/shared/pipes/format-damage-pipe.spec.ts`

#### Tests: all 10 audited
* **Existing Assertion:** null/undefined -> `''`; 0 -> `'0'` (a real measurement); 999 -> `'999'`; 1000 -> `'1K'` (exact boundary); 8500 -> `'9K'` (half-up); 999999 -> `'1.0M'` (never `'1000K'` - the promotion guard); 1240000 -> `'1.2M'`.
* **Correctness Status:** `VALID`
* **Analysis:** the 999999 case is the load-bearing one (it fails without the promotion guard) and its arithmetic was node-verified (`Math.round(999.999) = 1000`, `toFixed` behavior).

### File: `frontend/src/app/shared/pipes/signed-percent-pipe.spec.ts`

#### Tests: all 12 audited
* **Existing Assertion:** input contract is WHOLE percent (confirmed at the only consumer, which multiplies by 100 before piping); null/undefined/NaN/Infinity -> `''`; 0 -> `'0%'`; +12 -> `'+12%'`; rounding both directions; -0.4 -> `'0%'` (never `'-0%'`); 0.6 -> `'+1%'`.
* **Correctness Status:** `VALID`
* **Analysis:** the `-0` stringification and half-toward-positive-infinity rounding were node-verified; the fraction-vs-percent ambiguity was resolved against the consumer call site rather than assumed.

## Rotation slice

### File: `frontend/src/app/pages/post-raid/rotation/rotation-transform.service.spec.ts`

#### Test: `buildCdBenchmark > rolls first cast, gaps, BL offset and uses/min across parses` (line 110)
* **Existing Assertion:** `expect(bench.uses_per_min.avg).toBeGreaterThan(0);` (line 121); no gap field asserted anywhere in the test.
* **User/Domain Expected Outcome:** each fixture parse has 2 casts over a 120 s fight -> `2/120 x 60 = 1.000` uses/min exactly, so `uses_per_min.avg` must be exactly `1`; pooled gaps are `[95-5, 97-7] = [90, 90]` -> `avg_gap_s = 90`, `stddev_gap_s = 0`. `uses_per_min` feeds `benchExpectedUses`, the input to the lost-cast critical - the flagship finding.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** `toBeGreaterThan(0)` passes for any positive wrong normalization: per-second (0.017), missing `x60`, inverted ratio (60). This is the only test in the suite that touches `benchUsesPerMin` output (the feature-service specs construct `cdBench` fixtures directly, and the transform end-to-end test never asserts `uses_per_min`), so the per-minute conversion behind expected-cast counts is unpinned suite-wide. Additionally the title promises gap rolling, and no gap statistic is asserted.
* **Recommended Assertion:** `expect(bench.uses_per_min.avg).toBe(1); expect(bench.avg_gap_s).toBe(90); expect(bench.stddev_gap_s).toBe(0);`

#### Test: `computeEfficiencyThresholds > derives a p90 downtime floor and per-parse efficiency mean` (line 190)
* **Existing Assertion:** `expect(result.downtimeThresholdMs).toBeGreaterThan(0); expect(result.topAvgEfficiency).toBeGreaterThan(0); expect(result.topAvgEfficiency).toBeLessThanOrEqual(100);`
* **User/Domain Expected Outcome:** for pooled gaps `[500, 600, 700, 5000]` at `DOWNTIME_PERCENTILE = 0.9`, the d3 R-7 quantile is `h = 3 x 0.9 = 2.7 -> 700 + 0.7 x (5000 - 700) = 3710` ms; downtime = gaps strictly above the floor = 5000 ms = 5 s over the 100 s duration -> `topAvgEfficiency = (1 - 5/100) x 100 = 95`.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the three range assertions cannot fail under a wrong percentile (p50 gives 650 ms and 94.3% - still `> 0` and `<= 100`), a downtime sum wrongly including sub-threshold gaps (93.2% - still passes), or a fallback bug (the 1500 ms default is `> 0`). This is the only coverage of `DOWNTIME_PERCENTILE` anywhere - the documented p90 downtime floor is unpinned suite-wide while exact expected values are derivable.
* **Recommended Assertion:** `expect(result.downtimeThresholdMs).toBe(3710); expect(result.topAvgEfficiency).toBe(95);`

#### Tests: remaining 24 audited
* **Existing Assertion:** BL window alignment and offset; held-cast detection strictly above 8 s past prior cast + cooldown (with a float-safe just-above case and the exact-8 non-trigger); cascade-free prior-relative holds with 1-based `cast_index`; sorted gap list; `used_sample_count` = parses with at least one use; the only-nullable-fields contract (`avg_gap_s`/BL fields null, `bl_pct` 0); `majority_hold` inclusive at exactly 5 of 10 and cleared at 4; hold-target consensus over the TOTAL parse denominator with `max(2, ...)`; band floored at `HOLD_BAND_MIN_S` when deviation is 0; the 1500 ms default floor fallback; per-name aggregation; end-to-end bench from factory-built streams recomputed; backfill past a private parse to exactly `TOP_PARSE_COUNT`; missing when the rulebook has no cooldowns.
* **Correctness Status:** `VALID`
* **Analysis:** every boundary the architecture doc names is pinned strictly and on both sides, except the two flagged above.

### File: `frontend/src/app/pages/post-raid/rotation/rotation.service.spec.ts`

#### Test: `checkCastEfficiency > does not flag efficiency within 1 sigma of the top average` (line 370)
* **Existing Assertion:** `expect(WARN_THRESHOLD_PCT).toBeLessThan(TOP_AVG_PCT);` (line 372) and `expect(checkCastEfficiency([0, IDLE_AT_TOP_AVG_S * ONE_SEC_MS], FIGHT_DUR_S, bench())).toBeNull();` (line 373)
* **User/Domain Expected Outcome:** the documented band: warn only when strictly MORE than 1 sigma below the top average (`90 - 1 x 3 = 87%`; exactly 87% must NOT warn). A boundary pair should bracket 87%, per the project's own pair-with-the-boundary convention that every other check in this file follows.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** line 372 compares two spec-local constants (87 < 90) - it can never fail from any SUT change. Line 373's fixture is 12 s idle -> exactly 90% = the top average, a full sigma ABOVE the boundary; combined with the fire case at 83.33%, the boundary is bracketed only by [83.33, 90], so a 1.5-sigma or 2-sigma multiplier, or a non-strict `<=`, passes every efficiency test in both rotation spec files. The sigma multiplier and the strictness - the two things the contract specifies - are both unpinned. (This is the one boundary check in the file that does not sit at its boundary; `checkGaps`, first-cast, holds, and BL all pin theirs exactly.)
* **Recommended Assertion:** use binary-exact numbers so the boundary is float-safe: `expect(checkCastEfficiency([0, 32 * ONE_SEC_MS], 128, bench({ top_avg_efficiency: 80, top_efficiency_stddev: 5 }))).toBeNull(); // exactly 75 = top - 1 sigma` and `expect(checkCastEfficiency([0, 33 * ONE_SEC_MS], 128, bench({ top_avg_efficiency: 80, top_efficiency_stddev: 5 }))).not.toBeNull(); // 74.22, just below`

#### Tests: remaining 66 audited
* **Existing Assertion:** rule engine pair/hold windows with 1-based anchor handling; `rulesFollowed` applicability gates; lost-cooldown critical from `benchExpectedUses`; late-opener strictly above `avg + 2 sigma` with the exact-boundary non-trigger; BL alignment gated by measured `bl_pct >= 50` pinned at 50 on / 49 off, explicitly contradicting the rulebook flag both ways; in-window BL offset 2-sigma boundary both sides, judged cast = closest-to-zero offset; gap checks strict at exactly `avg + 2 sigma`; hold suggestions fire only strictly below `delay_s - band_s` with the exact-edge non-trigger and over-hold tolerance; efficiency never-critical and beats-top-never-fires; use-share gate suppressing lost + first-cast checks at 0.2 < 0.5; talent-gated skip; bucketing/partition routing discriminated by output only the right path emits; `buildCdPlan` ordering, per-use nulling under the gate, BL badge; feature-service missing/transient propagation and end-to-end on-plan chip.
* **Correctness Status:** `VALID`
* **Analysis:** the threshold table from the architecture doc is pinned line by line with strict boundaries on both sides; fixture arithmetic recomputed throughout.

## Burst slice

### File: `frontend/src/app/pages/post-raid/burst-windows/burst-transform.service.spec.ts`

#### Test: `ranks abilities by window damage, counts casts by name, and flags passive abilities` (line 155)
* **Existing Assertion:** `expect(breakdown).toEqual([{ spell_id: EVISCERATE, damage: EVIS_DMG, casts: 1, is_passive: false }, { spell_id: BLACK_POWDER, damage: BP_DMG, casts: 0, is_passive: true }]);`
* **User/Domain Expected Outcome:** cast counts are keyed by ability NAME because a WCL damage event's ability id differs from its cast id (the documented `SHADOW_BLADES` 121471 cast / `SHADOW_BLADES_DAMAGE` 279043 quirk); the SUT builds `castsByName` and looks up `nameOf(spell_id)` (`burst-transform.service.ts:159-169`).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** in the fixture the cast id equals the damage id (both `EVISCERATE`), so a mutant that counts casts by id (Map keyed on `abilityId`, looked up by `spell_id`) produces the identical `[1, 0]`; the by-name bridge the test names is undiscriminated. The passive flag and damage ranking are genuinely tested.
* **Recommended Assertion:** add a case where `nameOf` maps both `SHADOW_BLADES` and `SHADOW_BLADES_DAMAGE` to `'Shadow Blades'`, damage lands on `SHADOW_BLADES_DAMAGE`, casts land on `SHADOW_BLADES`, and `expect(breakdown[0]).toMatchObject({ spell_id: SHADOW_BLADES_DAMAGE, casts: 1 })`.

#### Test: `detects and measures a damage-density burst as a single window` (line 198)
* **Existing Assertion:** `expect(windows[0]).toMatchObject({ time_s: 10, window_length_s: 4, window_damage: 4 * BIN_DAMAGE });`
* **User/Domain Expected Outcome:** `window_damage` is the sum of `amount + absorbed` per hit (`burst-transform.service.ts:190-192`); an absorbed-only hit must survive the `> 0` filter and count.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the current numeric result is exact (dense bins trimmed to `{10,13}`, half-open `[10000,14000)` sums `4 x 1000`), but no `damage()` call anywhere in the file passes `absorbed`, so deleting `+ (event.absorbed ?? 0)` from both the filter and the map passes all 47 tests. The amount-plus-absorbed definition is unvalidated on the burst side (same class of gap as the defensive slice).
* **Recommended Assertion:** build the burst with one shielded hit, e.g. `damage(SHADOW_BLADES_DAMAGE, 10, BIN_DAMAGE - 400, { absorbed: 400 })`, keeping `window_damage: 4 * BIN_DAMAGE`.

#### Test: `keeps a dense window at or above the significance share of fight damage` (line 253)
* **Existing Assertion:** `expect(windows.some(w => w.time_s === 10 && w.window_damage === significantDamage)).toBe(true);`
* **User/Domain Expected Outcome:** the significance drop is strict `<` (`burst-transform.service.ts:231`), so a window at exactly `SIGNIFICANCE_PCT` is KEPT - the "at" the test name promises.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the fixture is `600/10600 = 5.66%`, 3.8x the 1.5% boundary, and the paired drop test is `0.99%` - both far from the edge, so mutating `<` to `<=` (dropping the exactly-at window) passes both. This violates the project's mandatory at-the-boundary pairing convention. A float-exact boundary fixture is constructible (spike 150 in a 1000-bin fight -> `150/10000 = 0.015` exactly).
* **Recommended Assertion:** `const windows = scanWindows([damage(EVISCERATE, 10, 150), damage(BLACK_POWDER, 500, 9850)], 1_000_000); expect(windows.some(w => w.time_s === 10 && w.window_damage === 150)).toBe(true);`

#### Tests: `counts a killing-blow hit at exactly fight end in the fight-closing window` (line 272) and `keeps a last-bin-only window whose only damage is a killing blow at exact fight end` (line 281)
* **Existing Assertion:** `expect(closing?.window_damage).toBe(4 * BIN_DAMAGE + KILLING_BLOW_DMG);` and `expect(closing?.window_damage).toBe(KILLING_BLOW_DMG);`
* **User/Domain Expected Outcome:** the documented burst contract (warcraft-architecture skill) states `window_damage` is measured over the **half-open** `[start, end)` with no exception; under that a hit at exactly `endMs` is excluded, making the first expected value `4000` (not `9000`) and the second window nonexistent.
* **Correctness Status:** `VALID` (assertion pins intentional behavior) - but flags a **doc/code contract mismatch that must be reconciled**.
* **Analysis:** the SUT deliberately makes the **fight-closing** window end-inclusive (`closesFight ? hit[0] <= endMs : hit[0] < endMs`, `burst-transform.service.ts:227-229`) with a source comment: `bucketDamagePerBin` clamps the fight-end killing blow into the last bin, so excluding it at the window layer would drop real, already-binned damage. Recomputing the SUT gives exactly the asserted 9000 and 2000, and a mutant that forced unconditional half-open (`hit[0] < endMs` always) would exclude the killing blow and fail both assertions - so the tests do genuinely discriminate this boundary. This is the more domain-correct behavior (a killing blow is real burst damage), so the assertions are not wrong. The skill doc, however, is not merely silent on the exception - it is imprecise and internally inconsistent: the per-parse step (warcraft-architecture SKILL.md line 165) states half-open `[start, end)`, while a later line (188) already notes "the per-parse bench span counts damage on an inclusive end", and neither line documents the rule the code actually implements (interior windows half-open, the fight-closing window inclusive). The test is faithful to the code; the **documentation is incomplete and self-contradictory**. This is the one substantive code/contract divergence the audit surfaced, and it is a doc defect, not a test-assertion defect.
* **Recommended Action:** amend the burst-window definition in the warcraft-architecture skill to document the fight-closing inclusive end (after which these two assertions stand as correct); do NOT change the assertions to strict half-open, which would canonize dropping the killing blow.

#### Test: `emits a cluster present in enough parses, with common cds + ability stats` (line 331)
* **Existing Assertion:** `expect(out[0]).toMatchObject({ time_s: 10.5, common_cds: ['Shadow Blades'], dmg_avg: BIN_DAMAGE, window_length_s: 6 });`
* **User/Domain Expected Outcome:** `time_s` is the MEDIAN of member `time_s` and `window_length_s` is the MEAN of member lengths (`burst-transform.service.ts:305,311`); `dmg_stddev`/`dmg_min`/`dmg_max` are part of the documented absolute-damage stat block.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** both members have `window_length_s = 6` (mean = median = min = max = first) and times `[10, 11]` (median 10.5 = mean 10.5), so the asserted values hold under any aggregate: mutating `mean` to `max`/`min`/`first`, or `median` to `mean`, passes. `dmg_stddev`/`dmg_min`/`dmg_max` are asserted nowhere in the file even though the sibling dedupe fixture makes them exactly derivable (damages `[900, 700]` -> min 700, max 900, sample stddev `sqrt(20000) = 141`).
* **Recommended Assertion:** give members differing lengths and 3 skewed times (lengths `[4, 5, 9]` -> 6 only under mean; times `[10, 11, 14]` -> 11 only under median), and add `expect(out[0]).toMatchObject({ dmg_min: 700, dmg_max: 900, dmg_stddev: 141 });`.

#### Test: `drops a cluster present in fewer parses than the consensus floor` (line 348)
* **Existing Assertion:** `expect(clusterParseWindows(three, 10)).toHaveLength(0);`
* **User/Domain Expected Outcome:** the consensus gate is `max(2, CLUSTER_MIN_FRAC x samples)` (`burst-transform.service.ts:269`); the absolute-2 floor exists so a single parse is never "consensus" at small sample counts (where the fraction alone would fall below 2).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** across every cluster fixture in the file (floors 4/2.4/2 against member counts 3/2/2/2/4), `max(2, frac)` and plain `frac` produce identical keep/drop outcomes, so deleting the `max(2, ...)` passes all 47 tests. The absolute-2 arm is never discriminated.
* **Recommended Assertion:** add `expect(clusterParseWindows([window(10)], 2)).toHaveLength(0); // single parse: frac arm 0.8 would wrongly keep it; the 2-floor drops it`.

#### Test: `gates and counts clustered abilities by distinct parses (1 of 4 does not surface)` (line 397)
* **Existing Assertion:** `expect(out[0].ability_breakdown).toHaveLength(1); expect(out[0].ability_breakdown[0]).toMatchObject({ spell_id: SHADOW_BLADES_DAMAGE, count: 4 });`
* **User/Domain Expected Outcome:** `MEMBER_MAJORITY_FRAC = 0.5` with `>=` means an ability or cd present in exactly half the members surfaces (2 of 4: `2 >= 2`); the same filter gates `common_cds`.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the fixtures only exercise 4/4 (kept) and 1/4 (dropped), and in every cluster fixture the cd `'Shadow Blades'` is in 100% of members, so mutating `>=` to strict `>` (an exactly-half ability/cd vanishing) fails no test, and the `common_cds` majority filter has no discriminating fixture at all.
* **Recommended Assertion:** add a 2-of-4 ability expecting `count: 2` in the breakdown, plus a cd in 2 of 4 members (expect present) and one in 1 of 4 (expect absent).

#### Tests: remaining 38 audited
* **Existing Assertion:** name-to-id mapping with falsy-id skip; per-cooldown cast collection in fight-relative seconds; bin bucketing with clamp; forward rolling sum with end truncation and the `rollBins === 1` identity; dense-run opening at strict `>=` threshold with the one-below non-trigger; gap bridging at exactly `mergeGapBins` and splitting at `+1`; run trimming to damage-carrying bins; half-open cast/hit exclusion at the window end with the just-inside inclusion; top-6 breakdown cap; synthetic-id folding; the density threshold `max(THRESHOLD_MULT x mean, RATE_QUANTILE quantile)` pinned exactly at 48 with the 47 non-trigger (machine-verified); significance drop below share; bridge/split of dense runs; distinct-parse consensus counting (windows vs parses) with the biggest-window-per-parse dedupe; the `MEMBER_MAJORITY_FRAC` floor at exactly 4 of 10; passive-only-when-every-member flag; end-to-end cluster bench with icon projection; backfill past a private parse to 10; missing on no cooldowns and error pass-through.
* **Correctness Status:** `VALID`
* **Analysis:** the per-parse window detection (binning, rolling, threshold, trim, half-open interior boundary) is pinned with strict boundary pairs and machine-verified arithmetic; the flagged gaps are confined to the absorbed term, the cluster-aggregate discrimination, and three unpinned boundaries.

### File: `frontend/src/app/pages/post-raid/burst-windows/burst.service.spec.ts`

#### Test: `below avg band -> warn` (the `it.each` at lines 27-35)
* **Existing Assertion:** `expect(burstWindowStatus(player, 1000, 800, 100, notReached)).toEqual({ status, icon });` with rows at player damage 650/850/950/1000.
* **User/Domain Expected Outcome:** both band comparisons are strict `<` (`burst.service.ts:39-40`): with `topAvg 1000, topMin 800, stddev 100`, player damage exactly 700 is NOT bad (`700 < 700` false) -> warn, and exactly 900 is NOT warn -> good. The project convention hard-requires the at-boundary pair.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** all five rows are interior (650/850/950/1000), so mutating either `<` to `<=` misclassifies the edge damage and yet passes every row plus the bench-only test; the strict band edges the SUT (and the spec's own comment) define are unpinned.
* **Recommended Assertion:** add rows `{ player: 700, notReached: false, status: 'warn' }` and `{ player: 900, notReached: false, status: 'good' }`.

#### Test: `sums player damage inside the window and counts casts by ability name` (line 168)
* **Existing Assertion:** `expect(out[0].window_damage).toBe(1000); expect(out[0].ability_breakdown![0]).toMatchObject({ spell_id: SHADOW_BLADES_DAMAGE, damage: 1000 });`
* **User/Domain Expected Outcome:** the sum is `amount + absorbed` (`burst.service.ts:126-128`) and casts are counted by name so a damage row picks up casts made under a different id with the same name (SUT comment, lines 130-131).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the sum 1000 is correct, but no `expect` in the test touches `casts` despite the name, and with the fixture's names the breakdown row's `casts` is 0 (the two casts have no same-name damage row, and `toMatchObject` ignores the unasserted field); the only cast assertion in the file is a zero elsewhere. No fixture carries `absorbed` either. A mutant hard-coding `casts: 0`, or one dropping `+ (event.absorbed || 0)`, passes every test.
* **Recommended Assertion:** map both `SHADOW_BLADES_DAMAGE` and `SHADOW_BLADES` to `'Shadow Blades'`, give one hit an absorbed share, and assert `expect(out[0].ability_breakdown![0]).toMatchObject({ spell_id: SHADOW_BLADES_DAMAGE, damage: 1000, casts: 2 })`.

#### Tests: remaining 24 audited
* **Existing Assertion:** the window status matrix (not-reached/missing -> muted; far below min -> bad; within range -> good; bench-only -> neutral info overriding every other state); name-to-id routing with placeholder labels; the indexed clip key; player-damage join onto normalized melee/synthetic bench rows with `playerCasts` 0-vs-null discrimination; per-window player pairing with the detail join; passive detail flag; muted-and-null for an unreached window; the runtime half-open exclusion at exactly `time_s + length` pinned exactly; a low-ranked player ability surfacing through the join (a top-6 player cap would fail it); data-source error propagation; the missing-fight informational view; and the transient WCL-failure error (no silent bench-only fallback).
* **Correctness Status:** `VALID`
* **Analysis:** the runtime half-open boundary and the status matrix are pinned exactly; the melee/synthetic normalization join is recomputed.

## Defensive slice

### File: `frontend/src/app/pages/post-raid/defensive/defensive-transform.service.spec.ts`

#### Test: `findParseDefensiveWindows > slices damage taken by the buff span and picks the dominant enemy` (line 82)
* **Existing Assertion:** `expect(result[0]).toMatchObject({ defensive_name: 'Cloak of Shadows', spell_id: CLOAK_OF_SHADOWS, window_damage: 700, ref_game_id: BOSS_GAME_ID });`
* **User/Domain Expected Outcome:** window damage is `amount + absorbed` over the span with an INCLUSIVE end (the documented bench-side boundary), and `pct_of_total` = window damage / the parse's total damage taken (here `700/1699`).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the asserted 700 is correct for this fixture, but three contract clauses are undiscriminated: (1) no fixture event in the entire file carries `absorbed`, so deleting `+ (event.absorbed ?? 0)` from the damage projection (`defensive-transform.service.ts:193-195`) changes nothing; (2) no hit sits at the exact remove timestamp anywhere in the file, so flipping the documented inclusive `<= endTs` to `< endTs` also changes nothing (only the inclusive START is pinned, at line 106); (3) `pct_of_total` is never asserted in any test (it appears only as a fixture field in the clustering tests), leaving the parse-total denominator contract unvalidated. The assertion passes under three distinct contract violations.
* **Recommended Assertion:**
  ```ts
  damageTaken(BOSS_HIT, 12, 500, { source: BOSS_ACTOR, absorbed: 250 }),
  damageTaken(ADD_HIT, 15, 200, { source: ADD_ACTOR }),   // at the exact remove second: inclusive end
  damageTaken(BOSS_HIT, 100, 999, { source: BOSS_ACTOR }),
  ...
  expect(result[0].window_damage).toBe(950);              // (500+250) + 200
  expect(result[0].pct_of_total).toBeCloseTo(950 / 1949); // parse-total denominator
  ```

#### Test: `buildHoldTargets > surfaces a cast index a majority held, with the prior-relative band` (line 232)
* **Existing Assertion:** `expect(targets[String(HELD_INDEX)].band_s).toBeGreaterThanOrEqual(HOLD_BAND_MIN_S);`
* **User/Domain Expected Outcome:** `band_s = round(max(sample stddev of delays, HOLD_BAND_MIN_S))`; for delays `[40, 50]`: stddev = `sqrt(50) = 7.0711` -> `band_s = 7.1`.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** `>= 5` also passes for a floor-only implementation (`band_s = 5`), a `max`/`min` swap (5), and a band built from the ACTUALS' stddev instead of the delays' (the fixture is degenerate: actuals `[100, 110]` have the same `sqrt(50)` spread). The exact value is derivable, and the floor arm of `max(sigma, HOLD_BAND_MIN_S)` is never exercised anywhere (the fixture's sigma already exceeds 5), so neither arm of the documented band rule is pinned.
* **Recommended Assertion:** `expect(targets[String(HELD_INDEX)].band_s).toBe(7.1); // round(sqrt(50))` - and decouple the actuals spread, plus add a tight-cluster case (delays 40/42) asserting `band_s === 5` to pin the floor arm.

#### Test: `buildDefensiveBenchmark > derives first-cast / gap / uses-per-min and the total/used sample split` (line 261)
* **Existing Assertion:** `expect(benchmark.avg_uses).toBe(USERS);` (line 277) and `expect(benchmark.uses_per_min.avg).toBeGreaterThan(0);` (line 278)
* **User/Domain Expected Outcome:** `avg_uses` = the mean of per-parse USES = `mean([2, 2]) = 2`; `uses_per_min` = `{ avg: 0.4, stddev: 0, min: 0.4, max: 0.4 }` (2 uses over a 5-minute fight).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** two defects. (1) The fixture makes `mean(uses) = 2` numerically equal to `summaries.length = 2` AND to `used_sample_count = 2`, and the expectation is literally the `USERS` constant - a SUT returning the user count instead of the uses mean passes; the aggregate test two blocks down has the same tie (uses `[1, 3]` average to its user count 2). (2) `toBeGreaterThan(0)` on `uses_per_min.avg` passes for per-second (0.0067), raw-uses (2), and inverted (10) normalizations; the exact 0.4 is derivable. This bench feeds the defensive lost-cast expected-uses check.
* **Recommended Assertion:** give the two summaries uses 2 and 3, then `expect(benchmark.avg_uses).toBe(2.5);` and `expect(benchmark.uses_per_min).toEqual({ avg: 0.5, stddev: 0.1, min: 0.4, max: 0.6 });` (recompute the four fields for the chosen fixture).

#### Tests: remaining 25 audited
* **Existing Assertion:** apply/remove pairing in raw ms with latest-open close and open spans (null end); open buff runs to FIGHT END (290 = 300 - 10, explicitly discriminating against the rulebook duration 5); inclusive start at the exact applybuff millisecond; per-ability damage sums descending with id-0 skip and the top-6 boundary; synthetic-id folding onto 291807; SAMPLE stddev (`sqrt(20000) -> 141`; population's 100 would fail); ability majority at the boundary; DISTINCT-parse gating with per-parse dedupe (two windows from one parse counted once, damage summed then averaged - the naive 3-window mean 400 would fail); cluster median/damage/ref-enemy recomputed; consensus `max(2, CONSENSUS_FRAC x samples)` pinned at 5-in/4-out of 10; usage-only consensus (a 1%-share window still surfaces - the documented dmg-share-never-gates rule); TOTAL-parse hold denominator; end-to-end cluster bench; backfill; missing on empty defensives; permanent on a WCL failure.
* **Correctness Status:** `VALID`
* **Analysis:** the defensive window definition from the architecture doc is pinned clause by clause, including the subtle ones (open-buff-to-fight-end, distinct-parse dedupe, usage-only consensus).

### File: `frontend/src/app/pages/post-raid/defensive/defensive.service.spec.ts`

#### Test: `computePlayerDefensiveWindows > sums player damage taken inside each top defensive window (half-open)` (line 230)
* **Existing Assertion:** `expect(out[0].window_damage).toBe(500); // event at exactly 15 (== end) excluded` with fixture hits `damageTaken(700, 12, 400), damageTaken(701, 14, 100), damageTaken(700, 15, 999)`.
* **User/Domain Expected Outcome:** the runtime player measurement is half-open `[start, end)` - correctly pinned here - AND each event's contribution is `amount + absorbed` (`dmgOf`, `defensive.service.ts:56`).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the half-open end is genuinely discriminated (the 999 at exactly 15 s is the right kind of boundary fixture). The flagged defect: no `damageTaken` fixture anywhere in this file passes `absorbed`, so a regression dropping `+ (event.absorbed || 0)` from `dmgOf` - which feeds the window sums, `dmg_during`, and the damage-event filter - passes every assertion in the file. The player-vs-band comparison that drives the window card status would silently undercount absorbed-heavy hits (exactly the hits defensives exist for).
* **Recommended Assertion:** `damageTaken(700, 12, 400, { absorbed: 150 })` -> `expect(out[0].window_damage).toBe(650); expect(out[0].ability_breakdown![0]).toMatchObject({ spell_id: 700, damage: 550 });`

#### Tests: remaining 50 audited
* **Existing Assertion:** buff-window uses with damage; open buff to fight end (the function takes no duration input at all); point-cast fallback only without a span; out-of-bounds cast filtered; gap checks strict at exactly `avg + 2 sigma`; hold suggestions strict at the band edge with over-hold tolerance and 1-based decode (index 0 skipped, unreached index skipped); lost/late-first-use findings with the use-share gate at 0.3 < 0.5; talent-gated skip; no-bench success only when used; ability-id normalization joining player damage to bench detail rows; the window status matrix (not-reached/missing -> muted; within band covered AND uncovered -> good; at exactly `dmg_max + dmg_stddev` -> good, strictly above -> bad, covered or not) - the documented band semantics pinned at the exact boundary; coverage slack edges inclusive/exclusive; clip keys by exact millisecond; unreached windows muted with null player data; plan rows; icon fallback; missing/transient propagation; the informational ok view when the fight is absent mid live-sync; end-to-end player windows.
* **Correctness Status:** `VALID`
* **Analysis:** the runtime band and coverage rules from the architecture doc are pinned at their exact boundaries; the status matrix covers all documented cells.

## Gear slice

### File: `frontend/src/app/pages/post-raid/gear/gear-extract.spec.ts`

#### Tests: all 12 audited
* **Existing Assertion:** `TRINKET_SLOTS` pinned against independent literals 12/13; `.jpg` strip case-insensitive; the five WCL gameData HTML entities decoded; `extractGear` wire-faithful (trinkets at positional 12/13, `permanentEnchant` fed as a STRING and coerced, `permanentEnchantName` empty per the wire quirk); non-trinket slots ignored; no-id and id-0 (empty slot) skips; `selectCombatantInfo` by `sourceID` with first-event fallback and null on empty.
* **User/Domain Expected Outcome:** the WCL combatant-info wire contract from the warcraft-wcl-data skill (positionally indexed gear, string enchant ids, never-populated enchant names).
* **Correctness Status:** `VALID`
* **Analysis:** the unit-level fixtures here are wire-faithful - including the string-typed `permanentEnchant` the end-to-end test below gets wrong.

### File: `frontend/src/app/pages/post-raid/gear/gear-transform.service.spec.ts`

#### Test: `talentKeyFromTree > builds a v2: key from string-sorted nodeIDs` (line 24)
* **Existing Assertion:** `expect(talentKeyFromTree([{ nodeID: 90640 }, { nodeID: 90638 }])).toBe('v2:90638,90640');`
* **User/Domain Expected Outcome:** the documented contract is STRING sort order (`gear-extract.ts:47-52`, `ids.sort()` on strings). The order is load-bearing: bench `talent_key` values persisted at ingest time (same function) are compared byte-for-byte against the runtime player key (`b.key === playerKey`), so a silent change to numeric sort desynchronizes new player keys from previously ingested bench keys for any tree mixing 5- and 6-digit node ids (`'100001'` sorts before `'90638'` as a string, after it as a number).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the fixture's ids are equal-width, so lexicographic and numeric order coincide and the asserted output is identical under a `.sort((a, b) => a - b)` mutant. The test proves sorting happens (input is descending) and the `v2:` prefix, but not the string-order clause its own name states.
* **Recommended Assertion:** `expect(talentKeyFromTree([{ nodeID: 100001 }, { nodeID: 90638 }])).toBe('v2:100001,90638'); // string order: '1' < '9'; numeric sort would yield 'v2:90638,100001'`

#### Test: `GearTransformService (live, in-browser) > computes a gear bench aggregated from the top parses` (line 201)
* **Existing Assertion:** `expect(bench.value.enchants[15]).toEqual([{ id: 8041, name: 'Soph', pct: 100 }]);` fed by the fixture `gear[15] = { id: 1, name: 'Wep', permanentEnchant: 8041, permanentEnchantName: 'Soph' }` (line 182) with `getGameNames: async () => ({})` (line 197).
* **User/Domain Expected Outcome:** on the real wire, `permanentEnchant` is a STRING (`'8041'`) and `permanentEnchantName` is NEVER populated (warcraft-wcl-data skill; the gear-comparison spec's own comment states it) - so extraction yields name `''` and `'Soph'` can only arrive through the production name-resolution pipeline: `getGameNames -> names['e8041'] -> decodeHtmlEntities` (`gear-transform.service.ts:228-239`).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the asserted name is produced by a field the wire never populates, with the real resolution path faked to `{}` and therefore bypassed. If the production pipeline broke (wrong `e${id}` alias key, dropped `decodeHtmlEntities`, deleted `getGameNames` wiring), this end-to-end test still passes; it also feeds a numeric `permanentEnchant` the wire never sends (the string-typed path is covered only at the `extractGear` unit level). The id/pct/slot assertions in the same test genuinely validate aggregation and remain valuable.
* **Recommended Assertion:** in the fixture: `gear[15] = { id: 1, name: 'Wep', permanentEnchant: '8041' };` and in the fake: `getGameNames: async () => ({ e8041: { id: 8041, name: 'Soph' } });` - keep the assertion unchanged so `name: 'Soph'` can only pass through the real e-alias resolution.

#### Tests: remaining 16 audited
* **Existing Assertion:** `toParseGear` fingerprint mapping and null for absent gear; talent-build ranking 67/33 with first-seen example and the `MAX_TALENT_BUILDS` cap; trinket bucketing per slots 12/13 with frequency, skips, cap, and empty-name backfill (pct 100 = 2/2 proves the empty-name parse still counts); enchant aggregation with the zero-id parse in the denominator; the three-facet composition; backfill past a private parse (11 -> 10); missing on no rankings.
* **Correctness Status:** `VALID`
* **Analysis:** all consensus percentages recomputed with their denominators; the backfill count discriminates skip-vs-abort on a private parse.

### File: `frontend/src/app/pages/post-raid/gear/gear.service.spec.ts`

#### Tests: all 12 audited
* **Existing Assertion:** stats projection; permanent error `'No combatant info in this log.'`; fingerprint build with the `v2:` round-trip; bench-only view (12/13 merge, slot labels, 90 >= 40 row); comparison mode on-plan and missing-enchant warn (90 >= 70); the empty placeholder; feature-service merge (`sourceID` match, key round-trip), missing-bench-before-player-fetch ordering proven by outcome.
* **Correctness Status:** `VALID`
* **Analysis:** the enchant-name path is unasserted here, so this file's fixtures (which also populate `permanentEnchantName`) taint no assertion - the flag belongs to the transform e2e above.

## Map slice

### File: `frontend/src/app/pages/post-raid/map/map-transform.service.spec.ts`

#### Test: `caps the kept set at MAX_TRACKED_ENEMIES, keeping the most-sampled` (line 191)
* **Existing Assertion:** `expect(kept).toHaveLength(MAX_TRACKED_ENEMIES + 1); expect(kept.some(e => e.actorId === BOSS_OF_MANY)).toBe(true); expect(kept.some(e => e.actorId === 15)).toBe(true);`
* **User/Domain Expected Outcome:** with six enemies (cap + 1), the cap keeps the five most-sampled and the boss is appended past the cap (`map-transform.service.ts:158-162`).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the fixture's one overflow enemy IS the boss (id 20, fewest samples, max HP). With the cap: kept = [11..15] + boss appended = 6 entries. With the cap deleted (`kept = enemies`): all 6 entries including the boss, no append - the identical set. Length, `some(20)` and `some(15)` all pass either way, so the cap this test names is undiscriminated here; only the boss-append is. (The sibling test at line 208, whose overflow is a non-boss add, is the one that actually catches a no-cap mutant.)
* **Recommended Assertion:** add a seventh non-boss enemy so the cap truncates in this test too: entries `[11,60],[12,50],[13,40],[14,30],[15,20],[16,15],[BOSS_OF_MANY,10,BASE_HP+1]`, keep the length assertion, and add `expect(kept.some(e => e.actorId === 16)).toBe(false);`

#### Test: `emits the player timeline and picks the boss by highest maxHp` (line 253)
* **Existing Assertion:** `expect(parse.interval_s).toBe(POSITIONS_INTERVAL_S); expect(parse.player.length).toBeGreaterThan(0);`
* **User/Domain Expected Outcome:** `interval_s` is the ingest resample cadence 1.5 s, and the player samples spanning t = 0..6 s resample to rows at exactly t = 0, 1.5, 3, 4.5, 6 (five rows - the test's own comment derives the cadence but never asserts it).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** `POSITIONS_INTERVAL_S` is imported from the SUT, so a wrong cadence constant (999) passes the first assertion; `length > 0` passes for mutants that mis-wire `durationS` or the interval into the resampler (interval 999 -> 1 row). The exact row times are fully derivable. The boss-pick assertions in the same test are valid.
* **Recommended Assertion:** `const RESAMPLE_CADENCE_S = 1.5; expect(parse.interval_s).toBe(RESAMPLE_CADENCE_S); expect(parse.player.map(row => row[0])).toEqual([0, 1.5, 3, 4.5, 6]);`

#### Tests: remaining 24 audited
* **Existing Assertion:** resource-actor attribution (source default, `resourceActor 2` -> target, null arms); raw wire-unit grouping with ms -> s and per-actor sort; linear interpolation within one mapID (150/300 digit-exact) and verbatim nearest-sample snapping across a mapID change on both sides of the midpoint; coordinate rounding with null facing pass-through; `[t, x, y, mapID]` player rows with no facing element; boss picked by highest observed maxHp regardless of sample count; player and non-enemy actors excluded; the lowest-sampled non-boss dropped over the cap; the fetch shape (`includeResources: true`, `hostilityType: 'Enemies'`, never DamageDone); missing/transient/permanent bench arms.
* **Correctness Status:** `VALID`
* **Analysis:** the interpolation and mapID-snap traces were recomputed digit by digit in wire units; the fetch-shape test pins the two WCL position quirks (includeResources and hostility) that the wcl-data skill documents.

### File: `frontend/src/app/pages/post-raid/map/map.service.spec.ts`

#### Test: `dedupes enemies by gameId and sorts the boss first` (line 66)
* **Existing Assertion:** `expect(listReferenceEnemies(positions)).toEqual([{ gameId: 100, name: 'Boss', isBoss: true }, { gameId: 200, name: 'Add', isBoss: false }]);`
* **User/Domain Expected Outcome:** enemies deduped by gameId across parses AND the boss sorted first (`map.service.ts:115` sorts by `isBoss`).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the fixture's first parse lists the Boss before the Add, so the Map's insertion order is already boss-first and the stable sort is a no-op; a mutant with `.sort()` removed returns the identical array. The dedup half IS discriminated (gameId 200 appears in two parses and emits once); the sort half the name claims is unobservable with this fixture. No fixture in the file ever lists the boss after an add.
* **Recommended Assertion:** reorder the first parse's enemies so the Add precedes the Boss, keeping the same boss-first `toEqual`.

#### Tests: remaining 24 audited
* **Existing Assertion:** flattened-position attribution by `resourceActor` with yards/radians scaling (digit-exact `/100`, `/1000`); the documented -90 degree facing offset pinned as an independent ground truth; boss gameId -> live actor mapping with null arms; bench load/missing/transient signal arms; panel open/close/clear state; deferred overlay fetch (0 calls before open, memoized on re-open, never fetched unopened); the exact 2-call fetch shape; permanent errors for no-player-positions and failed overlay; the stale-bench race guard (out-of-order resolve discriminated).
* **Correctness Status:** `VALID`
* **Analysis:** deferral and memoization are pinned by call counts that fail in both mutant directions; unit conversions recomputed against the wire contract.

### File: `frontend/src/app/pages/post-raid/map/map-draw.spec.ts`

#### Test: `builds a trail per parse across the window` (line 116)
* **Existing Assertion:** `expect(trails[0].length).toBeGreaterThan(1);`
* **User/Domain Expected Outcome:** the trail loop (`map-draw.ts:168`) steps tt = 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5 (binary-exact floats) and every step has a valid reference and player sample, so exactly 7 points = `(pre + post) / step + 1`.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** `> 1` passes for step/window mutants (step ignored -> 3 points; pre dropped -> 4 points); the window extent and step handling the test names are undiscriminated while the exact count is fully derivable.
* **Recommended Assertion:** `const TRAIL_POINT_COUNT = 7; // (pre 1.5 + post 1.5) / step 0.5 + 1` then `expect(trails[0]).toHaveLength(TRAIL_POINT_COUNT);` (optionally pin the tt sequence).

#### Test: `parsePointsAt on prebuilt timelines matches the all-in-one topParsePoints` (line 152)
* **Existing Assertion:** `expect(parsePointsAt(timelines, 3)).toEqual(topParsePoints(positions, { kind: 'boss' }, 3));`
* **User/Domain Expected Outcome:** at t = 3 each parse's point is `{ t: 3, fwd: 5, right: 0, dist: 5, angleDeg: 0 }` (player at 500 raw = 5 yd forward of a facing-less boss at origin; effective facing = pi/2 - pi/2 = 0) - derivable independently.
* **Correctness Status:** `TAUTOLOGICAL` (self-referential - blind to the shared primitives only, corrected on adversarial re-verification)
* **Analysis:** the two operands are NOT identical: the left passes the test's prebuilt `timelines` to `parsePointsAt` directly, while the right routes through `topParsePoints`, which is `parsePointsAt(buildParseTimelines(positions, selector), t)` (`map-draw.ts:179-181`). So the assertion IS blind to any bug in the primitives both sides invoke equally (`parsePointsAt`, `buildParseTimelines`, `positionAt`, `toReferenceLocal`) - which is where the geometry the test appears to check actually lives - but it is NOT an absolute tautology: a mutation in `topParsePoints`'s own body (a wrong forwarded `t` or selector) would diverge, because `RelPos` records the queried time in its `.t` field (`map-draw.ts:94`), so the left's `t = 3` would fail to equal the right's `t = 4`. My initial "can never fail" was too strong; the precise weakness is that the geometry primitives sit in the invisible zone.
* **Recommended Assertion:** `const points = parsePointsAt(timelines, 3); expect(points).toHaveLength(2); expect(points[0]).toMatchObject({ t: 3, fwd: 5, right: 0, dist: 5, angleDeg: 0 });`

#### Test: `parseTrailsOf on prebuilt timelines matches the all-in-one topParseTrails` (line 157)
* **Existing Assertion:** `expect(parseTrailsOf(timelines, 3, 1.5, 1.5, 0.5)).toEqual(topParseTrails(positions, { kind: 'boss' }, 3, 1.5, 1.5, 0.5));`
* **User/Domain Expected Outcome:** two trails of exactly 7 points each, every point `{ t: tt, fwd: 5, right: 0, dist: 5, angleDeg: 0 }` - derivable independently.
* **Correctness Status:** `TAUTOLOGICAL` (self-referential - blind to the shared primitives only)
* **Analysis:** structurally identical to the `topParsePoints` finding above: the left passes the prebuilt `timelines` to `parseTrailsOf` directly, the right routes through `topParseTrails` = `parseTrailsOf(buildParseTimelines(...), ...)` (`map-draw.ts:184-189`). The assertion is blind to bugs in the shared primitives (`parseTrailsOf`, `buildParseTimelines`, `positionAt`, `toReferenceLocal`) that both operands invoke equally - the geometry it appears to test - but it does catch a mutation in `topParseTrails`'s own argument forwarding (a wrong `t`/`pre`/`post`/`step` makes the right's per-point `.t` diverge from the left's). Same correction as above: not an absolute tautology, but the geometry primitives are untested.
* **Recommended Assertion:** `const trails = parseTrailsOf(timelines, 3, 1.5, 1.5, 0.5); expect(trails).toHaveLength(2); expect(trails[0].map(p => p.t)).toEqual([1.5, 2, 2.5, 3, 3.5, 4, 4.5]); expect(trails[0].every(p => p.dist === 5 && p.fwd === 5)).toBe(true);`

#### Tests: remaining 16 audited
* **Existing Assertion:** interpolation within a shared mapID; nearest-sample snapping across a mapID change with the `fraction >= 0.5` midpoint boundary pinned exactly; endpoint clamping inside tolerance and null beyond it; empty-timeline contract; the -90 degree facing offset discriminated (a mutant without the offset yields fwd 0, not 5); rotation-invariant distance; mapID carried for trail line-breaking; raw-to-yards/radians scaling digit-exact; anchor-time points per parse; enemy-reference selection by gameId with the absent-reference skip.
* **Correctness Status:** `VALID`
* **Analysis:** geometry recomputed by hand (hypot, atan2, rotation), including the facing-offset mutant check.

## Post-raid shell, live capture, pull overview

### File: `frontend/src/app/pages/post-raid/post-raid.spec.ts`

#### Test: `derives a one-decimal duration in seconds from the millisecond span` (line 71)
* **Existing Assertion:** `const [f] = buildFights([fight({ id: 1, encounterID: 100, startTime: 1000, endTime: 95500 })]); expect(f.duration_s).toBe(94.5);`
* **User/Domain Expected Outcome:** `duration_s = Math.round(spanMs / 100) / 10` (`post-raid.ts:71`) - millisecond span scaled to seconds and rounded to one decimal.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the span 94500 ms is a multiple of 100, so the `Math.round` step is inert: the mutant `spanMs / 1000` (no rounding at all) also returns exactly 94.5. The scaling half is validated; the one-decimal rounding the test names is not.
* **Recommended Assertion:** `fight({ ..., startTime: 1000, endTime: 95_567 })` -> `expect(f.duration_s).toBe(94.6); // 94567 ms -> 945.67 -> 946 -> 94.6`

#### Test: `pickPlayerId > honors an explicit auto-player` (line 122)
* **Existing Assertion:** `expect(pickPlayerId(players, 1)).toBe(1);` with `players = [{ id: 1, 'Anya' }, { id: 2, 'Bram' }]`
* **User/Domain Expected Outcome:** `pickPlayerId` returns the explicit `autoPlayer` when given one (`post-raid.ts:104`), in preference to the first-visible fallback.
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the chosen `autoPlayer` (1) collides with the fallback value (`visiblePlayers[0].id` = 1), so both branches return 1: deleting `if (autoPlayer) return autoPlayer;` keeps this test - and the whole suite - green. The branch under test contributes nothing to the outcome. The fallback itself is already pinned by the sibling test (line 126).
* **Recommended Assertion:** `expect(pickPlayerId(players, 2)).toBe(2); // differs from the fallback id 1`

#### Test: `skips the report fetch and drops the poll when the report is switched before the probe resolves` (line 400)
* **Existing Assertion:** `expect(comp.reportCode()).toBe(REPORT_B);` (line 417)
* **User/Domain Expected Outcome:** none - this reads back state the test itself wrote at line 410 (`comp.reportCode.set(REPORT_B)`); no `_pollOnce` code path writes `reportCode` (its only writers are in `loadReport`).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** the assertion holds for every possible `_pollOnce` implementation, including one with the superseded-poll guard deleted; it verifies test-authored state, not SUT behavior. The rest of the test is the real proof (`getReport` not called, `fights`/`fightControl` unchanged) and is valid - this one assertion adds only false confidence.
* **Recommended Assertion:** delete line 417 (the guard is already proven by lines 414-416).

#### Tests: remaining 36 audited
* **Existing Assertion:** report-code extraction from URLs with fragments; `isValidReportCode` exactly-16 boundary (15 and 17 rejected) and charset; trash-fight filtering with start-time ordering and per-boss attempt numbering; player projection with the `'Unknown'` spec default; friendly-participant scoping with both fallbacks; auto-analyze decision matrix; sticky-player re-selection by name (discriminated against the fallback id, case-insensitive, absent/null arms); `'<spec><class>'` WCL name building across all roles with space stripping; sticky name never overwritten by auto-select (real localStorage) but persisted on explicit pick; live-sync poll guards (off-switch and stale-slower-load races discriminated through fights/spinner/status effects the wrong path cannot produce).
* **Correctness Status:** `VALID`
* **Analysis:** the shell contract from the architecture doc (validated report reference, no auto-run, sticky name semantics) is pinned; the race tests construct genuine interleavings with deferred promises.

### File: `frontend/src/app/pages/post-raid/live/live-capture.service.spec.ts`

#### Tests: all 20 audited
* **Existing Assertion:** report-clock arithmetic (fight offset + bench offset, s -> ms scale); pre/post-roll widening to exact epoch ms; one clip per window with keys carried; full-pull span and its `'full-pull'` memo key pinned by an independent duplicate literal; buffer overlap selection sorted with STRICT edge exclusion on both bounds (a zero-length touch carries no footage); seek-time clamp at 0; stitch gaps summed with the 0 back-to-back boundary; overlap predicate all three arms.
* **User/Domain Expected Outcome:** clip windows cut from the rolling `getDisplayMedia` buffer on the report's absolute clock.
* **Correctness Status:** `VALID`
* **Analysis:** every epoch value recomputed; the strict-overlap edges are the domain-correct choice (a segment that only touches the window edge contains zero window footage) and are pinned on both sides.

### File: `frontend/src/app/pages/post-raid/pull-overview/pull-overview.service.spec.ts`

#### Test: `lethalHitAmount > picks the latest matching hit before the death, ignoring later or other-ability hits` (line 116)
* **Existing Assertion:** `expect(lethalHitAmount(dt, OVERWHELMING_BLAST, deathTs)).toBe(BLAST_UNMITIGATED);` with the other-ability fixture `dtEvent(FROST_BOMB, DEATH_1_AT_S, 42)` landing at the death's exact timestamp.
* **User/Domain Expected Outcome:** the killing-blow amount is the latest hit of the KILLING ability at or before the death (`pull-overview.service.ts:123`, `event.abilityGameID !== abilityId || event.timestamp > deathTs`).
* **Correctness Status:** `TAUTOLOGICAL`
* **Analysis:** hand-tracing the mutant with the ability filter deleted: the FROST_BOMB event ties the blast's timestamp, and the strict `>` tie-break (`event.timestamp > lethal.timestamp`, line 124) keeps the already-selected blast - the assertion still returns `BLAST_UNMITIGATED`. Checked suite-wide: the other `lethalHitAmount` tests also pass under that mutant (their non-matching events are absent or after the death), so a removed/broken ability filter is never caught. The latest-pick and after-death clauses ARE discriminated; the other-ability clause the name claims is not.
* **Recommended Assertion:** place the other-ability hit strictly AFTER the matching hit but still at-or-before the death: `dtEvent(OVERWHELMING_BLAST, DEATH_1_AT_S - 1, BLAST_AMOUNT, BLAST_UNMITIGATED), dtEvent(FROST_BOMB, DEATH_1_AT_S, 42), dtEvent(OVERWHELMING_BLAST, DEATH_1_AT_S + 5, 99)` - the mutant without the ability filter now returns 42 and fails.

#### Tests: remaining 18 audited
* **Existing Assertion:** DPS = entry total / pull length (exact division, row picked by player id); string-blob and object-blob parity; null/unparseable/malformed tables -> permanent load errors (never a bogus measured 0) with the documented id; real 0 for an absent row and for a zero-length pull; ability names keyed by game id; unmitigated-preference and fallback arms; death rows oldest-first, 1-based, raidmate filtered, relative times recomputed; wipe = the instant a third player is concurrently dead (no time-window constraint - deaths 200 s apart still count), battle-rez decrements, fight-end fallback; end-to-end wipe summary and clean-kill skip of the DamageTaken fetch.
* **Correctness Status:** `VALID`
* **Analysis:** the wipe-detection set-walk and all duration/percentage arithmetic recomputed; the failed-load-vs-real-zero taxonomy (the user-facing stake) is pinned in both directions.

---

## Summary of findings

Across all 57 spec files (844 assertions' worth of tests), the audit found **zero assertions that lock in an incorrect expected value**. Every numeric expectation that was recomputed by hand matched the domain-correct result, and every status/taxonomy/routing expectation matched the SUT's intended contract. The suite's boundary discipline is unusually good: the great majority of threshold tests pair a "triggers" case with a strict at-the-boundary "does not trigger" case, exactly as the project convention requires.

What the audit did find is **38 assertions that pass regardless of whether the behavior they name actually works** - the `TAUTOLOGICAL` class in this report. These fall into a few recurring shapes:

| Shape | What makes it non-discriminating | Findings |
|---|---|---|
| Self-referential | `toEqual` between an inner function on prebuilt inputs and a thin wrapper that recomputes them; blind to the shared primitives (the real geometry), though it still catches the wrapper's own arg-forwarding | M5, M6 |
| Constant vs constant / SUT-constant echo | both sides are the SUT's own exported constant, or a test-local constant compared to another | A2, ING-speclimit, R3 (line 372), C3 |
| Test-authored / framework state read back | asserts state the test itself set, or a raw `input()` the SUT never transforms | S3, C3 |
| Absent-default collision | the "explicit" value equals the fallback/default, so the branch under test contributes nothing | S2, M1, T1, C1 |
| Range assert where an exact value is derivable | `toBeGreaterThan(0)` / `>= floor` on outputs whose exact value is computable | R1, R2, D2, D4 |
| Boundary not sat on | a "boundary" test whose fixture sits far from the strict `<`/`>=` edge, so a `<=`/`>` mutant passes | R3, B3, B8 |
| Contract clause never fixtured | `amount + absorbed` with no `absorbed` in any fixture; by-name counting where the cast id equals the damage id; median-vs-mean on degenerate members; the `max(2, ...)` floor never reached | B1, B2, B5, B6, B7, B9, D1, D3, D5, G1, G2, S1 |
| Vacuous / duplicate coverage | a loop over a possibly-empty iterable with no length check; a disjunct satisfied by the wrong arm | A3, C2, ING-partition |
| Tie clause unexercised | a "stable for equal ranks" claim with no equal-rank pair; a sort that is a no-op on an already-ordered fixture | A1, M2, M3, M4, B4-adjacent |

None of these is a shipped-product bug on its own - the current code produces the right answer for the fixtures given. Each is a **latent gap**: the day someone refactors the SUT (swaps a sample stddev for population, drops an `absorbed` term, flips a strict boundary, changes a sort key, renames a cast-id mapping), the test that exists to catch it stays green. The highest-leverage repairs are the ones guarding load-bearing math that has no other coverage: `R1`/`R2` (the only tests touching `uses_per_min` and the p90 downtime floor that feed the lost-cast and efficiency findings), `D1`/`D5`/`B2`/`B9` (the `amount + absorbed` damage definition, which every window-damage comparison depends on and which no fixture exercises), and `G1`/`G2` (the talent-key sort order and enchant-name resolution that gate the ingest-vs-runtime gear join).

### The one code/contract divergence

`B4` is not a defective assertion - it is a **documentation gap**. The burst transform deliberately treats the fight-closing window's end as inclusive (`burst-transform.service.ts:227-229`, with a source comment: the fight-end killing blow is already clamped into the last bin by `bucketDamagePerBin`, so excluding it at the window layer would drop real damage), while interior windows stay half-open. The two tests at `burst-transform.service.spec.ts:272` and `:281` correctly pin this (a forced-half-open mutant fails them). But the warcraft-architecture skill is imprecise: its per-parse step says half-open `[start, end)` while a later line already says the bench span uses an inclusive end, and neither states the actual interior-half-open / fight-closing-inclusive rule. The code's behavior is the more domain-correct of the two (a killing blow is real burst damage); the fix is to **amend the skill doc** to state the exception, not to change the assertions.

### Adversarial re-verification

Every flagged finding was put through a second, adversarial pass: one independent reviewer per finding, each instructed to *refute* it by reading the exact source and constructing the mutant the finding claims survives, then checking whether the existing assertion actually stays green. Of the 39 flags, **37 were upheld verbatim** and **2 were corrected**: `M5`/`M6` (the map self-comparison pair) were downgraded from "cannot fail under any bug" to the precise "self-referential - blind to the shared geometry primitives, but catches the wrapper's own arg-forwarding", and the `B4` doc characterization was sharpened (the skill doc is self-inconsistent, not merely silent). No finding was withdrawn; the two corrections narrowed overstated claims. That the adversarial pass moved two labels is itself evidence worth stating: the raw per-file sweep's precision is good but not perfect, and any finding should be read as a well-supported candidate, not an infallible verdict.

### Limitations of this method (what "0 INCORRECT" does and does not mean)

"0 INCORRECT" is scoped precisely: **no assertion contradicts the code as written, and no recomputed expected value is wrong**. It is not proof that the analysis math is correct. A per-file assertion sweep compares each expectation against the SUT and against first-principles derivation, but it has no independent oracle for the domain math, so a locked-in **wrong-but-internally-consistent** value - a mis-scaled coefficient, an off-by-one window bound, a wrong `uses_per_min` divisor that the fixture and the code happen to agree on - would pass all 844 tests and survive this audit untouched. Tellingly, the audit's own dominant finding (fixtures that never exercise the discriminating input) is exactly the condition under which such a bug hides. Three defect classes are structurally outside a per-file sweep and are **not** claimed to be clear: (1) a shared fixture factory reused across files would mask a common bug identically in every caller, each reading as internally consistent in isolation; (2) slice math validated only end-to-end against helpers the production code also calls is self-consistent, not independently verified; (3) a shared helper asserted only transitively through its callers has its constants sat on nowhere. Any snapshot/golden-style assertion captured from current output rather than derived independently is a regression lock, not a correctness check. Establishing correctness of the analysis math would require a separate effort: an independent expected-value oracle (hand-computed or a reference implementation) and a cross-file fixture-provenance check. This audit establishes that the suite's assertions are sound and mostly discriminating; it does not certify the numbers they pin.

### Scope notes

This audit judged assertion validity only. It did not evaluate test structure, coverage breadth, naming, or missing test cases except where a missing assertion makes an existing one non-discriminating (which is the substance of the `TAUTOLOGICAL` findings above). Deliberate project conventions - strict threshold boundaries, total functions returning `0`/`null`/`[]` on empty input, the two pass-through API services, the embedded WCL client-credentials secret, and the map slice's raw wire-unit fixtures - were treated as contracts and are not defects. Recommended assertions are provided per finding; they are drop-in replacements or additions that make each test fail under the mutant it currently misses.
