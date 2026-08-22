import { describe, it, expect } from 'vitest';
import { ok, missing, transient, permanent, type Result } from '../core/result';
import { INGEST_VERSION } from './ingest-version';
import { encounterSkipKey, parseKey, type SignatureRanking } from './signature';
import {
  isFutureVersion, readStamp, skipDecision, stampBurstFile, stampSignature,
  type EncounterParses, type IngestStamp, type StampedFile,
} from './stamp';

const INGESTED_AT_S = 1776245400;
const STAMP: IngestStamp = { version: INGEST_VERSION, ingestedAtS: INGESTED_AT_S };
const VERSION = String(INGEST_VERSION);
const TOP_N = 10;
const PRIVATE_RANK = 1;
const ranking = (index: number): SignatureRanking => ({ report_code: `report${index}`, fight_id: index });
const ROWS = [PRIVATE_RANK, 2, 3].map(ranking);
const PRIVATE_PARSE = parseKey(ranking(PRIVATE_RANK));
const PARSES: EncounterParses = { rows: ROWS, version: VERSION, topN: TOP_N };
const SIGNATURE = encounterSkipKey(ROWS, new Set(), VERSION, TOP_N);
const WITHOUT_PRIVATE = encounterSkipKey(ROWS, new Set([PRIVATE_PARSE]), VERSION, TOP_N);
const DATA = { spec: 'SubtletyRogue', encounter_id: 3470 };
const NO_INACCESSIBLE: string[] = [];

// Only .ok and .error.kind matter to the stamp, so the ok payload is a placeholder.
const OK: Result<unknown> = ok('slice');
const ALL_OK: Result<unknown>[] = [OK, OK, OK, OK, OK];
const withSibling = (sibling: Result<unknown>): Result<unknown>[] => [OK, sibling, OK, OK, OK];

describe('readStamp', () => {
  const UNSTAMPED = { signature: null, version: null, ingestedAtS: null, inaccessibleParses: new Set() };

  it('reads every stamped field off a file', () => {
    const file: StampedFile = {
      source_signature: SIGNATURE, ingest_version: INGEST_VERSION,
      ingested_at_s: INGESTED_AT_S, inaccessible_parses: [PRIVATE_PARSE],
    };
    expect(readStamp(file)).toEqual({
      signature: SIGNATURE, version: INGEST_VERSION,
      ingestedAtS: INGESTED_AT_S, inaccessibleParses: new Set([PRIVATE_PARSE]),
    });
  });

  it('defaults every field for an absent or unstamped file', () => {
    expect(readStamp(null)).toEqual(UNSTAMPED);
    expect(readStamp(undefined)).toEqual(UNSTAMPED);
    expect(readStamp({})).toEqual(UNSTAMPED);
    expect(readStamp({ ingest_version: INGEST_VERSION })).toEqual({ ...UNSTAMPED, version: INGEST_VERSION });
  });

  it('reads version 0 rather than defaulting it away', () => {
    expect(readStamp({ ingest_version: 0 }).version).toBe(0);
  });
});

describe('stampSignature', () => {
  it('adds source_signature + ingest_version + ingested_at_s without mutating the original', () => {
    const original = { ...DATA };

    const stamped = stampSignature(original, SIGNATURE, STAMP);

    expect(stamped).toEqual({
      ...DATA, source_signature: SIGNATURE, ingest_version: INGEST_VERSION, ingested_at_s: INGESTED_AT_S,
    });
    expect(original).not.toHaveProperty('source_signature');
    expect(original).not.toHaveProperty('ingest_version');
    expect(original).not.toHaveProperty('ingested_at_s');
  });
});

describe('stampBurstFile', () => {
  it('stamps the signature when every slice produced data', () => {
    const file = stampBurstFile(DATA, SIGNATURE, STAMP, NO_INACCESSIBLE, ALL_OK);
    expect(readStamp(file).signature).toBe(SIGNATURE);
  });

  it('leaves the burst unstamped when a sibling slice fails transiently', () => {
    const file = stampBurstFile(DATA, SIGNATURE, STAMP, NO_INACCESSIBLE, withSibling(transient('WCL request failed')));
    expect(readStamp(file).signature).toBeNull();
  });

  it('leaves the burst unstamped when a sibling slice fails permanently', () => {
    const file = stampBurstFile(DATA, SIGNATURE, STAMP, NO_INACCESSIBLE, withSibling(permanent('bad shape', 'burst.bench')));
    expect(readStamp(file).signature).toBeNull();
  });

  it('still stamps when a sibling is legitimately empty (missing is not a failure)', () => {
    const file = stampBurstFile(DATA, SIGNATURE, STAMP, NO_INACCESSIBLE, withSibling(missing('No top parses')));
    expect(readStamp(file).signature).toBe(SIGNATURE);
  });

  it('persists the ingest version, the stamp time and the inaccessible set, stamped or not', () => {
    const stamped = stampBurstFile(DATA, WITHOUT_PRIVATE, STAMP, [PRIVATE_PARSE], ALL_OK);
    const unstamped = stampBurstFile(
      DATA, WITHOUT_PRIVATE, STAMP, [PRIVATE_PARSE], withSibling(transient('WCL request failed')));

    for (const file of [stamped, unstamped]) {
      const stored = readStamp(file);
      expect(stored.version).toBe(INGEST_VERSION);
      expect(stored.ingestedAtS).toBe(INGESTED_AT_S);
      expect(stored.inaccessibleParses).toEqual(new Set([PRIVATE_PARSE]));
    }
  });

  it('does not mutate the input data', () => {
    stampBurstFile(DATA, SIGNATURE, STAMP, NO_INACCESSIBLE, ALL_OK);

    expect(DATA).not.toHaveProperty('source_signature');
    expect(DATA).not.toHaveProperty('ingest_version');
    expect(DATA).not.toHaveProperty('ingested_at_s');
  });
});

describe('write-then-read lifecycle', () => {
  it('skips an encounter whose file this run stamped for the same parse set', () => {
    const file = stampSignature(DATA, SIGNATURE, STAMP);

    expect(skipDecision(file, PARSES)).toEqual({ skip: true, signature: SIGNATURE });
  });

  it('skips an encounter whose burst a complete run stamped', () => {
    const file = stampBurstFile(DATA, SIGNATURE, STAMP, NO_INACCESSIBLE, ALL_OK);

    expect(skipDecision(file, PARSES)).toEqual({ skip: true, signature: SIGNATURE });
  });

  it('ingests an encounter that has no file yet', () => {
    expect(skipDecision(null, PARSES)).toEqual({ skip: false, signature: SIGNATURE });
  });

  it('ingests an encounter whose burst a failed slice left unstamped', () => {
    const file = stampBurstFile(DATA, SIGNATURE, STAMP, NO_INACCESSIBLE, withSibling(transient('WCL request failed')));

    expect(skipDecision(file, PARSES)).toEqual({ skip: false, signature: SIGNATURE });
  });

  it('ingests an encounter whose parse set gained a parse', () => {
    const file = stampSignature(DATA, SIGNATURE, STAMP);
    const grown: EncounterParses = { ...PARSES, rows: [...ROWS, ranking(4)] };

    expect(skipDecision(file, grown).skip).toBe(false);
  });

  it('skips a burst stamped without a parse it recorded as inaccessible', () => {
    const file = stampBurstFile(DATA, WITHOUT_PRIVATE, STAMP, [PRIVATE_PARSE], ALL_OK);

    expect(skipDecision(file, PARSES)).toEqual({ skip: true, signature: WITHOUT_PRIVATE });
  });

  it('ingests a file carrying that same signature without the inaccessible parse recorded', () => {
    const file = stampSignature(DATA, WITHOUT_PRIVATE, STAMP);

    expect(skipDecision(file, PARSES)).toEqual({ skip: false, signature: SIGNATURE });
  });
});

describe('isFutureVersion', () => {
  it('rejects a file stamped with a newer ingest version', () => {
    expect(isFutureVersion({ ingest_version: INGEST_VERSION + 1 })).toBe(true);
  });

  it('trusts the current version and an older one', () => {
    expect(isFutureVersion({ ingest_version: INGEST_VERSION })).toBe(false);
    expect(isFutureVersion({ ingest_version: INGEST_VERSION - 1 })).toBe(false);
  });

  it('trusts a file this run stamped', () => {
    expect(isFutureVersion(stampSignature(DATA, SIGNATURE, STAMP))).toBe(false);
  });

  it('trusts a file with no version stamp (manifest / rulebook)', () => {
    expect(isFutureVersion({ spec: 'SubtletyRogue' })).toBe(false);
    expect(isFutureVersion([{ spec: 'SubtletyRogue' }])).toBe(false);
  });

  it('trusts a non-object or a non-numeric version stamp', () => {
    expect(isFutureVersion(null)).toBe(false);
    expect(isFutureVersion('nope')).toBe(false);
    expect(isFutureVersion({ ingest_version: 'seven' })).toBe(false);
    expect(isFutureVersion({ ingest_version: Number.NaN })).toBe(false);
  });
});
