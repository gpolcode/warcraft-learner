import { Pipe, PipeTransform } from '@angular/core';

/** A rate reads as odds: 0.016 is "1 in 63", 0 is "none". */
@Pipe({ name: 'odds' })
export class OddsPipe implements PipeTransform {
  transform(rate: number | null | undefined): string {
    if (rate == null || !Number.isFinite(rate) || rate < 0) return '';
    if (rate === 0) return 'none';
    return `1 in ${Math.max(1, Math.round(1 / rate))}`;
  }
}
