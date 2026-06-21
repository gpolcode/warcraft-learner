import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GameIconComponent } from '../game-icon/game-icon';
import { FormatDamagePipe } from '../../pipes/format-damage-pipe';
import { RangeRow } from '../range-chart/range-chart';
import { WindowStatus } from '../window-comparison/window-comparison';

// Bar layer colours, kept in step with wl-range-chart so the two read the same.
const COLOR_RANGE = '#4a9eff';
const COLOR_RANGE_FILL = 'rgba(74, 158, 255, 0.28)';
const COLOR_AVG = '#60cfff';
const COLOR_YOU = '#ffd700';
const STATUS_FILL: Record<WindowStatus, string> = {
  good: '#3fb950',
  warn: '#d29922',
  bad: '#f85149',
  muted: COLOR_YOU,
};

/**
 * One compact comparison row: icon -> label -> your value -> candle bar -> delta%.
 *
 * Used inside the burst/defensive detail panel in place of wl-range-chart for
 * single-row rendering. Values are absolute damage; the bar is decorative
 * (aria-hidden) and the numeric columns carry the meaning for screen readers.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-compact-ability-row',
  imports: [GameIconComponent, FormatDamagePipe],
  template: `
    <div class="flex items-center gap-2 py-1">
      @if (row().spellId) {
        <wl-game-icon class="shrink-0" [id]="row().spellId!"></wl-game-icon>
      } @else {
        <div class="w-[18px] shrink-0"></div>
      }
      <span class="flex-1 truncate text-sm">{{ row().label }}</span>
      <span class="tabular-nums text-xs w-16 text-right">
        {{ row().playerPct | formatDamage }}
      </span>
      <!-- Candle bar: top-parse range band, average tick, and your marker. -->
      <div class="relative h-2 w-24 shrink-0 rounded bg-[var(--surface)]" aria-hidden="true">
        @if (rangeStyle(); as rs) {
          <div class="absolute inset-y-0 rounded" [style]="rs"></div>
        }
        @if (avgStyle(); as avg) {
          <div class="absolute inset-y-0 w-[2px]" [style]="avg"></div>
        }
        @if (playerStyle(); as ps) {
          <div class="absolute inset-y-0 w-[3px] rounded" [style]="ps"></div>
        }
      </div>
      <span class="tabular-nums text-xs w-12 text-right" [class]="deltaClass()">
        {{ formattedDelta() }}
      </span>
    </div>
  `,
})
export class CompactAbilityRowComponent {
  readonly row = input.required<RangeRow>();
  readonly max = input.required<number>();
  /** Optional fill colour override (timeline status colour) for the player marker. */
  readonly status = input<WindowStatus | null>(null);

  private pct(value: number): number {
    const max = this.max();
    if (max <= 0) return 0;
    return Math.min(100, Math.max(0, (value / max) * 100));
  }

  protected readonly rangeStyle = computed<string | null>(() => {
    const { topMin, topMax } = this.row();
    if (topMin == null || topMax == null) return null;
    const left = this.pct(topMin);
    const width = Math.max(0, this.pct(topMax) - left);
    return `left:${left}%;width:${width}%;background:${COLOR_RANGE_FILL};border:1px solid ${COLOR_RANGE};`;
  });

  protected readonly avgStyle = computed<string | null>(() => {
    const { topAvg } = this.row();
    if (topAvg == null) return null;
    return `left:${this.pct(topAvg)}%;background:${COLOR_AVG};`;
  });

  protected readonly playerStyle = computed<string | null>(() => {
    const { playerPct } = this.row();
    if (playerPct == null) return null;
    const fill = STATUS_FILL[this.status() ?? 'muted'];
    return `left:${this.pct(playerPct)}%;background:${fill};`;
  });

  /** Player vs top-average delta as a percentage; null when either is missing. */
  private readonly delta = computed<number | null>(() => {
    const { playerPct, topAvg } = this.row();
    if (playerPct == null || topAvg == null || topAvg === 0) return null;
    return ((playerPct - topAvg) / topAvg) * 100;
  });

  protected readonly formattedDelta = computed(() => {
    const delta = this.delta();
    if (delta == null) return '';
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(0)}%`;
  });

  protected readonly deltaClass = computed(() => {
    const delta = this.delta();
    if (delta == null) return 'text-[var(--muted)]';
    return delta >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]';
  });
}
