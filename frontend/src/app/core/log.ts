/** Minimal logging helper for best-effort operations that must not crash the UI. */
export function logWarn(context: string, err: unknown): void {
  console.warn(`[warcraft-learner] ${context}:`, err);
}

/** Trace for user-visible diagnostics (on-device AI setup), mirrored to the console. */
export function logInfo(context: string, message: string): void {
  console.info(`[warcraft-learner] ${context}: ${message}`);
}
