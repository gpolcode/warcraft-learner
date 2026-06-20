import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { logWarn } from '../log';
import { IconInfo } from './icon-cache';
import { WowheadKind, parseWowheadXml, wowheadProxyUrl } from './wowhead-mappers';

/**
 * Thin transport for resolving spell/item icon + name from Wowhead via a CORS
 * proxy. Mirrors the WclApiService pattern: this service only fetches, then
 * hands the body to a pure mapper. Best-effort - a failed lookup returns null
 * so the UI degrades to a plain Wowhead link.
 */
@Injectable({ providedIn: 'root' })
export class WowheadApiService {
  private readonly http = inject(HttpClient);

  async getGameData(kind: WowheadKind, id: number): Promise<IconInfo | null> {
    try {
      const xml = await firstValueFrom(
        this.http.get(wowheadProxyUrl(kind, id), { responseType: 'text' }),
      );
      return parseWowheadXml(xml, kind);
    } catch (err) {
      logWarn('wowhead-api.getGameData', err);
      return null;
    }
  }
}
