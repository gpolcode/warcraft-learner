/** Presence assertion: fails the test on a missing value, so specs never null-forgive with `!`. */
export function defined<T>(value: T | null | undefined): T {
  if (value == null) throw new Error(`Expected a value, got ${String(value)}`);
  return value;
}
