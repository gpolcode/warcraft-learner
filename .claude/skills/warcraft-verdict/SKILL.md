---
name: warcraft-verdict
description: warcraft-learner verdict contract - the tones a finding may take, the evidence each needs, the chosen numbers, and the procedure for adding or changing a finding, a threshold, a tone or a reference population. Load this before touching any finding's severity, decision rule, reference or registry entry.
---

# warcraft-learner verdict contract

**What good looks like:** every colored row says how it differs from a named, counted group of top logs, and the rule behind its color flags those top logs no more often than its tone allows.

The contract lives in `frontend/src/app/domains/raid-analysis/data/verdict/`. Every number it chooses rather than measures is in `verdict-choices.ts`; never write one of them anywhere else.

## Tones

| Tone | Says | Evidence | Cost class |
|---|---|---|---|
| Red | "You lost something top raiders keep." | False-flag rate on held-out top logs within the red per-test budget | high |
| Amber | "You differ from top raiders more than they differ from each other." | Within the amber budget; a low-cost row needs red-level evidence | medium or high, or low with red-level evidence |
| Blue | "k of n top raiders do this." No mistake claimed. | A consensus, shown as a count | any |
| Neutral | A measurement or comparison, no judgement | none | any |
| Muted | Not judged, with the reason (dead, after the wipe, not reached) | none | none |

- A tone is `min(family tier, evidence, cost-class cap, calibration cap)`. `ToneService.tone` is the only place that computes it, and `Tone` is a branded type only `ToneService` makes.
- The page budget is the per-pull count of red and amber rows a held-out top log may show, per role. Below the average is a position (a marker, a sort key), never amber.
- A bench under `minReferenceN` logs is context only: every rule returns neutral evidence.

## Calibration

Tone comes from calibration (`data/verdict/calibration/`). Every page loads the caps once (`CalibrationCapsService.load(spec, encounterId)`) and passes them to every producer, which hands them to `ToneService.tone`; a producer called without caps gives the rules' tone alone, which is what the harness measures.

- **Harness.** For each top log of a bench with per-log measures, `LeaveOneOutService` rebuilds the bench from the others (plan gate, cadence benches, defensive windows), and the card's held-out service judges the log through the production `judge*` methods and the page's gates. Each row is one test at the rules' tone.
- **Arming.** `ArmingService` pools tests per family over spec, then role, then every spec; a tone arms when the one-sided Clopper-Pearson bound of its pooled rate is inside `VERDICT_CHOICES.arming` on at least its minimum tests, and the family catches its share of its injected mistakes (`calibration.detectionFloor`). Blue and neutral families need no arming. A role over the page budget demotes the family adding the most to the breach; a bench whose own rate the pool would rarely give demotes the family there alone; a failed invariant demotes the family.
- **Status.** `graded` (the armed tone), `comparison` (neutral, with the reason) or `hidden`. A missing index, or one written for another registry hash, fails closed to comparison. Each post-raid card lists its checks that are not graded, with the reason (`CalibrationCapsService.notGraded` over the card's families, rendered by `wl-not-graded`), and the Method page (`/method`) renders the pooled index: rows per pull per role and each family's tests, rates, detection and verdict. Every family carries a `label`, the name both print.
- **Files.** Ingest writes `data/specs/<Spec>/calibration/<encounterId>.json` (signed on the benches' stamps and the registry hash) and pools them into `data/specs/calibration.json`. `npm run calibrate` recomputes both from the files on disk and fails on a page-budget breach, a failed invariant or a lost grade.
- A family whose construct a held-out log cannot be measured on (no per-log value baked) has no test, so it stays a comparison until its measure is baked.

## Decision rules

`DecisionRuleService` holds the closed set. A family picks one; it never writes its own threshold.

| Rule | For | Edge |
|---|---|---|
| `interval` | A continuous quantity | t prediction interval for one new top log, widened by an absolute floor in the construct's unit, so s = 0 still tolerates the floor and the reference's own extreme is never the edge |
| `excess-rate` | A share of moments | One-sided binomial test against the reference miss rate, floored at `1 / (moments + 2)`, with a minimum number of excess misses per tone |
| `count` | Cooldown uses | Poisson lower bound on expected uses over available time, never above `expected - 1`, with a minimum shortfall |
| `mechanistic` | A game-defined loss | The game amount is crossed and the value lies beyond the top logs' interval |
| `consensus` | "You differ from k of n" | Alone, colors only at k = n; paired with an independent second condition, colors from the paired share |
| `fact` | A plain fact | Colors only through a consensus or a game rule behind it |

## Adding or changing a finding

1. Declare its `FindingFamily` beside its producer and list it in `FINDING_REGISTRY` (`finding-registry.ts`). Every field is required: the conformance spec (`finding-registry.spec.ts`) fails an incomplete entry. A family still measured on a construct due for rebuild names its replacement in `pendingRebuild`.
2. Measure once: the same `measure` method feeds ingest's per-parse values and the runtime's value, over the same kind of time (alive, before the judged end, window wholly inside the pull).
3. Feed the measure to the family's rule, and the rule's `Evidence` to `ToneService.tone`. Set `AnalysisFinding.family` to the entry's id. The producer emits evidence, never a severity: `local/no-severity-literal` fails a severity literal or a cast to `Tone` under `RA/data/**`; a family's `tier` is a ceiling, not a tone, and passes.
4. Add the family's producing scenario to `PRODUCING_SCENARIOS` in `finding-registry.spec.ts`: a pull with the family's mistake in it, run through the producer, which must emit a finding with the family's id.
5. Name the injected mistakes the family must catch and the availability masks that decide whether it runs.
6. Bump the family's `version` on any change to its measure, rule or parameters; the registry hash changes with it, so calibration re-runs and the family renders as comparison until it arms again.
7. Judge it in the card's held-out service under `data/verdict/calibration/`, through the same `judge*` method and gates the page uses, and give each named injected mistake a variant in `InjectedMistakeService`.
8. Copy follows the tier voice in **warcraft-writing**; the row prints its reference as a count.

`local/no-severity-literal` ignores only specs and `data/verdict/**`: `AnalysisFinding.severity` and `FindingRow.severity` are a `Tone`, and an on-plan finding is a neutral tone with `onPlan` set. Any new entry in its ignores carries a one-line justification in `frontend/eslint.config.js`.
