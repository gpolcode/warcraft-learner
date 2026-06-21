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
 * allorigins `/get` wraps the Wowhead XML response as `{ contents: "<xml>" }`.
 * HttpClient decodes the JSON envelope natively; the XML string inside is
 * parsed with DOMParser.
 */
@Injectable({ providedIn: 'root' })
export class WowheadApiService {
  private readonly http = inject(HttpClient);

  async getGameData(kind: WowheadKind, id: number): Promise<IconInfo | null> {
    try {
      const envelope = await firstValueFrom(
        this.http.get<AllOriginsResponse>(wowheadProxyUrl(kind, id)),
      );
      return parseWowheadXml(envelope?.contents ?? '', kind);
    } catch (err) {
      logWarn('wowhead-api.getGameData', err);
      return null;
    }
  }
}
