/** Minimal logging helper for best-effort operations that must not crash the UI. */
export function logWarn(context: string, err: unknown): void {
  console.warn(`[warcraft-learner] ${context}:`, err);
}

/** Minimal logging helper for fatal errors (e.g. a failed bootstrap) that are not best-effort. */
export function logError(context: string, err: unknown): void {
  console.error(`[warcraft-learner] ${context}:`, err);
}
