# warcraft-learner

A web-based diagnostic tool for Mythic WoW raiders: it evaluates Warcraft Logs combat data against AI-generated, spec-specific rulebooks and delivers coaching-style feedback benchmarked against top parses. The app is a **fully static Angular SPA** on GitHub Pages - no backend, all analysis client-side, WCL queried directly from the browser with an OAuth2 client-credentials token (no user login).

## How this file works

This file is the always-on **router**: the few rules that apply on every turn, the commands, and a table that tells you which **skill** to load before each kind of work. The detailed conventions live in skills under `.claude/skills/` and load **on demand** - a skill is matched by its `description`, so each task only pulls in the context it needs. Load the matching skill before you start; do not work from memory of a topic that has a skill.

## Always-on rules

- **Never use em-dashes (U+2014), en-dashes (U+2013), the Unicode minus (U+2212), or the middle dot (U+00B7)** anywhere - docs, code comments, commit messages, UI copy, generated output. Use a plain ASCII hyphen (`-`) or rephrase.
- **Describe only current behavior, never past behavior.** Docs, skill files, and code comments state what the code does now - never "previously...", "was removed", "no longer...", or a contrast against a prior approach. Change history lives in git, not in the source.
- **Comment the why, not the what - one terse line, or none.** The default is NO comment. The one gate: a comment may exist only if you can name the specific, concrete mistake a competent reader makes *without* it (feeds this id to a spell lookup; deletes this branch not knowing it handles case Y). If you cannot name that mistake, delete the comment. At most one line, never restating the code, JSDoc included; a why that takes two clauses keeps only the clause naming the mistake. Self-audit every comment your diff adds before committing. When in doubt, delete it.

## Architecture at a glance

The layout is domain-oriented: module types over the Angular style guide's feature-area folders. One business domain, `raid-analysis`, plus the technical `shared` domain, each split into the four module types: `feature-*` (a use case's smart components), `ui-*` (presentational components and pipes), `data` (the domain model and every service operating on it: WCL and data-file access, transforms, the per-feature `*FeatureService`s, analysis math, selection state) and `util-*` (technical helpers). Everything directly under `src/app/` outside `domains/` is the shell (the routed pages and the nav) and may reach anything. Access, eslint-enforced (`frontend/eslint.config.js`): feature -> ui, data, util; ui -> ui, data, util; data -> util; util -> util; a domain reaches only itself and `shared`.

Behavior is implemented as methods on `@Injectable` services - stateless, data in, data out (eslint-enforced); exactly **two pass-through API services** (`WclApiService`, `DataFileApiService`) do IO. Ingestion is the same Angular app booted with the `ingest` configuration (`feature-ingest`), driving the same `*TransformService`s and persisting through a micro file server to `frontend/public/data/specs/**`:

```
INGEST (browser, ingest env)                RUNTIME (browser, Angular)
WclApiService -> *TransformService          data/specs/** -> DataFileApiService
  -> DataFileApiService -> file server            -> *DataSource (token swap)
     (:3000) -> data/specs/**                     -> *FeatureService -> *Component
```

The deployed site is composed on **`gh-pages`** from disjoint single-owner folders: `data/specs/` (shared dataset, written by `ingest-parses`), `main/` (prod shell), `pr-N/` (per-PR shells), and a root `index.html` redirect (all written by `deploy-pages`). Code deploys never re-push data; both writers share one concurrency group. Local dev: `npm run data:pull`.

```
frontend/        # the entire Angular 22 app
  src/app/       # the shell: app.*, post-raid/ (route /), pre-fight/ (route /pre), page-nav/
  src/app/domains/raid-analysis/
    feature-*/     # one per use-case card: rotation, burst-windows, defensive, gear, map, live, northern-sky, pull-overview; feature-ingest (bundled only by the ingest configuration)
    ui-*/          # finding-table, plan-table, window-comparison, game-icon, spec-name, bench-empty-banner
    data/          # one folder per feature (its *TransformService, *DataSource token, *FeatureService, local math) plus analysis/, gear/, rulebook/, encounter/, capture/, wcl/, data-files/, data-source/, http/ (the HttpClient chokepoint), selection/, ingest/
    util-wowhead/
  src/app/domains/shared/
    ui-*/          # load-state (+ LoadResourceService), collapsible, flyover-panel, format (pipes)
    util-*/        # http (Result, retry interceptor, providers), logging, validation, card-deck
  schema/        # wcl.graphql - the introspected WCL v2 SDL, for browsing available fields; gitignored, written by `npm run schema:pull`
  scripts/       # ingest-server.js + ingest-headless.mjs + schema-pull.mjs - plain Node, zero ingestion logic
  e2e/           # Playwright happy-path suite (one WCL analysis per run)
  public/data/specs/  # static ingested data - not tracked on main; lives on gh-pages
.github/workflows/  # deploy-pages, ingest-parses (hourly), test, e2e
.claude/agents/   # rulebook-author.md - the isolated per-spec authoring worker
.claude/skills/   # on-demand skills (see the router below)
```

## Commands (run from `frontend/`)

| Command | Description |
|---|---|
| `npm start` | Angular dev server on http://localhost:4200 |
| `npm run build` | Production build to `../static/angular/` |
| `npm test` | `ng test` (Vitest, the one unit-test suite) |
| `npm run e2e` | Playwright e2e suite over both pages (`npm run data:pull` first) |
| `npm run lint` | `ng lint` over `src/**` then `eslint` over `scripts/**`, `e2e/**`, and the Playwright config |
| `npm run knip` | Dead-code check: unused files, exports, and dependencies (`knip.json`) |
| `npm run schema:pull` | Re-introspect the WCL v2 schema and regenerate `wcl-operations.generated.ts` in one run; commit only the regenerated types |
| `npm run data:pull` | Fetch the shared dataset from `origin/gh-pages` into the ignored working tree |
| `node scripts/ingest-server.js` | Ingest file server on :3000; interactive ingestion is this plus `ng serve --configuration ingest` in a second terminal |
| `npm run ingest` | Headless ingestion (CI entry): starts both of the above, then drives the app in a headless browser |

## Development workflow router

Load the matching skill(s) **before** you start that step. The `warcraft-*` skills are this project's rules; Angular/TypeScript conventions, the layer boundaries, and the UI styling rules are enforced by ESLint (`frontend/eslint.config.js`), not by a skill. A skill loads automatically once its `description` matches the task, or you can name it explicitly - either way, load it before starting the row's work, not from memory.

| When you are... | Load |
|---|---|
| Building or changing any code (finding, rule kind, feature, page, component) | **warcraft-change** |
| Writing or changing any string a user sees | **warcraft-writing** |
| Touching WCL queries, gear / spec / talent / enchant extraction, positions, or `wcl-auth` / the embedded secret | **warcraft-wcl-data** |
| Generating or refreshing a spec's `rulebook.json` | **warcraft-rulebook** |
| Reviewing code, a diff, or a PR | **warcraft-change** (the self-review checklist applies) |
| Verifying a change runs / manual end-to-end check | run the relevant command from the Commands table above |

On any conflict between a skill and this file, **this file wins**.
