import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from './http-load-error';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import type { SimcTier } from '../simc/simc.models';

const SIMC_RAW = 'https://raw.githubusercontent.com/simulationcraft/simc';

@Injectable({ providedIn: 'root' })
export class SimcDataService {
  private readonly logger = inject(LoggerService);
  private readonly http = inject(HttpClient);

  /** The full list every tier profile embeds, read here because a tier ships profiles for only some specs; a missing file means SimC writes none. */
  getApl(tier: SimcTier, className: string, specLabel: string): Promise<Result<string>> {
    const file = `${className.toLowerCase()}_${this.specToken(specLabel)}.simc`;
    return this.getText(`${SIMC_RAW}/${tier.branch}/ActionPriorityLists/default/${file}`, 'simc.apl');
  }

  getSpellDataDump(tier: SimcTier, classSlug: string): Promise<Result<string>> {
    return this.getText(`${SIMC_RAW}/${tier.branch}/SpellDataDump/${classSlug.toLowerCase()}.txt`, 'simc.spell-data');
  }

  /** SimC names the file after the class module: `hunter_beast_mastery`, every space of the spec label an underscore. */
  private specToken(label: string): string {
    return label.trim().toLowerCase().replace(/\s+/g, '_');
  }

  private async getText(url: string, id: string): Promise<Result<string>> {
    try {
      const text = await firstValueFrom(this.http.get(url, { responseType: 'text' }));
      return Results.ok(text);
    } catch (cause) {
      this.logger.logWarn(`SimcDataService ${id}`, cause);
      return HttpLoadErrors.toLoadError(cause, id);
    }
  }
}
