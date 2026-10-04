import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IngestSignatureService {

  /** Stable `report_code:fight_id` list, sorted, so ranking order never affects the hash. */
  private rankingFingerprint(rankings: SignatureRanking[]): string {
    return rankings
      .map(ranking => `${ranking.report_code}:${ranking.fight_id}`)
      .sort()
      .join('|');
  }

  /** A private log in the top N stays in the signed set, so the free pre-check needs no record of which logs failed; the parse backfilling it is not signed. */
  encounterSkipKey(poolRows: SignatureRanking[], version: string, topN: number): string {
    return bytesToHex(sha256(utf8ToBytes(`${version}\n${this.rankingFingerprint(poolRows.slice(0, topN))}`))).slice(0, 16);
  }
}

// A tailored file is fresh when the ingest version AND its top-ranked parse set are unchanged, folded into one short hash.
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';

/** Satisfied by the shared `toParseRankings` selection's rows, so the signature keys on exactly the parses that feed the transforms. */
export interface SignatureRanking {
  report_code: string;
  fight_id: number;
}
