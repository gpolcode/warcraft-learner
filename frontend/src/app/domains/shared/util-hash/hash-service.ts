import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HashService {
  /** Hex SHA-256 through Web Crypto, which the browser and Node both expose without a dependency. */
  async sha256Hex(text: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
}
