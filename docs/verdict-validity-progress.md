# Verdict validity: implementation progress

Tracks the work packages that implement `docs/verdict-validity.md`. Each package is a stacked PR; the stack base is `claude/cool-franklin-an2ldu`.

## Package 0: independent fixes (done)

Branch `ccr-b792d165-ypnein`, PR against `claude/cool-franklin-an2ldu`.

### Done

- **Northern Sky TOC regex.** `ALERT_ENTRY` (`RA/data/http/northern-sky-phase-data-service.ts`) accepts trailing load conditions such as ` [AllowLoadGameType standard]`. A verbatim copy of the addon's `NorthernSkyRaidTools.toc` lives in `frontend/src/testing/northern-sky-toc.ts`; the spec reads all 20 boss modules from it through the new `alertPaths`. Against the live addon the fixed parser finds 9 re-arming encounters. Baked files keep `phases: []` until the stage 2 re-bench.
- **Northern Sky card.** Subtitle reads "Cooldown timings from one top Mythic log for your spec, ...". A `No phase table` tag sits after the card title, and the export panel says every line counts from the pull, whenever `NorthernSkyFeatureService.hasPhaseTable` is false.
- **Live clips.** Every clip, window or point, gets the same 5 s roll on both sides (`CLIP_ROLL`, `LiveCaptureFeatureService.clipWindowFor`).
- **Map.** The centroid ring's legend reads "Average of top-log positions". The ring itself is unchanged.
- **Errors.** A permanent `LoadError` carries `source: 'app' | 'log'`. `Results.permanent` is `app`; `Results.unusableLog` is `log`. `WclApiService` throws `WclReportUnavailableError` for a report WCL will not serve, and `HttpLoadErrors.toLoadError` maps it (anywhere in the cause chain) to `unusableLog('This report is private, expired or does not exist.')`. Gear's missing combatant info ("This log has no combatant info.") and the map's missing player positions are `log`. `wl-load-state` renders a `log` error with a muted info icon and "Retrying will not fix it. Pick another fight or report."; only `app` errors say "This analysis is bugged".
- **Finding sentence.** `FindingRow.message` carries `AnalysisFinding.message`; `wl-finding-table` renders it in the Fix cell above the remedy (remedy muted).

### Decisions and deviations

- The paper's label "#1 Mythic log (name, 5:31 kill)" is not shipped. The bench carries neither the source log's rank, name nor kill time, and the pipeline takes the highest-ranked log among the top 10 that it can read and that cast an exported ability, which is not always rank 1. The subtitle says "one top Mythic log" until the stage 2 "Northern Sky source identity" bench field lands; that package should switch the label to the paper's form.
- "No phase table" is a neutral tag, not a warning: an empty table also covers a boss the addon keeps on one clock, where a pull-relative note is correct.
- The "damage table missing" pull-overview error stays `app`: an unparseable table can be the app's parsing, not the log.
- No `INGEST_VERSION` bump: no bench shape or measured value changed.

### Drift against 6882b59

None: the stack base is 6882b59 plus the paper, and every file:line reference this package used (RC6, RC7) matched.

### For the next package

- Use `Results.unusableLog` for any new permanent failure caused by the user's log or report.
- `FindingRow.message` is required; every row builder must set it.

## Package 1: player timeline (done)

Branch `claude/verdict-validity-p1-timeline`, PR against `ccr-b792d165-ypnein`.

### Done

- **`PullModelService`** (`RA/data/analysis/pull-model-service.ts`). `PullContextService.analyzePull` builds one `PullModel` per card call and hands it in `PullContext.model`; `PullRef` carries `playerId`. Reads: raid-wide `Deaths`, the player's `Buffs`, `playerDetails`, and `getResurrects` only when the player died or an uncalled wipe has half the raid dead. All are reads another card or the page makes, so the response cache serves them.
  - Judged end: a kill runs to the fight end; a wipe ends at `wipeCalledTime` (report clock, made pull-relative) when it lies inside the pull, else at the first instant `ceil(friendlyPlayers / 2)` are dead at once (`DeathTimelineService.firstDeadAtOnceS`), else at the fight end (`judgedEndCause: 'wipe'`). The pull overview keeps its own three-dead outcome label.
  - Dead spans are the player's own, cut at the judged end; a death at or after it is dropped. Alive spans are their complement on `[0, judgedEnd)`.
  - Lust is the earliest Bloodlust aura on the player's own buffs (`RotationBloodlustService.lustSpan`; `detectBloodlust`, which ingest calls, reads through it). Phases are `phaseTransitions` made pull-relative. Role is the `playerDetails` group (`tanks`, `healers`, `dps`), else `unknown`.
  - `causeOf(model, from, to)` returns the attribution precedence for a stretch: `dead`, then `after_wipe` (any non-kill end) or `not_reached` (kill), else null. A stretch ending exactly at the judged end is judged; a death ending exactly where a stretch starts does not touch it.
- **`REPORT_Q`** selects `phaseTransitions{id startTime}` and `wipeCalledTime`; `WclFight` carries both as optional. `REPORT_FIGHTS_Q` is unchanged.
- **Measures** (`analysis-math.ts`, shared by ingest and runtime): `AliveSpan`, `spansS`, `overlapS`, `castDowntimeS(castTimes, threshold, spans)`, and `benchExpectedUses(spans, bench)`. Expected uses are the rate over alive minutes, capped by the cadence: the span starting at 0 keeps the opener rule, a span resumed after a resurrect fits only whole top gaps (none without a gap). Ingest's `computeEfficiencyThresholds` measures each top log through `castDowntimeS` over `[[0, duration]]`.
- **Consumers.** Rotation and defensive judge casts and uses inside `[0, judgedEnd]`, count expected uses over alive spans (the lost-use sentence names "in m:ss of alive time" once that is shorter than the fight), and rotation efficiency is downtime over alive time ("of your alive time"). Burst and defensive windows go through `WindowViewService.buildWindowView({ model })`: a window not wholly inside alive, pre-wipe time is muted with `unjudged` (`Dead`, `After the wipe`, `Not reached`; icons skull, flag, schedule) and no player damage. A null model is the bench-only view.
- **One root cause, one row.** `AnalysisFinding.span` names the stretch a finding rests on (first cast: `[0, first]`; gap: `[prev, cast]`; hold: `[prev, holdTo]`; Bloodlust miss: the lust window; Bloodlust timing: lust to the judged cast). `PullModelService.foldFindings` drops a finding whose span has a cause and counts it per cause; a cooldown whose issues all fold reads as on plan. Lost uses and efficiency carry no span: they are measured on alive time instead.
- **Captions.** `wl-judged-span` renders under the subtitle of Downtime, Offensives, Defensives, Burst windows and Defensive windows (`judged` input on `wl-finding-table` and `wl-window-comparison`): "Judged 0:00 to m:ss, alive m:ss." plus one sentence per cause that silenced something, with the count. The view models carry `JudgedSpan | null` (null on empty and bench-only views).
- **E2E.** The cards pin the caption's first sentence; `showsFirstWindow` accepts an unjudged first window and returns whether it was judged.

### Decisions and deviations

- `npm run schema:pull` needs a WCL client pair, which this session lacked. The generated types were produced by the same codegen pipeline against the published WCL schema SDL (`math280h/go-wcl` `schema/schema.graphql`, which reproduces the committed types byte for byte before the change). Rerun `npm run schema:pull` with a pair to confirm; only `ReportQuery` should differ.
- The defensive window rule "dead in the window is bad" is replaced by the muted `Dead` window; the death is named once in the caption.
- Lust comes from the player's own buffs, so a player dead when lust was cast has no lust; Bloodlust checks for that player read none.
- The model is built per card call (three cards), not memoized across cards; services stay stateless and the WCL reads are cached.

### Drift against 6882b59

None for the references this package used (RC3: `analysis-math.ts:97-107`, `window-view-service.ts:98`, `rotation-transform-service.ts:27-28,138`, `rotation-feature-service.ts:166-167,237`).

### Seams stubbed

- `PullModel.phases` and `PullModel.role` have no consumer yet. The phase guard waits for package 2's baked per-parse phase starts and reads `model.phases`.

### For the next package

- Every new timed check sets `AnalysisFinding.span` and runs through `PullModelService.foldFindings`; every new window goes through `buildWindowView` with the model.
- Ingest and runtime measures stay in `analysis-math.ts` and take spans; ingest passes `[[0, duration]]`.
- Test fixtures: `pullModel(over)` in `src/testing/builders/pull-model.ts`; `featureService` defaults `getPlayerDetails` and `getResurrects` on a WCL fake that leaves them out.

## Package 2: reference class and per-parse measures (done)

Branch `claude/verdict-validity-p2-reference`, PR against `claude/verdict-validity-p1-timeline`.

### Done

- **Reference class.** `RANKINGS_Q` takes `$metric: CharacterRankingMetricType!`; `SpecRoleService.rankingMetric` gives `hps` for the 7 healer folders, `dps` otherwise (tanks included). `TopParseSelectionService` walks partitions newest-first and takes the first with at least `MIN_SAMPLE_COUNT` (5, exported there) rows; when none reaches it, the newest non-empty pool, so the bench says how few it had. The pipeline floors every recipe at 5 with a default too-few message; Northern Sky sets `minSamples: 1` (it exports one log).
- **Rankings facts.** `ParseRanking` keeps `rank` (position in WCL's list, counting the rows the selection skips), `amount`, `duration_s`, `item_level` (`bracketData`), `started_at_s`; an unreadable fact is null, never a dropped row. Every sampled bench header carries `metric` and `sources` (the accepted parses, in the order of every per-parse array); Northern Sky carries `metric` and `source` (`header: 'export'`). The map bench extends `BenchHeader`.
- **Per-parse measures**, aligned with `sources`: rotation `per_parse` (`efficiency_pct`, `lust_s` through `lustSpan`, `phase_starts` through `WclProjectionsService.phaseStarts`, which `PullModelService` also reads, `cd_casts_s`, `buttons` as `{ right, moments }` through `ListCheckService.rightCounts`, which `rightShare` reads); defensive `per_parse.def_casts_s`; every burst and defensive window's `members` (`parse`, `time_s`, `window_length_s`, `damage`); gear `per_parse` (talent key, trinket ids, enchant per slot), `talent_nodes` (entry, rank, count via `parseTalentKey`) and `talent_sample_count`.
- **UI.** `BenchStripService.strip` and `wl-bench-strip` ("Compared with 10 top logs[ ranked on healing], ranks a to b, item level a to b, kill times a to b." then "Benched 18 Oct 2026.") on Rotation rules, Downtime, Offensives, Burst windows, Defensives, Defensive windows and Gear. Pull overview: the figure on the spec's metric (`getTable` reads `Healing` for healers), the alive-time figure when the player died (resurrects read on a wipe or a death), and "Top logs a to b on kills" from the gear bench's sources when its metric matches. Northern Sky subtitle names `#rank`, player and kill time. `wl-load-state` has a `reason` state; healers get it on Burst windows (no bench or log read) and on Rotation rules.
- `INGEST_VERSION` 44.

### Decisions and deviations

- Generated types came from the same codegen against the `math280h/go-wcl` SDL, as in package 1 (byte-identical before the change). Rerun `npm run schema:pull` with a client pair; only `CharacterRankingMetricType` and `RankingsQueryVariables.metric` should differ.
- The constructs section 5.4 lists but the code does not have yet (unused ready time, damage on the common span, coverage by any defensive) are not baked; members carry the current window construct, and a defensive window's members are its coverage by that defensive.
- Lust and phase starts are baked in the rotation bench only.
- The pull overview reference comes from the gear bench, the one bench with no plan gate.
- Runtime tolerates a bench written before this version: no strip, no Northern Sky source (old subtitle), no pull overview reference. E2E checks the strip and the pull overview captions when drawn and accepts both Northern Sky subtitles; tighten it once the re-bench lands.
- The map overlay has no strip.

### Drift against 6882b59

None: `wcl-queries.ts:49-54` and `bench-pipeline-service.ts:138` matched.

### Seams stubbed

- The phase guard is not armed (a rule change): `per_parse[].phase_starts` and `PullModel.phases` exist, with no consumer.

### WCL cost of the re-bench

The bump re-benches all 400 spec-encounter pairs (40 specs). Rankings reads are never stored, as today; report and event reads come from the response store wherever the top parses are unchanged, apart from package 1's one-time `REPORT_Q` misses. The 70 healer pairs (7 specs x 10 encounters) are re-ranked on `hps`, so most of their top parses are new and fetched fresh, about the cost of a first bench of 7 specs. Expect several thousand points over several hourly runs, each stopping at `INGEST_POINTS_MARGIN`; the ingest log's per-encounter quota line measures it.

### For the next package

- Per-parse arrays index `sources`; a leave-one-out fold drops index i from `sources` and every `per_parse`/`members` entry with `parse === i`.
- Button counts: `ListCheckService.rightCounts`; efficiency: `computeEfficiencyThresholds(...).efficiencies`.
- `BenchHeader.metric` says what a bench was ranked on; compare it before mixing a bench's amounts with the player's figure.

## Package 3: verdict contract (done)

Branch `claude/verdict-validity-p3-contract`, PR against `claude/verdict-validity-p2-reference`.

### Done

All under `RA/data/verdict/`:

- **Chosen numbers**: `verdict-choices.ts` (`VERDICT_CHOICES`): per-test budgets (1%, 5%), page budgets (0.1, 1.0), arming bounds and minimum pooled tests (2% / 1,500, 8% / 500), `minReferenceN` 5, effect floors (2 and 3 excess misses, 1 use and 25% of expected, 5 s), paired consensus share 0.8, reaction 0.35 s, wipe dead share 0.5, phase guard 15 s, lift 2 / 1.3 and AUC 0.6. `MIN_SAMPLE_COUNT` (`top-parse-selection-service.ts`) and `PullModelService.halfRaid` read it.
- **Tone**: `tone.models.ts` has `ToneLevel` (`neutral < blue < amber < red`), the branded `Tone` (a level or `muted`), `CostClass` and `Evidence` (`level`, `observed`, `n`, `target`, `excess`). `ToneService.tone(family, evidence)` returns `min(tier, evidence level, cost cap)`; cost cap: high red, medium amber, low amber on red evidence, blue on blue evidence, else neutral. `ToneService.muted()` for unjudged checks.
- **Rules**: `DecisionRuleService` with `interval`, `excessRate`, `count`, `mechanistic`, `consensus`, `fact`; tail math in `DistributionService` (t quantile, binomial upper tail, Poisson CDF). Every rule returns neutral evidence on a bench under `minReferenceN`. Specs pair every boundary, s = 0 included.
- **Registry**: `FindingFamily` (`finding-family.models.ts`), `FINDING_REGISTRY` (`finding-registry.ts`, empty), conformance spec `finding-registry.spec.ts` (unique ids, complete fields, red only on high cost, graded tiers name injected mistakes, minN at least 5, and a producing scenario per family in `PRODUCING_SCENARIOS` that must emit a finding whose `family` is the entry id). `AnalysisFinding.family?` is the id.
- **Lint**: `local/no-severity-literal` (`frontend/eslint-rules/no-severity-literal.js`) fails a string literal of any severity, status or tone word (`critical`, `warning`, `info`, `success`, `hold_suggestion`, `good`, `warn`, `bad`, `red`, `amber`, `blue`) and any cast to `Tone` under `RA/data/**`; type positions, comparisons, switch cases and keys are allowed. Specs and `data/verdict/**` are exempt.
- **Docs**: `.claude/skills/warcraft-verdict/SKILL.md`, its CLAUDE.md router row, the pointer from `warcraft-change`'s "New finding", the tier voice in `warcraft-writing`, README's measured vs chosen line.

### Decisions and deviations

- `AnalysisFinding.severity` keeps its string union: branding it breaks every producer, which is package 4. The branded `Tone` exists; package 4 switches the field (or the row mapping) to it.
- Legacy producers sit in the `local/no-severity-literal` ignores in `frontend/eslint.config.js`: `cast-cadence-service`, `finding-rows-service`, `hold-targets-service`, `burst-feature-service`, `defensive-feature-service`, `gear-comparison-service`, `list-finding-service`, `rotation-feature-service`. Each leaves the list when its card moves.
- Producer use is witnessed at runtime, not by scanning source: the Angular test build cannot read files (`node:fs` does not resolve), so each family needs a producing scenario.
- `count` uses a Poisson lower bound on the expected uses (no per-parse count spread is baked). Cooldown counts are underdispersed against Poisson, so the bound errs toward fewer flags; calibration measures it.
- `consensus`: alone, k = n is amber, red only once `1 / (n + 2)` is within the red budget (n >= 98); paired, amber from a share of 0.8 (a chosen number), else blue. Red for a paired consensus waits for calibration.
- `fact`: a game rule backs it with red evidence (the tier and cost class cap it); a consensus backs it with that evidence.
- Excess-rate reference rate is `max(misses / moments, 1 / (moments + 2))` over the pooled reference moments.

### Drift against 6882b59

None: sections 5.1 to 5.3 and 7 carry no file:line reference; `halfRaid` and `MIN_SAMPLE_COUNT` are where packages 1 and 2 left them.

### Seams stubbed

- `FINDING_REGISTRY` and `PRODUCING_SCENARIOS` are empty.
- Calibration status (graded, comparison, hidden) does not cap `ToneService` yet; package 5 adds it as a fourth cap.
- MARKER for package 5: add the calibration suite's command to the CLAUDE.md command table once it has a name.

### For the next package

- Per card: declare each family, call one `DecisionRuleService` rule on the shared measure, pass the evidence to `ToneService.tone`, set `family`, add the producing scenario, drop the producer from the lint ignores.
- `Evidence.target` is the amber edge in the construct's unit (for `excessRate` the most misses tolerated, for `count` the fewest uses tolerated): print it as the row's target.

## Package 4a: rotation buttons and lost casts (done)

Branch `claude/verdict-validity-p4a-rotation`, PR against `claude/verdict-validity-p3-contract`.

### Done

- **Families** in `FINDING_REGISTRY`, each declared beside its judge and marked `pendingRebuild` (new `FindingFamily` field: the construct that replaces it, or null):
  - `rotation.button` (`data/rotation/priority-list/button-judge-service.ts`): tier amber, cost low, `excess-rate`; pending the SimC reaction-model decision points.
  - `rotation.lost_cast` (`data/rotation/cooldown-use-judge-service.ts`): tier red, cost high, `count`; pending unused ready time.
  - `rotation.never_used` (same file): tier red, cost high, `consensus`; pending unused ready time.
- **Judges, callable at ingest with a top log as the player.**
  - `ButtonJudgeService`: `measure(reading, action, endS)` is `ListCheckService.rightCounts` over `ListCheckService.within(reading, endS)`; ingest's `ListBenchService.counts` (the baked `per_parse[].buttons`) calls the same `measure` with an infinite end. `reference(perParse, action)` takes the top logs that had the button; `judge(counts, reference)` is `excessRate` on pooled reference misses and moments, n = logs with the button.
  - `CooldownUseJudgeService`: `castTimesS(events, spellId, upAtPull, endS)` is the one cast measure (ingest's `summarizeCooldownCasts`, which bakes `per_parse[].cd_casts_s`, and runtime both call it); `measure(castTimesS, spans, bench)` gives uses and `benchExpectedUses` over the spans (ingest passes `[[0, duration]]`); `referenceUses(perParse, name)`; `judge(uses, reference, taken)` returns null at or above the expected uses, `consensus` (k = top logs with a use, paired on talent taken and at least 2 expected uses) for 0 uses, else `count`.
- **Rules.** `DecisionRuleService.count` takes `users`: red only when `users / n` reaches `pairedConsensusShare` (the 5.7 "with 8 of 10 top logs using it"), else amber at most.
- **Tone.** Both producers pass evidence to `ToneService.tone`; `AnalysisFinding.severity` and `FindingRow.severity` accept a `Tone` beside the legacy words; `FindingRowsService.rowSeverity` passes a tone through (`ToneService.isTone`). `sortBySeverity` ranks via `severityRank` (red/critical, amber/warning, blue/info/hold, neutral, muted, success). `wl-finding-table` maps either vocabulary to one look (`toneOf`, `iconOf`): neutral is a muted `compare_arrows` row, muted takes the cause icon (skull, flag, schedule).
- **Muted from the timeline.** A button whose moments all fall after the judged end is a muted row (`you: null`, cause from `PullModelService.causeOf`, "Every moment came after the wipe, so none is judged."); moments after the judged end are never counted. A cooldown whose alive time fits no expected use while the whole fight fits one is a muted `lost_cooldown` row with `unjudged` set ("You were dead before X was due, so it is not judged.").
- **Rows show n and counts.** Button rows carry `right`, `moments`, `n`, `family` and a `message` ("You got 15 of 20 moments right. 10 top logs miss about 1 in 20." plus "Aim for 17 or more." on a graded row, with `Evidence.target` as the tolerated misses); the bar is grey unless graded. Lost and never-used rows print `uses / expected` with "cast(s), 10 top logs" and name the top logs in the message; only red and amber rows carry a remedy. Sort: tone, then moments times shortfall under the top average.
- **Empty states with counts.** Rotation rules renders whenever the bench judges buttons: "Your log shows no judged moment for any of the N buttons the list judges."; Offensives: "Nothing flagged. N cooldowns checked against M top logs." (`buttonsBenched`, `buttonsEmpty`, `offensivesEmpty` on `RotationPlayerView`; `wl-finding-table` and `wl-button-table` take an `empty` input).
- **Lint.** `list-finding-service.ts` left the `local/no-severity-literal` ignores. The rule allows a literal that is a `tier` property's value (a ceiling, not a tone); the skill says so.
- **E2E.** The Rotation rules test accepts the empty state, pins the row message by shape and stops at a muted first row; the empty Offensives state is matched by its first sentence; `CD_CHIP` includes `never used`.

### Decisions and deviations

- The `count` rule is package 3's Poisson lower bound, so "two short amber" from the 5.7 row holds only where Poisson says so (at 7 expected, 2 uses are amber and 1 red; at 4 expected, 1 use is neutral). One short is always a neutral comparison row.
- Lost-cast and never-used checks keep the use-share gate (`usedByMajority`): a cooldown under half the top logs press is not checked, as the current construct's expected count is noise there.
- The button family's target is `Evidence.target`, the amber-evidence edge, which on this low-cost family is one miss stricter than where the row turns amber (red-level evidence). The row prints it only when graded.
- An old bench without `per_parse` reads as n = 0: every button, lost-cast and never-used row is a comparison (neutral), never an unmeasured color.
- No `INGEST_VERSION` bump: `castTimesS` and `measure` reproduce the baked values exactly.
- New injected mistake `press-off-list` for the button family.

### Drift against 6882b59

None for this package: `list-finding-service.ts:71-74` (the button status) and `cast-cadence-service.ts:41-51` (`checkLostUses`) matched at the stack base.

### Seams stubbed

- `CastCadenceService.checkUseCount` and `checkLostUses` stay for the defensive card (another package); rotation no longer calls them. `ROTATION_VOICE.underuseRemedy` stays because `CadenceVoice` requires it.
- `rotation-feature-service.ts` and `cast-cadence-service.ts` stay in the lint ignores: they still grade the first cast, gaps, Bloodlust, efficiency and the success chip.
- Calibration does not cap the tone yet (package 5); the harness that calls the judges at ingest is not built.

### For the next package

- Mixed rows: a producer on the contract sets `severity` to the `Tone` and `family`; muted rows set `unjudged`. Row mapping goes through `FindingRowsService.rowSeverity`.
- A judge takes a measure and a reference list aligned with `sources`; build both through the same method the transform uses.
- `DecisionRuleService.count` needs `users`.

## Package 4b: cadence checks (done)

Branch `claude/verdict-validity-p4b-cadence`, PR against `claude/verdict-validity-p4a-rotation`.

### Done

- **Families** in `FINDING_REGISTRY`, each declared beside its judge:
  - `rotation.late_opener` (`data/rotation/cadence-judge-service.ts`): tier amber, cost medium, `interval` above with the 2 s floor (`VERDICT_CHOICES.effectFloors.openerS`); pending unused ready time.
  - `rotation.cooldown_gap` (same file): tier amber, cost medium, `interval` above with the 5 s floor (`effectFloors.timingS`); one row per cooldown; pending unused ready time.
  - `rotation.hold` (same file): tier blue, cost medium, `consensus` alone (k = the hold target's `count`, n = its `total_samples`); construct final (`pendingRebuild: null`).
  - `rotation.downtime` (`data/rotation/downtime-judge-service.ts`): tier amber, cost medium, `interval` below; pending idle time beyond the GCD or cast time.
- **Judges, callable at ingest with a top log as the player.** Each has `measure*`, `reference*` (over `per_parse`, aligned with `sources`) and `judge*`:
  - Opener: `measureOpener(castTimesS)` is the first use of `CooldownUseJudgeService.castTimesS`, the measure ingest bakes into `per_parse[].cd_casts_s`; the reference is each top log's first baked use.
  - Gap: `measureGap(castTimesS, spans, holds)` is the longest stretch between two uses lying wholly inside the spans, leaving out a stretch that ends within a hold target's band of its `target_s`. Top logs pass one infinite span.
  - Hold: `measureHold(castTimesS, target)` is the latest use before `target_s - band_s` whose cooldown still runs at `target_s` (strict), null when any use lands within the band.
  - Downtime: `measure(castTimesS, thresholdS, spans)` returns idle seconds, alive seconds and the casting share; ingest's `computeEfficiencyThresholds` calls it with `[[0, duration]]` to bake `per_parse[].efficiency_pct`, the runtime with the alive spans. The baked values are unchanged.
- **Rules and tone.** Every producer passes the rule's evidence to `ToneService.tone`. An opener, gap or downtime row is emitted only when the evidence is graded, so it is amber; under `minReferenceN` top logs (an old bench without `per_parse` included) nothing is emitted, never an unmeasured color. A hold row is blue from 5 top logs, a neutral comparison under that.
- **Rows.** Opener, gap and downtime rows print `n` in the measured unit (`top 00:05, 10 top logs`) and in the message, with `Evidence.target` as the target; `fmtApart` (`analysis-math.ts`) and a seconds fallback keep the value and the target from printing as the same string. The downtime fix quotes only the idle seconds past the top logs' average share over the player's alive time. Hold rows name "k of n top raiders hold X for m:ss" and carry no remedy (blue voice). Hold findings use the category `cooldown_hold` (`hold until` chip); `hold_suggestion` stays the defensive card's.
- **Timeline.** Opener and hold findings carry their spans and run through `foldFindings` as before. The gap measure skips any stretch the player was not alive for, so a death between two uses is never a gap row; the gap finding still carries its span and goes through `foldFindings`.
- **Empty state.** The Downtime card always renders: "Nothing flagged. Your casting time was checked against N top logs.", "Nothing flagged. None of the N top logs carries a casting time to compare with." on a bench without per-log shares, "Nothing flagged. No casting time was judged in this pull." under two casts or on the empty view (`RotationPlayerView.downtimeEmpty`). E2E checks the card unconditionally.
- Rotation no longer calls `CastCadenceService.checkFirstCastDelay`, `checkGaps` or `HoldTargetsService.holdSuggestionFindings`; `ROTATION_VOICE` is gone.

### Decisions and deviations

- **Holds on the plan clock.** The 5.7 holds row ("Copy and clock now") is implemented: the target is the bench's absolute `target_s`, matched by time, not the prior-relative band. This is the CON-8 / TIME-5 fix; the plan page already shows `target_s`.
- **Gap test shape.** The 5.7 row gives no rule; "one cadence test per cooldown" is the `interval` rule on each log's longest unexplained wait. Holds explain a wait by time (within `band_s` of a target), the same on both sides.
- **Gap over alive time.** A wait crossing a death is left out of the measure rather than folded, so a later real gap still counts; the Offensives caption no longer counts a folded gap under the death.
- **Downtime floor.** The 5 s timing floor is converted to the construct's unit as `100 * 5 / aliveS` percentage points, so no new chosen number; the opener's 2 s floor is the new `effectFloors.openerS`.
- **Cost class medium** for the opener, gap and downtime (amber cap); the hold family is medium too, since a low cost class would cap an all-agree consensus (amber evidence) to neutral.
- **Graded rows only** for opener, gap and downtime: a neutral comparison row for every cooldown would flood the card, and the plan view already shows the top timings.
- The opener keeps the use-share gate (`usedByMajority`), as in 4a.
- No `INGEST_VERSION` bump: no bench field or baked value changed.

### Drift against 6882b59

- `cast-cadence-service.ts:81` (gap test) is at `:98`; `rotation-feature-service.ts:205-207` (efficiency) was at `:250-252` before this package. Both are now off the rotation path.

### Seams stubbed

- `CastCadenceService.checkUseCount`, `checkFirstCastDelay`, `checkGaps` and `HoldTargetsService.holdSuggestionFindings` stay for the defensive card (package 4d).
- Lint ignores unchanged: `rotation-feature-service.ts` still grades Bloodlust (4f) and the success chip; `cast-cadence-service.ts` and `hold-targets-service.ts` still grade defensive rows (4d). The new judges sit outside the ignores.
- Calibration does not cap the tone yet (package 5); the harness is not built.

### For the next package

- `CadenceJudgeService` takes cast times and `per_parse`, so the defensive card (4d) can reuse `measureOpener`, `measureGap` and `measureHold` once `per_parse.def_casts_s` feeds the references.
- `fmtApart(value, edge)` prints a flagged value and its target apart.

## Package 4c: Burst windows judge split (done)

Branch `claude/verdict-validity-p4c-burst`, PR against `claude/verdict-validity-p4b-cadence`.

### Done

- **Family** `burst.window` in `FINDING_REGISTRY`, declared in `data/burst-windows/burst-judge-service.ts`: tier amber, cost medium, `interval` below; pending the amplification construct on the common span (package 6). Injected mistake `shift-burst-15s`.
- **Judge, callable at ingest with a top log as the player.** `BurstJudgeService`:
  - `measure(damage, startS, endS, closesFight)` is the one window-damage measure: `damage`-type hits, amount plus absorbed, `[start, end)`, the end kept on a window that closes the fight. Ingest's `windowFromRun` bakes each parse window's `window_damage` (and so every `members[].damage`) through it; the runtime overwrites `PlayerBurstWindow.window_damage` with it (`findPlayerBurstWindows`, which now takes the fight length). The baked values are unchanged.
  - `aliveRate(damage, spans)` is damage per alive second; ingest passes `[[0, duration]]`.
  - `reference(window)` is `members[].damage` (n = top logs that formed the window); `judge(damage, reference, ratePerS)` is `interval` below with the floor `effectFloors.timingS * ratePerS`; `verdict(window, damage, ratePerS)` returns `{ family, status: Tone, icon, message, n }`; `benchVerdict(window)` is the pre-fight window (neutral, "N top logs had this window.").
- **Tone.** `ToneService.tone(BURST_WINDOW_FAMILY, evidence)` sets every judged window; `ToneService.neutral()` is new for the pre-fight window. Amber at most; under 5 members, or on a bench whose windows carry no `members` (an older ingest; `BurstFeatureService.withMembers` fills `[]`), the window is a neutral comparison with a message saying why. Muted windows come from `WindowViewService` as package 1 set them, with no message.
- **Rows.** `ComparisonWindow` gains `benchOnly`, `message` and `family`; `WindowStatus` accepts a `Tone` beside the legacy words (`info` is gone: bench-only is the `benchOnly` flag). `wl-window-comparison` reads either vocabulary as one look (`lookOf`), prints `message` under the window (amber text on a graded window), and on a contract window (`isOnContract`) leaves the delta uncolored unless graded and the ability rows uncolored (`wl-compact-ability-row` `toned` input). `wl-range-bar` and `wl-range-legend` take a `RangeLook` (`success`, `warning`, `critical`, `accent`, `muted`); the button table maps to it.
- **Empty state with counts** (`BurstView.empty`, `empty` input on `wl-window-comparison`): no windows: "No burst window to compare. The biggest bursts of the N top logs do not line up in time." as the card's empty state; a judged pull with no amber window: "Nothing flagged. a of b windows checked against the N top logs." as a line above the strip (a = windows not muted with at least 5 members).
- **Lint.** `burst-feature-service.ts` left the `local/no-severity-literal` ignores.
- **E2E.** Post-raid checks the judged first window's message by shape and the "Nothing flagged" line when drawn; pre-fight checks "N top logs had this window." when drawn.

### Decisions and deviations

- **Floor.** The 5.7 row names no floor; the rule needs one in damage, so it is the timing floor's 5 s at the player's own alive-time damage rate (no new chosen number, and the same unit the pending amplification construct uses).
- **Reference.** The members that formed the window, not every accepted parse; "all accepted parses" is the rebuilt construct's reference (package 6). The 5.7 contrast-lift gate waits for the harness (package 5).
- The amber window carries no remedy: the construct cannot tell a moved burst from a weak one, so no fix is named.
- The pre-fight window is a neutral tone, not a separate state; its look matches a comparison window, so the pre-fight strip turns grey instead of blue.
- No `INGEST_VERSION` bump: `measure` reproduces the baked window damage exactly.

### Drift against 6882b59

- `burst-feature-service.ts:85-86` (the burst rule) was at `:104-105` at the stack base; it is gone now. `window-view-service.ts:98` held as package 1 left it.

### Seams stubbed

- The defensive windows card (4d) still uses the legacy `WindowStatus` words through the same `WindowViewService`; its windows keep their colors and its ability rows stay toned.
- Calibration does not cap the tone yet (package 5); the harness that calls `verdict` at ingest is not built.

### For the next package

- A window card moves onto the contract by returning a `Tone`, `message` and `family` from its `WindowViewAdapter.status`; `wl-window-comparison` then drops the colors no rule backs on its own.
- Defensive windows (4d) can mirror `BurstJudgeService`: `measure` on damage taken over the window span through one function shared with ingest, `members` as the reference.
