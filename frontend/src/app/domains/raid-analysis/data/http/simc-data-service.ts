import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from './http-load-error';
import { LoggerService } from '../../../shared/util-logging/logger-service';

/** The SimulationCraft branch and profiles folder every plan reads; it moves with each raid tier. */
const SIMC_TIER = { branch: 'midnight', dir: 'MID2' };
const SIMC_RAW = `https://raw.githubusercontent.com/simulationcraft/simc/${SIMC_TIER.branch}`;

@Injectable({ providedIn: 'root' })
export class SimcDataService {
  private readonly logger = inject(LoggerService);
  private readonly http = inject(HttpClient);

  /** A 404 is SimulationCraft shipping no profile for the spec, which reads as `missing`. */
  getProfile(classLabel: string, specLabel: string): Promise<Result<string>> {
    const file = `${SIMC_TIER.dir}_${classLabel.replace(/ /g, '_')}_${specLabel.replace(/ /g, '_')}.simc`;
    return this.getText(`${SIMC_RAW}/profiles/${SIMC_TIER.dir}/${file}`, 'simc.profile');
  }

  getSpellDump(className: string): Promise<Result<string>> {
    return this.getText(`${SIMC_RAW}/SpellDataDump/${className.toLowerCase()}.txt`, 'simc.spell-dump');
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
