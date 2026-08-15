/** Yields a macrotask - not a microtask - so the queued `.then` callbacks of a fire-and-forget async load run before assertions. */
export function flushAsync(): Promise<void> {
  return new Promise(resolve => { setTimeout(resolve, 0); });
}
