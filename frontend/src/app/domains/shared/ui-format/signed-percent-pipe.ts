import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'signedPercent' })
export class SignedPercentPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) return '';
    // A delta that rounds to zero is neither ahead nor behind, so it carries no sign; -0 stringifies to "0".
    const rounded = Math.round(value);
    const sign = rounded > 0 ? '+' : '';
    return `${sign}${rounded}%`;
  }
}
