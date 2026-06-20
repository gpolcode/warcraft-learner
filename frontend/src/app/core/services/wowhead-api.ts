import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { logWarn } from '../log';
import { IconInfo } from './icon-cache';
import {
  AllOriginsResponse,
  WowheadKind,
  WowheadTooltip,
  tooltipToIcon,
  wowheadProxyUrl,
} from './wowhead-mappers';

/**
 * Thin transport for resolving spell/item icon + name from Wowhead via a CORS
 * proxy. Mirrors the WclApiService pattern: this service only fetches, then
 * hands the decoded payload to a pure mapper. Best-effort - a failed lookup
 * returns null so the UI degrades to a plain Wowhead link.
 *
 * The allorigins `/get` envelope and the Wowhead tooltip body are both JSON, so
 * HttpClient decodes the response natively; there is no XML parsing.
 */
@Injectable({ providedIn: 'root' })
export class WowheadApiService {
  private readonly http = inject(HttpClient);

  async getGameData(kind: WowheadKind, id: number): Promise<IconInfo | null> {
    try {
      const envelope = await firstValueFrom(
        this.http.get<AllOriginsResponse>(wowheadProxyUrl(kind, id)),
      );
      const tooltip = JSON.parse(envelope?.contents ?? 'null') as WowheadTooltip | null;
      return tooltipToIcon(tooltip);
    } catch (err) {
      logWarn('wowhead-api.getGameData', err);
      return null;
    }
  }
}
