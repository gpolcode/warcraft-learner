import { describe, it, expect } from 'vitest';
import {
  Result, ok, err, missing, transient, permanent, isOk, match, mapErr,
} from './result';

const VALUE = 42;
const PERMANENT_ID = 'gear.combatant-info';

describe('ok / err constructors', () => {
  it('wraps a success value under the ok discriminant', () => {
    expect(ok(VALUE)).toEqual({ ok: true, value: VALUE });
  });

  it('wraps an error under the err discriminant', () => {
    expect(err(missing('gone'))).toEqual({ ok: false, error: { kind: 'missing', message: 'gone' } });
  });
});

describe('LoadError variant builders', () => {
  it('builds a missing variant (an un-ingested boss, not an error)', () => {
    expect(missing('Not yet ingested.')).toEqual({ kind: 'missing', message: 'Not yet ingested.' });
  });

  it('builds a transient variant (retryable network/5xx failure)', () => {
    expect(transient('WCL is unreachable right now.'))
      .toEqual({ kind: 'transient', message: 'WCL is unreachable right now.' });
  });

  it('carries an id and context on a permanent variant so the shell can logWarn for repro', () => {
    const cause = new Error('boom');
    expect(permanent('Analysis is bugged.', PERMANENT_ID, cause))
      .toEqual({ kind: 'permanent', message: 'Analysis is bugged.', id: PERMANENT_ID, context: cause });
  });

  it('leaves context undefined when omitted', () => {
    expect(permanent('Analysis is bugged.', PERMANENT_ID))
      .toEqual({ kind: 'permanent', message: 'Analysis is bugged.', id: PERMANENT_ID, context: undefined });
  });
});

describe('isOk', () => {
  it('is true for a success and narrows to the value', () => {
    const result: Result<number> = ok(VALUE);
    expect(isOk(result)).toBe(true);
  });

  it('is false for a failure', () => {
    expect(isOk(err(missing('gone')))).toBe(false);
  });
});

describe('match', () => {
  it('folds a success through the ok arm', () => {
    expect(match(ok(VALUE), { ok: (v) => v + 1, err: () => -1 })).toBe(VALUE + 1);
  });

  it('folds a failure through the err arm', () => {
    expect(match(err(transient('down')), { ok: () => 'ok', err: (e) => e.kind })).toBe('transient');
  });
});

describe('mapErr', () => {
  it('re-tags the error channel of a failure', () => {
    const result = mapErr(err(missing('gone')), (e) => e.kind);
    expect(result).toEqual({ ok: false, error: 'missing' });
  });

  it('leaves a success untouched', () => {
    const result: Result<number> = ok(VALUE);
    expect(mapErr(result, () => 'unused')).toEqual({ ok: true, value: VALUE });
  });
});
