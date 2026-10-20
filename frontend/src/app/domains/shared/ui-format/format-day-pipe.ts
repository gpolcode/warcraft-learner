import { Pipe, PipeTransform } from '@angular/core';

const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Epoch seconds as a calendar day in the reader's time zone, `18 Oct 2026`. */
@Pipe({ name: 'formatDay' })
export class FormatDayPipe implements PipeTransform {
  transform(epochS: number | null | undefined): string {
    if (epochS == null) return '';
    return DAY.format(epochS * MS_PER_S);
  }
}

const MS_PER_S = 1000;
