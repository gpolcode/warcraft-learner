import { Injectable } from '@angular/core';

/** Every stamp, key and fingerprint in the data files carries this many hex digits. */
const SHORT_HASH_LENGTH = 16;

@Injectable({ providedIn: 'root' })
export class HashService {
  /** The first 16 hex digits of the text's SHA-256, through Web Crypto, which a secure context exposes without a dependency: https, or localhost as the ingest run and the tests serve it. */
  async shortHash(text: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('').slice(0, SHORT_HASH_LENGTH);
  }
}
