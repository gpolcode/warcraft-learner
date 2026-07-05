/**
 * `Result<T, E>`: a total, serializable outcome for any fallible load. The functional
 * core and the imperative shell return this instead of throwing, returning `null`, or
 * returning a `{ found: false }` placeholder, so every caller must decide what each
 * failure means. Discriminate on the `ok` field; both arms are plain object literals
 * (no class), so they tree-shake, JSON-serialize, and assert cleanly in tests.
 *
 * This module is Angular-free and dependency-free, so the pure core transforms and the
 * headless Node ingestion can import it. The HTTP-status-to-variant converter that needs
 * Angular types lives in `http-load-error.ts` (browser shell only).
 */
export type Result<T, E = LoadError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * The load-failure taxonomy the UI renders. Exactly three kinds:
 *  - `missing`   an un-ingested spec/boss (a 404). NOT an error - feeds the existing
 *                "bench empty / missing data" waiting state.
 *  - `transient` network / 5xx / 429 / timeout. The user sees "something broke, retry in
 *                a moment". The retry-transient interceptor already retried once.
 *  - `permanent` a 200 OK that is semantically unusable for this analysis (no combatant
 *                info, player absent from the damage table). The user sees "this analysis
 *                is bugged, do not retry"; carries an `id` + optional `context` so the
 *                shell can `logWarn` for repro.
 */
export type LoadError =
  | { readonly kind: 'missing'; readonly message: string }
  | { readonly kind: 'transient'; readonly message: string }
  | { readonly kind: 'permanent'; readonly message: string; readonly id: string; readonly context?: unknown };

/* ------------------------------- constructors ------------------------------- */

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Variant builders, so call sites never spell out the object shape. */
export function missing(message: string): LoadError {
  return { kind: 'missing', message };
}

export function transient(message: string): LoadError {
  return { kind: 'transient', message };
}

export function permanent(message: string, id: string, context?: unknown): LoadError {
  return { kind: 'permanent', message, id, context };
}

/* --------------------------------- helpers ---------------------------------- */

/** Narrowing guard (the `.ok` field alone also narrows; this reads well in filters). */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

/** Exhaustive fold to a single render value. The one combinator worth having here. */
export function match<T, E, R>(
  result: Result<T, E>,
  arms: { ok: (value: T) => R; err: (error: E) => R },
): R {
  return result.ok ? arms.ok(result.value) : arms.err(result.error);
}

/** Re-tag the error channel while leaving a success untouched (used at the shell boundary). */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return result.ok ? result : err(fn(result.error));
}
