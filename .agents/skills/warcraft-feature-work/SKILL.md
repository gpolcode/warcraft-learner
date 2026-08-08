---
name: warcraft-feature-work
description: warcraft-learner feature development lifecycle - what a complete change must deliver, end to end. Covers the entry-point shape of the four change kinds (slice, rule kind, page, shared component) and the checklist of artifacts each one ships (slice math, bench shape, occurrences UI, finding copy, specs, INGEST_VERSION bump), with one-line pointers to the domain skill that governs each part. Load this first when building or changing any user-facing feature, then load only the domain skills your change touches.
---

# warcraft-learner feature work

A change is complete when it is playable end to end: the analysis computes it, ingestion bakes it, the page renders it, the copy coaches it, and a spec pins it. This skill is the entry point - it tells you what a complete change delivers and which skill owns each surface. Load the listed domain skill before touching that surface; do not work from memory of it.

## The universal checklist

Every feature change below delivers some subset of:

1. **Slice math** - named, pure, total functions colocated in the slice's own `*.service.ts` (or its slice-local module). Governing skill: **warcraft-architecture**.
2. **Bench shape** - if the change alters what ingestion must bake, update the slice's `*Bench` interface in its `*-data-source.ts` and bump `INGEST_VERSION` (`src/app/ingest/ingest-version.ts`). Governing skill: **warcraft-ingestion**.
3. **Failure handling** - every fallible load returns `Result<T, LoadError>`; the four render states. Governing skill: **warcraft-error-handling**.
4. **UI** - template owns styling, formatting goes through pipes, drill-down uses the shared finding components. Governing skill: **warcraft-frontend**.
5. **Finding copy** - message + remedy in the terse analyst voice. Governing skill: **warcraft-copy**.
6. **Specs** - pure math tested at the lowest altitude, services end-to-end through fakes. Governing skill: **warcraft-testing**.
7. **WCL reads** - a new event stream or gear/talent/position field means checking the quirks table first. Governing skill: **warcraft-wcl-data**.

## Change kinds

### New finding on an existing slice

The smallest complete change. Deliver: the pure check in the slice's colocated functions, a `FindingOccurrence`-populated result (no occurrences, no drill-down UX), message + remedy copy, boundary-paired specs. No bench change means no `INGEST_VERSION` bump.

### New rule-engine kind

Deliver: the kind's block in `RULE_KINDS` (`rotation-rules.ts` - streams, measure, evaluator, applicability, label; the mapped type will not compile with one missing), per-instance `occurrences` on the finding (extend `evaluateBoundedPerCast` or `fillerOccurrences` before writing a bespoke builder), boundary-paired specs. The kind must also be declared in the rulebook schema (`.agents/skills/warcraft-ingestion/rulebook.schema.json`) so rulebook authors can write rules of that kind - that is a bench-affecting change: bump `INGEST_VERSION`. Rulebook semantics are governed by **warcraft-ingestion** (schema) and **warcraft-rulebook** (generation).

### New vertical slice

Follow the Burst slice (`pages/post-raid/burst-windows/`) as the reference. Deliver: the slice's `*TransformService` + `*DataSource` token pair + `*FeatureService` + feature component, wired into the ingest orchestrator and the page shell, its tailored bench file, specs at both altitudes. Bump `INGEST_VERSION`. Governing skills: **warcraft-architecture** (layer rules), **warcraft-ingestion** (orchestrator + file shape).

### New page or shared component

Deliver: the shell (zero domain services) or leaf (inputs/outputs only), copy per **warcraft-copy**, specs per **warcraft-testing** (`mountVm` for leaves), and - for a page - an e2e card test per **warcraft-e2e**.

## Verification

`npm test`, `npm run lint`, and a production-build check from `frontend/` (commands in AGENTS.md). E2e spends one WCL analysis per run - run it only when the change touches a rendered page, and read **warcraft-e2e** first.
