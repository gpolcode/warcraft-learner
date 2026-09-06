import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from './http-load-error';
import { LoggerService } from '../../../shared/util-logging/logger-service';

const DUMP_URL = 'https://www.raidbots.com/static/data/live/enchantments.json';

interface RaidbotsEnchantment { id?: number; itemId?: number }

/** The purchasable item behind each enchant id, keyed by the enchant id WCL reports on gear. */
export type EnchantItems = Record<number, number>;

@Injectable({ providedIn: 'root' })
export class EnchantItemDataService {
  private readonly logger = inject(LoggerService);
  private readonly http = inject(HttpClient);

  async getEnchantItems(): Promise<Result<EnchantItems>> {
    try {
      const dump = await firstValueFrom(this.http.get<RaidbotsEnchantment[]>(DUMP_URL));
      return Results.ok(this.indexEnchantItems(dump));
    } catch (cause) {
      this.logger.logWarn('EnchantItemDataService dump fetch', cause);
      return HttpLoadErrors.toLoadError(cause, 'enchant-item-data.dump');
    }
  }

  // Runes and other trainer-taught enchants carry no item; only entries with a real item resolve.
  protected indexEnchantItems(dump: RaidbotsEnchantment[]): EnchantItems {
    const items: EnchantItems = {};
    for (const enchant of dump) {
      if (enchant.id != null && enchant.itemId) items[enchant.id] = enchant.itemId;
    }
    return items;
  }
}
