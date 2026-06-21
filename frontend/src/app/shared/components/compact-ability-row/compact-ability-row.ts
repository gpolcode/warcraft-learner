import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GameIconComponent } from '../game-icon/game-icon';
import { FormatDamagePipe } from '../../pipes/format-damage-pipe';
import { RangeRow } from '../range-chart/range-chart';
import { WindowStatus } from '../window-comparison/window-comparison';

const COLOR_RANGE = '#4a9eff';
const COLOR_RANGE_FILL = 'rgba(74, 158, 255, 0.28)';
const COLOR_AVG = '#60cfff';
const STATUS_FILL: Record<WindowStatus, string> = {
  good: '#3fb950',
  warn: '#d29922',
  bad: '#f85149',
  muted: '#ffd700',
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-compact-ability-row',
  imports: [GameIconComponent, FormatDamagePipe],
  // Grid columns match the column headers in window-comparison.html.
  // When hidePlayer is true the grid collapses to 2 columns (ability + candle only).
  template: `
    @if (hidePlayer()) {
      <div class="grid grid-cols-[1fr_9rem] gap-x-3 px-4 py-1 items-center min-w-0">
        <div class="flex items-center gap-1.5 min-w-0 overflow-hidden">
          @if (row().spellId) {
            <wl-game-icon class="min-w-0 shrink-0" [id]="row().spellId!"></wl-game-icon>
          } @else {
            <span class="truncate text-sm text-[var(--muted)]">{{ row().label }}</span>
          }
        </div>
        <div class="relative h-2 rounded bg-[var(--surface)]" aria-hidden="true">
          @if (rangeStyle(); as rs) {
            <div class="absolute inset-y-0 rounded" [style]="rs"></div>
          }
          @if (avgStyle(); as avg) {
            <div class="absolute inset-y-0 w-[2px]" [style]="avg"></div>
          }
        </div>
      </div>
    } @else {
      <div class="grid grid-cols-[1fr_5rem_6rem_3rem] gap-x-3 px-4 py-1 items-center min-w-0">
        <div class="flex items-center gap-1.5 min-w-0 overflow-hidden">
          @if (row().spellId) {
            <wl-game-icon class="min-w-0 shrink-0" [id]="row().spellId!"></wl-game-icon>
          } @else {
            <span class="truncate text-sm text-[var(--muted)]">{{ row().label }}</span>
          }
        </div>
        <span class="tabular-nums text-xs text-right" [style.color]="valueColor()">
          {{ row().playerPct | formatDamage }}
        </span>
        <!-- Candle bar: decorative, numeric columns carry the meaning for screen readers. -->
        <div class="relative h-2 rounded bg-[var(--surface)]" aria-hidden="true">
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
        <span class="tabular-nums text-xs text-right" [style.color]="deltaColor()">
          {{ formattedDelta() }}
        </span>
      </div>
    }
  `,
})
export class CompactAbilityRowComponent {
  readonly row = input.required<RangeRow>();
  readonly max = input.required<number>();
  readonly status = input<WindowStatus | null>(null);
  readonly higherIsBetter = input<boolean>(true);
  readonly hidePlayer = input<boolean>(false);

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

  protected readonly valueColor = computed(() => {
    const { playerPct, topAvg } = this.row();
    if (playerPct == null || topAvg == null) return 'var(--muted)';
    const isBetter = this.higherIsBetter() ? playerPct >= topAvg : playerPct <= topAvg;
    return isBetter ? '#3fb950' : '#f85149';
  });

  protected readonly deltaColor = computed(() => {
    const delta = this.delta();
    if (delta == null) return 'var(--muted)';
    const isBetter = this.higherIsBetter() ? delta >= 0 : delta <= 0;
    return isBetter ? '#3fb950' : '#f85149';
  });
}
