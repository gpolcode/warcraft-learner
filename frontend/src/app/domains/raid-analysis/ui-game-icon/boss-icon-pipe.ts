import { inject, Pipe, PipeTransform } from '@angular/core';
import { ENVIRONMENT } from '../../../../environments/environment-token';

@Pipe({ name: 'bossIcon' })
export class BossIconPipe implements PipeTransform {
  private readonly environment = inject(ENVIRONMENT);

  transform(encounterId: number | null | undefined): string {
    return encounterId ? this.bossIconUrl(encounterId) : '';
  }

  /** Warcraft Logs serves the boss art directly, so no ingestion is needed. */
  private bossIconUrl(encounterId: number): string {
    if (!Number.isInteger(encounterId) || encounterId <= 0) return '';
    return `${this.environment.rpglogsBossIconUrl}/${encounterId}-icon.jpg`;
  }
}
