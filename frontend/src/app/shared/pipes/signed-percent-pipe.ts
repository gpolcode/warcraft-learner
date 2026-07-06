import { Pipe, PipeTransform } from '@angular/core';

/** Signed whole-percent delta: 12 -> "+12%", -4 -> "-4%", 0 -> "0%", null -> "". */
@Pipe({ name: 'signedPercent' })
export class SignedPercentPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '';
    const sign = value > 0 ? '+' : '';
    // A small negative that rounds up to zero yields "-0" from toFixed; render it
    // as the plain zero form so it matches how a positive zero renders.
    const magnitude = value.toFixed(0);
    const normalized = magnitude === '-0' ? '0' : magnitude;
    return `${sign}${normalized}%`;
  }
}
