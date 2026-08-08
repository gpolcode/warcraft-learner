---
name: warcraft-error-handling
description: warcraft-learner fallible-load pattern - how any load that can fail is typed, surfaced, and rendered. Covers the Result<T, LoadError> contract, the three-variant taxonomy (missing / transient / permanent), the single retry-transient interceptor, the toLoadError status boundary, and the four-state card rendering contract. Load this before writing or changing any code that fetches, parses, or renders the outcome of a WCL query or a data-file read. Pairs with warcraft-architecture (layer rules) and warcraft-frontend (no silent swallow); on conflict those and AGENTS.md win.
---

# warcraft-learner error handling

**What good looks like:** every load that can fail returns a typed `Result<T, LoadError>`, and the user always lands in one of four render states (content / waiting / transient error / permanent error) - never a blank or stale card that reads as "nothing to report", never an escaping throw, never a silent fallback.

**Deliverable:** a fallible read returns `Promise<Result<T, LoadError>>`; its consumer discriminates on `.ok` or `match`es into the four states; the card template gates content behind one `wl-load-state`.

## The taxonomy: exactly three kinds

`LoadError` is a closed union - no fourth kind, no bare `Error`. `Result` and the variant builders live in `core/result.ts` (Angular-free; pure cores and headless ingestion import it); read it for the exact API.

| kind | when | user sees | retry? | logWarn? |
|---|---|---|---|---|
| `missing` | 404 - an un-ingested spec/boss | the `wl-load-state` waiting state | no | no (not an error) |
| `transient` | network / 5xx / 429 / 408 / status 0 | "something broke, retry in a moment" | retried once by the interceptor | yes |
| `permanent` | a 200 OK that is semantically unusable (no combatant info, unknown ability id) | "this analysis is bugged, do not retry" | no | yes, with a stable `id` + `context` for repro |

`missing` is deliberately not an error: it feeds the waiting state, not an error banner.

## Where each piece lives

- **Retry interceptor** (`core/interceptors/retry-transient.interceptor.ts`): the single retry point - transient statuses only, count from the `RETRY_MAX_ATTEMPTS` token. 401/403/404 pass through un-retried. Never add a per-service retry loop.
- **Imperative shell** (`*FeatureService`, `*DataFileService`, transports, `WclApiService`): the only layer with `try/catch`. The catch `logWarn`s, then returns `toLoadError(cause, id)` (`core/http-load-error.ts` - the one place an HTTP status becomes a variant; do not re-derive the mapping per slice).
- **Functional core** (colocated pure transforms): total, no-throw, no-IO. A semantically impossible analysis returns `permanent(...)` / `missing(...)` directly - never a `null` sentinel or `{ found: false }` placeholder.
- **Components / view-models**: apply the `Result`, keep one `available` signal (`= result.ok`) and one `error` signal (null for `missing`), and render content or one `wl-load-state` (`shared/components/load-state`). A legitimate not-an-error state (no player selected) still returns `ok(...)`.

## The rules

1. Every fallible load returns `Result<T, LoadError>` - never `T | null`, never an escaping throw, never a `{ found: false }` placeholder.
2. The error channel is the three-variant union. `missing` is not an error; `permanent` carries an `id` and is `logWarn`ed.
3. `try/catch` lives only in the imperative shell; the catch `logWarn`s then returns `toLoadError(cause, id)`. No silent swallow.
4. Pure core functions signal failure with `missing(...)` / `permanent(...)`, never by throwing.
5. Consume by discriminating on `.ok` or by `match`. No monadic chaining until earned (Rule of Three).
6. The retry-transient interceptor is the single retry point.
7. Map status to variant in exactly one place (`toLoadError` / `RETRYABLE_STATUSES`).
8. No new runtime dependency for this pattern - `Result` is the hand-rolled `core/result.ts`.
9. Tests assert on plain literals and pair each mapped status with its boundary sibling (**warcraft-testing**).

## Testing note

The interceptor's backoff is a real RxJS timer: drive its retry with `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync(...)` and `HttpTestingController`.
