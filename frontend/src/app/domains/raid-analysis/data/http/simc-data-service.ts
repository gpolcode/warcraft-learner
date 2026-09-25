import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from './http-load-error';
import { LoggerService } from '../../../shared/util-logging/logger-service';

/** SimC's default branch, which SimC moves to each new expansion. */
const SIMC_RAW = 'https://raw.githubusercontent.com/simulationcraft/simc/HEAD';

@Injectable({ providedIn: 'root' })
export class SimcDataService {
  private readonly logger = inject(LoggerService);
  private readonly http = inject(HttpClient);

  /** Unlike the tier profiles, written for every spec SimC keeps a list for; a 404 is a spec with none, which reads as `missing`. */
  getApl(className: string, specLabel: string): Promise<Result<string>> {
    const file = `${className.toLowerCase()}_${specLabel.toLowerCase().replace(/ /g, '_')}.simc`;
    return this.getText(`${SIMC_RAW}/ActionPriorityLists/default/${file}`, 'simc.apl');
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
