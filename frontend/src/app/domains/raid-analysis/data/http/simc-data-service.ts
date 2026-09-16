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

  /** The profile of one spec in one tier; a missing file is the "SimC ships no profile for this spec" answer, not an error. */
  getProfile(tier: SimcTier, classLabel: string, specLabel: string): Promise<Result<string>> {
    const file = `${tier.dir}_${this.fileToken(classLabel)}_${this.fileToken(specLabel)}.simc`;
    return this.getText(`${SIMC_RAW}/${tier.branch}/profiles/${tier.dir}/${file}`, 'simc.profile');
  }

  getSpellDataDump(tier: SimcTier, classSlug: string): Promise<Result<string>> {
    return this.getText(`${SIMC_RAW}/${tier.branch}/SpellDataDump/${classSlug.toLowerCase()}.txt`, 'simc.spell-data');
  }

  /** SimC writes `MID2_Hunter_Beast_Mastery`: every space of the display label becomes an underscore. */
  private fileToken(label: string): string {
    return label.trim().replace(/\s+/g, '_');
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
