# Verdict validity: an audit of the post-raid verdicts and the solution

Scope: every card that judges a pull (rotation rules, offensive cooldowns, downtime, burst windows, defensive windows and cadence, gear) plus the cards that describe one (pull overview, map, Northern Sky export, live clips), at commit `6882b59` (ingest version 43). `RA` below is `frontend/src/app/domains/raid-analysis`. Finding ids (TIME-n, APL-n, UX-n, POP-n, CON-n, STAT-n) are listed in Appendix A.

The question this document answers: where does what the site tells a raider differ from what a raider reads into it, and from what is objectively correct, as a matter of concept rather than arithmetic; and what change makes the site's verdicts defensible and keeps them so.

---

## 1. Summary

**The core problem.** Every colored row on the post-raid page is an implicit statistical claim: "you differ from the top raiders here, in a way that matters". None of the rules that produce those rows has a known error rate, and none is ever checked against the logs it claims to describe. Measured on the real baked benches:

- A log exchangeable with the bench's ten top logs draws about **1.07 red and 5.44 amber rows per pull** over a median of 48 tests; 66% of such pulls show at least one red, 99.5% at least one amber [estimated from the stored statistics, E5 3.2]. A leave-one-out replay of 317 real top parses through the cadence rules alone gives 0.26 red and 0.98 amber per pull [measured, E5 3.4]. Under the rules as rebuilt by this plan, the validity harness measures 0.00 red and 0.68 amber rows per held-out top pull (DPS 0.68, tank 0.53, healer 0.83) over 120 top pulls of four specs on three bosses [measured, `npm run calibrate` over the `calibration-testdata` subset].
- The colors barely separate good play from weaker play: burst windows flag 15.9% of windows for a top-10 player and 31.7% for a modelled rank ~950 player; 39% and 57% once the window displacement the bench itself shows is included [estimated, E2 and E5 3.5].
- Several numbers measure something other than their label: burst "damage vs top" is mostly the overall DPS gap plus a measurement artifact; the "Uncommon build" warning hits 59% of the benched top players against their own bench; top logs are "idle" a median 23.7% of the fight under the downtime definition.
- The tool has no model of the player's own pull: one death turns into several "lost cast" criticals and a red burst window. Bloodlust is compared against the player's own raid lust (sound), but "this cooldown wants Bloodlust" is learned from top raids that lust on the pull, so a raid that lusts mid-fight gets a critical "missed Bloodlust" by chance. On the version 44 subset 105 of 120 top logs lust within 30 s of the pull and no bench holds 5 mid-fight lusts, so the rebuilt Bloodlust rule makes no row there and its chance rate is 0 [measured].
- Healers are benchmarked against the ten highest-damage healers; the Northern Sky export ships pull-relative lines that the addon drops at the first phase change on four bosses.

**The solution** has three parts that overlap in time (part 1 is stage 0; part 2 is stages 1-3 and 5; part 3 is stages 4, 6 and 7 of section 6). It is assembled from four independently designed proposals scored by three independent judges (section 2):

1. **Honest now.** Remove the colors the audit has already shown cannot be defended at n <= 10, add tolerance where rounding removed it, stop judging time the player was dead or the pull was over, and show the evidence (n, counts, the finding sentence). Days, runtime only.
2. **Measured next.** A verdict contract in code (one typed registry entry per finding, one service that may assign a color, a closed set of decision rules) and a validity harness in ingest that replays every benched top log leave-one-out through the exact runtime rules, injects known mistakes, perturbs pulls with deaths and wipes, and checks discrimination against weaker logs. A rule shows a color only while its measured error rates are inside its budget; otherwise it is demoted automatically.
3. **Rebuilt last.** Replace the constructs that calibration cannot repair (burst on a common span relative to the player's own throughput, defensive coverage, unused ready time, downtime beyond the GCD, per-node talents, Bloodlust overlap), then the rotation engine's decision semantics, then a cost-ranked "what to fix first" layer.

The definition that holds the three together: **a colored row is defensible when (1) it measures the same quantity on the player and on the reference logs over the time the player could act, (2) its false-flag rate on top logs held out of their own bench is measured and inside a stated budget, (3) it flags weaker logs measurably more often than top logs, and (4) its copy claims no more than a difference from top raiders.**

---

## 2. How this was established

| Step | What was done | Output |
|---|---|---|
| Code fact sheets | 16 slices of the code documented with file:line, every constant, formula, fallback and user-visible string | Behavior reference |
| Empirical analysis | Python over all baked bench files on `gh-pages` (40 specs, about 9 bosses each, 2,096 files, ingest version 43) plus a live `characterRankings` spot check (Assassination Rogue, two bosses, ranks 1-100 and about 901-1000) | Measured rates and estimates, labelled as such |
| Six audit lenses | Time alignment and survival; rotation (SimC APL) semantics; user expectation and copy; reference population; construct validity; statistical decision rules | 72 findings |
| Verification | Every finding checked against the code by one verifier and attacked by an adversarial refuter | 68 confirmed (17 high, 41 medium, 10 low materiality), 4 refuted; 33 needed corrected specifics |
| Solution design | Four complete proposals from different angles: validation-first, contract-first, model-first, honesty-first triage | Four designs |
| Judging | Three independent judges (measurement science, raid coaching, codebase engineering) scored the four and ruled on every disagreement | The composite plan in section 5 |
| Review | This paper checked by a claims reviewer against the audit material and by a code-reference checker against the repository | Corrections applied |

Where the judges split, the paper takes the statistically stricter figure on error control and the majority on everything else: arming bounds and sample sizes (section 5.4) combine the measurement judge's sample sizes with the other two judges' bounds; the contrast cohort refreshes weekly (two of three); the contract lives in a new skill with a CLAUDE.md router row (two of three); talent nodes stay information only (two of three).

Limits of the evidence: the per-pull false-flag figures are partly estimated from stored means and spreads under stated distributional assumptions; the only replay of real top parses covers the cadence rules. Producing these numbers from production code on every ingest is the first job of the harness in section 5.4.

The four refuted findings, for the record: alignment by seconds from the pull is correct on this raid tier (shared burst windows do not move with kill length, median slope +0.005, E2 section 5), so phase re-alignment is a guard rather than a re-architecture (TIME-3, TIME-11); exporting one real top log to Northern Sky is the right design, only its label and phases are wrong (POP-9); the map draws all ten top players, so its centroid ring is a weak summary rather than a misleading one (POP-10).

---

## 3. What is wrong, by root cause

Each root cause groups findings that share one conceptual error. "Reads" is what a raider believes the card says; "correct" is what a defensible version would measure or claim.

### RC1. Verdict rules are hand-set and never validated

| | |
|---|---|
| Does | Each card applies its own rule: buttons are red below the lowest of the top logs and amber below their mean (`list-finding-service.ts:71-74`); timing rules flag beyond mean + max(2 sd, floor) from 10 or fewer values (`analysis-math.ts:58-60`), where the first-cast and lust-offset tests pass a 2 s floor (`TIMING_BAND_MIN_S`, `analysis-math.ts:56`) and the gap test passes none (`cast-cadence-service.ts:81`), so a gap bench with sd 0 has zero tolerance; efficiency warns below mean - 1 sd (`rotation-feature-service.ts:205-207`); burst is red below min - sd and amber below avg - sd (`burst-feature-service.ts:85-86`); consensus gates sit at exactly 50%. Nothing in ingest or runtime measures how often any rule fires on a top log. |
| Reads | Red and amber mean "you did something top raiders do not do". A clean card means "you played it like them". |
| Correct | Each rule is a test with a false-flag rate that follows from its shape: below the minimum of n is 1/(n+1), 9.1% at n = 10 per test, regardless of play; below the mean flags 20-41% of top players per button (shares are skewed toward 1.0, E1); a 1 sd one-sided band at n = 10 is 18.3%. A page running about 48 such tests per pull must control the expected number of false rows, show n, and prove its rules separate better from worse play. |
| Evidence | 1.07 red and 5.44 amber per top pull (E5 3.2); 33% of benched buttons have lo = avg = hi = 1, so a single miss is red (E1); the README states thresholds are "not from arbitrary constants" (`README.md:17`) while every tolerance multiplier is hand-set (UX-8). |
| Findings | STAT-1, STAT-2, STAT-9, STAT-10, STAT-12, UX-1, UX-8, POP-7, CON-11, APL-10 |

### RC2. One reference population, selected on damage, for everything

| | |
|---|---|
| Does | `RANKINGS_Q` hardcodes `metric:dps` for every spec (`wcl-queries.ts:49-54`); the first 10 usable rows of the newest partition with rows are the bench for every card; benches may hold a single parse (`MIN_SAMPLE_COUNT = 1`, `bench-pipeline-service.ts:138`; only rotation requires 5); n is printed only on the pre-fight plan table. |
| Reads | "Top raiders on your spec" means the best players at my job, and a percentage is a population fact. |
| Correct | For healers the ranked outcome is healing (`metric` accepts `hps`); tanks ranked by damage is WCL's own convention and acceptable. The top 10 by damage carry more item level, shorter kills and more recent kills than other logs, so absolute damage comparisons import those differences. At n = 10 a share of 2 of 10 has a 95% interval of 3-56%. |
| Evidence | Top 10 vs ranks about 901-1000: +23-28% DPS, 28-58 s shorter kills, +3.9-5.7 item levels (E5 4). Healer rotation benches have 0 judged buttons in all 38 files (E5 1.2; E1 lists them). The modal exact talent build is a median 2 of 10 and all ten differ in 148 of 337 benches (E4). |
| Findings | POP-1, POP-2, POP-3, POP-5, POP-11, UX-10, UX-11, CON-10, STAT-4, STAT-6 |

### RC3. No model of the player's own pull or of the raid's decisions

| | |
|---|---|
| Does | Of the judging cards only the defensive card reads deaths; the pull overview reads them to list deaths and place the wipe. Expected cooldown uses scale with the full WCL fight window (`analysis-math.ts:97-107`); burst windows count 0 damage while dead; a window that starts before the pull ends is judged on its fragment (`window-view-service.ts:98`). A cooldown "wants Bloodlust" when 50% of top parses cast inside [lust - 30 s, lust + 55 s] of their own raid's lust (window at `rotation-transform-service.ts:27-28,138`, gate at `rotation-feature-service.ts:237`); the player is judged against their own raid's lust, and a miss is critical (`rotation-feature-service.ts:166-167`). Defensive windows judge damage taken at the top raiders' press clock regardless of who was targeted. |
| Reads | A death is one mistake; cooldown advice is about my cooldown use; "missed Bloodlust" is a cooldown-discipline error. |
| Correct | Every measurement that requires the player to be alive and the encounter to be live is truncated at the death (resumed at a battle rez) and at the wipe point, and the lost value is attributed once to the death. Comparing against the player's own raid lust is right and stays; "wants Bloodlust" must be learned from top raids that lusted mid-fight, and a miss is never critical, because lust timing is the raid leader's decision. Damage at a mechanic depends on assignment (active tank, soaker, debuff target). |
| Evidence | One death at 2:30 on a 5:40 kill yields four "lost cast" criticals and a red burst window (TIME-1). Top raids lust on the pull: for 77% of benched cooldowns the stored lust offset equals the opener time (POP-8). A soaker taking 3x the typical damage is red in 94% of defensive windows; the bench's own rank-1 parse is "covered" in only 60.6% of its windows (E3), 50% (13 of 26) on the version 44 subset. The rebuilt window rule colors no window red and flags at most 2.8% of held-out top-log windows amber (6 of 217, an upper bound) [measured]. Correction from verification: a death with no resurrect adds no downtime, because time after the last cast is never counted. |
| Findings | TIME-1, TIME-4, TIME-5, TIME-7, TIME-8, TIME-9, TIME-10, POP-4, POP-6, POP-8, UX-3, UX-6, CON-4, CON-5 |

### RC4. Numbers that measure something other than their label

| Card | Label | What it measures | Defensible construct |
|---|---|---|---|
| Burst windows | "Damage vs top range" | Raw damage in a fixed clock span against each top member's damage in its own detected densest run; the overall DPS gap appears in every window | Both sides measured on the same span with the same offset search, relative to the player's own alive-time DPS (amplification); raw damage as context (CON-1, STAT-3, TIME-2, POP-2) |
| Defensive windows | "defensive used wrongly" / "needed, unused" | Damage taken against max + sd of the 5-6 top parses who pressed that defensive; only the same-named defensive counts as coverage; 18 immunity windows have a maximum of 0 | Coverage by any defensive active at the hit; damage as context; observations instead of intent (CON-2, UX-7, STAT-7) |
| Downtime | "Low cast efficiency", "Fill Ys of gaps" | Whole inter-cast gaps above the 90th percentile of top gaps, GCD and cast time included; top logs carry a median 85 s of it per pull | Idle time beyond GCD or cast time over alive time; fix quotes only the excess over the top average (CON-3, STAT-8) |
| Lost cast | "2 / 3 cast(s)", critical | Uses-per-minute times the full fight length; the floor rounds back to the expected count for 62% of cooldowns, so one missing cast is critical | Uses over available time with a count interval that never rounds to zero tolerance; later, unused ready time (CON-4, STAT-5) |
| Bloodlust | "missed Bloodlust", critical | A cast inside a clock window; "wants Bloodlust" mostly restates "opener under a pull lust" | Overlap of the cooldown's aura with the player's raid lust, judged only when top raids also lusted mid-fight (CON-5) |
| Gear | "Most common build", "Uncommon build" | Plurality of exact full talent keys among 10 parses; leader typically 1-2 parses | Per-node agreement with counts and a diff of the player's build; trinket and enchant consensus is usable at n = 10 (CON-6, CON-7) |
| Map | "Top-log centre" | Mean position of ten raids' different assignments; in the median sample no top player stands within 5 yd of it | Per-parse dots and trails (kept); centroid only when compact (CON-9) |
| Pull overview | "Your DPS" | WCL's figure with no reference on a page that promises a comparison | Same figure plus the top logs' range and an alive-time figure on a death (CON-10) |

### RC5. The rotation engine judges the wrong unit at the wrong instant

| | |
|---|---|
| Does | A press is "Right time" when any of its own lines holds (`list-check-service.ts:204-208`); a priority violation is charged as a skip to the button that was due, never to the pressed one; only presses are decision points, so idling with a button due is never a skip; a button must be on the GCD and pressed at least once this pull to be skippable (`:239-242`); hardcasts are judged at completion; `react` reads the current stack 20 ms before the press (`fact-table.ts:14`, `aura-facts.ts:92-96`); the enemy count is the number of targets the player's own damage hit in the next 3 s (`fight-facts.ts:74-81`); `use_item`, `potion`, `pool_resource`, `wait` and `target_if` ranking are dropped. |
| Reads | A green chip means the press was what the list would do. A clean card means no rotation mistakes. |
| Correct | An APL is a policy: at each decision point the first line whose condition holds and whose action is ready is the action. SimC evaluates it with a reaction model: per-player reaction `250_ms` mean, `100_ms` offset, `150_ms` tail, capped at `1.4_s`, and `react` reads `stack_react()` after that delay (section 8). The enemy count is a property of the encounter, not of the press. |
| Evidence | 58% of baked list lines read an enemy-count fact, which on add waves mostly confirms the player's own choice (APL-1); 10.9% of benched buttons read a `.react` fact (APL-3). Verification correction: many of these biases apply to the top logs too, so they distort individual "Wrong time" and "Skipped" chips more than the comparative bar. |
| Findings | APL-1 to APL-12 |

### RC6. The coaching layer states more than the data supports

| | |
|---|---|
| Does | Severity is fixed per rule category, so a one-cast shortfall is as red as never pressing a button (`cast-cadence-service.ts:41-51`); the finding sentence with its evidence (`message`) is built and never rendered (rows are built at `finding-rows-service.ts:14-24` and `rotation-feature-service.ts:319-329` into a `FindingRow` with no message field, `finding-rows-service.ts:85-96`); remedies are imperatives about raid decisions ("Align X with Bloodlust."); "Nothing flagged." reads as a pass while about two thirds of list actions (one third excluding racials) are never judged; permanent errors say "This analysis is bugged" for a private report or a log without combatant info. |
| Correct | Severity reflects evidence and cost; the row shows what happened and against how many logs; raid decisions are never orders; silence names what was not checked; errors name the cause the user can fix. |
| Findings | UX-2, UX-6, UX-9, UX-12, UX-14, STAT-11, STAT-12, CON-8 |

### RC7. The Northern Sky export

The TOC alert-entry regex (`ALERT_ENTRY`, `RA/data/http/northern-sky-phase-data-service.ts:14`) rejects the ` [AllowLoadGameType standard]` suffix the addon's TOC lines now carry, so no boss counts as re-arming and `indexPhases` (`:107-115`) keeps no phase table. All 356 baked files carry `phases: []`, every exported line is `ph:1` and pull-relative, and by the code's own model of the addon (`northern-sky-feature-service.ts:37`) the lines after the first phase change never fire on the four phase-driven bosses (81% of lines on Entombed Sentinels). The card says "Cooldown timings from the top Mythic logs" for what is one log (TIME-6, UX-5).

### Smaller items

Live window clips assume the logger's and the viewer's clocks agree and have no roll (TIME-12); enchant rows say "Most top raiders use it" below 50% (CON-7).

---

## 4. What is sound and stays

The lenses agreed on these, and the solution keeps them:

- Mythic only, with the difficulty passed explicitly; non-Mythic pulls refused.
- Three-valued logic: a fact the log cannot state is unknown, never false.
- Per-boss benches, equal weight per parse, distinct-parse clustering, signature-based refresh.
- Burst detection by damage density on the pull clock (the shared windows are fixed-clock events on this tier).
- Use-share and talent gates before any lost-cast verdict; the cadence cap on expected counts.
- Bloodlust detected from the player's own aura and compared against the player's own raid lust.
- Self-aura detection of defensive uses; dead in a window is bad; coverage as annotation.
- Press folding, fake-cast drops, a pre-pull aura as cast 0, auras read just before the press.
- The condition checklist (met, not met, not in the log; decisive versus unneeded).
- "Used in N of M logs" on the plan table, calm "On plan" chips, no tooltips.
- The pull overview reports the outcome without grading it.

---

## 5. The solution

### 5.1 Definition

A colored row is defensible when all four hold:

1. **Same measurement.** One `measure` function per rule, called by ingest on every reference log and by the runtime on the player, over the same kind of time (alive, before the wipe point, window fully inside the pull).
2. **Measured specificity.** The rule's false-flag rate on top logs held out of their own bench is measured, pooled across benches, and inside the budget of its color.
3. **Measured discrimination.** The rule flags weaker logs measurably more often than held-out top logs.
4. **Bounded claim.** The copy claims a difference from a named, counted reference ("8 of 10 top logs"), never an intent, and never orders a raid decision.

Anything that cannot meet the four keeps its numbers and loses its color.

### 5.2 Page-wide semantics

A family's **tier** is the highest tone its registry entry allows (red, amber, blue or neutral); calibration and the cost class can only lower it.

| Tone | Meaning | Required evidence | Required cost class |
|---|---|---|---|
| Red | "You lost something top raiders keep." | Per-test false-flag rate on held-out top logs <= 1% | high |
| Amber | "You differ from top raiders more than they differ from each other." | <= 5%; a low-cost row needs red-level evidence (1%, and for shares at least 3 excess misses) | medium or high, or low with red-level evidence |
| Blue | "k of n top raiders do this." No mistake claimed. | Consensus shown as a count | any |
| Neutral | A measurement or comparison without a judgement | none | none |
| Muted | Not judged, with the reason ("you were dead from 2:10") | n/a | n/a |

- **Page budget.** For a held-out top log, at most 0.1 red and 1.0 amber rows per pull, per role (DPS, tank, healer). Under the audited rules: 1.07 and 5.44. Under the rebuilt rules, measured: 0.00 red and 0.68 amber per pull (DPS 0.68, tank 0.53, healer 0.83); under the armed caps 0.00 red and 0.05, 0.03 and 0.27 amber.
- **Below the average is a position**, drawn as a marker and used for sorting, never amber.
- **One root cause, one row.** Precedence: death, wipe point, window not reached, raid decision outside the reference band, player choice. A silenced check folds under its cause, named once per card.
- **n is always shown.** Every colored row prints its reference as a count; a bench with n < 5 is context only; the page header carries a bench strip: "Compared with 10 top Mythic logs for Assassination Rogue on Sszorak: kills 5:06 to 6:42, item level 327 to 335, ranked by damage, refreshed Oct 12."
- **The finding sentence renders** above its remedy.
- **Empty state is neutral with counts**: "No differences found in 23 checks. 9 not judged." with the reasons.
- **Severity = min(tier cap, evidence tone, cost-class cap)**, with effect floors inside a class (at least 2 moments, 1 cast and 25% of expected uses, 5 s). Rows sort by cost class, then evidence, then shortfall in the construct's unit. A "Fix first" strip lists the top three colored rows across cards.

### 5.3 The contract in code

- **Registry.** One typed entry per finding family beside its producer, with the fields: id, version, tier, claim, construct, reference (population, minimum n), alignment, availability masks, raid decisions (relative, gated or excluded), decision rule, cost class, uncertainty shown, copy templates, injected mistakes it must detect, limits (what the card cannot see, shown in a "not judged" footer). A conformance spec iterates the registry and fails on an incomplete entry or an entry no producer uses.
- **One tone source.** `AnalysisFinding.severity` becomes a branded type only `ToneService` can construct; an eslint rule forbids a severity literal anywhere else under `RA/data/**`. Producers emit evidence (observed value, reference n and k, target, excess, availability), not severity.
- **A closed set of decision rules**, implemented once in a `DecisionRuleService` with boundary-paired specs:
  1. `interval` for a continuous quantity: a t prediction interval, `mean - t(n-1, 1-alpha) * s * sqrt(1 + 1/n)`, minus an absolute floor in the construct's unit, so `s = 0` never means zero tolerance. The minimum or maximum of n is never an edge.
  2. `excess-rate` for a share: a one-sided binomial test of the player's misses x of m moments against the reference miss rate, with a minimum excess (2 misses for amber, 3 for red) and a succession floor `1 / (moments + 2)` so an all-perfect bench still tolerates a miss.
  3. `count` for cooldown uses: expected uses over available time, capped by the cadence fit (kept), with a count prediction bound that is never above `expected - 1`.
  4. `mechanistic` for a game-defined quantity crossing a game-defined amount (for example unused ready time of at least one cooldown beyond the reference's spread).
  5. `consensus`: on its own, "you differ from k of n" flags a held-out top player at a rate of (n - k)/n, 20% at 8 of 10, so consensus alone tones only at k = n, amber at most while n <= 10 (even k = n carries a Laplace estimate of 1/(n + 2) = 8.3% before pooling), with its rate taken from pooled leave-one-out. Otherwise it must be paired with an independent second condition (talent taken and at least 2 expected uses; uncovered and damage above the top median).
  6. `fact` (dead in a window, slot not enchanted), colored only with a consensus or a game rule behind it.
- **Governance.** A new skill, `.claude/skills/warcraft-verdict/SKILL.md`, states the tiers, budgets and the procedure for a new or changed finding, with a CLAUDE.md router row ("Adding or changing a finding, a threshold, a tone or a reference population"); the "New finding" deliverables in `warcraft-change` point to it. A colored finding ships only with its registry entry, its injected mistakes, its availability masks and a version bump; a new or changed rule renders as comparison until calibrated. Rules that exist at stage 0 keep their stage 0 tone, bounded by the synthetic calibration specs and the bench audit, until stage 3 measures them; from then on tone comes only from calibration. `warcraft-writing` gains the tier voice: imperatives only on graded rows about the player's own actions, counts as facts on suggestions, raid decisions never as orders. README line 17 states which part is measured and which is chosen. CLAUDE.md gains the second test suite (the offline calibration recompute) in its command table.

### 5.4 The validity harness

Runs inside the existing ingest, over data the pipeline already fetches, with zero extra WCL points for everything except deaths (a raid-wide Deaths and a Resurrects read per parse, disk-cached) and the contrast cohort.

1. **Per-parse measures baked into every bench**, not only min, mean and max: per-log button shares and moment counts, uses, first cast, unused ready time, window damage on the common span, coverage per window, lust time. This lets CI recompute everything offline.
2. **Leave-one-out folds.** For each accepted top parse i, rebuild the bench from the other n - 1 payloads, including the plan gate (`bench-pipeline-service.ts:79` builds it from every parse's cast ids) and the burst cluster spans, then judge parse i with the same `judge` function the runtime calls. Rebuilding only aggregates leaks the held-out parse.
3. **Thresholds.** The a-priori parametric rules of 5.3 by default, so the measured leave-one-out rate is genuine out-of-sample evidence. Empirical quantiles only for a family whose parametric check fails (skewed burst damage), and then cross-fitted: the quantile for a bench comes from the other benches of its pool.
4. **Pooling and sample size.** Rates are pooled per family x spec, then x role, then globally. A tier arms only when the one-sided 95% Clopper-Pearson upper bound of its pooled leave-one-out rate is inside the arming bound, on enough tests that an honest rule passes:

   | Tone | Design rate | Arming bound | Minimum pooled tests | Rule at its design rate arms | Rule at the bound arms |
   |---|---|---|---|---|---|
   | Red | 1% | 2% | 1,500 | 92% of the time | 3% of the time |
   | Amber | 5% | 8% | 500 | 82% | 4% |

   The page budget is enforced by lowering alpha first for the families with the lowest discrimination. A per-bench anomaly check demotes a family to comparison on one bench when that bench's own leave-one-out rate exceeds the pooled rate at binomial p < 0.01; this catches the 18 immunity windows with a top maximum of 0 (E3) and the single-gap defensive benches (STAT-9) without demoting the whole family.
5. **Injected mistakes** (power floor and regression test): drop one major cooldown cast, delay one by 30 s, idle 5 GCDs, shift a burst by 15 s, strip a defensive, swap a talent node, remove an enchant. Detection at least 90% for red rules, 70% for amber.
6. **Perturbation invariants** (the confounds the audit found, which top logs rarely contain): truncate a held-out pull at a random wipe point; insert a death with and without a rez; move lust to 120 s and 180 s; jitter every event by +/-2 s; scale damage by 0.85. Truncation and death insertion must keep each rule's flag rate per graded test within 1.5x of the unperturbed rate; the jitter must change the burst flag rate by under 2 points; the lust shift must produce no lust row outside the bench's lust band; the damage scale must leave cadence and coverage verdicts unchanged. The same invariants run as Vitest specs over `frontend/src/testing/builders/events.ts`.
7. **Contrast cohort** for discrimination: `characterRankings(page: 10)`, five parses at evenly spaced ranks per spec and boss, judged against the full bench, capped at 300 WCL points per run after benching and only above `INGEST_POINTS_MARGIN` (one analysis costs about 14 points per `frontend/e2e/wcl-points-needed.ts`), refreshed weekly or on a rule-version change, under its own signature. Acceptance: lift >= 2 with a pull-clustered bootstrap 90% lower bound >= 1.3, and AUC >= 0.60. Page 2 as a gradient check and the item-level `bracket` probe as a confound control are reported, not gating.
8. **Status per family.** `graded` (colored), `comparison` (numbers, "Not graded: this check flags top raiders too often" or "does not separate top logs from others"), or `hidden` (construct known invalid). Per-encounter results go to a seventh bench file, `data/specs/<Spec>/calibration/<encounterId>.json`, with its own signature (the top-10 set plus a hash of the registry's ids, versions and parameters), so a rule change re-runs only calibration from the disk store instead of re-benching every card. `refreshIndices` pools them into `data/specs/calibration.json`, which the runtime reads through a data-source token; a version mismatch fails closed to comparison. Both live under `frontend/public/data/specs`, the only folder the ingest workflow publishes.
9. **CI.** Every PR touching `RA/data/**` recomputes leave-one-out and contrast rates from the baked per-parse measures at zero WCL cost and fails on a page-budget breach, a failed invariant, or a previously graded rule losing its grade. The hourly ingest writes the validity report to the job summary.

### 5.5 The player's timeline

A `PullModelService` builds once per pull, from reads the page already makes, and passes to every card:

- Deaths and resurrects, alive spans (from `DeathTimelineService`).
- The judged end: `wipeCalledTime` when WCL has it, else the first instant half of the raid is dead at once (masking hides mistakes, so it removes only time that is almost certainly post-collapse; the overview keeps its three-dead collapse label).
- Lust start and end; `phaseTransitions` where WCL reports them; the player's role.

Consumers: expected uses over alive minutes; efficiency over alive time; windows judged only when fully inside alive, pre-wipe time, else muted "Dead" or "After the wipe". One caption per card states the judged span: "Judged 0:00 to 4:12, alive 3:21". Once stage 2 bakes per-parse phase starts, a phase guard arms on the four phase-driven bosses: a window after a phase that began more than 15 s from the bench median is muted (a guard, not a re-alignment, since the pull clock is correct on this tier).

Reading `phaseTransitions` and `wipeCalledTime` adds fields to `REPORT_Q`, so `npm run schema:pull` regenerates the typed operations, and every stored report response misses the response store once after the change (the store is keyed on the query body).

### 5.6 Reference class

- Healers ranked on `hps` (a `$metric` variable in `RANKINGS_Q`); tanks stay on `dps`; the healer burst card is replaced by a one-line reason; the healer rotation card states its structural absence instead of "Waiting for top logs".
- `MIN_SAMPLE_COUNT` 5 for every recipe, with fallback to the previous partition when the newest has fewer.
- The rankings rows' `amount`, `duration`, `bracketData` and rank are kept (they are fetched today and discarded) and feed the bench strip and the pull overview's reference range.

### 5.7 Card-by-card target

| Card | Claim | Construct | Rule | Rollout |
|---|---|---|---|---|
| Rotation buttons | "Envenom: lines held 41 of 52 presses. Top raiders miss at most 1 in 20." | Right / (judged + skipped), counts shown; unjudged excluded (kept) | `excess-rate` at alpha 1% with at least 3 excess misses and the succession floor; amber at most (cost low, so red-level evidence) | De-tone now; re-arm as amber after calibration |
| Lost cast | "5 of 6 casts while alive. 9 of 10 top logs made 6." | Uses over available time | `count`: one short is information, two short amber, half or more of the expected uses lost (with 8 of 10 top logs using it) red | Grace now; unused ready time later |
| Never used | "You never pressed Deathmark. 10 of 10 top raiders did." | 0 casts, talent taken (kept gate) | `consensus` paired with talent taken and at least 2 expected uses; red only once pooled leave-one-out shows it inside the red budget | Keep, corrected gate |
| Late opener | "First Deathmark at 0:14. Top raiders press it by 0:08." | First cast (kept) | `interval`; the 2 s floor is kept | Keep, move from 2 sd to the prediction interval |
| Gap rows | none | Folded into one cadence test per cooldown | n/a | One row per cooldown now; removed when unused ready time lands |
| Bloodlust | "Deathmark was up for 0 of your raid's 40 s Bloodlust at 3:00. 4 of 4 top raiders who lusted mid-fight had it up." | Aura overlap with the player's own lust | `consensus` + `interval`, amber at most, only inside the bench's lust band | Removed now; returns gated |
| Holds | "6 of 10 top raiders hold Vanish for the 4:16 burst." | Absolute target (plan clock), matched by time | Suggestion | Copy and clock now |
| Downtime | "Idle 41 s more than the top average." | Idle beyond GCD or cast time over alive time | `interval` amber, never red | 2 sd and excess copy now; construct later |
| Burst windows | "1.6x your pull average in the 2:12 window. Top raiders reach 2.1x." | Amplification on the common span, same offset search both sides, all accepted parses as reference | `interval` amber at most; must pass contrast lift | De-tone now; rebuild, then re-arm |
| Defensive windows | "No defensive was up at 3:25. 8 of 10 top raiders had one up." | Coverage by any defensive; damage as context | Amber only when uncovered, at least 8 of 10 top parses covered, and damage above the top median; tanks and immunity windows coverage only | Now (notes and coverage); calibrate later |
| Dead in window | "You died at 3:27 in this window." | Fact | Red, the home of that death's attribution | Keep |
| Defensive cadence | "Top raiders press Unending Resolve 3 times here; you pressed it once." | Count over available time | Amber at most; externals are assignment rows (context) | Now |
| Talents | "You differ on 2 of the talents 9 of 10 top logs share." | Per-node agreement and a diff of the player's build | Information (a 9-of-10 node flags a held-out top player 10% of the time) | Information now; per-node diff after stage 2 bakes node counts |
| Trinkets | "6 of 10 top raiders use X and Y." | Kept (pair as a multiset) | Blue: a 5-of-10 leader still flags about 10% of top players per pull [estimated], twice the amber budget | Now |
| Enchants | "Not enchanted. 9 of 10 use Y." / "7 of 10 top raiders use Y." | Kept; same-name ids merged; share printed | Amber for a missing enchant behind a leader of at least half (kept gate); otherwise blue | Now |
| Pull overview | "302k DPS; top logs 241k to 258k on kills." | WCL figure, alive-time figure on deaths, top range | Context | Add reference |
| Map | "Where 10 top raiders stood at 3:25." | Per-parse dots and trails; centroid only when compact | Context | Relabel or drop the ring |
| Northern Sky | "Cooldown timings from the #1 Mythic log (name, 5:31 kill)." | One real schedule, phase-relative lines | Context; "No phase table" state instead of success | Regex, label and state now; phases appear in the files at the stage 2 re-bench |
| Live clips | "Clip 3:20 to 3:45." | Window clips get the same 5 s roll as point clips | Context | Now |
| Errors | "This report is private or expired." / "This log has no combatant info." | Cause-specific; "bugged" only for internal failures | Muted | Now |

### 5.8 Rotation engine, late and in slices

The comparative bar is least wrong today because the engine's biases hit the top logs equally, so the engine changes come after the verdict layer, each as a family version that is accepted only if the leave-one-out rate and the contrast lift do not worsen. Every engine change re-benches, because `list-bench-service.ts` computes the top shares with the same engine; a runtime-only change would break the same-measurement condition.

1. Early and small: facts that changed within 350 ms before a press read unknown (SimC's own minimum reaction); hardcasts are judged at their `begincast`. Both only convert false "Wrong time" chips into "Not judged".
2. Later: one verdict per decision charged to the pressed button; idle decision points; off-GCD and never-pressed buttons judged by ready time with ownership from talents; `use_item` lines as off-GCD buttons; the enemy count as a range against an encounter timeline baked from the top logs, reading unknown when the player's own hits disagree; judged and unknown counts per enemy-count stratum.

### 5.9 Cost and coaching

Ordinal cost classes (high: a whole major cooldown cast, a death; medium: a cooldown shifted 10 s or more, excess idle of 15 s or more, a burst below reference, an uncovered window; low: a button-share shortfall, a short opener delay, a talent node, a trinket pair) cap the tier and order rows. A damage estimate per finding, in seconds of the player's own average damage, orders rows inside a class only where it is identifiable from one pull (direct-damage cooldowns, deaths, idle time), prints "about" with a range, and never changes a tone; it appears in copy only after its estimates exceed the observed DPS gap on at most 10% of contrast logs and correlate with it (Spearman >= 0.3). A "Where your damage went" card then ranks deaths first and folds silenced findings under their root.

---

## 6. Rollout

Each stage ships on its own and leaves the page more correct than before.

| Stage | Content | Data change | Acceptance |
|---|---|---|---|
| 0. Honest now (week 1) | De-tone buttons (counts and sort by moments x shortfall stay), burst windows (info, fragments muted), Bloodlust findings (removed from the post-raid card), talent warnings (information). Lost-cast grace (`min(floor, expected - 1)`) and tiers with a stated precedence. One gap row per cooldown at 3 sd with a 5 s floor and a minimum pooled count, silent when a hold explains the cast. Efficiency at 2 sd quoting only the excess. Defensive coverage by any defensive, intent notes deleted, immunity windows and tanks coverage only, defensive first-use and gap rows removed. Holds on the plan clock. Trinkets blue; enchant share printed. Render `message`, n and the bench date, counts on buttons, neutral empty state, cause-specific errors, README sentence, "#1 Mythic log" label, Northern Sky regex with a real TOC fixture and its "No phase table" state, clip roll, map ring relabelled. The `warcraft-verdict` skill and router row. | None at runtime; the Northern Sky files gain phases at the stage 2 re-bench | Vitest calibration specs per changed rule reproduce 1/(n+1) and the t prediction tail and stay inside budget under normal, lognormal and hold-mixture draws. A bench audit runs production rule code over the real baked benches after `npm run data:pull` (zero WCL points; button benches store only lo, avg and hi, so buttons use the synthetic specs) and must report at most 0.1 red and 1.0 amber per top pull; it stays the PR regression gate until stage 3 reaches its pooled test counts. Expected load for a top log about 0.01 red and 0.5 amber [estimated] |
| 1. Timeline (weeks 1-2) | `PullModelService`: alive spans, judged end, lust, phases, role; expected uses, efficiency and window eligibility on available time; attribution precedence; judged-span captions | No bench change; `schema:pull` and regenerated types for `phaseTransitions` and `wipeCalledTime`; one-time response-store misses | Boundary pairs: a death removes exactly its span; a window ending 0.1 s after the judged end is muted, one ending at it is judged; death-mask and wipe-truncation invariants hold |
| 2. Reference (weeks 2-3) | `hps` for healers; n >= 5 with partition fallback; rankings facts and a sources list per bench; per-parse measures; talent node counts; per-parse lust times; bench strip; Northern Sky source identity; pull overview reference | One `INGEST_VERSION` bump; the version re-bench plus the healer pools re-bench over several hourly runs inside the existing budget stop | Every post-raid card prints n; phased bosses carry phases and the phase guard arms; healer benches ranked on `hps` |
| 3. Contract and harness (weeks 3-6) | Registry, `ToneService`, eslint rule, `DecisionRuleService`; per-feature `judge` split, card by card; leave-one-out folds, injected mistakes and invariants in ingest; per-encounter calibration files and the pooled `calibration.json`; measure-only first, then tone from calibration; CI recompute | Seventh bench file per encounter under `data/specs/<Spec>/calibration/` | Conformance spec per family (ingest measure equals runtime measure); red arms only with at least 1,500 pooled tests and a one-sided 95% upper bound <= 2%, amber with at least 500 and <= 8%; page <= 0.1 red and 1.0 amber per held-out top pull per role; the first report reproduces the audit's per-component load before anything new arms |
| 4. Constructs (weeks 5-9) | Burst amplification on the common span; unused ready time (after it is checked against each cooldown's observed top cadence, since 34% of cooldowns run faster than their stored cooldown); downtime beyond GCD; defensive coverage gate; Bloodlust overlap within the lust band | A family version bump each | Each new version renders as comparison until it passes stage 3's gates |
| 5. Discrimination (weeks 6-10) | Contrast cohort from ranking page 10 under a 300-point cap per run (about 4 spec-boss pairs per run, the 360 pairs in about four days of hourly runs), refreshed weekly; lift and AUC in `calibration.json` | Contrast results | An armed rule shows lift >= 2 (lower bound >= 1.3) and AUC >= 0.6, else comparison |
| 6. Cost and coaching (after 5) | Cost classes, "Fix first" strip, damage estimates as ordering only, "Where your damage went" card | None | Estimates exceed the observed DPS gap on at most 10% of contrast logs before they appear in copy |
| 7. Rotation engine (ongoing) | Section 5.8, early slices first | Re-bench per slice | Leave-one-out rate and lift do not worsen |

The cost of the rollout to the site is discrimination in the short term: after stage 0 the burst and button cards show numbers without color, and lost casts, opener, efficiency, defensive coverage and missing enchants remain the colored rows until the rebuilt constructs earn their color back through the harness. That is the honest state: a rule that flags a top player on two burst windows in five does not discriminate enough to be colored.

**Risks.**

1. **Scope of the judge split.** Calibration needs every card's judgement as a pure function callable at ingest with a top log as "the player"; today rotation, burst and defensive interleave fetching, measuring and toning. The split goes card by card, and it fails safe: once tone comes from calibration, an unsplit card renders as comparison rather than with an unmeasured color.
2. **The first measured report may demote most families.** If it does, the page stays mostly uncolored and effort moves to the constructs (stage 4) before more tone is switched to calibration; the report on the method page says why each card is not graded.
3. **WCL budget.** The two re-bench waves at stage 2 (the version bump, then the healer pools) and each later family version spend several thousand points over several hourly runs under the existing budget stop; the contrast cohort is the lowest-priority spender and runs only above `INGEST_POINTS_MARGIN`. The client pair is shared with every site visitor.

---

## 7. What this does not fix, and what stays a choice

- **Agreement with top logs is not optimality.** A graded rule says "you differ from top raiders in a way they rarely do". Whether the top raiders and the APL are right for this boss is SimC's and the community's question.
- **Things the log cannot show stay unjudged and are named in each card's limits footer**: raid assignments (soaks, swaps, externals given), why a cooldown was held, movement, trinket and potion policy until stage 7, the situation mix of a short wipe.
- **The reference stays outcome-selected.** The bench strip shows item level, kill length and recency; nothing matches the reference to the player's gear, so absolute comparisons stay context.
- **Healer rotation** has no construct yet (no benched buttons).
- **Chosen numbers**, written in one file and measured rather than derived: the 1% and 5% per-test budgets, the 0.1 and 1.0 page budgets, the pooled sample sizes, the cost classes, the 350 ms reaction allowance, the half-raid wipe rule, the 15 s phase guard, the lift and AUC gates.

---

## 8. Sources, quoted verbatim

**SimulationCraft** (`https://raw.githubusercontent.com/simulationcraft/simc/HEAD`, the app's own `simcRawUrl`):

- `engine/player/player.cpp` lines 1017-1020: `reaction( 250_ms, 0_ms ),` `reaction_offset( 100_ms ),` `reaction_max( 1.4_s ),` `reaction_nu( 150_ms ),`
- `engine/player/player.cpp` line 7765: `return std::min( reaction_max, reaction_offset + rng().exgauss( reaction, reaction_nu ) );`
- `engine/buff/buff.cpp` line 503 (the `react` expression): `{ return buff()->stack_react(); }`
- `engine/buff/buff.cpp` lines 2699-2700 (alignment whitespace collapsed): `timespan_t total_reaction_time = ( player ? ( player->total_reaction_time() ) : sim->reaction_time );` `timespan_t react = sim->current_time() + total_reaction_time;`
- The app reads `react` as the current stack: `RA/data/rotation/priority-list/fact-table.ts:14`: `react: ['count', 'stacks', 'stack'],`

**Warcraft Logs v2 GraphQL schema** (field and argument descriptions from schema introspection):

- `characterRankings(metric)`: "Optional. You can filter to a specific player metric like dps or hps. If omitted, an appropriate default player metric for the zone will be chosen."
- `characterRankings(page)`: "Optional. Which page of rankings to fetch. By default the first page is used."
- `characterRankings(bracket)`: "Optional. A specific bracket (e.g., item level range) to use instead of overall rankings. For WoW, brackets are item levels or keystones. For FF, brackets are patches."
- `ReportFight.phaseTransitions`: "List of observed phase transitions during the fight."
- `ReportFight.wipeCalledTime`: "If a wipe was explicitly called using the Companion app, then this field will contain the time. This is a timestamp with millisecond precision that is relative to the start of the report, i.e., the start of the report is considered time 0."
- `ReportFight.fightPercentage`: "The actual completion percentage of the fight. This is the field used to indicate how far into a fight a wipe was, since fights can be complicated and have multiple bosses, no bosses, bosses that heal, etc."

**Prediction intervals** (Wikipedia, "Prediction interval"):

- Normal distribution, unknown mean and variance (ASCII transliteration of the article's formula): "x-bar +/- t_{1-alpha/2, n-1} sqrt(s^2 + s^2/n)", that is `mean +/- t(n-1, 1-alpha/2) * s * sqrt(1 + 1/n)`.
- Non-parametric: "the probability that the next observation will be the largest is 1/(n + 1)".

**Live rankings spot check** (Assassination Rogue, Mythic, `metric: dps`): Sszorak, first 10 rows median DPS 253.7k, kill 339 s, item level 330.5; rows about 901-1000 median about 200k, 373 s, 326. Nek'zali: 243.4k, 334 s, 329 against about 200k, 399 s, 326.

---

## Appendix A. Finding index

Verdict: confirmed or refuted by the adversarial refuter. Materiality: the refuter's assessment. Code check: whether the stated current behavior matched the code exactly (partly: the behavior held but a gate, threshold or example needed correcting).

| Id | Title | Verdict | Materiality | Code check |
|---|---|---|---|---|
| TIME-1 | One death turns into four 'lost cast' criticals, a downtime warning and a bad burst window, each with a remedy that is wrong | confirmed | high | partly accurate |
| TIME-2 | The player's burst is scored inside a window anchored at the top raiders' median press clock, so a few seconds of displacement reads as lost damage | confirmed | high | accurate |
| TIME-3 | Everything is aligned by seconds from pull with no phase, boss-HP or boss-event signal, although the bench itself spans kills 1.23x apart and most windows are boss-driven | refuted | low | accurate |
| TIME-4 | 'Missed Bloodlust' and 'late inside Bloodlust' are artifacts of top raids lusting on pull, applied to raids that lust mid-fight | confirmed | medium | accurate |
| TIME-5 | The runtime 'hold to' clock is relative to the player's own prior cast, but the hold the top raiders made was for an absolute window, so the remedy names a time nothing happens at | confirmed | medium | accurate |
| TIME-6 | Every exported note is pull-relative with ph:1 on every line because the phase parser silently matches nothing in the live addon, although the addon ships Mythic phase tables for all nine bosses | confirmed | high | accurate |
| TIME-7 | Expected counts, uptime and DPS are scaled by the raw WCL fight window, so time dead, the post-collapse tail of a wipe and the tolerance floor all turn into 'lost cast' and 'downtime' flags | confirmed | medium | partly accurate |
| TIME-8 | A window that starts before the pull ends but finishes after it is judged on a fragment, because 'Not reached' tests only the window start | confirmed | medium | accurate |
| TIME-9 | Defensive windows are clock intervals around the top raiders' press clusters, and the player's damage taken at that clock is judged as if the same mechanic hit them then | confirmed | medium | accurate |
| TIME-10 | A cooldown held through an intermission or phase change is flagged 'late' against a pooled average gap, while the hold machinery that knows about such holds is not consulted | confirmed | medium | accurate |
| TIME-11 | The replay overlays ten kills of different length and the player's pull on one pull clock and averages their positions into a 'Top-log centre' with no signal that the parses are in the same encounter state | refuted | low | accurate |
| TIME-12 | Clips are cut on the assumption that the logger's PC clock equals the recorder's PC clock, with no calibration and zero roll on window clips | confirmed | low | accurate |
| APL-1 | The enemy count is read from the player's own hits, so the AoE-versus-single-target decision is judged by its own outcome | confirmed | high | partly accurate |
| APL-2 | A hardcast is judged at its completion, not at the press that decided it | confirmed | medium | partly accurate |
| APL-3 | SimC's own reaction and lag model is stripped: react reads the stack 20 ms before the press, and a button that came up or procced an instant earlier is 'due' | confirmed | medium | partly accurate |
| APL-4 | 'Right time' means 'some own line held', not 'the list would press this': priority is never charged to the pressed button | confirmed | medium | partly accurate |
| APL-5 | Off-GCD buttons and buttons never pressed this pull can never be 'skipped', so holding Shadow Dance or never pressing Secret Technique is invisible | confirmed | medium | partly accurate |
| APL-6 | Unjudged casts and undecided moments drop out of the share, which inflates it and makes 'you' and 'top' ratios over different populations, with no judged count shown | confirmed | medium | partly accurate |
| APL-7 | Several facts are read with hindsight from the rest of the pull, and kills and wipes are read by different rules | confirmed | low | partly accurate |
| APL-8 | The policy judged is not the APL: use_item, potion, pool_resource, wait and target_if ranking are dropped, so trinket timing and pooling cannot be wrong | confirmed | medium | partly accurate |
| APL-9 | Two standards are mixed: the APL defines 'right' while the field defines 'good', and the buttons where they disagree most are silently removed | confirmed | low | accurate |
| APL-10 | No damage weighting: every moment counts one, rows sort by shortfall of an unweighted share, and 'bad' is 'below the worst of 10 logs' | confirmed | medium | accurate |
| APL-11 | The share is a ratio over whatever situations the pull contained, so a P1 wipe, an add assignment or forced movement moves the bar as much as the field's whole range | confirmed | medium | accurate |
| APL-12 | Only the player's presses are decision points, so idling while a button was due is never a skip while filling is | confirmed | low | accurate |
| UX-1 | 'warn' means below the top-10 average and 'bad' means below the lowest of ten, so a genuine top player's pull is painted amber and red almost every time | confirmed | high | accurate |
| UX-2 | 'critical' is assigned by category, not by cost: one missing cast of a 2-minute cooldown is as red as dying, and the list order says nothing about what to fix first | confirmed | medium | partly accurate |
| UX-3 | One death or one absent stretch fans out into many separate red items across four cards, and nothing tells the raider they are the same event | confirmed | high | partly accurate |
| UX-4 | 'Most common build' and the amber 'Uncommon build' verdict come from exact-key matching over 10 logs where the leader is usually 1 or 2 logs, so the verdict is noise and flags most top players | confirmed | high | partly accurate |
| UX-5 | The export promises 'Cooldown timings from the top Mythic logs' but ships one unnamed player's raw cast log on a pull-relative clock that the addon drops after the first phase | confirmed | high | partly accurate |
| UX-6 | Remedies are unconditional orders about things the raid decides or that encode the top raiders' fight timing, and the row never shows the reason | confirmed | medium | partly accurate |
| UX-7 | 'defensive used wrongly' and 'defensive needed, unused' assert intent from damage taken on the top raiders' press clock, which the data cannot support | confirmed | medium | accurate |
| UX-8 | 'Every threshold is derived from the top 10 Mythic parses ... not from arbitrary constants' is false: the centres come from the parses, the verdict rules are hand-set constants applied to n <= 10 samples with no small-sample correction | confirmed | low | accurate |
| UX-9 | The 'what happened' sentence of every finding is built and then discarded: the row shows only a chip, two numbers and an order | confirmed | medium | accurate |
| UX-10 | No post-raid card shows how many logs stand behind a number, so '30% of top logs', a 100% consensus from one log and a range from 5 logs all read as population facts | confirmed | medium | partly accurate |
| UX-11 | Every spec's 'top raiders' are the top 10 by DPS, so a healer is coached against the healers who did the most damage | confirmed | high | accurate |
| UX-12 | Silence reads as a clean bill, but about 70% of the list's buttons, minority-use cooldowns, unjudged casts and never-pressed buttons are never judged, with no trace on the card | confirmed | medium | partly accurate |
| UX-13 | 'Replays where top raiders stood through the window this map opened at' aligns ten different kills by elapsed seconds, so a late-fight anchor shows the top raiders in a different fight state | confirmed | medium | partly accurate |
| UX-14 | 'This analysis is bugged. Retrying will not fix it.' blames the app for the user's log, and 'Waiting for top logs ... Hourly ... Automatic' promises benches that will never come | confirmed | medium | partly accurate |
| POP-1 | Healers and tanks are benchmarked against the ten highest-DAMAGE healers and tanks | confirmed | high | accurate |
| POP-2 | Raw window damage against a DPS-selected top 10 imports item level, kill length, externals and composition, and the thresholds come from a maximum-selected sample | confirmed | medium | accurate |
| POP-3 | 'Most common build' and 'Uncommon build' at n = 10 are sampling noise, and the sample is selected on damage, not on the build | confirmed | high | accurate |
| POP-4 | Damage taken at a clock time is judged against people with different assignments, swap orders and raid plans | confirmed | medium | partly accurate |
| POP-5 | A bench of 1-3 parses looks exactly like a bench of 10, n is never shown, and the newest partition wins with a single row | confirmed | medium | partly accurate |
| POP-6 | A wipe, and the time the player spent dead, is judged as if it were a kill of that length | confirmed | high | partly accurate |
| POP-7 | The 'top raiders' range' is the range of 10 (sometimes 5-7) draws, so 'below every top log' has a 9-17% base rate per test for a genuine peer | confirmed | medium | accurate |
| POP-8 | The Bloodlust benchmark encodes 'top raids lust on the pull', so it judges the raid leader's Lust timing, not the player | confirmed | medium | accurate |
| POP-9 | The exported schedule is a single parse (rank 1 by DPS) labelled as 'the top Mythic logs' | refuted | low | accurate |
| POP-10 | 'Top-log centre' averages ten raids' strategies into a spot nobody stood at | refuted | low | accurate |
| POP-11 | What 'top 10' is at the moment of reading is unverifiable: no n, no partition, no ingest time, no rank coverage shown | confirmed | low | partly accurate |
| CON-1 | Window 'Damage' and 'Vs top raiders average' measure the player's overall DPS deficit and a selection artifact, not burst execution | confirmed | high | accurate |
| CON-2 | 'Damage taken vs top range' treats less damage as better and infers 'used wrongly' or 'needed, unused' from a total that does not measure mitigation or role | confirmed | medium | partly accurate |
| CON-3 | 'Low cast efficiency' and 'Fill Ys of gaps' count whole gaps above a p90 threshold, so Y is mostly cast time, pooling and boss-driven time that top raiders also carry | confirmed | medium | accurate |
| CON-4 | 'Lost cast' expects uses from a per-minute rate times the full fight length, so deaths, intermissions and reactive defensives read as critical cooldown discipline failures | confirmed | medium | partly accurate |
| CON-5 | 'Missed Bloodlust' tests for a cast inside a clock window and 'wants Bloodlust' mostly encodes that top raids lust on pull, not an alignment preference | confirmed | medium | accurate |
| CON-6 | 'Most common build' and 'Uncommon build' are the plurality of 10 exact talent keys, a 2-of-10 median, with no item level or ownership behind the trinket verdict | confirmed | high | partly accurate |
| CON-7 | 'Most top raiders use it.' is asserted for any id mismatch, including slots where the leader is under 50% and ids that share a name | confirmed | low | accurate |
| CON-8 | 'Hold X to MM:SS' is computed from the player's own prior cast, while the hold's reason and the plan page's number are an absolute encounter clock | confirmed | low | accurate |
| CON-9 | 'Top-log centre' is the mean of 10 players from 10 raids with unknown assignments, a spot where typically nobody stood | confirmed | low | accurate |
| CON-10 | 'Your DPS' is a raw total over the full fight with no reference, on a page that promises a comparison, and 'damage' differs from the burst card's construct | confirmed | medium | partly accurate |
| CON-11 | 'You X%' hides its denominator, excludes unjudged presses, and is coloured against a min-of-10 range where a third of buttons are perfect, so one miss reads red | confirmed | medium | partly accurate |
| STAT-1 | The page is an uncalibrated battery of about 48 tests: a genuine top-10 log gets about 1 red and 5 amber flags, and "Nothing flagged." is effectively unreachable | confirmed | high | partly accurate |
| STAT-2 | Button "bad" is "below the worst of about 10 logs" and "warn" is "below their mean": 9% red and 20-40% amber per button for a top player, and on a third of buttons any single miss is red | confirmed | medium | accurate |
| STAT-3 | Burst verdicts cannot separate a weaker player from measurement noise: "bad" is unreachable on 38% of windows, "warn" fires on 1 window in 6 for a top player, and the fixed-span measurement roughly doubles that | confirmed | high | accurate |
| STAT-4 | "Uncommon build" is a near-certain warning: the exact-key talent consensus has no identifiable leader at n=10, and 59% of the benchmark's own players would be warned against their own bench | confirmed | high | accurate |
| STAT-5 | One missing cast is a red "lost cast" for 62% of cooldowns because the floor rounds back to the expected count, and the expected count is itself a rounded mean with no count uncertainty | confirmed | medium | accurate |
| STAT-6 | Gates at exactly half turn a coin-flip consensus into mandatory behaviour: a player who does what 5 of 10 top raiders do gets a red row | confirmed | medium | partly accurate |
| STAT-7 | The defensive "bad" band is built only from the top raiders who pressed the defensive there, then applied to the player's raw damage on a fixed clock span, so soakers, tank swaps and anyone whose press is 10 s off read as mistakes | confirmed | medium | partly accurate |
| STAT-8 | "Low cast efficiency" fires on 1 pull in 5.5 for a top player, and "Fill Ys of gaps" quotes idle seconds under a definition where the top raiders themselves are idle 85 s per pull | confirmed | medium | accurate |
| STAT-9 | Timing rules use mean + 2 sd from 10 or fewer values as if it were a population tail: no t or 1+1/n correction, sd = 0 means zero tolerance, and one test per gap multiplies the family | confirmed | medium | accurate |
| STAT-10 | No sample size, uncertainty or effect size is shown anywhere: the range bar implies a population range, "20% of top logs" is 2 of 10, and the README presents the constants as data-derived | confirmed | medium | partly accurate |
| STAT-11 | Hold targets come from a 50% consensus of 8-second delays with a 5-second band, and tell the pool's own best parse to hold its cooldown in 27% of cases | confirmed | low | accurate |
| STAT-12 | Red and amber encode which rule fired, not how strong the evidence is: a one-cast shortfall with a 5-10% false rate is red while a button under the mean with a 20-40% false rate is amber, and rows sort by that label | confirmed | medium | partly accurate |

## Appendix B. Key measurements

| Quantity | Value | Kind | Source |
|---|---|---|---|
| Tests per pull, median spec and boss | 47.8 (IQR 39.8-58.7) | measured | E5 3.2 |
| Red / amber rows per pull, log exchangeable with the bench's top 10 | 1.07 / 5.44; P(at least one red) 66% | estimated | E5 3.2 |
| Cadence rules only, leave-one-out replay of 317 real top parses | 0.26 red / 0.98 amber per pull; lost uses 5.9% (cooldowns), 9.5% (defensives) per test | measured | E5 3.4 |
| Red / amber rows per held-out top pull, rebuilt rules, 120 top pulls (4 specs, 3 bosses) | 0.00 / 0.68 (DPS 0.68, tank 0.53, healer 0.83); under the armed caps 0.00 / 0.05, 0.03, 0.27 | measured | validity harness |
| Cadence rules only, rebuilt, same 120 pulls | 0.00 red / 0.42 amber per pull (cooldowns 0.16, defensives 0.26); lost uses 1.6% (cooldowns, 3 of 191), 7.2% (defensives, 15 of 209) per test | measured | validity harness |
| Defensive window, held-out top log, rebuilt rule | red 0 of 217, amber 6 of 217 (2.8%, an upper bound) | measured | validity harness |
| Top logs whose raid lusts within 30 s of the pull | 105 of 120 (87.5%); 10 mid-fight, 5 without lust; no bench with 5 mid-fight lusts | measured | validity harness |
| Benched buttons with lo = avg = hi = 1 | 538 of 1,629 (33%) | measured | E1 |
| Button red rate for an exchangeable top player | 1/(n+1) = 9.1% per button at n = 10 | analytic | E1 |
| Burst windows where red is unreachable (min - sd <= 0) | 915 of 2,427 (37.7%) | measured | E2 |
| Burst non-good rate, top-10 vs rank about 950 | 15.9% vs 31.7%; 39% vs 57% with displacement | estimated | E2, E5 3.5 |
| Top players warned "Uncommon build" against their own bench | 1,985 of 3,370 (59%) | measured | E4 |
| Modal exact talent build share | median 2 of 10; all ten distinct in 148 of 337 benches | measured | E4 |
| Cooldowns where one missing cast is critical | 401 of 648 majority-used (62%) | measured | E1 |
| Top logs' own "idle" time under the downtime definition | median 23.7% of the fight, about 85 s per pull | measured | E1 |
| Efficiency warning rate for an exchangeable top player | 18.3% per pull | analytic | E1 |
| Defensive immunity windows with a top maximum of 0 | 18 | measured | E3 |
| Rank-1 parse covered in its own bench's defensive windows | 60.6%; 50% (13 of 26) on the version 44 subset | measured | E3, validity harness |
| Cooldowns whose stored lust offset equals the opener | 468 of 609 (77%) | measured | POP-8 refuter |
| Northern Sky files with phases | 0 of 356 | measured | E3 |
| Exported Northern Sky lines past a phase start | 1,985 of 6,689 (30%); Entombed Sentinels 81% | measured | TIME-6 |
| Baked list lines reading an enemy-count fact | 1,056 of 1,815 (58%) | measured | APL-1 |
| Top 10 vs ranks about 901-1000 (two bosses) | +23-28% DPS, 28-58 s shorter kills, +3.9-5.7 item levels | measured | E5 4 |
