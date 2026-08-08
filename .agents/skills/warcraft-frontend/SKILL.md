---
name: warcraft-frontend
description: warcraft-learner project Angular conventions - the hard rules for all Angular/TypeScript code in frontend/src. Covers the goal of every UI rule (one design-token theme, template owns styling, formatting through pipes, typed pass-through API services, declarative polling), the no-hardcoded-colors rule, the finding drill-down contract, the ESLint setup, and the index.html keep-in-sync checklist. Load this before editing or creating anything under frontend/src (components, templates, services, pipes, index.html). Pairs with the generic angular-developer skill; on conflict these project rules win.
---

# warcraft-learner frontend conventions

**What good looks like:** a component TS file exposes only semantic state (enums, raw numbers, booleans) - reading it tells you nothing about pixels. The template maps state to theme tokens, pipes format every rendered value, and `styles.scss` is the single source of color truth.

**Deliverable:** the hard rules below all hold for your diff; `npm run lint` passes; the sync checklist holds when you touch the surfaces it lists.

## Styling and components

- **Styling: Angular Material building blocks + Tailwind utilities only; zero per-component style files.** The one stylesheet is global `frontend/src/styles.scss` (Material `mat.theme()`, `mat.*-overrides()` token mixins, design tokens, semantic `badge-*` / `fill-*` / `seg-*` / `icon-*` / `chip-onplan` classes). Reference style: `pages/post-raid/post-raid.html`, `shared/components/window-comparison`.
- **Restyle Material through tokens, never `!important` or plain utilities.** Material's styles are unlayered; Tailwind v4 utilities are layered and silently lose. Theme-wide looks go through the `mat.*-overrides()` mixins; mat-icon sizes use the global `icon-16` / `icon-18` / `icon-seg` classes. Icon buttons stay at Material's default size.
- **No hardcoded colors anywhere - ever.** No hex, `rgb()`, or named CSS color in TS, templates, or constants - only the `styles.scss` tokens via Tailwind arbitrary values (`text-[var(--success)]`) or `badge-*` classes. Canvas/imperative draws read tokens at draw time via `getComputedStyle` (see `token()` in `map-canvas.ts`) with no hex fallback.
- **Component TS never produces CSS classes or style strings; the template owns all styling.** A `computed()` exposes semantic state only; the template maps it with `[class.x]="status() === 'x'"` or `@if`/`@switch`. Bracketed `[class.x]` cannot toggle a Tailwind arbitrary-value class - for a token-driven multi-property look add a semantic class to `styles.scss` and toggle it by name. Static, non-conditional `host: { class: '...' }` is allowed.
- **Never build inline `style` strings.** For dynamic numeric geometry expose the raw number and bind one property (`[style.width.%]="widthPct()"`).
- **Layout lives in the template, not in TS.** No `computed()` returning Tailwind class strings; conditional columns are `@if` around cells with fixed-width utilities. Mirrored parent/child widths stay as literals in both templates with a cross-pointing comment.
- **External `templateUrl` for anything beyond trivial markup** (roughly <10 lines inline).
- **All formatting goes through Angular pipes** (`FormatDurationPipe`, `FormatDamagePipe`, `DecimalPipe`, `FormatSpecPipe`); view-models expose raw numbers, templates format. New formats go in `shared/pipes/`, never ad-hoc string building.
- **A rule finding's drill-down is `wl-finding-occurrences`** (`shared/components/finding-table/`): populate `occurrences` on the finding and the UI work is done - never build a bespoke per-condition display.
- Time windows render as a `m:ss - m:ss` range.

## API service conventions

- **`get*` verb for all network methods** (`getReport`, never `fetch*` or noun-first).
- **GraphQL query strings live in `core/services/wcl-queries.ts` only**, each with a typed `*Vars` interface - never `Record<string, unknown>`.
- **Transports are pass-through**; response-to-model mapping is colocated in the consuming slice/shell (**warcraft-architecture**).
- **No silent error swallowing** - any best-effort `catch` calls `logWarn(context, err)` from `core/log.ts` before discarding.

## Polling and async state

- Live-sync/polling machinery belongs in a service (`LiveReportSyncService`); components wire it declaratively (`combineLatest`/`switchMap`/`exhaustMap` + `takeUntilDestroyed`).
- One teardown strategy per pipeline: `takeUntilDestroyed(destroyRef)` **or** a stored `Subscription` unsubscribed in `ngOnDestroy` - never both.

## Angular/TypeScript conventions

The `angular-developer` skill holds the generic Angular best practices this app follows (standalone components, signals, `input()`/`output()`, native control flow, `inject()`). The mechanizable subset is **enforced by ESLint** - `frontend/eslint.config.js` is the source of truth for the pinned rules and their option tweaks; read it there.

## Keep-in-sync checklist

When your change touches one of these surfaces, update its counterpart in the same commit:

- New `<mat-icon>` ligature or status-icon literal -> the `icon_names=` subset list in `frontend/src/index.html`.
- Text styled `font-bold` (700) is not loaded - use `font-semibold`; adding a weight means editing the Google Fonts `wght@` list in `index.html`.
- New external host the app talks to -> the CSP `meta` tag in `index.html` (the allowlist mirrors the external-API catalog in **warcraft-wcl-data**).
- A rendered Wowhead spell/item link needs no script work: `WowheadTooltipsService` lazily injects the tooltips on first link render.
