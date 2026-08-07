import { Pipe, PipeTransform } from '@angular/core';

/** `mm:ss`, zero-padded, sign-preserving (a negative time is real, e.g. pre-pull). */
function clockText(seconds: number): string {
  const sign = seconds < 0 ? '-' : '';
  const abs = Math.abs(seconds);
  const m = Math.floor(abs / 60);
  const s = Math.floor(abs % 60);
  return `${sign}${m}:${String(s).padStart(2, '0')}`;
}

@Pipe({ name: 'formatDuration' })
export class FormatDurationPipe implements PipeTransform {
  transform(seconds: number | null | undefined): string {
    if (seconds == null) return '-';
    if (!Number.isFinite(seconds)) return '0:00';
    return clockText(seconds);
  }
}

/** Same `mm:ss` rendering as {@link FormatDurationPipe}, for fight-relative ms - the one place that unit converts to seconds for display. */
@Pipe({ name: 'formatMsDuration' })
export class FormatMsDurationPipe implements PipeTransform {
  transform(ms: number | null | undefined): string {
    if (ms == null) return '-';
    if (!Number.isFinite(ms)) return '0:00';
    return clockText(ms / 1000);
  }
}
