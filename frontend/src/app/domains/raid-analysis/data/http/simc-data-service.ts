import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from './http-load-error';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { ENVIRONMENT } from '../../../../../environments/environment-token';

/** Where SimC's class code names the auras, dots and actions a list reads; `player.cpp` holds the racials every class shares. */
const CLASS_SOURCES: Record<string, string[] | undefined> = {
  deathknight: ['class_modules/sc_death_knight.cpp'],
  demonhunter: ['class_modules/sc_demon_hunter.cpp'],
  druid: ['class_modules/sc_druid.cpp'],
  evoker: ['class_modules/sc_evoker.cpp'],
  hunter: ['class_modules/sc_hunter.cpp'],
  mage: ['class_modules/sc_mage.cpp'],
  monk: ['class_modules/monk/sc_monk.cpp'],
  paladin: ['class_modules/paladin/sc_paladin.cpp', 'class_modules/paladin/sc_paladin_protection.cpp', 'class_modules/paladin/sc_paladin_retribution.cpp'],
  priest: ['class_modules/priest/sc_priest.cpp', 'class_modules/priest/sc_priest_shadow.cpp'],
  rogue: ['class_modules/sc_rogue.cpp'],
  shaman: ['class_modules/sc_shaman.cpp'],
  warlock: ['class_modules/warlock/sc_warlock.cpp', 'class_modules/warlock/sc_warlock_init.cpp', 'class_modules/warlock/sc_warlock_actions.cpp'],
  warrior: ['class_modules/sc_warrior.cpp'],
};
const SHARED_SOURCE = 'player/player.cpp';

@Injectable({ providedIn: 'root' })
export class SimcDataService {
  private readonly logger = inject(LoggerService);
  private readonly http = inject(HttpClient);
  private readonly rawUrl = inject(ENVIRONMENT).simcRawUrl;

  /** Unlike the tier profiles, written for every spec SimC keeps a list for; a 404 is a spec with none, which reads as `missing`. */
  getApl(className: string, specLabel: string): Promise<Result<string>> {
    const file = `${className.toLowerCase()}_${specLabel.toLowerCase().replace(/ /g, '_')}.simc`;
    return this.getText(`${this.rawUrl}/ActionPriorityLists/default/${file}`, 'simc.apl');
  }

  getSpellDump(className: string): Promise<Result<string>> {
    return this.getText(`${this.rawUrl}/SpellDataDump/${className.toLowerCase()}.txt`, 'simc.spell-dump');
  }

  /** SimC's table of what each item does on use and on equip, which names the spell an item's use casts. */
  getItemEffects(): Promise<Result<string>> {
    return this.getText(`${this.rawUrl}/engine/dbc/generated/item_effect.inc`, 'simc.item-effects');
  }

  sourcePaths(className: string): string[] {
    return [...(CLASS_SOURCES[className.toLowerCase()] ?? []), SHARED_SOURCE];
  }

  getSource(path: string): Promise<Result<string>> {
    return this.getText(`${this.rawUrl}/engine/${path}`, 'simc.source');
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
