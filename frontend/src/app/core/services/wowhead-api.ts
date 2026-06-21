import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { logWarn } from '../log';
import { IconInfo } from './icon-cache';
import {
  AllOriginsResponse,
  WowheadKind,
  parseWowheadXml,
  wowheadProxyUrl,
} from './wowhead-mappers';

/**
 * Thin transport for resolving spell/item icon + name from Wowhead via a CORS
 * proxy. Mirrors the WclApiService pattern: this service only fetches, then
 * hands the decoded payload to a pure mapper. Best-effort - a failed lookup
 * returns null so the UI degrades to a plain Wowhead link.
 *
 * Failures are logged with their *reason* (transport error, proxy http_code,
 * HTML challenge page, missing element, ...) plus a body snippet. The previous
 * implementation swallowed these, which is exactly why the breakage was
 * undiagnosable; see `parseWowheadXml` for the discriminated result it returns.
 */
@Injectable({ providedIn: 'root' })
export class WowheadApiService {
  private readonly http = inject(HttpClient);

  async getGameData(kind: WowheadKind, id: number): Promise<IconInfo | null> {
    let envelope: AllOriginsResponse | null = null;
    try {
      envelope = await firstValueFrom(
        this.http.get<AllOriginsResponse>(wowheadProxyUrl(kind, id)),
      );
    } catch (err) {
      logWarn(`wowhead-api.getGameData ${kind}=${id} transport failed`, err);
      return null;
    }

    const result = parseWowheadXml(envelope, kind);
    if (!result.ok) {
      const snippet = (envelope?.contents ?? '').slice(0, 200);
      logWarn(
        `wowhead-api.getGameData ${kind}=${id} unresolved: ${result.reason}`,
        new Error(`body[0..200]=${JSON.stringify(snippet)}`),
      );
      return null;
    }
    return result.info;
  }
}
