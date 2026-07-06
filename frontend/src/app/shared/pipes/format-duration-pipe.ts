import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatDuration' })
export class FormatDurationPipe implements PipeTransform {
  transform(seconds: number | null | undefined): string {
    if (seconds == null) return '-';
    // Durations here (fight times, gaps) are semantically non-negative; clamp a
    // negative or non-finite input to zero so it renders as the zero duration.
    const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
    const m = Math.floor(safe / 60);
    const s = Math.floor(safe % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
