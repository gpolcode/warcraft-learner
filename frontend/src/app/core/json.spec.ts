import { describe, it, expect, vi, afterEach } from 'vitest';
import { z } from 'zod';
import { parseJson } from './json';

const SCHEMA = z.object({ name: z.string() });

/** Stands in for a call site's log context. */
const CONTEXT = 'parseJson.spec';

const MATCHING_BLOB = '{"name":"Shadowmaster"}';

/** A truncated write leaves a blob JSON.parse rejects outright. */
const TRUNCATED_BLOB = '{"name":';

/** Parses as JSON, but `name` is a number the schema refuses. */
const WRONG_SHAPE_BLOB = '{"name":7}';

/** Captures the helper's logWarn output and keeps it out of the test log. */
function spyOnWarn() {
  return vi.spyOn(console, 'warn').mockImplementation(() => undefined);
}

describe('parseJson', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the validated value for a blob matching the schema', () => {
    expect(parseJson(SCHEMA, MATCHING_BLOB, CONTEXT)).toEqual({ name: 'Shadowmaster' });
  });

  it('returns null and warns for a blob JSON.parse rejects', () => {
    const warn = spyOnWarn();

    expect(parseJson(SCHEMA, TRUNCATED_BLOB, CONTEXT)).toBeNull();
    expect(warn).toHaveBeenCalled();
  });

  it('returns null and warns for valid JSON the schema rejects, matching the unparseable case', () => {
    const warn = spyOnWarn();

    expect(parseJson(SCHEMA, WRONG_SHAPE_BLOB, CONTEXT)).toBeNull();
    expect(warn).toHaveBeenCalled();
  });
});
