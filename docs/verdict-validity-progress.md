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

## Package 4d: Defensives and Defensive windows judge split (done)

Branch `claude/verdict-validity-p4d-defensive`, PR against `claude/verdict-validity-p4c-burst`.

### Done

- **Families** in `FINDING_REGISTRY`, all declared in `data/defensive/defensive-judge-service.ts`:
  - `defensive.uses`: tier amber, cost medium, `count`; pending unused ready time of the defensive. Injected mistake `strip-defensive`.
  - `defensive.first_use`, `defensive.gap`: tier amber, cost medium, `interval` (2 s and 5 s floors, as rotation); pending unused ready time.
  - `defensive.hold`: tier blue, cost medium, `consensus` alone; construct final.
  - `defensive.window`: tier amber, cost medium, `consensus` with `pairedOnly`; pending coverage by any defensive active at the hit (package 6). Injected mistake `strip-defensive`.
  - `defensive.dead_in_window`: tier red, cost high, `fact` backed by the game rule; construct final. New injected mistake `die-in-window`.
- **Judge, callable at ingest with a top log as the player.** `DefensiveJudgeService`:
  - `measureUseTimes(uses)` is the one use measure (rounded starts of `DefensiveUsesService.uses`): ingest's `summarizeDefensiveCasts`, which bakes `per_parse[].def_casts_s`, and the runtime's `analyzeDefensives` both call it.
  - Cadence: `usesFinding` measures through `CooldownUseJudgeService.measure` (alive spans; ingest passes `[[0, duration]]`), references `per_parse[].def_casts_s` counts, rule `count` with `users`. `firstUseFinding`, `gapFinding` and `holdFindings` reuse `CadenceJudgeService.measureOpener/judgeOpener`, `measureGap/judgeGap` and `measureHold/judgeHold`; `referenceOpeners` and `referenceGaps` now take `CastsByName[]` (one casts-by-name map per top log), so rotation passes `per_parse.map(p => p.cd_casts_s)` and defensives `per_parse.map(p => p.def_casts_s)`.
  - Windows: `measureDamage(damageTaken, start, end)` is the one window-damage measure (damage events, amount plus absorbed, end inclusive): ingest's `findParseDefensiveWindows` bakes each use's `window_damage` (so every `members[].damage`) through it, and the runtime overwrites `PlayerBurstWindow.window_damage` with it. `measureCovered(window, uses)` is the window's own defensive up within 3 s of either edge. `reference(window, n)` gives k = distinct member parses (the covered top logs), n = the bench's `sources`, their median damage and whether every member took none (immunity). `judgeWindow` is `consensus({ differs: uncovered, k, n, paired: damage > median, pairedOnly: true })`, with `paired` forced false for tanks (`PullModel.role === 'tank'`) and immunity windows.
  - Death: `deathHomes(windows, deadSpans)` gives each death strictly inside a window the player was alive into to the first such window; `deathVerdict` is the red fact "You died at m:ss in this window."
- **Rules.** `ConsensusInput.pairedOnly`: the family's claim needs the second condition, so without it k = n stays blue. Specs pair both sides.
- **Tone.** Every defensive producer passes evidence to `ToneService.tone`; externals and on-plan chips carry no rule tone (`ToneService.neutral()`, `FindingRowsService.onPlanFinding`).
- **Externals.** A defensive whose every use in the pull opened no self aura (`isExternal`) is an assignment: only its count shows, as a neutral row ("..., each on another raider."), and no first-use, gap or hold row is built.
- **Timeline.** `WindowViewAdapter.claim(window, cause, index)` lets a card judge a window the model would mute; the defensive adapter claims only `dead` windows that are a death's home. Every other muted window stays as package 1 set it. A claimed window is not counted in the caption's folds. First-use, gap and hold findings carry spans and run through `foldFindings`.
- **Rows show n.** Count rows print `uses / expected` with "use(s), N top logs"; first-use and gap rows print the top logs in the unit and the message; holds "k of n top raiders"; window messages "k of n top raiders had it up here." Intent notes ("covered", "defensive used wrongly", ...) are gone.
- **Empty states with counts.** Defensives: "Nothing flagged. N defensives checked against M top logs." or "Nothing flagged. No defensive on the plan was checked in this pull." (`DefensiveView.findingsEmpty`). Defensive windows always renders: "No defensive window to compare. The defensives of the N top logs do not line up in time." with no windows, else "Nothing flagged. a of b windows checked against the N top logs." while no window is amber or red (`DefensiveView.windowsEmpty`). New subtitle: "Each moment top logs press a defensive, and whether you had it up."
- **UI.** `wl-window-comparison` prints a red window's message in the critical color.
- **Lint.** `cast-cadence-service.ts`, `hold-targets-service.ts` and `defensive-feature-service.ts` left the `local/no-severity-literal` ignores. `CastCadenceService.checkUseCount`, `checkLostUses`, `checkFirstCastDelay`, `checkGaps`, `CadenceVoice` and `HoldTargetsService.holdSuggestionFindings` are deleted: no caller remains.
- **E2E.** The Defensive windows card is checked unconditionally: the judged first window's message by shape, the "Nothing flagged" line when drawn, the no-window empty state otherwise.

### Decisions and deviations

- **First use and gaps stay as graded rows** on the reused `CadenceJudgeService` measures and `interval` rule, emitted only when graded (as 4b). The 5.7 Defensive cadence row names only the count; section 6's "defensive first-use and gap rows removed" belongs to the skipped stage 0 row.
- **Today's coverage construct.** "Covered" is the window's own defensive, as before; k counts the top logs whose use formed the window, n every accepted top log. A window forms only when half the top logs pressed it, so k / n is at least 0.5. "No defensive was up" in the 5.7 claim waits for package 6.
- **Damage as the second condition, damage as context.** Above the top logs' median is strict; at the median the row is blue. The overview damage bar stays as context, uncolored unless graded.
- **Dead in window.** Package 1 muted every window the player died in; the 5.7 "Dead in window: Red, keep" row now holds for the one window per death the player was alive into (death strictly after its start, before its end). A window wholly after the death stays muted. The death is still named in the caption's dead spans.
- **External detection** is per pull: point uses only. A never-pressed external is judged as the player's own defensive (the plan has no external flag and the bench bakes none); the family's availability mask says so.
- **Count rule** for defensives is the package 3 Poisson bound at tier amber, so at 7 expected 2 uses are amber, 3 a comparison; one short is always a comparison row. The use-share gate (`usedByMajority`) stays for the count and the first use.
- **On-plan chips** come from `FindingRowsService.onPlanFinding`, which keeps the legacy `success` word in a file still on the ignores list for rotation.
- No `INGEST_VERSION` bump: `measureUseTimes` and `measureDamage` reproduce the baked values exactly (the transform specs pin them).

### Drift against 6882b59

- `cast-cadence-service.ts:81` (the gap test, RC1) is deleted with its last caller. The defensive window rule the RC4 row describes (damage against max + sd) sat in `DefensiveFeatureService.defensiveWindowStatus` and is replaced. RC3's "Defensive windows judge damage taken at the top raiders' press clock" still holds for the window span, now as context only. The audit figures (94% soaker red, 60.6% rank-1 covered) are not re-measured: that needs the harness.

### Seams stubbed

- `AnalysisFinding.severity` keeps `hold_suggestion` and `FindingRowsService.bucketIssue` keeps its `hold_suggestion` branch; no producer emits it now. Leave them to whichever package retires the legacy words in `finding-rows-service.ts`.
- `rotation-feature-service.ts` stays in the lint ignores for its Bloodlust literals (`checkBloodlustAlignment`, `bloodlustTiming`: `critical`, `warning`) and the success chip (package 4f). `finding-rows-service.ts` and `gear-comparison-service.ts` stay too (4e and the legacy row words).
- Calibration does not cap the tone yet (package 5); the harness that calls the judges at ingest is not built.

### For the next package

- `WindowViewAdapter.claim` is the seam for a card that judges a window the timeline would mute.
- `CadenceJudgeService.reference*` take `CastsByName[]`; `clocksApart` is public for a card that prints its own opener copy.
- `DecisionRuleService.consensus` takes `pairedOnly` for a claim that needs its second condition (the gear enchant gate may reuse it).

## Package 4e: Gear judge split (done)

Branch `claude/verdict-validity-p4e-gear`, PR against `claude/verdict-validity-p4d-defensive`.

### Done

- **Families** in `FINDING_REGISTRY`, all declared in `data/gear/gear-judge-service.ts`:
  - `gear.talent_build`: tier blue, cost medium, `consensus` alone; pending per-node agreement with counts and a diff of the player's build (package 6). Injected mistake `swap-talent-node`.
  - `gear.trinket_pair`: tier blue, cost medium, `consensus` alone; construct final.
  - `gear.enchant_missing`: tier amber, cost low, `fact`; construct final. Injected mistake `remove-enchant`.
  - `gear.enchant`: tier blue, cost medium, `consensus` alone; construct final.
- **Judge, callable at ingest with a top log as the player.** `GearJudgeService`:
  - Measures: `measureTalentKey(tree)` (the talent key parse), `measureTrinkets(trinkets)` (sorted ids; `trinketKey` joins them), `measureEnchants(enchants)` (enchant id per slot, id 0 dropped). Ingest's `GearTransformService` (`fetchParseGear`, `parseMeasures`, `aggregateTrinketSets`) and the runtime's `GearFeatureService` (`buildCharacterGear`, `buildGearView`) call the same methods. The baked values are unchanged.
  - References over `per_parse`: `talentReference` and `trinketReference` count each key over the logs that carry one (n = logs with a readable tree, logs wearing trinkets); `enchantLeaders(enchants, perParse)` counts each slot's enchant over every accepted log (n = `per_parse.length`), ids sharing a name in the bench's `enchants` lists counted as one identity, a tie kept in the bench's order.
  - Verdicts: `talentVerdict` and `trinketVerdict` take the bench's ranked list (its first entry is the leader) and return `GearVerdict { family, tone, onPlan, note, n }`, null where nothing compares (no player key, no bench list, a talent key of another version). `enchantRows(gear, enchants, perParse, slotName)` returns `EnchantRow { slotName, family, tone, onPlan, name, note, top, n }`; the two rings compare as a multiset of identities.
- **Rules.** Talents and trinkets: `consensus({ differs, k: leader count, n })`; tier blue caps an all-agree consensus. A missing enchant: `fact({ holds: true, backing })` with `'game-rule'` when the leader reaches `VERDICT_CHOICES.enchantLeaderShare` (0.5, new) of at least `minReferenceN` logs, else the consensus evidence; so amber behind a leader of at least half, otherwise blue. A different enchant: `consensus`, blue. Under 5 logs every check is a neutral comparison, and a bench without `per_parse` reads n = 0.
- **Tone.** Every gear verdict passes through `ToneService.tone`; on-plan rows carry `ToneService.neutral()` with `onPlan: true`.
- **Copy and n.** Talent and trinket rows: "Most common build. 8 of 10 top raiders use it.", "2nd most common build. 3 of 10 top raiders use it. 6 of 10 use the most common one.", "Uncommon pair. 7 of 10 top raiders use the most common one."; enchant rows: "9 of 10 top raiders use it." plus "Apply it." on an amber row only. Bench-only enchant rows print their share ("9 of 10 top logs") and list a slot only once its leader reaches half of at least 5 logs.
- **Empty states with counts** (`talentEmpty`, `trinketEmpty`, `enchantEmpty`, `enchantsClean` on `GearComparisonView`): "No talent data. None of the 10 top logs has a readable talent tree.", "No trinket data. None of the 10 top logs carries a trinket.", "No enchant data. None of the 10 top logs carries an enchant.", "No enchant data. No slot where at least half of the 10 top logs use one enchant." (bench view), "Nothing flagged. 4 enchants checked against 10 top logs." (replaces the "All enchants" chip). Without `per_parse` the count is left out.
- **UI.** `wl-gear` maps a verdict's tone to one look: blue an accent `info` icon, neutral a muted `compare_arrows`, amber (enchants) `warning_amber`; no talent or trinket row is amber.
- **Lint.** `gear-comparison-service.ts` left the `local/no-severity-literal` ignores; `GearStatus`, `talentStatusOf`, `trinketStatusOf`, `buildEnchantRows`, `enchantStatusOf` and `trinketSetKey` are gone from it. It keeps the build and pair lists, the talent diff, slot names and rank labels.
- **E2E.** Post-raid matches the enchant note by its count shape and accepts the "Nothing flagged" line; pre-fight checks a listed slot's share and matches the enchant empty state by its first sentence.

### Decisions and deviations

- **"Information" is blue** for talents: the 5.7 row's claim is a count ("k of n top logs share") and section 6 de-tones the talent warning to information, which the page draws in the accent color. The construct stays today's full-key plurality; the per-node claim waits for package 6.
- **Cost class medium** for the three blue families: a low cost class caps an all-agree consensus (amber evidence) to neutral, so a 10-of-10 leader would read weaker than 9 of 10 (the 4b hold decision). The missing enchant is low: its game-rule backing is red-level evidence, which a low cost class turns into amber.
- **The 50% gate as a game-rule backing.** The closed `consensus` rule colors amber only from 0.8 paired or at k = n; the 5.7 row keeps the 50% gate. The fact "slot not enchanted" is backed by the game rule (an empty enchantable slot loses its stats) once at least half of the top logs agree on the slot's enchant, which shows the slot takes one. The share is `VERDICT_CHOICES.enchantLeaderShare`.
- **A missing enchant under the gate is now a blue row** ("4 of 10 top raiders use it."), where it was silent; the 5.7 "otherwise blue" says so.
- **Same-name merge** keys on the names in the bench's `enchants` lists (the item name where ingest resolved one), so an id outside a slot's top 3 counts under its own id. The player's enchant matches the leader through the same id-to-name map, so another quality rank of the leading enchant reads on plan.
- **Leader** for talents and trinkets is the bench list's first entry, so the row and the list name the same build or pair; k comes from `per_parse`.
- The talent and trinket checks keep the version-prefix and empty-key guards: those pulls show no verdict row.
- No `INGEST_VERSION` bump: the measures reproduce `per_parse` exactly and no bench field changed.

### Drift against 6882b59

None: the paper cites no gear file:line. The RC4 Gear row ("Most common build", "Uncommon build" as the plurality of exact keys) still describes the talent construct; "Uncommon build" now reads as a blue count, never a warning. The CON-7 item ("Most top raiders use it" below 50%, ids sharing a name) is fixed.

### Seams stubbed

- `finding-rows-service.ts` and `rotation-feature-service.ts` stay in the lint ignores (legacy row words, Bloodlust in 4f).
- Calibration does not cap the tone yet (package 5); the harness that calls the gear judges at ingest is not built.

### For the next package

- Package 6's per-node talent construct replaces `TALENT_BUILD_FAMILY`'s measure (`talent_nodes` and `per_parse[].talent_key` are already baked); bump its `version` then.
- `GearJudgeService.enchantLeaders` and `agreedLeaders` give any later view the merged enchant consensus with k and n.
- `FINDING_REGISTRY`'s producing scenarios accept `family: string | null` (rows that are on plan carry null).

## Package 4f: Bloodlust judge split and the legacy vocabulary (done)

Branch `claude/verdict-validity-p4f-bloodlust`, PR against `claude/verdict-validity-p4e-gear`.

### Done

- **Families** in `FINDING_REGISTRY`, both declared in `data/rotation/bloodlust-judge-service.ts`, tier amber, cost medium, pending the overlap of the cooldown's aura with the raid's lust (package 6), new injected mistake `move-cooldown-out-of-lust`:
  - `rotation.bloodlust`: `consensus` paired with the lust band (an `interval`), the alignment check.
  - `rotation.bloodlust_timing`: `interval` on the offset from the lust, both sides, the timing check.
- **Judge, callable at ingest with a top log as the player.** `BloodlustJudgeService`:
  - `measureOffset(castTimesS, lustS)` is the one measure: the use closest to the lust inside `VERDICT_CHOICES.lustWindow` (30 s before, 55 s after, both edges inclusive). Ingest's `summarizeCooldownCasts` bakes `bl_aligned` and `bl_offset_s` through it; the runtime judges through it. The baked values are unchanged.
  - `isMidFight(lustS)`: a lust later than the window's 30 s lead, so its window never holds the opener. The player's lust and every top log's baked `per_parse[].lust_s` go through it.
  - `reference(perParse, name)`: `lustsS` (each mid-fight lust, n) and `offsetsS` (`measureOffset` over `per_parse[].cd_casts_s`, k). `wantsLust` needs at least `minReferenceN` mid-fight lusters and k / n of at least `VERDICT_CHOICES.lustWantShare` (0.5, new).
  - `judgeBand(lustS, reference)`: inside when the player's lust is mid-fight and the `interval` rule (5 s timing floor) finds it on neither side of the top logs' lusts. `judgeAlignment` is `consensus({ differs: no use in the window, k, n, paired: inside })`: amber from 8 of 10, else blue, never red. `judgeTiming` is `interval` above, then below, with the 5 s floor.
  - `findings(name, castTimesS, lustS, perParse)`: no lust or not wanted, nothing; outside the band and not pressed, a neutral context row ("Your raid's Bloodlust came at 00:01. The 5 top raiders who lusted mid-fight had theirs from 01:55 to 02:05, so X is not judged against yours."); inside and not pressed, the alignment row ("You did not press X from 30s before to 55s after your raid's Bloodlust at 02:00. 5 of 5 top raiders who lusted mid-fight pressed it for theirs."); inside and pressed, a timing row only when graded ("You pressed X 10s after your raid's Bloodlust at 02:00. 5 top raiders who lusted mid-fight pressed it 5s after theirs on average."). No row carries a remedy.
- **Tone.** Every Bloodlust row passes through `ToneService.tone`, the context row through `ToneService.neutral()`. Rows carry spans and run through `foldFindings` as before.
- **Plan view.** The Bloodlust badge (`CdPlanRow.bloodlust`) is `wantsLust` over `per_parse`; an old bench without `per_parse` shows none. `CdPlanRow.bloodlustPct` is gone (nothing rendered it).
- **Legacy vocabulary retired.**
  - `AnalysisFinding.severity` and `FindingRow.severity` are `Tone`. An on-plan finding is `FindingRowsService.onPlanFinding(name)`: a neutral tone with `onPlan: true`; rotation's success chip and the defensive on-plan chip both use it, and `bucketFindings` and `partitionRotationFindings` read `onPlan`.
  - `FindingRowsService.rowSeverity`, `ToneService.isTone`, `wl-finding-table`'s legacy map, the `hold_suggestion` severity and category label, and the analysis-math outlier helpers (`isOutlierAbove`, `isOutlierBeyond`, `isOutlierBelow`, `OUTLIER_SIGMAS`, `TIMING_BAND_MIN_S`) are gone. `severityRank` takes a `Tone`.
  - `bucketIssue`'s hold branch keys on `cooldown_hold`, the category every hold finding carries.
  - `local/no-severity-literal` ignores only specs and `data/verdict/**`; no producer entry is left. The `warcraft-verdict` skill says so.
- **Tests.** `bloodlust-judge.spec.ts` pairs every boundary (window edges, mid-fight at 30 s, the 0.5 want share, the 0.8 paired share, the band edge, both timing edges); `src/testing/builders/tone.ts` builds a `Tone` for fixtures without TestBed.

### Decisions and deviations

- **Two families, not one.** The 5.7 row is one row on the overlap construct. On today's construct (a use inside the window) alignment and timing are separate claims with separate rules, so each has its own entry; package 6 can fold both into one overlap family.
- **Mid-fight is the window's lead.** "Lusted mid-fight" is a lust later than 30 s, the point from which its window no longer reaches the pull. No new chosen number; the window itself moved into `VERDICT_CHOICES.lustWindow`.
- **The lust band is the `interval` rule** on the top logs' mid-fight lusts with the 5 s timing floor, both sides. "Paired with interval" reads as this band: the consensus is paired only inside it, and outside it nothing is judged.
- **The player's lust must be mid-fight too.** A pull lust is context even when a wide band reaches the pull: its window holds the opener, which the opener family already judges.
- **Context row only on a miss.** Outside the band, a cooldown pressed in the window has no row; one not pressed gets the neutral context row, so the reader learns why no flag was raised.
- **The want gate** keeps blue rows to cooldowns at least half of the mid-fight lusters press for their lust; below it, no row.
- **No remedy on either family**, amber included: lust timing is a raid decision, and the window construct cannot say which press the player should move.
- **Defensive holds** used to fall into the "Unknown cooldown" bucket (category `cooldown_hold` with the name in `details`); the hold branch now keys on `cooldown_hold`, so they bucket under their defensive.
- `PerCdBenchmark.bl_pct`, `avg_bl_offset_s` and `stddev_bl_offset_s` stay baked but have no runtime reader. Dropping them changes the bench, so it waits for the next `INGEST_VERSION` bump.
- No `INGEST_VERSION` bump: `measureOffset` reproduces the baked `bl_offset_s` exactly (the transform spec pins it) and no bench field changed.

### Drift against 6882b59

- RC3's window (`rotation-transform-service.ts:27-28,138`) was at `:30-31,154`; the gate (`rotation-feature-service.ts:237`) and the critical miss (`:166-167`) were at `:274` and `:213`. All three are replaced by `BloodlustJudgeService`. The RC3 / TIME-4 / CON-5 / POP-8 claim ("wants Bloodlust" learned from pull lusts) no longer holds: the reference keeps only mid-fight lusts. The audit's chance rate of a critical miss is not re-measured (needs the harness).

### Seams stubbed

- `WindowStatus` (`window-comparison.models.ts`) still lists `good`, `warn` and `bad`, and `wl-window-comparison`'s `LOOK` maps them, though no producer emits them now. Retiring them touches `isOnContract`, which decides when ability rows keep their color; left for the windows' package 6 rebuild.
- Calibration does not cap the tone yet (package 5); the harness that calls `BloodlustJudgeService.findings` at ingest is not built.

### For the next package

- Package 6's overlap construct replaces `measureOffset` in both Bloodlust families (bump their `version`); `per_parse[].lust_s` gives the lust start, the aura spans need a new baked field.
- An on-plan finding is `FindingRowsService.onPlanFinding`; never set a severity word on a finding, the type no longer accepts one.
- Fixtures build a tone with `tone(level)` from `src/testing/builders/tone.ts`.

## Package 5: validity harness (done)

Branch `claude/verdict-validity-p5-harness`, PR against `claude/verdict-validity-p4f-bloodlust`.

### The measured report

`DATA_REF=calibration-testdata npm run data:pull && npm run calibrate` runs the harness over version 44 benches of four specs (Assassination Rogue, Balance Druid, Protection Paladin, Holy Paladin) on three bosses (3470, 3445, 3455): 12 encounters, 120 held-out top pulls, burst unfoldable on all 12. Package 5b records the figures and how they compare with the audit.

### Done

All under `RA/data/verdict/calibration/` unless named:

- **Leave-one-out folds** (`LeaveOneOutService`). `fold` drops index i from `sources` and `per_parse`. `foldRotation` rebuilds the plan gate (a cooldown stays when another top log has a use of it in `cd_casts_s`) and every `per_cd_benchmarks` entry from the other logs' baked casts and ranking `duration_s`, through `CastCadenceService.entry` and `buildCadenceBenchmark`, the same methods both transforms now call (`entry` is new; the baked values are unchanged). `foldDefensive` does the same for `per_defensive_benchmarks` and refolds `defensive_windows`: members with `parse === i` drop, later indices move down, a window keeps its full-bench `index` and stays only while half of the remaining logs (at least 2) still form it, centred on the median of its members.
- **Held-out judging through the production judges.** `RotationHeldOutService`, `DefensiveHeldOutService` and `GearHeldOutService` judge one log's baked measures against its fold through `ButtonJudgeService`, `CooldownUseJudgeService`, `CadenceJudgeService`, `DowntimeJudgeService`, `BloodlustJudgeService`, `DefensiveJudgeService` and `GearJudgeService`, with the page's gates (talent taken, `usedByMajority`, expected uses over alive time, the lust band, `causeOf` folds). `HeldOutRowService.row` turns evidence into one test at `ToneService.tone` without caps; evidence under `minReferenceN` and a span a death or the pull's end explains are no test. `HeldOutCaseService` makes one case per log and bench, keys logs by `report_code:fight_id`, and reads each log's talents from the gear bench's `talent_key`.
- **Injected mistakes** (`InjectedMistakeService`): drop the last use of the first majority cooldown; delay its first use and, separately, its second by 30 s; move every use inside the lust window past its end; take 5 GCDs of 1.5 s off `efficiency_pct`; turn 5 right moments of the most-judged button into misses (`press-off-list`); strip the first majority defensive of its uses and covered windows; swap a talent; remove an enchant. A trial counts for every family naming the mistake whose test the variant still makes; it detects when the family flags more rows than the plain log (blue for a blue family, else amber).
- **Perturbations** (`PerturbationService`, seeded per log so a recompute reproduces them): truncate at a wipe point, death without and with a rez 30 s later (uses in the dead span dropped), lust at 120 s and 180 s, jitter of every use by up to 2 s, defensive window damage times 0.85. The same invariants run as Vitest specs over `src/testing/builders/events.ts` (`invariants.spec.ts`).
- **Per encounter** (`EncounterCalibrationService`): family tallies (`tests`, `amber` counting amber and red, `red`), the page load (pulls, amber rows, red rows), detection per family, and per perturbation each family's tallies before and after; for the lust shifts, every Bloodlust row a cooldown gets while the shifted lust sits outside its band (key `outside-band`).
- **Pooling and arming** (`ArmingService`, `CalibrationIndexService.build`): per family, a tone is decided on the first pool with its minimum tests among spec, role, every spec; red arms when the one-sided 95% Clopper-Pearson bound (`DistributionService.clopperPearsonUpper`) of the red rate is at most 2% on 1,500 tests and amber also arms, amber at most 8% on 500; both need detection at the floor (90% red, 70% amber) when the family names a mistake. Blue and neutral families are graded at their tier with no test. A spec's verdict never outranks its role's. A failed invariant demotes the family. A role whose armed page breaks 0.1 red or 1.0 amber per pull demotes the family adding the most to the breach, one tone at a time. A bench whose own amber rate has binomial upper tail under 0.01 at the pooled rate demotes that family on that bench alone (`demoted`).
- **Invariant checks** (`CalibrationIndexService`): truncation and both deaths keep each family's smoothed flag rate, `(amber + 1) / (tests + 2)`, within 1.5 times the plain rate; the lust shifts give no `outside-band` row; jitter moves the burst rate by under 2 points; the damage scale leaves every rotation and defensive tally equal.
- **Files.** Ingest (`IngestOrchestratorService.calibrate`, after the spec loop) runs `CalibrationRunService.run(false)`: each benched encounter's `data/specs/<Spec>/calibration/<encounterId>.json`, signed on the four benches' `source_signature` and `ingest_version` plus the registry hash (an unchanged signature reuses the file), then the pooled `data/specs/calibration.json`. Pruning a retired encounter removes its calibration file. The report goes to the console and, through `__INGEST_DONE__.report`, to `$GITHUB_STEP_SUMMARY` (`scripts/ingest-headless.mjs`). Zero WCL cost: only files on disk are read.
- **Runtime cap.** `ToneService.tone(family, evidence, caps?)` takes `FamilyCaps` as its fourth cap; without caps it is the rules' tone (what the harness measures). `CalibrationCapsService.load(spec, encounterId)` reads `calibration.json` through the `CALIBRATION_SOURCE` token (root default: `DataFileApiService.getCalibrationIndex`) and fails closed to comparison (neutral) on a missing or malformed index, an index for another registry hash (`RegistryHashService`: every family's id, version, tier, cost class and rule plus `VERDICT_CHOICES`), a family or spec it does not name, or a demoted bench. The rotation, defensive, burst and gear feature services load the caps once per view and pass them to every producer. Opener, gap, downtime, Bloodlust timing rows and the burst "Aim for" sentence are now emitted on the calibrated tone (`ToneService.graded`), so a row calibration leaves as a comparison never carries an imperative.
- **CI recompute.** `npm run calibrate` (the `calibrate` build and serve configuration, `src/environments/environment.calibrate.ts`, `CalibrationCheckService`) recomputes every encounter from the pulled benches, ignoring stored files, and fails on a page-budget breach, a failed invariant on a previously graded family, or a family graded before that is not now. `.github/workflows/calibration.yml` runs it on PRs touching `RA/data/**`. CLAUDE.md lists the command (package 3's marker).
- **Chosen numbers** added to `VERDICT_CHOICES.calibration`: arming confidence 0.95, anomaly p 0.01, detection floors 0.9 and 0.7, rate ratio 1.5, jitter shift 0.02 and 2 s, lust shifts 120 and 180 s, damage scale 0.85, delay 30 s, 5 idle GCDs of 1.5 s, 5 off-list presses, perturbation share 0.2 to 0.9 of the pull, rez after 30 s.
- `SpecRoleService.role(spec)` gives `dps`, `tank` or `healer` (new tank list).
- Package 5b adds the not-graded list on each card, the Method page, the zero-test invariant pass and the defensive delay variant; see there.

### Decisions and deviations

- **Comparison is neutral.** A family that has not armed is capped at neutral, so its blue counts turn neutral too; blue and neutral families need no arming. `hidden` exists in the status type; no family is hidden yet.
- **Burst windows cannot be folded.** The burst bench bakes a log's damage only for the windows it formed, so a held-out log's damage at a window it did not form is unknown and no test is made; `burst.window` stays a comparison until package 6 bakes damage on the common span for every log. The jitter invariant (burst only) has no test until then.
- **Dead in window has no test**: no per-log deaths are baked, so `defensive.dead_in_window` stays a comparison (red today at stage 0) until deaths are baked.
- **Defensive window damage is an upper bound.** An uncovered held-out log's damage is unknown, so it counts as above the median (the paired condition holds unless tank or immune): the measured flag rate is an upper bound.
- **Leaks the fold cannot remove**: `efficiency_pct` is baked against the downtime threshold of all n logs; the plan gate reads `cd_casts_s` (casts under the bench's id) rather than each log's cast ids; defensive windows recluster only the baked members, so a cluster that would form only without the held-out log is missed; hold windows are rebuilt from casts rounded to 0.01 s; a log's fight length is its ranking's `duration_s`.
- **Lost cast cannot pass its power floor as specified.** Dropping one cast is one use short, which the `count` rule always keeps neutral (package 3's effect floor), so `rotation.lost_cast` will measure about 0% detection and stay a comparison. Expect the first real report to demote it; package 6 (unused ready time) or a larger injected loss is the fix, not this harness.
- **Page budget enforcement demotes families**, the one adding most to the breaching tone first; there is no per-family alpha to lower, and the discrimination order needs the contrast cohort (package 7a).
- **Tests per check**: a judged cooldown is one test of `lost_cast` (uses above zero) or `never_used` (no use); every hold target is a test on a log that used the cooldown; every enchant leader slot of at least 5 logs is one test of each enchant family; a lust inside the band is an alignment test, and a timing test when pressed.
- **One registry hash** covers every family and chosen number, so any family's version bump fails every family closed until the next ingest recalibrates.
- Producers take `caps` as an optional last parameter; a page must pass it. The providers file (`src/testing/test-providers.ts`) swaps `CalibrationCapsService` for an uncapped stand-in, so producer specs read the rules alone; `calibration-index.spec.ts` provides the real service.
- No `INGEST_VERSION` bump: `CastCadenceService.entry` reproduces both transforms' summaries (the transform specs pin them), and calibration files are their own signature.

### Drift against 6882b59

- 5.4.2's plan gate (`bench-pipeline-service.ts:79`) is at `:81` (`topLogPlan`, which calls `SpecPlanService.inTopLogs`).

### Seams stubbed

- The contrast cohort and the lift and AUC gates (package 7a) are not built; arming uses held-out rates and power only.

### Remaining

- None; package 5b closed both items.

### For the next package

- A new or rebuilt construct is calibrated by adding its test to the card's held-out service (same `judge*` method and gates the page uses) and a variant per injected mistake; bump the family `version`.
- Package 6: bake per-log damage on every burst window's common span and per-log deaths, then give `burst.window` and `defensive.dead_in_window` held-out tests; drop the defensive window's upper-bound assumption once uncovered logs' damage is baked.
- A page that adds a producer must load `CalibrationCapsService` and pass the caps; a producer called without them reads uncapped.

## Package 5b: real calibration data and the first measured report (done)

Branch `claude/verdict-validity-p5b-calibration-data`, PR against `claude/verdict-validity-p5-harness`.

### Calibration test data

- **Branch `calibration-testdata`** (orphan, data only, never deployed): `data/specs/**` for Assassination Rogue (melee, 4 cooldowns), Balance Druid (caster, 4 cooldowns), Protection Paladin (tank, 7 defensives) and Holy Paladin (healer, no SimC list) over Nek'zali the Soulcoiler (3470), Entombed Sentinels (3445) and Vashnik the Malignant (3455), every pair at n = 10, `ingest_version` 44, with the calibration files the ingest wrote. A one-off workflow on this branch benched it from the stack's own code (subset ingest, then `npm run calibrate`) in run 39161645971 on 2026-10-18; the workflow file is removed in the PR's last commit. The run spent about 870 of the hour's 3,600 points (2,728 left after it, against E2E's 50).
- **`DATA_REF`.** `npm run data:pull` fetches `origin/${DATA_REF:-gh-pages}`; `DATA_REF=calibration-testdata npm run data:pull` then `npm run calibrate` reproduces the report below at zero WCL cost. Listed in CLAUDE.md's command table.
- **`Environment.ingestSubset`** (default null): `{ specs, encounterIds }` makes an ingest bench exactly those specs over those encounters, skipping the version-first spec schedule. The workflow set it by rewriting `environment.ingest.ts`; nothing in the repository sets it.

### The measured report (rules' tone, before the caps)

| Role | Held-out pulls | Red per pull | Amber per pull | Red, armed | Amber, armed |
|---|---|---|---|---|---|
| DPS | 60 | 0.00 | 0.68 | 0.00 | 0.05 |
| Tank | 30 | 0.00 | 0.53 | 0.00 | 0.03 |
| Healer | 30 | 0.00 | 0.83 | 0.00 | 0.27 |

| Family | Tests | Amber rate | Detection | Full ingest (about 400 benches, 33x the tests) |
|---|---|---|---|---|
| rotation.button | 368 | 1.6% | 35 of 89 (39%) | comparison: detection under 70% |
| rotation.lost_cast | 191 | 1.6% | 1 of 119 | comparison: a one-cast drop stays inside the `count` floor |
| rotation.never_used | 13 | 0% | 0 of 16 | comparison: truncation and death invariants fail, no detection |
| rotation.late_opener | 191 | 6.3% | 79 of 235 (34%) | comparison: detection |
| rotation.cooldown_gap | 169 | 2.4% | 40 of 215 (19%) | comparison: detection |
| rotation.downtime | 120 | 6.7% | 3 of 120 | comparison: 5 idle GCDs sit inside the interval |
| rotation.bloodlust, bloodlust_timing | 0 | none | none | comparison: no bench reaches 5 mid-fight lusts |
| burst.window | 0 | none | none | comparison until package 6 bakes damage on the common span |
| defensive.uses | 209 | 7.2% | 86 of 117 (74%) | arms amber if the bound stays under 8% (projected 7.7%) |
| defensive.first_use | 160 | 6.3% | 8 of 219 | comparison: detection |
| defensive.gap | 90 | 6.7% | 11 of 165 | comparison: detection |
| defensive.window | 217 | 2.8% (upper bound) | 0 of 84 | comparison: no detection, truncation invariant fails |
| defensive.dead_in_window | 0 | none | none | comparison until deaths are baked |
| gear.enchant_missing | 1,095 | 1.1% | 115 of 120 | graded amber already (1,095 tests over the 500 minimum) |
| rotation.hold, defensive.hold, gear.talent_build, gear.trinket_pair, gear.enchant | 94 to 1,095 | 0% | n/a | graded blue (counts need no arming) |

- Red: no family reaches a red row on any held-out top log. The three red-tier families (`lost_cast`, `never_used`, `dead_in_window`) fail detection or have no test, so the full ingest arms red for none.
- Pooled tests reached per family are in the Tests column; only `gear.enchant_missing` and `gear.enchant` (1,095 each) pass the amber minimum of 500 on the subset, none passes red's 1,500. At the full ingest every family with at least 15 tests here passes 500, and every one with at least 45 passes 1,500; arming is then decided by rate and detection as the last column says.
- Invariants: `rotation.never_used` fails truncation (0.067 to 0.235 smoothed) and death (to 0.176): a pull cut before the reference's first use turns its uses into a never-used flag. `defensive.window` fails truncation (0.032 to 0.057 on 4 of 86 perturbed tests). Both are demoted by the harness; the full ingest's counts decide whether the window one is noise.

### Against the audit figures

- 1.07 red and 5.44 amber per pull (estimated, audited rules): the rebuilt rules measure 0.00 red and 0.68 amber per held-out top pull, inside the 0.1 and 1.0 budget before any cap, close to stage 0's estimate (0.01 and 0.5). The audit load is not reproduced because the rules it measured are gone; the paper now carries both.
- 0.26 red and 0.98 amber for the cadence rules (measured, audited rules): now 0.00 red and 0.42 amber (cooldowns 0.16, defensives 0.26); lost uses per test 1.6% (cooldowns) and 7.2% (defensives) against 5.9% and 9.5%.
- The 94% soaker red: the rebuilt window rule never colors red (`pairedOnly` consensus) and needs 80% of the other top logs covering the window for amber; 6 of 217 held-out windows flag amber, an upper bound since an uncovered log counts above the median.
- 60.6% rank-1 coverage: 50% (13 of 26 windows) on the subset.
- The Bloodlust chance rate: 105 of 120 top logs lust within 30 s of the pull, 10 mid-fight, 5 without; no bench reaches the 5 mid-fight lusts `wantsLust` needs, so the rule makes no row and its chance rate is 0.
- The paper's summary, RC3 evidence, page budget line and Appendix B carry the measured figures beside the audit's.

### Harness defects fixed

- **An invariant with no perturbed test failed.** Truncation and death-with-rez leave downtime no test (it needs the whole pull); the rule-of-succession rate of the empty tally is 0.5, which failed the 1.5x bound and demoted the family. A rate-bound invariant whose perturbation leaves no test passes (`CalibrationIndexService.rateBound`, spec in `calibration-index.spec.ts`).
- **`defensive.first_use` and `defensive.gap` had no trial.** Both name `delay-cooldown-30s`, which `InjectedMistakeService` made only on rotation cases; it now delays the first and, separately, the second use of the first majority defensive (spec in `mistakes-and-perturbations.spec.ts`). Their measured detection is 4% and 7%.
- **`ng serve` outlived the headless runner**, keeping port 4200, so a second run in the same job (ingest then `npm run calibrate`) failed at once; the production ingest logs show the same orphan. `scripts/ingest-headless.mjs` starts each child in its own process group (not on Windows) and signals the group.

### Remaining items of package 5, done here

- **Not-graded list on each card.** `FindingFamily.label` names each check (conformance spec checks it is not blank). `CalibrationCapsService.load` returns `CalibrationCaps` (`capOf` plus `verdictOf`), and `notGraded(caps, families)` lists the families whose status is not graded with the reason. The post-raid feature services pass each card's families (Rotation rules, Downtime, Offensives, Defensives, Defensive windows, Burst windows, Gear on a comparison), and `wl-not-graded` renders the list under the card's rows through `wl-button-table`, `wl-finding-table`, `wl-window-comparison` and `wl-gear`. A bench whose own rate demotes a family reads `NOT_GRADED.bench`.
- **Reasons are plain sentences** that read under a check's name (`NOT_GRADED`, `COMPARISON`), without a "Not graded:" prefix.
- **Method page** (`/method`, nav item "Method"): `ValidityFeatureService` reads `calibration.json` through `CALIBRATION_SOURCE` and `wl-validity-report` prints the rows per pull per role under the armed caps, then every family in registry order with its tests, amber and red odds (`OddsPipe`), detection and verdict; a measurement for another registry hash says every check is uncolored; a missing index reads "No validity measurement is published."
- E2E: `showsNotGraded` checks the list on each post-raid card when drawn, `e2e/method.spec.ts` the method page (no WCL spend).

### Decisions

- The subset is benched from empty (`public/data/specs` cleared), so calibration pools only the subset; gh-pages and main were never written.
- The one-off workflow shared the `gh-pages` concurrency group so it never overlapped the hourly ingest's budget, read the budget with `wcl-budget.mjs ingest` and failed rather than skipped on a low budget, relied on the orchestrator's per-encounter `INGEST_POINTS_MARGIN` stop (500, far above E2E's 50) and confirmed E2E's budget afterwards. It did not save the WCL response cache, so main's cache entries keep their quota.
- The paper's audit figures stay as the audit measured them; the measured figures sit beside them, since they measure different rules.

### Drift against 6882b59

- None beyond package 5's.

### For the next package

- `DATA_REF=calibration-testdata npm run data:pull && npm run calibrate` is the zero-cost loop for harness work; the stored calibration files there carry the reason strings of their run, a recompute rewrites them.
- The full report arrives with the first hourly ingest after the stack reaches main (version 44 re-bench); expect `defensive.uses` to arm amber, `gear.enchant_missing` to stay amber and every other amber or red family to stay a comparison until package 6 and the constructs raise detection (late opener 34%, gap 19%, downtime 3%, defensive first use 4%, defensive gap 7%, window 0%).
- `rotation.never_used` needs an availability gate on the reference's first use before the judged end, or the truncation and death invariants keep it demoted.
- A new page that judges a family must add the family to its card's `notGraded` call.

## Package 6a: Burst windows as amplification on the common span (done)

Branch `claude/verdict-validity-p6a-burst-amplification`, PR against `claude/verdict-validity-p5b-calibration-data`.

### Done

- **Baked measure.** `BurstBench.per_parse` (aligned with `sources`, optional for older benches): each accepted top log's `damage_per_s`, whole seconds from the pull, hits outside the fight clamped into the first or last second, rounded. `BurstJudgeService.series` builds it at ingest and for the player at runtime. `INGEST_VERSION` 45. Bench files grow from about 10 KB to about 30 KB.
- **Construct.** `BurstJudgeService.measure(perS, window, aliveSpans)`: the window's span in whole seconds (start rounded, length rounded, at least 1 s), searched at every offset within `effectFloors.timingS` (5 s) for the most damage, over the log's damage per alive second (the seconds that start inside an alive span). Returns `{ damage, amplification, startS, lengthS }`; null when no searched span fits the series or no damage was dealt while alive. Raw damage is the context printed in the message; the headline and the range bar are the multiple.
- **Reference.** `reference(window, per_parse, sources, aliveSpans?)`: every accepted top log whose kill (`duration_s`) reaches the window's end, measured with the same function, its average read over the player's own alive spans clipped to its kill (a pre-fight view passes none and reads each whole kill). Members no longer form the reference; `members` stay for the pre-fight count and the leave-one-out respan.
- **Rule.** `judge(amplification, reference, window)`: `interval` below, floor `timingS / lengthS` (the timing floor's seconds of the log's own average, spread over the window). Amber at most, no remedy.
- **Family** `burst.window` version 2, `pendingRebuild: null`, reference "every accepted top log whose kill reaches the window", new construct, claim, copy and limits.
- **Copy.** Graded: "You dealt 1.5K here, 1.49x your pull average, less than the 5 top logs. Aim for 1.5x or more." Comparison: "You dealt 1.5K here, 1.5x your pull average. The 5 top logs average 2.0x here." Under 5: "Only 4 top logs reach this window, too few to judge." No per-log damage baked: "No top log carries its own damage for this window, so it is not judged." No damage while alive: "You dealt no damage while alive, so this window is not judged." The multiple prints one more digit while it reads as its own target.
- **Card.** `WindowViewAdapter.overview` lets a card supply the headline figures in its own unit (the window's player figure is dropped when muted); the burst adapter gives the player's multiple and the top logs' mean, min and max multiple. `wl-window-comparison` gains `metricUnit` (`damage` or `multiple`, new `FormatMultiplePipe`), prints "Not measured" for a missing headline; burst labels are "Damage vs pull average" and "Damage vs pull average, top range". The "Nothing flagged" count reads the per-log reference. `findPlayerBurstWindows` no longer overwrites `window_damage` (only the ability rows read it).
- **Legacy window words retired.** `WindowStatus` is `'muted' | Tone`; `LOOK`, `isOnContract`, the delta's `better` state and `wl-compact-ability-row`'s `toned`, `higherIsBetter` and colored gap and casts are gone: no rule grades one ability, so its row prints numbers only.
- **Harness.** `LeaveOneOutService.foldBurst` drops the held-out log and respans each window on its remaining members (median start, mean length) at the transform's `CLUSTER_MIN_FRAC` (0.4, now exported). `BurstHeldOutService.judge` measures the held-out log on every folded window, whether or not its own burst formed it, through `measure`, `reference` and `judge`, with the page's gate (a window a death or the pull's end explains is no test). `HeldOutCaseService` makes burst cases for damage specs (none for healers) and names a burst bench without `per_parse` unfoldable. `InjectedMistakeService` makes `shift-burst-15s` (new `VERDICT_CHOICES.calibration.burstShiftS`): per folded window, the log's best span moves 15 s later and the 15 s it displaced come earlier, total kept; none when the shift would leave the pull. `PerturbationService` zeroes damage past a wipe and while dead, moves each second's damage up to the jitter away (total kept), scales damage, and leaves lust to rotation. `burst.window` joins the damage-scale invariant (a multiple is scale-free).
- **E2E.** The burst cards read the new labels, a multiple or "Not measured" for the headline, the delta only when drawn (a gh-pages bench before version 45 has no top figure), and the message by shape.

### Calibration test data and its cost

- One re-run of the one-off data workflow on this branch (run 39166421640, removed in the PR's last commit), seeded from `calibration-testdata` and re-benching Assassination Rogue, Balance Druid and Protection Paladin on 3470, 3445 and 3455 at version 45. Holy Paladin keeps its version 44 benches (a healer has no burst card, and nothing else it bakes changed). It spent 347 points (5.75 startup plus nine encounters from 20 to 53 each); 637 of 3,600 were left after it, against E2E's 50. `calibration-testdata` was force-updated; gh-pages and main were not touched, and the response cache was not saved.

### The measured report (rules' tone, before the caps)

`DATA_REF=calibration-testdata npm run data:pull && npm run calibrate`:

| Family | Tests | Amber rate | Amber bound | Detection | Verdict |
|---|---|---|---|---|---|
| burst.window | 423 | 0.7% | 1.8% | 136 of 398 (34%) | comparison: detection under 70% (and under the 500 tests minimum on the subset) |

- Page load: DPS 0.72 amber per held-out pull (0.68 before), tank 0.57 (0.53), healer unchanged; red 0.00. Inside the 1.0 budget.
- Invariants: truncation, both deaths and jitter hold for `burst.window`; damage scale leaves it unchanged. Every other family's line is as in package 5b.
- Why detection stays low: a top log with no burst at all (1.0x) is still inside the interval on 52% of the held-out windows (42% with no floor), because the other top logs spread a median 0.5x around a median 2.2x on windows of a median 11 s. The spread, not the floor, bounds detection; the offset search (5 s) also recovers part of a 15 s shift on windows longer than 10 s. The harness keeps the family a comparison, which is the intended fallback.

### Decisions and deviations

- **A per-second series, not a per-window value.** 5.4.1 names "window damage on the common span" as the baked measure. The leave-one-out fold respans each window on its remaining members, so a value baked on the full bench's span would leak the held-out log; the series lets the harness and the runtime measure any span through the one function. Not a deviation from the data shape's intent: it is the per-parse measure at a finer grain.
- **The offset search radius is the timing floor (5 s)**, no new chosen number; the effect floor is the same 5 s spread over the window. The 15 s shift lies outside the search on a window of 10 s or less.
- **Same span on both sides** includes time: each top log's average is read over the player's alive spans clipped to its kill. Reading top logs over their whole kill failed the truncation invariant (0.009 to 0.017), since a cut pull's average is opener-heavy.
- **Every accepted top log whose kill reaches the window** is the reference, not the members that formed it; a log with a shorter kill is left out rather than measured on a fragment.
- The detection result is the harness demoting the family, not a deviation.
- Contrast lift (5.7's "must pass contrast lift") waits for package 7a.

### Drift against 6882b59

- `window-view-service.ts:98` (the fragment check) is at `:107` (`judgedAs`, `PullModelService.causeOf`). `burst-feature-service.ts:85-86` was already gone (4c).

### Seams stubbed

- None in this package. The pre-fight view reads each top log's whole kill, as it has no player.

### For the next package

- `BurstBench.per_parse[].damage_per_s` is on disk for the three re-benched specs and arrives with the full ingest at version 45; a gh-pages bench before 45 has none, so its windows render "No top log carries its own damage" and the harness names it unfoldable.
- Detection for `burst.window` is bounded by the top logs' spread; a sharper construct (6b to 6f do not touch it) or the contrast cohort (7a) is where it can improve, not the floor.
- `wl-window-comparison` colors only through a `Tone`; a new window card must return one from its adapter.

## Package 6b: cooldown timing as unused ready time (done)

Branch `claude/verdict-validity-p6b-ready-time`, PR against `claude/verdict-validity-p6a-burst-amplification`.

### Done

- **Construct** (`data/rotation/ready-time-judge-service.ts`, `ReadyTimeJudgeService`, shared by rotation and defensives):
  - `readyCooldown(button, perParse, name)`: the cooldown checked against the observed top cadence first. Each top log's uses prove a recharge of at most `t / (k - charges)` for any run of `k` uses inside `t` seconds; the recharge is the stored cooldown or the median top log's proven one, whichever is shorter. On the calibration subset 3 of 21 rotation cooldowns run faster than stored (Fury of Elune 19 s on two bosses, Force of Nature 32 s, both stored at 60 s).
  - `measure(castTimesS, spans, cooldown, holds)`: the stretches in which every charge was ready (all charges ready at the pull), a use with no charge left restarting the recharge as a reset would; a stretch ending on a use a hold target explains is left out, and so is one that crosses a death (the press it would have had fell while dead). Returns ready seconds, alive seconds, their share and the longest stretch.
  - `reference(perParse, killsS, name, cooldown, holds, spans)`: every top log that used it, measured with the same function over the player's alive spans cut at its own kill (the 6a "same span on both sides").
  - `judge`: `mechanistic` with the game amount one recharge of ready time and the floor the 5 s timing floor, both as shares of alive time. `finding` emits a row only when the rule flags (red or amber evidence), on the calibrated tone, so it reads as a comparison until graded; the target and remedy print only when graded.
- **No baked field changed.** The construct reads `per_parse[].cd_casts_s` and `def_casts_s`, `sources[].duration_s` and the plan's `cooldown` and `charges`, all already on disk, so no `INGEST_VERSION` bump and no re-bake; no WCL points were spent. The calibration subset on `calibration-testdata` measures it as it stands.
- **Families.**
  - `rotation.ready_time` (new, version 1): tier red, cost high, `mechanistic`, mistakes `drop-major-cooldown-cast` and `delay-cooldown-30s`. Replaces `rotation.late_opener`, `rotation.cooldown_gap` and `rotation.lost_cast`, which are removed with their measures (`CadenceJudgeService` keeps only the hold check; `CooldownUseJudgeService` keeps `castTimesS`, `measure` and the never-used check).
  - `defensive.ready_time` (new, version 1): tier amber, cost medium, same construct, mistake `delay-cooldown-30s`. Replaces `defensive.first_use` and `defensive.gap`. Not for externals.
  - `rotation.never_used` version 2: judged only once the alive time runs one stored cooldown past every top log's first use (the gate 5b asked for), else muted with the cause when the pull has one; `pendingRebuild: null`.
  - `defensive.uses` keeps the count rule (5.7's Defensive cadence construct), `pendingRebuild: null`.
- **Page.** Offensives: a used majority cooldown gets at most one ready-time row, an unused one the never-used row; a ready-time row has no span to fold (measured on alive time). Defensives: the uses row and at most one ready-time row per defensive, then holds. Ready-time rows carry the `lost_cooldown` category (chip "lost cast": the game amount is one cast's worth); the `cooldown_delay` category and its "late" chip are gone. `PlayerDefensive` carries the plan's `cooldown` and `charges`. Not-graded lists name the new families. README line 11 names the new checks.
- **Harness.** `RotationHeldOutService` judges a used majority cooldown on ready time and an unused one on never-used, `DefensiveHeldOutService` adds the ready-time test beside the uses test, both through the page's methods and gates. `CalibrationIndexService.rateBound`: a perturbation that flags nothing passes, however few tests it left (with 5 to 7 tests the smoothed rate of zero flags on fewer perturbed tests read as a rise). Specs: `ready-time-judge.spec.ts`, the never-used gate pair, the zero-flag invariant pair, and the death and wipe invariants on the new measure.

### The measured report (rules' tone, before the caps)

`DATA_REF=calibration-testdata npm run data:pull && npm run calibrate`:

| Family | Tests | Red rate | Amber rate | Amber bound | Detection | Verdict |
|---|---|---|---|---|---|---|
| rotation.ready_time | 191 | 0.5% | 1.0% | 3.3% | 60 of 354 (17%) | comparison: detection under the floors (and under the minimum tests on the subset) |
| rotation.never_used | 5 | 0% | 0% | 45% | 0 of 8 | comparison: too few tests; the dropped-use variants stay blue, as pairing needs 2 expected uses and 8 of 10 agreeing |
| defensive.ready_time | 160 | 0% | 1.9% | 4.8% | 3 of 219 (1%) | comparison: detection |

- Page load: DPS 0.42 amber and 0.02 red per held-out pull (0.72 and 0.00 before), tank 0.33 (0.57), healer 0.63 (0.83); armed red stays 0.00. The removed opener, gap and first-use families carried most of the amber.
- Invariants: truncation, both deaths, the lust shifts and damage scale hold for both ready-time families and for `rotation.never_used` (which failed truncation and death before). Only `defensive.window`'s truncation failure remains, as in 5b.
- Against the families replaced: late opener 34%, gap 19%, lost cast 1 of 119; defensive first use 4%, gap 7%. The ready-time family detects less than the opener did, at a sixth of its amber rate.

### Why detection stays low, and what would raise it

- **The spread, mostly.** Over the first majority cooldown of each held-out log (the one the mistakes change), a prototype of the same measure finds 73% of the injected variants inside the top logs' interval, and the game amount alone blocking 12%. The median variant adds 20 s of ready time; the median amber edge sits 32 s above the top logs' mean. The spread comes from cooldowns top logs hold or pool on purpose: Vanish is bimodal (5 of 10 logs near 0.07 of alive time, 5 near 0.45), Thistle Tea's three charges run from 0.12 to 1.00, Kingsbane has two logs at 0.29 against eight near 0.10.
- **The game amount.** One recharge of ready time is the paper's mechanistic amount; a 30 s delay of a 60 s or 120 s cooldown is under it by construction, and dropping the last use near the end adds only the time left. Without the amount (interval alone) the prototype detects about 31% at a 2.6% flag rate, still under the floors.
- **Defensives** are pressed when the damage comes, so their ready time spreads across the whole range; a 30 s delay almost never leaves it. Their count (`defensive.uses`, 74%) stays the defensive card's strongest check.
- **What would raise it:** hold windows the bench does not detect as holds (pooled charges, a bimodal cooldown) taken out of both sides per log, or the reference split by cast pattern; the contrast cohort (7a) for a lift gate in place of the held-out power floor; injected mistakes shaped like the claim (one dropped mid-pull use rather than the last).

### Decisions and deviations

- **No new baked field.** 5.4.1 lists unused ready time as a per-parse measure. The fold and the runtime both need it over the player's spans and on the fold's own recharge, so a value baked over each log's whole kill would leak and could not be respanned; the baked casts let ingest, the harness and the page measure it through the one function (6a's reasoning for the burst series).
- **Defensive cadence.** The paper's Defensive cadence row keeps a count over available time, so `defensive.uses` stays; ready time replaces only the first-use and gap rows (section 6 removes those). The two rows can show for one defensive, as uses and gap did.
- **Never used stays its own family** (5.7 "Keep, corrected gate"); a used cooldown goes to ready time, an unused one to never used, so one cooldown gives at most one row.
- **Tiers.** `rotation.ready_time` is red tier and high cost like the lost cast it replaces; `defensive.ready_time` amber and medium like the defensive rows it replaces.
- **A wait crossing a death is left out** on both sides, as the gap measure did: an inserted death with a rez otherwise read the dropped presses as ready time (0.016 to 0.098). A limit names it.
- Not a deviation: the harness keeps both ready-time families as comparisons.

### Drift against 6882b59

- None beyond earlier packages: RC1's `cast-cadence-service.ts:81` was already gone (4d), and 5.4.2's plan gate is at `bench-pipeline-service.ts:81` (package 5).

### Seams stubbed

- None.

### For the next package

- `ReadyTimeJudgeService` is the one ready-time measure; 5.8's "never-pressed buttons judged by ready time" can call it with a list button's cooldown and charges.
- A page that judged `rotation.late_opener`, `rotation.cooldown_gap`, `rotation.lost_cast`, `defensive.first_use` or `defensive.gap` now reads `rotation.ready_time`, `rotation.never_used` or `defensive.ready_time`; the registry hash changed, so every family renders as a comparison until the next ingest recalibrates.
- The full ingest measures the same construct on every bench at version 45 or 44 with no re-bench; expect the pooled tests to pass the minimums and detection to stay where the spread puts it.

## Package 6c: Downtime as idle time beyond the GCD or cast time (done)

Branch `claude/verdict-validity-p6c-downtime`, PR against `claude/verdict-validity-p6b-ready-time`.

### Done

- **Construct** (`data/rotation/downtime-judge-service.ts`, `DowntimeJudgeService`):
  - `idleStretches(events, spells)`: the stretches between two casts that no cast time or global cooldown covers. A cast is busy from its begincast (or its cast when instant) to the later of its cast and the start plus its global cooldown; the global cooldown is the plan spell's `gcd` (0 off the GCD, the list's most common GCD for an id the list does not name), hasted by the nearest hardcast's cast time over its base (clamped to 0.5 to 1, floored at the game's 0.75 s, never hasted at a flat 1 s). A press on the GCD ends any pending begincast, so an interrupted cast never pairs with a later instant press; fake casts are left out. Time before the first busy block and after the last never counts. Edges are rounded to 0.1 s. Null under two casts.
  - `measure(stretches, spans)`: idle seconds inside the alive spans, alive seconds and the idle percentage.
  - `reference(perParse, killsS)`: each top log's percentage over its own kill (`sources[].duration_s`).
  - `judge`: `interval` above, floor the 5 s timing floor as a percentage of the player's alive time; the family's amber tier caps a red edge, so it is never red.
  - `finding`: a row only when the rule flags, on the calibrated tone; the target ("Aim for X% or less") and the fix ("Fill Ns of idle time with casts.") print only when graded, and N is the idle time past the top logs' average share over the player's alive time.
- **Baked measure.** `RotationParseMeasures.idle_s` (optional, null under two casts) replaces `efficiency_pct`; `RotationBench` loses `downtime_threshold_s`, `top_avg_efficiency` and `top_efficiency_stddev` (no reader left). `RotationTransformService` bakes `idleStretches` over the log's presses with the plan's spells plus its trinket spells. `INGEST_VERSION` 46. A rotation bench grows by about 25 KB (Assassination Rogue 3445: 36 KB).
- **Runtime.** `RotationFeatureService.checkCastEfficiency` takes the cast and begincast events up to the judged end and the bench list's spells. The card subtitle reads "Time you spent idle past each cast's global cooldown and cast time, compared with the top logs."; the empty states say "idle time". `castDowntimeS` and `castEfficiencyPct` are gone from `analysis-math.ts`.
- **Family** `rotation.downtime` version 2, label "Idle time", `pendingRebuild: null`, alignment "the player's alive spans before the judged end, each top log over its own kill", new limits (channels, haste with no hardcast, top-log deaths).
- **Harness.** `RotationHeldOutService` judges the held-out log's stretches over its model's alive spans (a cut or perturbed pull is now a test). `PerturbationService` joins the stretches around a dead span into one and drops a stretch that ends past the last alive moment, as the page sees a death or a cut. `InjectedMistakeService` makes `idle-5-gcds` by lengthening the stretch idle at mid-pull (or the first after it) by 7.5 s and playing the rest of the pull that much later, the tail cut at the kill.

### Calibration test data and its cost

- One re-run of the one-off data workflow on this branch (run 39172226196, removed in the PR's last commit), seeded from `calibration-testdata` and re-benching Assassination Rogue, Balance Druid and Protection Paladin on 3470, 3445 and 3455 at version 46. It spent 351 points (3,562 before, 3,211 after, against E2E's 50). `calibration-testdata` was force-updated; gh-pages and main were not touched. Holy Paladin keeps its version 44 benches, which carry no `idle_s`, so the healer has no downtime test on the subset; the full ingest measures it on every spec.

### The measured report (rules' tone, before the caps)

`DATA_REF=calibration-testdata npm run data:pull && npm run calibrate`:

| Family | Tests | Red rate | Amber rate | Amber bound | Detection | Verdict |
|---|---|---|---|---|---|---|
| rotation.downtime | 90 | 0% | 2.2% | 6.8% | 7 of 90 (8%) | comparison: detection under 70% (and under the minimum tests on the subset) |

- Against the construct replaced: 120 tests at 6.7% amber and 3 of 120 detection (3%).
- Top logs' idle level: Assassination Rogue 21% to 23% of the kill (energy pooling on a flat 1 s GCD), Balance Druid 9% to 14%, Protection Paladin 2% to 3%, against the median 23.7% of the old definition.
- Page load: DPS 0.35 amber and 0.02 red per held-out pull, tank 0.33, healer 0.57 (without a downtime test the subset reads 0.35, 0.27 and 0.57); armed red stays 0.00.
- Invariants: truncation, both deaths, the lust shifts, jitter and damage scale hold for `rotation.downtime`. Only `defensive.window`'s truncation failure remains.

### Why detection stays low, and what would raise it

- **The spread.** Per bench the top logs' idle share spreads 1.0 to 3.7 points (sd); the amber edge for one new log sits about 2 sd plus the 5 s floor above their mean, a median 5 to 8 points, while five idle GCDs add 1.9 to 2.5 points on these kills. A prototype of the same rule finds the median held-out log needs 24 s of added idle (16 GCDs) to reach 70% detection; without the floor 19 s, and the floor-free rule detects 20 of 90 at 6 of 90 flags, still under the floor.
- **What sets the spread:** energy and other resource waits (most of the rogue's idle, which top logs take in different amounts), movement and boss downtime the log does not show, and haste read from hardcasts only (the paladin has almost none).
- **What would raise it:** leaving out waits where the next button's resource was short (the casts carry `classResources`), the boss's untargetable phases taken out of both sides, or the contrast cohort (7a) for a lift gate; a larger idle mistake shaped like the claim (a 20 s stall) would be detected, but five GCDs is inside how much top raiders differ from each other.

### Decisions and deviations

- **Baked stretches, not a share.** Each top log is read over its own kill, so a share would do for the reference; the stretches let the harness judge truncated and death-perturbed logs through the same `measure`, and the injected mistake change the pull rather than a number.
- **Each top log over its own kill**, not the player's spans: the task's "each top log over its own alive time". Top-log deaths are not baked, so a top log is alive for its whole kill (a limit).
- **Haste from hardcasts.** A log with none reads the base GCD on both sides; no new chosen number (the clamps and the 0.75 s floor are game rules, beside the code).
- **The fix quotes the excess over the top average** (5.7's "Idle 41 s more than the top average"), not over the edge.
- Not a deviation: the harness keeps the family a comparison.

### Drift against 6882b59

- None beyond earlier packages: RC1's `rotation-feature-service.ts:205-207` (efficiency) was already off the path (4b).

### Seams stubbed

- None.

### For the next package

- `per_parse[].idle_s` is on disk for the three re-benched specs and arrives with the full ingest at version 46; a bench before 46 has none, so the card reads "None of the N top logs carries its idle time to compare with." and the harness counts no downtime test.
- The registry hash changed (downtime version 2), so every family renders as a comparison until the next ingest recalibrates.
- `DowntimeJudgeService.idleStretches` is the one idle measure; a resource-wait exclusion would go there, read the same way in ingest and at runtime.

## Package 6d: Defensive windows as coverage by any defensive (done)

Branch `claude/verdict-validity-p6d-defensive-coverage`, PR against `claude/verdict-validity-p6c-downtime`.

### Done

- **Construct** (`DefensiveJudgeService`, one set of functions for ingest, the harness and the page):
  - `coverSpans(defensives)`: each plan defensive's own aura spans, rounded; a use that opened no aura (an external) covers nothing.
  - `measureCover(window, up)`: the names of every defensive whose aura touches the window within the 3 s slack; empty is uncovered. Any defensive counts, not only the one whose uses formed the window.
  - `takenSeries(events, fightLenS)` (the burst `series` over damage taken) and `measureTaken(perS, window)`: damage taken in every whole second the window touches, its last one included.
  - `reference(window, perParse, killsS)`: every top log that carries the new fields, whose kill reaches the window's end and that is alive through it; k = those with any defensive up, the median and the list of their damage taken there, `immune` when none took damage.
  - `judgeWindow` keeps the rule: `consensus` paired with damage above the top logs' median, `pairedOnly`, the pairing forced false for tanks and immunity windows (coverage only). With `pairedConsensusShare` it is amber only when uncovered, at least 8 of 10 top logs covered and the damage above their median.
- **Baked measure.** `DefensiveParseMeasures` gains `def_up_s` (aura spans per defensive), `taken_per_s` (damage taken per whole second) and `dead_s` (the log's dead spans, from a raid-wide Deaths read, plus Resurrects when the player died), all optional for older benches. `INGEST_VERSION` 47. A defensive bench grows from about 10 KB to 19 to 35 KB.
- **Page.** The window verdict reads "No defensive was up at 3:25. 8 of 10 top raiders had one up.", with "You took more damage here than half of the top raiders." only when graded, and "You had Evasion up at 3:25. ..." when covered. Comparisons: "No top log carries its defensives for this window, so it is not judged." (a bench before 47), "Only N top logs are alive through this window, too few to judge.", "None of the N top raiders had a defensive up here.". The headline is the player's damage taken against the reference logs' mean, min and max on the same series (`WindowViewAdapter.overview`), the baked window figures only on a bench before 47. Card subtitle: "Each moment top logs press a defensive, and whether you had any defensive up."; README line 13 says the same.
- **Families.** `defensive.window` version 2, `pendingRebuild: null`, reference "whose kill reaches the window and who are alive through it", mistakes `strip-defensive` and the new `uncover-window`. `defensive.dead_in_window` version 2 (reference alive into the window; tests now exist).
- **Harness.** `DefensiveHeldOut` carries `up` and `takenPerS` in place of `covered`, and its model carries the baked `dead_s`. `DefensiveHeldOutService.windowRows` gives a window the log died in a `dead_in_window` red row, and every other judged window one coverage test and one neutral `dead_in_window` test. `InjectedMistakeService`: `strip-defensive` also removes the defensive's auras; `uncover-window` removes every aura up at one covered window (damage kept); `die-in-window` kills the log halfway into each window it was alive through. `PerturbationService` keeps a log's own deaths beside an inserted one (merged, cut at the judged end), cuts its auras at a death and zeroes its damage taken while dead or past the cut, and scales `takenPerS`. `CalibrationIndexService` runs no death or death-rez invariant on `defensive.dead_in_window`: the inserted death is the fact it states.

### Calibration test data and its cost

- One re-run of the one-off data workflow on this branch (run 39174009447, removed in the PR's last commit), seeded from `calibration-testdata` and re-benching Assassination Rogue, Balance Druid and Protection Paladin on 3470, 3445 and 3455 at version 47. `calibration-testdata` was force-updated; gh-pages and main were not touched, and the response cache was not saved.
- **Points: over the limit.** The budget read 2,976 of 3,600 before the run and 892 after it (E2E needs 50): 2,084 points over the run window, against the about 450 this package was allowed. The run's own tallies sum to about 1,392 (13.75 startup plus nine encounters of 116 to 169 each, with 19 to 52 uncached reads each); the rest was spent on the shared pair inside the same window, which the log cannot attribute. The new raid-wide Deaths read (and Resurrects where a top log died) missed the restored response cache for every top log of every bench; the per-read cost of those misses was not estimated before the run, which is how the limit was breached. The full ingest pays the same Deaths read once per top log on its version 47 re-bench.
- Holy Paladin keeps its version 44 benches, which carry no coverage fields, so the healer has no window test on the subset.

### The measured report (rules' tone, before the caps)

`DATA_REF=calibration-testdata npm run data:pull && npm run calibrate`:

| Family | Tests | Red rate | Amber rate | Amber bound | Detection | Verdict |
|---|---|---|---|---|---|---|
| defensive.window | 140 | 0% | 1.4% | 4.4% | 21 of 148 (14%) | comparison: detection under 70% (and under the minimum tests on the subset) |
| defensive.dead_in_window | 140 | 0% | 0% | 2.1% (red) | 140 of 140 | comparison: under the 1,500 red minimum on the subset |

- Against the construct replaced: `defensive.window` 217 tests at 2.8% (an upper bound) and 0 of 84 detected; `defensive.dead_in_window` had no test.
- Fewer window tests: a top log dead in the window or whose kill ends inside it is no longer counted, and the healer's version 44 benches give none.
- Two top logs died on the subset (Balance Druid 3445, Protection Paladin 3455), neither inside a window, so the death fact flags no held-out log.
- Page load: DPS 0.38 amber and 0.02 red per held-out pull, tank 0.33, healer 0.37 (no healer window test); armed red stays 0.00.
- Invariants: death, death-rez, jitter and damage scale hold for `defensive.window`; truncation still fails on few tests (0.021 to 0.037 smoothed, the same 2 flags on fewer tests), as it did for the old construct. `defensive.dead_in_window` holds truncation.

### Why detection stays low, and what would raise it

- **Tanks.** Of the 121 `uncover-window` trials, 67 are Protection Paladin windows, which the rule judges on coverage alone (a blue count), so they can never reach amber. That is the paper's rule, not a defect.
- **The coverage share.** Even counting any defensive, top logs cover a median 0.75 of a window (0.5 to 1.0 over the 17 windows): a window forms where half of the logs pressed one defensive, and the rest are often uncovered. 31 trials sit on windows under the 8 of 10 the rule needs.
- **The damage condition.** 13 more trials have the log's damage at or below the others' median: the mistake removes the aura but not the damage it would have saved, so a log that took little damage stays under the median. 10 trials are detected; `strip-defensive` adds 11 of 27.
- **What would raise it:** a mitigation estimate added back to the damage taken in an uncovered variant (the aura's known damage reduction), which the bench does not bake; windows formed on any defensive rather than one defensive's uses, so a window means "top logs cover this moment"; and for tanks the contrast cohort (7a) rather than held-out power, since the rule never colors them.

### Decisions and deviations

- **Spans and a series, not a per-window boolean.** 5.4.1 names "coverage per window" as the baked measure; the fold respans each window on its remaining members, so a value baked on the full bench's span would leak the held-out log. The aura spans and the per-second damage let ingest, the harness and the page measure any span through one function (6a's reasoning).
- **"At the hit" is the window with the 3 s slack**, the slack already used; no new chosen number.
- **The reference is every top log alive through the window**, not the members that formed it, and the median damage is over all of them.
- **Deaths in the reference.** A top log dead inside the window is left out of the coverage reference; a top log's baked death also shortens its own alive spans when it is the held-out log, which changes its defensive use and ready-time tests as the page would.
- **No death invariant for the death fact.** The paper's death insertion invariant guards rules a death confounds; for `dead_in_window` the inserted death is the claim, so its rise is detection. Truncation still runs on it.
- **The healer stays at version 44** on the subset to keep the run's cost down; the full ingest measures every spec.
- The WCL spend breached this package's limit (above); it is not a deviation from the paper's plan, which the work follows.
- Not a deviation: the harness keeps both families comparisons.

### Drift against 6882b59

- None beyond earlier packages: the RC4 row's `DefensiveFeatureService.defensiveWindowStatus` was replaced in 4d.

### Seams stubbed

- None.

### For the next package

- `per_parse[].def_up_s`, `taken_per_s` and `dead_s` are on disk for the three re-benched specs and arrive with the full ingest at version 47; a bench before 47 renders every window as "No top log carries its defensives for this window, so it is not judged." and gives the harness no window or death test.
- `dead_s` is the first baked top-log death. Downtime (6c) and ready time (6b) still treat every top log as alive for its whole kill; they can read `dead_s` from the defensive bench of the same encounter.
- The registry hash changed (both window families at version 2), so every family renders as a comparison until the next ingest recalibrates.
- Expect each version 47 re-bench to pay one Deaths read per top log that the response cache does not hold yet.

## Package 6e: Bloodlust as overlap of the cooldown's aura with the raid's lust (done)

Branch `claude/verdict-validity-p6e-bloodlust-overlap`, PR against `claude/verdict-validity-p6d-defensive-coverage`.

### Done

- **Construct** (`BloodlustJudgeService`, one set of functions for ingest, the harness and the page):
  - `effectSpans(auraSpans, castTimesS, durationS, fightEndS)`: per use, the aura the press opened on the player (paired through `DefensiveUsesService.uses`, so a pre-pull aura counts from 0), else the plan cooldown's stated `duration` from the press, cut at the end of the pull; overlapping effects join, edges rounded to 0.1 s. Auras are read through `AuraWindowsService.spansNamed`, so an aura under another id of the cooldown's name counts.
  - `lustSpan(lustS, killS)`: the raid's lust from its start for `LUST_DURATION_S` (40 s, the game length of every `BLOODLUST_IDS` aura), cut at a kill. `lustOf(lustS, model)` cuts the player's at the judged end only on a kill; a wipe or a death inside the lust folds the row (`PullModelService.foldFindings` on the lust span, the held-out `HeldOutRowService.row` on the same span).
  - `measureOverlap(spans, lust)`: seconds up inside the lust and `up` (any effect touching it, so a zero-length press inside the lust is up).
  - `reference(perParse, killsS, name)`: every top log whose lust is mid-fight (`isMidFight`: later than `VERDICT_CHOICES.midFightLustS`, 30 s) and that carries `cd_up_s`, each measured on its own lust cut at its own kill. `wantsLust`: at least `minReferenceN` such logs and at least `lustWantShare` (0.5) of them up.
  - `judge(overlap, reference, band)`: `consensus({ differs: not up, k: logs up, n, paired: inside the lust band })`; the band is 4f's `judgeBand` (the `interval` rule on the top logs' mid-fight lusts, 5 s floor, the player's lust mid-fight). Amber from 8 of 10 inside the band, else blue, never red, no remedy.
  - `findings(name, spans, lust, top, caps)`: nothing without a lust, when not wanted, or when the cooldown was up; inside the band the overlap row ("Shadow Blades was up for 0s of your raid's 40s Bloodlust at 02:00. 5 of 5 top raiders who lusted mid-fight had it up for theirs.", measured "0s of 40s" / "in Bloodlust, 5 of 5 top logs had it up"); outside it the neutral context row of 4f.
- **One family.** `rotation.bloodlust` version 2, `pendingRebuild: null`, construct, claim, availability, copy and limits on the overlap; `rotation.bloodlust_timing` and its timing row are removed (`judgeAlignment`, `judgeTiming`, `measureOffset` gone). Mistake `move-cooldown-out-of-lust`.
- **Baked measure.** `RotationParseMeasures.cd_up_s` (optional): `effectSpans` per plan cooldown over the whole pull, baked by `RotationTransformService.summarizeCooldownCasts` from the Buffs stream and the report's abilities it already reads (no new WCL read). `PerCdBenchmark` is `CadenceBenchmark`: `bl_pct`, `avg_bl_offset_s` and `stddev_bl_offset_s` are dropped from the bench, the transform and the fold. `INGEST_VERSION` 48.
- **Page.** `RotationScanInput` carries the report's `abilities`; `analyzeRotationFindings` builds each cooldown's effect spans with the same call and passes them to `analyzeOneCooldown`. The plan view's Bloodlust badge reads the same reference (with kills), so a bench before 48 shows none. README line 11 names the check.
- **Tolerance of an older bench.** A bench without `cd_up_s` gives no reference, so no row, no badge and no held-out test; the harness keeps the family a comparison (0 tests).
- **Harness.** `RotationHeldOutService.lustRows(fold, log, name)` judges the held-out log's baked `cd_up_s` against the fold on its own lust (no test when either side lacks the field, outside the band, or when a death or the judged end falls inside the lust). `InjectedMistakeService.outOfLust`: the first cooldown up during the log's lust has every effect overlapping it, and the press that opened it, moved to start 30 s (`calibration.delayS`) after the lust ends. `PerturbationService` cuts `cd_up_s` at a death or a cut like the defensive auras and jitters each span with the casts. The lust-shift invariant reads the new family through the same `lustRows`.
- **Tests.** `bloodlust-judge.spec.ts` pairs every boundary (an effect ending at the lust start against 0.1 s before it, mid-fight at 30 s, the 0.5 want share, the 0.8 paired share, the band edge, the kill cut); the transform spec bakes `up_s` from an aura, from the stated duration and from a pre-pull aura; the feature spec judges an aura up through the lust and folds the row on a death in it; held-out, mistake and perturbation specs cover the new field.

### The measured report (rules' tone, before the caps)

`DATA_REF=calibration-testdata npm run data:pull && npm run calibrate`: `rotation.bloodlust` 0 tests (the version 47 benches carry no `cd_up_s`); every other family and the page load are as in 6d (DPS 0.38 amber and 0.02 red per held-out pull, tank 0.33, healer 0.37; armed red 0.00), and only `defensive.window`'s truncation invariant fails, as before.

### What the first full ingest measures, and what thin mid-fight lust data means

- The version 48 re-bench bakes `cd_up_s` on every rotation bench; it reads no new stream, so its cost is the version re-bench itself. The test-data budget was spent, so nothing was re-baked here.
- Even with the field baked, the calibration subset would give the family no test: its most mid-fight lusters on one bench are 4 (Balance Druid 3470), under the 5 `wantsLust` needs; 105 of its 120 top logs lust within 30 s of the pull.
- At the full ingest the tests come only from bosses whose top raids plan a mid-fight lust (3470 is the only such boss on the subset), at most one test per cooldown per such log. Expect far under the 500 pooled tests amber needs, so the family stays a comparison by the minimum alone, before detection is measured. Detection itself should be high where a test exists: the injected mistake leaves the cooldown with no effect in the lust, which `differs` reads exactly, and it colors amber when at least 8 of 10 mid-fight lusters had it up; a cooldown up for fewer of them stays a blue count.
- What would raise the test count: more top logs per boss for mid-fight lust bosses (a second rankings page), or pooling the lust check across a spec's bosses before the per-spec arming; neither is in this package.

### Decisions and deviations

- **One new field.** The paper names "the per-parse aura spans"; the raid's lust end is not baked. The lust is read at its 40 s game length from the baked `lust_s` on both sides (cut at a kill), because the player's own aura ends at a death, which the fold already explains. Not a deviation: the data shape is the one the paper describes.
- **The cooldown's aura.** A cooldown whose effect sits on the target (Deathmark, Kingsbane) logs no aura on the player, so its effect is the plan's stated duration from the press, the same rule on both sides; a limit names it.
- **Up, not seconds.** The rule's `differs` is "no effect touching the lust"; the seconds up are measured and printed but not judged on, since the paper's row is a count of top raiders who had it up, and a seconds interval over mostly zero or 40 s values would be bimodal.
- **`VERDICT_CHOICES.lustWindow` is `midFightLustS`** (30 s, the same number); the 55 s trail had no reader left.
- **The timing family is folded away**, not kept at a new version: inside the overlap construct the timing question (pressed too early or late for the lust) is the same overlap.
- Not a deviation: the family has no test on the subset and stays a comparison.

### Drift against 6882b59

- None beyond 4f's: RC3's window (`rotation-transform-service.ts:27-28,138`), gate (`rotation-feature-service.ts:237`) and critical miss (`:166-167`) were replaced in 4f; the window is gone now.

### Seams stubbed

- None.

### For the next package

- `per_parse[].cd_up_s` arrives with the full ingest at version 48; a bench before 48 renders no Bloodlust row or badge and gives the harness no test.
- `BloodlustJudgeService.effectSpans` is the one effect measure for an offensive cooldown; a construct that needs a cooldown's effect window (5.8's buttons, cost) can read the baked `cd_up_s`.
- The registry hash changed (`rotation.bloodlust` version 2, `rotation.bloodlust_timing` gone, `midFightLustS`), so every family renders as a comparison until the next ingest recalibrates.
- `npm run calibrate` launches the system Chrome channel when Playwright's own Chromium does not match; in this container that needed `/opt/google/chrome/chrome` linked to `/opt/pw-browsers/chromium`.
