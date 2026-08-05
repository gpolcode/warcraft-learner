# Milliseconds vs seconds audit

Planning document for review before deciding scope of any unit-consistency work. Not shipped
product documentation - delete or fold into a real doc/PR description once the plan is agreed.

## TL;DR

The repo uses two time domains on purpose, disambiguated by a naming convention:

- **`_ms` / `Ms` suffix** - milliseconds, fight-relative (`event.timestamp - fight.startTime`),
  except in the live-capture slice where it means absolute Unix-epoch ms.
- **`_s` / `S` suffix** - seconds, fight-relative. This is the dominant unit for benches,
  findings, rulebook thresholds, and UI display.

A blanket "convert everything to ms" is not recommended - see **Verdict** at the bottom. The
scoped fix worth doing is `rotation-rules.ts`, which is listed as its own section below.

This document catalogs every seconds occurrence (and, for contrast, the ms occurrences and the
conversion points between them) so the actual call can be made file by file.

---

## 1. Seconds fields - in-memory / view models (`core/models/**`)

| Field | File:line | Notes |
|---|---|---|
| `WclFight.duration_s` | `core/models/wcl.models.ts:9` | Computed in `buildFights` (`post-raid.ts:78`) as `Math.round((endTime-startTime)/100)/10` - rounded to 0.1s. |
| `BurstWindow.time_s`, `.window_length_s` | `core/models/analysis.models.ts:61,70` | |
| `PlayerBurstWindow.time_s` | `analysis.models.ts:84` | |
| `DefensiveWindow.start_s`, `.end_s` | `analysis.models.ts:90-91` | |
| `PlayerDefensive.cast_times_s`, `.first_cast_s` | `analysis.models.ts:100-101` | |
| `HoldTarget.target_s`, `.stddev_s` | `encounter.models.ts:28,30` | Absolute-clock median cast time, for "hold to 3:20" copy. |
| `CdHoldTarget.delay_s`, `.delay_stddev_s`, `.band_s`, `.effective_cd_s` | `encounter.models.ts:42,44,46,48` | Prior-relative cadence fields. |
| `PerCdBenchmark.avg_first_cast_s`, `.stddev_first_cast_s`, `.avg_gap_s`, `.stddev_gap_s`, `.avg_bl_offset_s`, `.stddev_bl_offset_s` | `encounter.models.ts:55-60` | |
| `PerDefensiveBenchmark.avg_first_cast_s`, `.stddev_first_cast_s`, `.avg_gap_s`, `.stddev_gap_s` | `encounter.models.ts:83-86` | |
| `ParsePositions.duration_s`, `.interval_s` | `positioning.models.ts:27-28` | |
| `EncounterPositions.interval_s` | `positioning.models.ts:38` | |
| `PosRow`/`PlayerPosRow` first tuple element (`t_s`) | `positioning.models.ts:11,14` | Untyped tuple position, not a named field - easy to miss in a grep-only pass. |
| `ClipAnchor.timeS`, `.windowLengthS` | `capture.models.ts:9,11` | Cross-layer boundary shape into the live-capture slice, which is otherwise all epoch-ms. |
| `ComparisonWindow.timeStartS`, `.timeEndS` | `window-comparison.models.ts:37-38` | |
| `RulebookCooldown.cooldown`, `.duration` | `rulebook.models.ts:4-5` | **No `_s` suffix in code** - unit is seconds only by the schema description (see section 3). Same for `RulebookDefensive.cooldown`/`.duration` (`rulebook.models.ts:15-16`). |

## 2. Seconds fields - transform/service-local types (not in `core/models`)

| Field | File:line |
|---|---|
| `RotationBench.avg_duration_s` | `rotation-data-source.ts:23` |
| `DefensiveBench` cast/window/bench fields (`cast_times_s`, `first_cast_s`, `fight_duration_s`, `time_s`, `window_length_s`, `avg_first_cast_s`, `stddev_first_cast_s`, `avg_gap_s`, `stddev_gap_s`) | `defensive-transform.service.ts:66-77,315-318` |
| `BurstWindow`-local `time_s`, `window_length_s` (pre-bench shape) | `burst-transform.service.ts:64-65` |
| `RuleContext.castTimes` (seconds-keyed map, the outlier inside an otherwise-ms `RuleContext`) | `rotation-rules.ts:83` (built), consumed throughout the file |
| `fightDurationS`, `deathTimes`, `aliveDurationS`, `castTimeS`, `timeS`, `firstCastS`, `pullS`, etc. (rule-evaluator locals) | `rotation-rules.ts:161-808` (see conversion table, section 4) |
| `castTimesMs`-derived `firstS`, `timeS`, `blTimeS`, `totalDtS`, `fightDurS` | `rotation.service.ts:115,131,143,163,168,184,233,244,254` |
| `timeS` locals | `defensive.service.ts:91,111,121,125,235,325,430` |
| `durationS` in map bench build | `map-transform.service.ts:192,262` |
| `interval_s` constant `POSITIONS_INTERVAL_S` | `map-transform.service.ts:193,229` |
| `MAX_FRAME_DT_S`, per-frame `dt` | `map-canvas.ts:148` |
| `HARD_CAST_WINDOW_S`, `TARGET_COUNT_WINDOW_S`, `HEALTH_SAMPLE_WINDOW_S` (rule constants) | `rotation-rules.ts` (grep for `_WINDOW_S`) |

## 3. Seconds fields - persisted data (the actual risk surface)

These are the fields the user asked to include explicitly: anything living in a file on disk,
not just in-memory TypeScript.

- **Rulebook schema** (`.claude/skills/warcraft-ingestion/rulebook.schema.json`):
  - `majorCooldown.cooldown` (schema.json:63-67) - `"Cooldown in seconds."`
  - `majorCooldown.duration` (schema.json:68-72) - `"Optional. Active buff/window duration in seconds."`
  - `defensive.cooldown` (schema.json:109-113) - `"Cooldown in seconds."`
  - `defensive.duration` (schema.json:114-118) - `"Optional. Buff duration in seconds."`
  - No rule `condition` carries a raw authored time number - every threshold is measured live
    from top parses at ingest time (`ruleThreshold`, `rotation-rules.ts:997-1007`), not authored
    in the rulebook. So the schema's seconds fields are the *only* hand-authored time unit in the
    whole pipeline - every other seconds/ms field downstream is machine-computed.
  - These schema files are consumed by the `warcraft-rulebook` skill's authoring subagents (human/LLM-authored content) and by `RulebookCooldown`/`RulebookDefensive` (section 1) at runtime.

- **Ingested bench files** (`frontend/public/data/specs/{spec}/**/*.json`, gitignored on `main`,
  rebuilt hourly by `ingest-parses`) - every field in sections 1 and 2 above that is written by a
  `*TransformService.getBench()` and read back by a `*DataSource`/`FileDataSource` is what
  actually lands on disk in these files. Concretely, per directory:
  - `rotation/{enc}.json` -> `RotationBench` (`avg_duration_s`, `downtime_threshold_ms` - note the
    one ms field mixed into an otherwise-seconds bench, plus every `PerCdBenchmark` field).
  - `defensive/{enc}.json` -> `DefensiveBench` (`cast_times_s`, window `time_s`/`window_length_s`,
    every `PerDefensiveBenchmark` field).
  - `burst/{enc}.json` -> burst windows keyed by `time_s`/`window_length_s`.
  - `positions/{enc}.json` -> `EncounterPositions`/`ParsePositions` (`duration_s`, `interval_s`,
    and the untyped `t_s` tuple slot in every sampled row).
  - `rulebook.json` (per spec) -> `cooldown`/`duration` in seconds, as above.

  Any unit change to these shapes is a **data-format change**, not just a code change: it needs
  an `INGEST_VERSION` bump (see the `warcraft-ingestion` skill) to force regeneration, since old
  and new files would otherwise silently disagree on what a bare number in `cast_times_s` means.

## 4. Milliseconds fields, for contrast

| Field | File:line | Reference frame |
|---|---|---|
| `WclEvent.timestamp` | `wcl.models.ts:31` | Fight-relative ms (WCL native). |
| `WclFight.startTime`, `.endTime` | `wcl.models.ts:4-5` | Report-relative ms. |
| `WclReport.startTime` | `wcl.models.ts:66-67` | **Absolute Unix-epoch ms** - explicitly commented as the shared clock for clip correlation. Different reference frame from `WclFight.startTime` despite both being "ms". |
| `AuraWindows`, `StackTimeline` | `shared/analysis/aura-windows.ts:5-6,38` | Fight-relative ms (doc-commented). |
| `AnalysisFinding.timestamp_ms`, `FindingOccurrence.atMs` | `analysis.models.ts:33,2` | Fight-relative ms. |
| `FindingTimeline.segmentsMs`, `.fightDurationMs` | `analysis.models.ts:13-14` | Fight-relative ms. |
| `RotationBench.downtime_threshold_ms` | `rotation-data-source.ts:24` | The one ms field in an otherwise-seconds bench file. |
| `live-capture.service.ts`: `Segment.start/end`, `ClipWindow.fromMs/toMs`, `SEG_MS` (:81), `BUFFER_MS` (:84), `ClipRoll.preMs/postMs` (:65-66, :87, :89) | `live-capture.service.ts` | **Absolute Unix-epoch ms** - a third, distinct reference frame from fight-relative ms. |
| OAuth token expiry | `core/services/wcl-auth.ts:63` | `Date.now() + expires_in(seconds) * 1000` - unrelated domain (auth, not combat time), same `*1000` idiom. |

## 5. Every ms<->s conversion site

Grepped for `/ 1000`, `* 1000`, `1000)` across `frontend/src`. Full file:line list:

**`rotation-rules.ts`** (densest - ~25 sites): 83, 161, 162, 216, 237, 256, 266, 296, 308, 310,
321, 326, 339, 384, 394-395, 433, 458, 470-471, 519, 528, 558, 589, 599, 653, 668, 671, 685-686,
719-720, 754, 763, 778, 784, 795, 808.

**`rotation.service.ts`**: 115, 131, 140, 143, 163, 168, 184, 233, 244, 254.

**`rotation-transform.service.ts`**: 48, 73, 115, 173, 304.

**`defensive.service.ts`**: 91, 111, 121, 125, 147, 197, 235, 325, 430.

**`defensive-transform.service.ts`**: 106, 111, 168, 192-193, 310, 324-325, 447.

**`burst-transform.service.ts`**: 34 (`BIN_S = BIN_MS / 1000`), 223-224.

**`burst.service.ts`**: 140, 151, 207.

**`map-transform.service.ts`**: 67, 262; **`map.service.ts`**: 23, 89; **`map-draw.ts`**: 13
(`FACING_TO_RAD = 1/1000`, milliradians -> radians, unrelated to time); **`map-canvas.ts`**: 148.

**`northern-sky-transform.service.ts`**: 21.

**`pull-overview.service.ts`**: 64, 131 (via `MS_PER_S = 1000` constant, line 14).

**`live-capture.service.ts`**: 98, 109, 133, 410.

**`hold-targets.ts`**: 90.

**`wcl-auth.ts`**: 63 (unrelated domain - OAuth `expires_in`).

**`post-raid.ts`**: 78 (`duration_s`), 430 (poll-interval display, unrelated to fight time).

Test-only conversions (fixtures/builders, not production code): `testing/builders/events.ts`
(`MS_PER_SECOND` constant, 8 call sites), `aura-windows.spec.ts` (`MS_PER_S`, 12 sites),
`live-capture.service.spec.ts`, `wcl-auth.spec.ts`, `rotation-rules.spec.ts:475,1295`,
`pull-overview.service.spec.ts`.

## 6. Risk zones (where a unit mistake would be silent, not a crash)

1. **`rotation-rules.ts`** - `RuleContext` mixes a seconds-keyed `castTimes` with three ms-keyed
   structures (`selfAuras`/`targetAuras`, `damageIndex`, `targetHealth`). Both `AuraWindows` and
   `CastTimes` are bare `Map<number, ...>`/`number[]` - nothing in the type system stops a new
   rule kind from comparing seconds against ms. That reads as "cast at 45s is inside/outside a
   window" evaluating against literal `45` instead of `45000` - no exception, just a wrong finding.
2. **`defensive-transform.service.ts`** - the same ms `buffWindows` map is consumed two ways in
   the same file: `summarizeDefensiveCasts` (line 106) divides by 1000, `findParseDefensiveWindows`
   (lines 174-178) uses the raw ms directly. Both correct today; an easy copy-paste trap for a
   third consumer.
3. **`live-capture.service.ts`** - a third time domain (absolute epoch ms) that the `Ms` suffix
   alone can't disambiguate from fight-relative ms. `ClipAnchor.timeS` (seconds, fight-relative)
   is the seam where it meets the rest of the app (`absoluteWindowStart`, line 98).
4. **Known, already-guarded precision issue**: rebuilding an ms bound from rounded seconds can
   overshoot by floating-point error (`2.007 * 1000 = 2007.0000000000002`) - documented in
   `defensive-transform.service.spec.ts:98`. Not new; flagging so it's not "discovered" twice.
5. Two independent `mm:ss` formatters (`FormatDurationPipe`, `analysis-math.ts:81 fmtClock`) with
   slightly different padding, and two independent "round to 0.1s" idioms (`analysis-math.ts:10
   round()` vs `map-transform.service.ts:41 DECISECONDS_PER_S`). Not a unit bug, just duplication
   that raises the odds one gets "fixed" to accept a different unit than the other.

## 7. Verdict

**Do not standardize the whole project on milliseconds.** Reasons, in order of how hard they
block it:

- The rulebook schema is **hand-authored in seconds** and published independently on `gh-pages`;
  changing the runtime unit forces either a schema-breaking change to every rulebook.json or a
  conversion shim at ingestion - i.e. exactly the kind of double-conversion risk this audit exists
  to reduce.
- Every persisted bench file is seconds-denominated by contract. Migrating is possible (bump
  `INGEST_VERSION`) but is pure churn - no analysis becomes more correct, only relabeled.
- Display is fundamentally seconds (`mm:ss`); moving internals to ms relocates the `/1000` to
  render time, it doesn't remove it.
- WCL itself already has two ms reference frames (`WclFight.startTime` report-relative vs
  `WclReport.startTime` absolute epoch) plus seconds (OAuth `expires_in`) and other non-time units
  entirely (milliradians, hundredths of a yard) - "just use ms" doesn't remove the need to track
  *which* ms.

**What's actually worth doing**, scoped and low-risk because `RuleContext` is pure in-memory,
never persisted:

1. Standardize `RuleContext` in `rotation-rules.ts` fully on ms - drop the seconds-keyed
   `castTimes`, build it as `castTimesMs` instead, and remove the ~25 ad-hoc `* 1000` conversions
   listed in section 5. No external schema, bench file, or rulebook impact.
2. Add branded types so the compiler catches a unit mix-up instead of relying on a doc comment:
   ```ts
   type Ms = number & { __unit: 'ms' };
   type Sec = number & { __unit: 's' };
   ```
   applied to `AuraWindows`, `StackTimeline`, and the rule-evaluator locals. This is a type-only
   change (zero runtime cost) and would have caught mistake #1 in section 6 at compile time.
3. Optionally collapse the two `mm:ss` formatters and the two 0.1s-rounding idioms (section 6,
   item 5) into one each while touching this code, since `/simplify` would flag the duplication
   anyway - separate, smaller cleanup, not required for 1-2.

Out of scope unless you want it separately: renaming persisted-data `_s` fields, touching the
rulebook schema, or touching `live-capture.service.ts`'s absolute-epoch domain (it's already
well-isolated and correctly commented).

---

**Next step**: confirm this scope (items 1-2, with or without 3) before any code changes.
