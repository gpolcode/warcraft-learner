---
name: warcraft-error-handling
description: warcraft-learner fallible-load and error-taxonomy pattern - the hard rules for how any load that can fail is typed, surfaced, and rendered. Covers the hand-rolled Result<T, LoadError> in core/result.ts, the three-variant taxonomy (missing / transient / permanent), the toLoadError HTTP-boundary converter, the single retry-transient HttpInterceptor, and where each piece sits in the functional-core / imperative-shell split. Load this before writing or changing any code that fetches, parses, or renders the outcome of a WCL query or a data-file read - transports, *DataFileService, *FeatureService loads, *DataSource, and the components that render their result. Pairs with warcraft-architecture (layer rules) and warcraft-frontend (no silent swallow); on conflict those and CLAUDE.md win.
---

# warcraft-learner error handling

Every load that can fail returns a typed `Result`, never `null`, never a `{ found: false }` placeholder, and never a throw that escapes the shell. The user always lands in one of four render states, never a blank or stale card that is indistinguishable from "nothing to report".

## The two files

- `core/result.ts` - Angular-free, dependency-free. The pure core transforms and the headless Node ingestion import it. Holds `Result<T, E>`, `LoadError`, the constructors (`ok`, `err`), the variant builders (`missing`, `transient`, `permanent`), and the helpers (`isOk`, `match`, `mapErr`).
- `core/http-load-error.ts` - browser shell only (imports `HttpErrorResponse`). Holds `toLoadError`, the one place an HTTP/transport status becomes a taxonomy variant.

## The type

```ts
type Result<T, E = LoadError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

Discriminate on `.ok`. Both arms are plain object literals (no class) so they tree-shake, JSON-serialize, and assert cleanly in Vitest.

## The taxonomy: exactly three kinds

`LoadError` is a closed union. Do not add a fourth kind or fall back to a bare `Error`.

| kind | when | user sees | retry? | logWarn? |
|---|---|---|---|---|
| `missing` | 404 - an un-ingested spec/boss | the existing bench-empty / missing-data waiting feature | no | no (not an error) |
| `transient` | network / 5xx / 429 / 408 / status 0 | "something broke, retry in a moment" | already retried once by the interceptor | yes |
| `permanent` | a 200 OK that is semantically unusable for this analysis (no combatant info, player absent from the damage table, an unknown ability id) | "this analysis is bugged, do not retry" | no | yes, with `id` + `context` for repro |

`missing` is deliberately not an error: it feeds the waiting state, not an error banner. `permanent` must carry a stable `id` (e.g. `'gear.combatant-info'`) and be `logWarn`ed so a user report can be reproduced.

## Where each piece lives (the layer map)

- **Retry interceptor** (`core/interceptors/retry-transient.interceptor.ts`): the single retry point. Retries once, transient statuses only, `delay` as a function (no deprecated `retryWhen`). Because Apollo's `HttpLink` rides on Angular `HttpClient`, this one interceptor covers both the data-file GETs and the WCL GraphQL POSTs. Knows HTTP status only, never domain meaning. 401/403/404 pass through un-retried (401 is the auth layer's job; 404 is `missing`; 403 is permanent). Never add a per-service retry loop.
- **Imperative shell** (`*FeatureService`, `*DataFileService`, `HttpDataFileTransport`, `WclApiService`): the only layer with `try/catch`. The catch body `logWarn`s, then returns `err(toLoadError(cause, id))`. Fallible reads change from `Promise<T | null>` to `Promise<Result<T, LoadError>>`.
- **Functional core** (colocated pure `*.service.ts` transforms): total, no-throw, no-IO. A semantically-impossible analysis returns `err(permanent(...))` or `err(missing(...))` directly, never a `null` sentinel or a `{ found: false }` placeholder.
- **Components / view-models**: `match` the `Result` into one of the four render states; a `permanent` result also triggers `logWarn(error.id, error.context)`.

## Status-to-variant mapping lives in one place

`toLoadError` (catch site) and the interceptor's `RETRYABLE_STATUSES` are the only two places that map an HTTP status to a variant. Do not re-derive the mapping per slice.

```ts
export function toLoadError(cause: unknown, id: string): LoadError {
  const status = cause instanceof HttpErrorResponse ? cause.status
    : cause instanceof WclTransportError ? cause.status : -1;
  if (status === 404) return missing('Not yet ingested.');
  if (TRANSIENT_STATUSES.has(status)) return transient('WCL is unreachable right now.');
  return permanent('Analysis data could not be loaded.', id, cause);
}
```

## Consuming a Result

`await` then discriminate on `.ok`, or `match` at the view boundary. Do not reach for monadic chaining.

```ts
const bench = await this.source.getBench(spec, encounterId);
if (!bench.ok) return errorView(bench.error);   // .ok narrows bench.value below
// ...use bench.value...
```

The minimal API is `ok`, `err`, `missing`, `transient`, `permanent`, `isOk`, `match`, `mapErr`, `toLoadError`. No `map` / `andThen` / `unwrapOr` until a real synchronous multi-step transform earns them (Rule of Three). `null` / `[]` stays legal only for the total-function "empty but valid input" contract (returning `0` / `[]` for genuinely empty data), never for a failure.

## Testing

`Result` is plain data, so assert on literals and pair each mapped status with its boundary sibling, per the testing skill's named-constants and tests-as-documentation rules.

```ts
expect(result.ok).toBe(true);
if (result.ok) expect(result.value.trinkets).toHaveLength(EXPECTED_TRINKET_COUNT);

expect(buildCharacterGear(null, {}, REPORT_CODE, SUBTLETY))
  .toEqual(err(permanent('No combatant info in this log.', 'gear.combatant-info')));

expect(await source.getBench(SUBTLETY, UNKNOWN_ENCOUNTER_ID))
  .toEqual(err(missing('Not yet ingested.')));
```

The interceptor's backoff is a real RxJS timer: drive its retry with `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync(BACKOFF_MS)` and `HttpTestingController`.

## The rules

1. Every fallible load returns `Result<T, LoadError>` - never `T | null`, never an escaping throw, never a `{ found: false }` placeholder.
2. The error channel is the three-variant `LoadError` union. No fourth kind, no bare `Error`. `missing` is not an error; `permanent` carries an `id` and is `logWarn`ed.
3. `try/catch` lives only in the imperative shell; the catch `logWarn`s then returns `err(toLoadError(cause, id))`. No silent swallow.
4. Pure core functions signal failure by returning `err(...)`, never by throwing. They stay synchronous, IO-free, and total.
5. Consume by discriminating on `.ok` or by `match`. No monadic chaining until earned.
6. The retry-transient interceptor is the single retry point (count 1, transient statuses only). 401/403/404 pass through.
7. Map status to variant in exactly one place (`toLoadError` / `RETRYABLE_STATUSES`).
8. No new runtime dependency for this pattern; `Result` is the hand-rolled `core/result.ts`.
9. Tests assert on plain literals, pair each status with its boundary sibling, and name every status/id constant.
10. Obey the always-on rules in this pattern's own code and docs: ASCII hyphens only, describe current behavior only.
