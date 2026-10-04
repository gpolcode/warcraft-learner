import { describe, it, expect } from 'vitest';
import { type SignatureRanking, IngestSignatureService } from './ingest-signature-service';
import { TestBed } from '@angular/core/testing';

const signatures = TestBed.inject(IngestSignatureService);

const rankings = (...rows: [string, number][]): SignatureRanking[] =>
  rows.map(([report_code, fight_id]) => ({ report_code, fight_id }));

// N is the pool's own length: a fixed N would silently sign a prefix of the rows instead of all of them.
const signatureOf = (version: string, rows: SignatureRanking[]): string =>
  signatures.encounterSkipKey(rows, version, rows.length);

describe('parse-set signature', () => {
  it('produces a 16-char lowercase hex hash', () => {
    expect(signatureOf('abc123', rankings(['r1', 1]))).toMatch(/^[0-9a-f]{16}$/);
  });

  it('is independent of ranking order (sorted parse-set fingerprint)', () => {
    const a = signatureOf('code', rankings(['r1', 1], ['r2', 2], ['r3', 3]));
    const b = signatureOf('code', rankings(['r3', 3], ['r1', 1], ['r2', 2]));
    expect(a).toBe(b);
  });

  it('changes when the parse set changes', () => {
    const a = signatureOf('code', rankings(['r1', 1], ['r2', 2]));
    const b = signatureOf('code', rankings(['r1', 1], ['r2', 9]));
    expect(a).not.toBe(b);
  });

  it('changes when only the version changes (same parse set)', () => {
    const set = rankings(['r1', 1], ['r2', 2]);
    expect(signatureOf('1', set)).not.toBe(signatureOf('2', set));
  });

  it('distinguishes same report with different fight ids', () => {
    const a = signatureOf('code', rankings(['r1', 1]));
    const b = signatureOf('code', rankings(['r1', 2]));
    expect(a).not.toBe(b);
  });
});

describe('encounterSkipKey', () => {
  const P = (report_code: string): SignatureRanking => ({ report_code, fight_id: 1 });
  const pool = (...codes: string[]): SignatureRanking[] => codes.map(P);
  const VERSION = '1';
  const TOP_N = 3; // small N so the cases read as documentation, not a wall of fixtures

  it('signs the top-N rows of the pool', () => {
    expect(signatures.encounterSkipKey(pool('a', 'b', 'c', 'd'), VERSION, TOP_N))
      .toBe(signatureOf(VERSION, pool('a', 'b', 'c')));
  });

  it('changes when the Nth row changes', () => {
    const before = signatures.encounterSkipKey(pool('a', 'b', 'c', 'd'), VERSION, TOP_N);
    expect(signatures.encounterSkipKey(pool('a', 'b', 'X', 'd'), VERSION, TOP_N)).not.toBe(before);
  });

  it('is unchanged when only a row past the top N changes', () => {
    const before = signatures.encounterSkipKey(pool('a', 'b', 'c', 'd'), VERSION, TOP_N);
    expect(signatures.encounterSkipKey(pool('a', 'b', 'c', 'X'), VERSION, TOP_N)).toBe(before);
  });
});
