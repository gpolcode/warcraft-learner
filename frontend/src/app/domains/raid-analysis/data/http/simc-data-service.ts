import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from './http-load-error';
import { LoggerService } from '../../../shared/util-logging/logger-service';

const SIMC_RAW = 'https://raw.githubusercontent.com/simulationcraft/simc';

export interface SimcTier {
  branch: string;
  /** The profiles folder, which also prefixes every profile file name. */
  dir: string;
}

@Injectable({ providedIn: 'root' })
export class SimcDataService {
  private readonly logger = inject(LoggerService);
  private readonly http = inject(HttpClient);

  /** A 404 is SimulationCraft shipping no profile for the spec, which reads as `missing`. */
  getProfile(tier: SimcTier, classLabel: string, specLabel: string): Promise<Result<string>> {
    const file = `${tier.dir}_${classLabel.replace(/ /g, '_')}_${specLabel.replace(/ /g, '_')}.simc`;
    return this.getText(`${SIMC_RAW}/${tier.branch}/profiles/${tier.dir}/${file}`, 'simc.profile');
  }

  getSpellDump(tier: SimcTier, className: string): Promise<Result<string>> {
    return this.getText(`${SIMC_RAW}/${tier.branch}/SpellDataDump/${className.toLowerCase()}.txt`, 'simc.spell-dump');
  }

  private async getText(url: string, id: string): Promise<Result<string>> {
    try {
      return Results.ok(await firstValueFrom(this.http.get(url, { responseType: 'text' })));
    } catch (cause) {
      this.logger.logWarn(`SimcDataService ${url}`, cause);
      return HttpLoadErrors.toLoadError(cause, id);
    }
  }
}
