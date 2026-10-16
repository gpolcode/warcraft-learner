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
