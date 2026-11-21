import { Pipe, PipeTransform } from '@angular/core';
import type { DamageEstimate } from '../data/verdict/tone.models';

/** `About 25s of your damage, between 18s and 31s.`; the range drops where its ends round alike. */
@Pipe({ name: 'damageEstimate' })
export class DamageEstimatePipe implements PipeTransform {
  transform(estimate: DamageEstimate | null | undefined): string {
    if (!estimate) return '';
    const [about, low, high] = [estimate.aboutS, estimate.lowS, estimate.highS].map(seconds => Math.round(seconds));
    const range = low === high ? '' : `, between ${low}s and ${high}s`;
    return `About ${about}s of your damage${range}.`;
  }
}
