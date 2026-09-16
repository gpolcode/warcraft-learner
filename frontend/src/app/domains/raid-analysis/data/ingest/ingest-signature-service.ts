import { Injectable, inject } from '@angular/core';
import { HashService } from '../../../shared/util-hash/hash-service';

@Injectable({ providedIn: 'root' })
export class IngestSignatureService {
  private readonly hash = inject(HashService);

  /** `report_code:fight_id` key - the unit of the parse-set fingerprint and the inaccessible set. */
  private parseKey(ranking: SignatureRanking): string {
    return `${ranking.report_code}:${ranking.fight_id}`;
  }

  /** Stable `report_code:fight_id` list, sorted, so ranking order never affects the hash. */
  private rankingFingerprint(rankings: SignatureRanking[]): string {
    return rankings
      .map(ranking => `${ranking.report_code}:${ranking.fight_id}`)
      .sort()
      .join('|');
  }

  private encounterSignature(sourceKey: string, rankings: SignatureRanking[]): Promise<string> {
    return this.hash.shortHash(`${sourceKey}\n${this.rankingFingerprint(rankings)}`);
  }

  /** The signature over the top-`topN` ACCESSIBLE parses - the one rule both the cheap pre-check and the post-fetch stamp key on, so they can never diverge. */
  encounterSkipKey(
    poolRows: SignatureRanking[], inaccessible: ReadonlySet<string>, sourceKey: string, topN: number,
  ): Promise<string> {
    const usedRows = poolRows.filter(row => !inaccessible.has(this.parseKey(row))).slice(0, topN);
    return this.encounterSignature(sourceKey, usedRows);
  }

  /** Persist only permission-denied `inaccessibleCodes`; sign the top-N minus every `failedCodes` fetch, so a backfilled bench is stamped as the set it used. */
  async signatureAfterFetch(
    poolRows: SignatureRanking[], inaccessibleCodes: ReadonlySet<string>, failedCodes: ReadonlySet<string>,
    sourceKey: string, topN: number,
  ): Promise<{ signature: string; inaccessibleParses: string[] }> {
    const inaccessibleParses = poolRows.filter(row => inaccessibleCodes.has(row.report_code)).map(row => this.parseKey(row));
    const failedParses = poolRows.filter(row => failedCodes.has(row.report_code)).map(row => this.parseKey(row));
    const signature = await this.encounterSkipKey(poolRows, new Set(failedParses), sourceKey, topN);
    return { signature, inaccessibleParses };
  }
}

// A tailored file is fresh when the source key (the ingest version and the SimulationCraft sources the rules read) AND the exact top-parse set that produced it are unchanged, folded into one short hash.

/** Satisfied by the shared `toParseRankings` selection's rows, so the signature keys on exactly the parses that feed the transforms. */
export interface SignatureRanking {
  report_code: string;
  fight_id: number;
}
