import { describe, it, expect } from 'vitest';
import { type Result, Results } from '../../../shared/util-http/result';
import { INGEST_VERSION } from './ingest-version';
import { type SignatureRanking, IngestSignatureService } from './ingest-signature-service';
import { type IngestStamp, IngestStampService } from './ingest-stamp-service';
import { TestBed } from '@angular/core/testing';

const signatures = TestBed.inject(IngestSignatureService);
const stamps = TestBed.inject(IngestStampService);

const INGESTED_AT_S = 1776245400;
const STAMP: IngestStamp = { version: INGEST_VERSION, ingestedAtS: INGESTED_AT_S };
const VERSION = String(INGEST_VERSION);
const TOP_N = 10;
const ranking = (rank: number): SignatureRanking => ({ report_code: `report${rank}`, fight_id: rank });
const ROWS = [1, 2, 3].map(ranking);
const SIGNATURE = signatures.encounterSkipKey(ROWS, VERSION, TOP_N);
const DATA = { spec: 'SubtletyRogue', encounter_id: 3470 };
const NO_FAILED_FETCHES: ReadonlySet<string> = new Set();
const FAILED_FETCH: ReadonlySet<string> = new Set([ranking(1).report_code]);

// Only .ok and .error.kind matter to the stamp, so the ok payload is a placeholder.
const OK: Result<unknown> = Results.ok('bench');
const ALL_OK: Result<unknown>[] = [OK, OK, OK, OK, OK];
const withSibling = (sibling: Result<unknown>): Result<unknown>[] => [OK, sibling, OK, OK, OK];
const nextRun = (file: unknown): { skip: boolean; signature: string } => stamps.skipDecision(file, ROWS, VERSION, TOP_N);

describe('write then read', () => {
  it('skips an encounter whose file this run stamped for the same parse set', () => {
    const file = stamps.stampSignature(DATA, SIGNATURE, STAMP);

    expect(nextRun(file)).toEqual({ skip: true, signature: SIGNATURE });
  });

  it('skips an encounter whose burst every bench completed', () => {
    const file = stamps.stampBurstFile(DATA, SIGNATURE, STAMP, ALL_OK, NO_FAILED_FETCHES);

    expect(nextRun(file)).toEqual({ skip: true, signature: SIGNATURE });
  });

  it('still skips when a sibling bench is legitimately empty (missing is not a failure)', () => {
    const file = stamps.stampBurstFile(DATA, SIGNATURE, STAMP, withSibling(Results.missing('No top parses')), NO_FAILED_FETCHES);

    expect(nextRun(file)).toEqual({ skip: true, signature: SIGNATURE });
  });

  it('ingests an encounter with no file yet', () => {
    expect(nextRun(null)).toEqual({ skip: false, signature: SIGNATURE });
    expect(nextRun(undefined)).toEqual({ skip: false, signature: SIGNATURE });
    expect(nextRun({})).toEqual({ skip: false, signature: SIGNATURE });
  });

  it('ingests an encounter whose burst a transiently failed bench left unstamped', () => {
    const file = stamps.stampBurstFile(DATA, SIGNATURE, STAMP, withSibling(Results.transient('WCL request failed')), NO_FAILED_FETCHES);

    expect(nextRun(file)).toEqual({ skip: false, signature: SIGNATURE });
  });

  it('ingests an encounter whose burst a permanently failed bench left unstamped', () => {
    const failed = withSibling(Results.permanent('bad shape', 'burst.bench'));
    const file = stamps.stampBurstFile(DATA, SIGNATURE, STAMP, failed, NO_FAILED_FETCHES);

    expect(nextRun(file)).toEqual({ skip: false, signature: SIGNATURE });
  });

  it('ingests an encounter whose burst a failed log fetch left unstamped, though every bench completed', () => {
    const file = stamps.stampBurstFile(DATA, SIGNATURE, STAMP, ALL_OK, FAILED_FETCH);

    expect(nextRun(file)).toEqual({ skip: false, signature: SIGNATURE });
  });

  it('ingests an encounter whose parse set gained a parse', () => {
    const file = stamps.stampSignature(DATA, SIGNATURE, STAMP);
    const grown = [...ROWS, ranking(4)];

    expect(stamps.skipDecision(file, grown, VERSION, TOP_N).skip).toBe(false);
  });

  it('writes the field names the files already on disk carry', () => {
    expect(stamps.stampSignature(DATA, SIGNATURE, STAMP)).toEqual({
      ...DATA, source_signature: SIGNATURE, ingest_version: INGEST_VERSION, ingested_at_s: INGESTED_AT_S,
    });
    expect(stamps.stampBurstFile(DATA, SIGNATURE, STAMP, ALL_OK, NO_FAILED_FETCHES)).toEqual({
      ...DATA, source_signature: SIGNATURE, ingest_version: INGEST_VERSION, ingested_at_s: INGESTED_AT_S,
    });
  });

  it('reads the ingest version and stamp time back off either writer, stamped or not', () => {
    const tailored = stamps.stampSignature(DATA, SIGNATURE, STAMP);
    const unstamped = stamps.stampBurstFile(
      DATA, SIGNATURE, STAMP, withSibling(Results.transient('WCL request failed')), NO_FAILED_FETCHES);

    for (const file of [tailored, unstamped]) {
      expect(stamps.readFileStamp(file)).toEqual({ version: INGEST_VERSION, ingestedAtS: INGESTED_AT_S });
    }
  });

  it('reads no version and no stamp time off an absent or unstamped file', () => {
    const UNSTAMPED = { version: null, ingestedAtS: null };

    expect(stamps.readFileStamp(null)).toEqual(UNSTAMPED);
    expect(stamps.readFileStamp(undefined)).toEqual(UNSTAMPED);
    expect(stamps.readFileStamp({})).toEqual(UNSTAMPED);
  });

  it('reads version 0 rather than defaulting it away', () => {
    expect(stamps.readFileStamp({ ingest_version: 0 }).version).toBe(0);
  });

  it('leaves the data the writers were handed untouched', () => {
    stamps.stampSignature(DATA, SIGNATURE, STAMP);
    stamps.stampBurstFile(DATA, SIGNATURE, STAMP, ALL_OK, NO_FAILED_FETCHES);

    expect(DATA).toEqual({ spec: 'SubtletyRogue', encounter_id: 3470 });
  });
});

describe('version trust', () => {
  it('rejects a file stamped one ingest version ahead', () => {
    expect(stamps.isFutureVersion({ ingest_version: INGEST_VERSION + 1 })).toBe(true);
  });

  it('trusts the current version and an older one', () => {
    expect(stamps.isFutureVersion({ ingest_version: INGEST_VERSION })).toBe(false);
    expect(stamps.isFutureVersion({ ingest_version: INGEST_VERSION - 1 })).toBe(false);
  });

  it('trusts a file this run stamped', () => {
    expect(stamps.isFutureVersion(stamps.stampSignature(DATA, SIGNATURE, STAMP))).toBe(false);
    expect(stamps.isFutureVersion(stamps.stampBurstFile(DATA, SIGNATURE, STAMP, ALL_OK, NO_FAILED_FETCHES))).toBe(false);
  });

  it('trusts a file with no version stamp (a manifest)', () => {
    expect(stamps.isFutureVersion({ spec: 'SubtletyRogue' })).toBe(false);
    expect(stamps.isFutureVersion([{ spec: 'SubtletyRogue' }])).toBe(false);
  });

  it('trusts a non-object or a non-numeric version stamp', () => {
    expect(stamps.isFutureVersion(null)).toBe(false);
    expect(stamps.isFutureVersion('nope')).toBe(false);
    expect(stamps.isFutureVersion({ ingest_version: 'seven' })).toBe(false);
    expect(stamps.isFutureVersion({ ingest_version: Number.NaN })).toBe(false);
  });
});
