import { Pipe, PipeTransform } from '@angular/core';

const COMPACT = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

@Pipe({ name: 'formatDamage' })
export class FormatDamagePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '';
    return COMPACT.format(value);
  }
}
