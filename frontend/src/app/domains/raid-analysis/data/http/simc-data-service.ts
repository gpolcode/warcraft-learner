import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from './http-load-error';
import { LoggerService } from '../../../shared/util-logging/logger-service';

const SIMC_RAW = 'https://raw.githubusercontent.com/simulationcraft/simc';

/** `midnight/MID2`: the SimC branch that carries the live expansion and the profile directory of the live tier. */
export interface SimcTier {
  branch: string;
  dir: string;
}

export interface SimcText {
  text: string;
  sha256: string;
}

@Injectable({ providedIn: 'root' })
export class SimcDataService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);

  parseTier(raw: string | null | undefined): SimcTier | null {
    const [branch, dir, ...rest] = (raw ?? '').split('/');
    if (!branch || !dir || rest.length) return null;
    return { branch, dir };
  }

  /** The profile of one spec in one tier; a missing file is the "SimC ships no profile for this spec" answer, not an error. */
  getProfile(tier: SimcTier, classLabel: string, specLabel: string): Promise<Result<SimcText>> {
    const file = `${tier.dir}_${this.fileToken(classLabel)}_${this.fileToken(specLabel)}.simc`;
    return this.getText(`${SIMC_RAW}/${tier.branch}/profiles/${tier.dir}/${file}`, 'simc.profile');
  }

  getSpellDataDump(tier: SimcTier, classSlug: string): Promise<Result<SimcText>> {
    return this.getText(`${SIMC_RAW}/${tier.branch}/SpellDataDump/${classSlug.toLowerCase()}.txt`, 'simc.spell-data');
  }

  /** SimC writes `Death_Knight_Beast_Mastery`: every space of the display label becomes an underscore. */
  private fileToken(label: string): string {
    return label.trim().replace(/\s+/g, '_');
  }

  private async getText(url: string, id: string): Promise<Result<SimcText>> {
    try {
      const text = await firstValueFrom(this.http.get(url, { responseType: 'text' }));
      return Results.ok({ text, sha256: bytesToHex(sha256(utf8ToBytes(text))) });
    } catch (cause) {
      this.logger.logWarn(`SimcDataService ${id}`, cause);
      return HttpLoadErrors.toLoadError(cause, id);
    }
  }
}
