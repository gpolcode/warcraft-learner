# Niche add-on complexity audit

An inventory of **small behaviors inside features** that cost more complexity than the value
they add, with removal suggestions for a later step. The unit here is the add-on, not the
feature: every item below can be deleted while the feature it sits in keeps working.

The calibration example is the burst card's worst-window preselection - roughly 25 lines that
change which chip is selected on open. Items are ranked by cost divided by value, so cheap
correctness guards rank low even when they look fiddly, and expensive polish ranks high.

Line counts are approximate and drift; treat them as relative weights. Spec lines are counted
separately because they run 2-4x the production lines on nearly every item here, and any
estimate that ignores them understates the real cost.

Stored data size is not a ranking criterion. It appears only where an add-on ships bytes no
code path can read.

## Status

Each accepted item ships as its own pull request so they stay independently reviewable and
revertable.

**Removed separately as verified-dead code:** the unread `useLiveTransform` flag,
`bucketFindings`'s `collectRules`/`ruleFindings` option, `topParsePoints`/`topParseTrails`, the
`Result` combinators `isOk`/`match`/`mapErr`, and the `gear-transform` re-export shim.

**Accepted for removal:** items 10, 11 (the magnitude only - the killing-blow ability name stays,
since it comes from the death event rather than the extra fetch), 12, 17, 19, and 25 (collapsed
to a single warn threshold at 50% rather than deleted).

**Accepted with a different resolution:**

- The rule engine (items 1, 2, 6, 7) is **not** being removed. The unused fields are to be made
  to work properly instead; `docs/rule-engine-plan.md` is that plan.
- The duplicated hold-suggestion math (see the section below) is being lifted into
  `shared/analysis`, standardising on rotation's thresholds and naming, rather than deleting
  either copy.

Everything else below is still present and undecided.

## Ranked shortlist

| # | Add-on | Where | Cost (code + spec) | Verdict |
|---|---|---|---|---|
| 1 | Null-condition rulebook rules: 293 of 319 deployed rules are inert text | rulebook payload | ~890 KB shipped, 0 rendered | Fix, see plan |
| 2 | `hold_cooldown_for_anchor` rule kind | `rotation.service.ts:119-143` | ~25 + ~30 | Fix, see plan (2 of its 8 rules punish correct play) |
| 3 | The wipe moment: 3-simultaneous-deaths walk with battle-rez rollback | `pull-overview.service.ts:44-69` | ~84 + an extra paginated WCL query per wipe | Cut or reduce |
| 4 | Dashed pacing spacers between window chips | `window-comparison.ts:89-104` | ~34 + 56 | Cut |
| 5 | Nav rail remembers its collapsed state across sessions | `nav-state-store.ts` (whole file) | ~40 + 70 | Cut |
| 6 | `rulesFollowed` / rule "on plan" chips | `rotation.service.ts:169-186` | ~26 + spec | Fix, see plan |
| 7 | `cast_without_prior` `exception` clause | `rotation.service.ts:98-105` | ~8 + 11 schema | Fix, see plan (0 of 319 rules use it) |
| 8 | Trinket swapped-pair pre-pass (`trinketSetMatches`) | `gear-comparison.ts:130-153` | ~35 + 34 | Cut |
| 9 | Full-pull download alongside clip download | `live-capture.service.ts:339-345` | ~15 + 15 | Cut |
| 10 | `wcl-auth` sessionStorage token persistence | `wcl-auth.ts` (~50 of 136) | ~50 + 40 | Accepted |
| 11 | Lethal-hit magnitude on death rows | `pull-overview.service.ts:115-127` | ~45 + a conditional WCL fetch | Accepted, magnitude only |
| 12 | Hand-rolled `_loadSeq` race guard duplicating `LatestLoad` | `post-raid.ts:274-276` | ~6 + 95 | Accepted, reuse `LatestLoad` |
| 13 | Bloodlust in-window offset warning (2nd tier) | `rotation.service.ts:254-266` | ~40 + 20 | Cut |
| 14 | `refEnemies` duplicated in the canvas | `map-canvas.ts:54-67` | ~14 | Cut (import the service's copy) |
| 15 | `PRIORITY_SPEC` personal spec pin in ingest ordering | `ordering.ts:11-12,44,52` | ~5 + spec | Cut |
| 16 | `environment.ingestSpec` hand-edit-only knob | `ingest-orchestrator.service.ts:157-171` | ~19 across 4 files | Cut |
| 17 | Unreachable `missing`-variant branches (3 sites) | `post-raid.ts:358-364`, `pre-fight.ts:97-105`, `pull-overview.html:3-6` | ~20 | Accepted |
| 18 | `pickPlayerId`'s dead `autoPlayer` parameter | `post-raid.ts:96-106` | ~11 + 16 | Inline |
| 19 | Redundant guards in `finding-table` click handlers | `finding-table.ts:35-43` | ~9 | Accepted |
| 20 | `art-icon` `size` input nobody binds | `art-icon.ts:24` | ~4 | Hardcode |
| 21 | `minPct` test-only override on the burst scan | `burst-transform.service.ts:181,188,231` | ~3 | Cut |
| 22 | Map playback: play/pause + rAF wall-clock loop | `map-canvas.ts:142-174` | ~50 | Borderline |
| 23 | Centroid ring on the map | `map-canvas.ts:106-120,254-258` | ~21 | Borderline (a mean that can lie) |
| 24 | Collapsible-text ResizeObserver overflow probe | `collapsible-text.ts:26-45` | ~20 | Borderline (untested) |
| 25 | Enchant second tier (info at 40% vs warn at 70%) | `gear-comparison.ts:71-79` | ~9 | Accepted, single warn at 50% |
| 26 | Five-card busy aggregation reveal gate | `post-raid.ts:230-236,503-507` | ~14 | Borderline (fragile) |
| 27 | Worst-window preselection (the calibration example) | `window-comparison.ts:46-72` | ~26 + 58 | **Keep** |

Taking every item marked Cut or Accepted is roughly 400 production lines and 400 spec lines; the
user-facing loss of each is stated in its entry below.

## Detail: the biggest offenders

### 1-2, 6-7. The rule engine (see the dedicated section below)

### 3. The wipe moment

The "Wipe" row's timestamp shows the instant the raid actually broke rather than fight end. To
get it, `pull-overview.service.ts:44-69` merges deaths and resurrects into one timeline, walks
it maintaining a live set of dead players, and marks the moment three are simultaneously down -
with a tie-break so a death and a rez at the same timestamp resolve in the right order. Feeding
that requires `getResurrects` (`wcl-api.ts:134-153`), an entire extra paginated query that
exists because WCL has no `Resurrects` dataType, so it scans `All` with a server-side type
filter.

That is ~84 lines plus one extra paginated WCL round-trip on every wipe - and wipes are the
common case on progression - to move one timestamp on one row by a few seconds. Dropping just
the battle-rez tier (keep the deaths walk, delete the resurrect fetch) removes ~45 lines and the
network call while keeping most of the behavior. Dropping the whole thing falls back to fight
end, which the function already does when it finds no wipe moment.

### 4. Dashed pacing spacers

Between window chips, half-width dashed boxes stand in for the pause before the next window, one
per 20 seconds of dead time. It costs a discriminated-union cell type, the `timelineCells`
builder, `gapSlots`, template branches, and the largest single spec block in the component (56
lines) - about 90 lines total for `aria-hidden` decoration. Each chip already carries its
timestamp underneath, which conveys the same pacing numerically.

### 5. Nav rail collapse memory

An entire injectable service plus a 70-line spec suite (including mocked storage-failure paths)
persists one boolean about sidebar width. Its own doc comment notes it mirrors `SelectionStore`'s
wrapped-localStorage approach rather than sharing it. Replacing it with `signal(false)` costs the
user one re-collapse per session.

### 10. Token sessionStorage persistence

The WCL client-credentials token is mirrored into `sessionStorage` so a reload skips one token
round-trip, which needs a throw-guarded storage wrapper plus hydrate, persist, and invalidate
paths - about 50 of the file's 136 lines. The in-memory cache and shared in-flight promise
already cover the whole session, and the token is app-level, not user-level, so nothing depends
on it surviving a reload. The saving is sub-second, once per reload.

### 12. The duplicated race guard

`post-raid.ts` hand-rolls a monotonic `_loadSeq` so a slow earlier `loadReport` cannot overwrite
a newer one - checked at three points, and carrying a 95-line bespoke test harness with manual
promise resolvers. The repo already has `shared/latest-load.ts` (21 lines) doing exactly this,
and every feature card uses it. The guard is worth keeping; the second implementation is not.

### 17. Unreachable error branches

Three places handle the `missing` variant of the load taxonomy on paths that cannot produce it.
`toLoadError` returns `missing` only on a literal HTTP 404, and the WCL GraphQL endpoint returns
HTTP 200 with `report: null` for an unserved report, which `wcl-api.ts:74-79` converts to a
`permanent` error. One of the three (`post-raid.ts:358`) even says so in its own comment. A
single note that `missing` is reachable only from data-file reads lets all three go.

### 27. Worst-window preselection - keep

Your example, measured: an 18-line ratio scan picking the window where the player fell furthest
behind, plus an 8-line `linkedSignal` that drops a manual pick when the window set swaps, plus
58 spec lines. It stays, for three reasons. It is the highest value per line in this document -
it puts the actionable window in front of the user with zero clicks. It is self-contained in one
presentational component, with no data, ingest, or cross-component cost. And the `linkedSignal`
half is a correctness fix, not polish: without it, switching encounter on `/pre` strands a stale
index and blanks the detail pane.

The shape worth cutting is the opposite of this one - add-ons that reach across layers, add a
WCL query, add a bench field, or add a build configuration.

## Explaining item 4 from the previous revision: the rule engine

A rulebook rule is an LLM-authored coaching statement attached to a spec, with an optional
machine-checkable `condition`. Two condition kinds exist:

- `cast_without_prior` - flag each cast of X with no cast of Y within `window_s` seconds.
- `hold_cooldown_for_anchor` - flag casts of listed spells landing in the window just before a
  non-first cast of an anchor spell.

Everything else on a rule (`type`, `priority`, `description`, `action`) is text.

**Measured across the 40 deployed rulebooks (319 rules total):**

| | Count | Share |
|---|---|---|
| `condition: null` | 293 | 91.8% |
| `cast_without_prior` | 18 | 5.6% |
| `hold_cooldown_for_anchor` | 8 | 2.5% |
| Using the `exception` clause | 0 | 0% |
| Specs with at least one evaluable rule | 18 of 40 | |
| Specs with zero evaluable rules | 22 of 40 | |

Four findings make this the weakest machinery in the app:

**The 92% that are inert are also invisible.** Both functions that iterate rules skip null
conditions (`rotation.service.ts:150` and `:174`), and nothing else reads the array. The schema
tells authors that null-condition rules "surface as display-only text" - that is simply not
true; no code renders them. They are shipped anyway: the `rules` array is copied verbatim into
every encounter's rotation bench file, making it the single largest key in that file (30-46% of
its bytes). About 890 KB of the deployed dataset is rule text no code path can reach. This is
the one place stored size matters, because it is bytes on the file a user downloads to see the
rotation card, and for 22 of 40 specs every one of those bytes is inert.

**Two of the eight hold rules are inverted - they punish correct play.** BloodDeathKnight's rule
flags Reaper's Mark cast in the 6 seconds before Dancing Rune Weapon, while its own action text
instructs the player to cast Reaper's Mark immediately before Dancing Rune Weapon. FuryWarrior's
does the same for Avatar into Recklessness, at `critical` severity. A player following the
coaching gets warned for it.

**One pairing rule will spam false positives.** RestorationDruid's rule targets Rejuvenation, a
spam-cast HoT, requiring it within 3 seconds of Swiftmend - so a real log renders something like
"Rejuvenation without Swiftmend, 47 / 52 casts".

**`hold_cooldown_for_anchor` duplicates a check the bench already does better.** The
hold-suggestion check derives hold targets empirically from the top-parse distribution, with a
consensus band and a count ("12/20 top parses hold to 4:15"), for every major cooldown of every
spec. The rule kind is a hand-authored version of the same idea covering 8 cases, with an
author-guessed window instead of a measured one.

**Cost:** ~156 runtime lines, 33 model lines, ~111 spec lines, and 98 of the schema's 227 lines.
`rule.type` (a six-value enum the schema marks required) is read by zero lines of TypeScript.
`priority` resolves to one bit: `critical` renders red, everything else amber. There is also a
naming inconsistency - a violated rule is labelled "X without Y" while the same rule followed
shows its description text.

**Suggested cut:** delete `hold_cooldown_for_anchor`, the `exception` clause, `rulesFollowed`,
and the null-condition tier (stop baking unevaluable rules into bench files and drop the
display-only promise from the schema). That leaves `cast_without_prior`, the one capability
nothing else covers, and removes ~120 lines plus ~890 KB of undeliverable payload. Full removal
of the engine is reasonable too, but note it takes the app's only spell-pairing detection with
it.

Two stale comments to fix alongside: `post-raid.ts:239` claims rotation's "rulebook rules render
regardless" of bench availability - `rotation.html:2` gates them behind it, so no bench means no
rules. And `RotationScanInput.rules` is threaded through the scan but always passed an empty
array, so `rotation.service.ts:402` is unreachable.

## Explaining item 3 from the previous revision: why hold suggestions exists twice

Because the architecture requires it. The layer rules in `warcraft-architecture` state that each
slice's transform and feature services are self-contained, must "reimplement/own" their math as
functions colocated in their own `*.service.ts`, and that "self-containment over sharing" is the
governing principle. Only generic, non-domain primitives are blessed into
`shared/analysis/analysis-math.ts` - `round`, `groupByTime`, `getOrInsert`, the outlier
predicates, `fmtClock`. Hold-target math was classified as domain math, so rotation and
defensive each got their own copy. It is deliberate policy, not an oversight.

The two copies are now near-identical:

| | Rotation | Defensive |
|---|---|---|
| Hold detection | `detectHoldWindows`, exported | inlined in `summarizeDefensiveCasts` |
| Threshold | `HOLD_THRESHOLD_S = 8.0` | `HOLD_THRESHOLD_S = 8` |
| Band floor | `HOLD_BAND_MIN_S = 5.0` | `HOLD_BAND_MIN_S = 5.0` |
| Consensus gate | `HOLD_CONSENSUS_FRAC = 0.5` | `HOLD_TRIGGER_FRAC = 0.4` |
| Target builder | `buildHoldTargets`, 8 output fields | `buildHoldTargets`, same 8 fields |
| Runtime check | `checkHoldSuggestions` | `holdSuggestionFindings` |

The runtime checks differ only in units (milliseconds vs seconds) and copy ("cast N" vs "use
N"). The target builders are structurally identical. The drift duplication invites has already
started: the same concept carries two names and two values (0.5 vs 0.4), and nothing keeps them
aligned.

Worth noting that the generic/domain line is already blurry - `groupByTime` is shared by burst
and defensive, and both cluster functions are described in the architecture skill as sharing it.
Hold-target math is comparably generic (a consensus band over indexed samples) and arguably sits
on the wrong side of the line.

That gives three options, in increasing order of value lost:

1. **Bless the hold-target math into `shared/analysis`** - deletes ~100 duplicated lines, keeps
   both features, and removes the drift risk. Requires accepting it as a shared primitive, which
   is a deliberate architecture decision, not a refactor to make quietly.
2. **Delete the defensive copy only** (~200 lines) - defensives are pressed reactively to
   mechanics, and the defensive windows card already shows when top parses defend and grades the
   player per window. This is the recommended cut.
3. **Delete both** (~490 lines plus the `hold_targets`/`majority_hold` bench fields) - removes
   the one genuinely novel consensus statistic in the app. The gap check still flags cadence
   outliers, so the loss is the specific "top parses hold this to 4:15" coaching.

## Suggested sequencing

Each lands as its own pull request.

1. **Accepted removals** (items 10, 11, 12, 17, 19, 25): roughly 150 production lines and 150
   spec lines. User-visible loss is limited to the lethal-hit magnitude on death rows and the
   soft 40% enchant nudge, which becomes a single warn at 50%.
2. **Hold-suggestion consolidation**: lift the duplicated math into `shared/analysis` on
   rotation's thresholds and naming, deleting roughly 100 duplicated lines and the 0.5-vs-0.4
   drift.
3. **Rule-engine repair** per `docs/rule-engine-plan.md`: make the unused fields deliver value
   rather than deleting them.
4. **Remaining pure subtraction** (items 4, 5, 9, 14, 15, 16, 18, 20, 21), still undecided:
   about 200 production lines and 200 spec lines with no user-facing loss beyond decoration and
   a remembered sidebar state.
5. **Borderline polish** (items 22, 23, 24, 26), taste calls rather than clear wins.

The whole-feature questions raised in the first revision (screen recording and clip replay, and
the map slice) are deliberately out of scope here; they are product decisions rather than
complexity cleanups, and nothing above depends on them.
