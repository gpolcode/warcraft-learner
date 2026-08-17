import * as z from './zod-mini';
import { logWarn } from './log';

/** Parses an untrusted JSON string against `schema`. A syntax error and a shape mismatch are one outcome - warn under `context`, return null - so callers keep a single malformed-input path. */
export function parseJson<S extends z.ZodMiniType>(schema: S, raw: string, context: string): z.infer<S> | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (err) {
    logWarn(context, err);
    return null;
  }
  const parsed = schema.safeParse(value);
  if (parsed.success) return parsed.data;
  logWarn(context, parsed.error);
  return null;
}
