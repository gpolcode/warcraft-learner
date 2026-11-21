import { Pipe, PipeTransform } from '@angular/core';

const ONE_DECIMAL = new Intl.NumberFormat('en', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** A ratio to a baseline, such as damage over the player's own average: `1.6x`. */
@Pipe({ name: 'formatMultiple' })
export class FormatMultiplePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) return '';
    return `${ONE_DECIMAL.format(value)}x`;
  }
}
