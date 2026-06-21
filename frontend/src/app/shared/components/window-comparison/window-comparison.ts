import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RangeRow } from '../range-chart/range-chart';
import { GameIconComponent } from '../game-icon/game-icon';
import { CompactAbilityRowComponent } from '../compact-ability-row/compact-ability-row';
import { FormatDurationPipe } from '../../pipes/format-duration-pipe';

export type WindowStatus = 'good' | 'warn' | 'bad' | 'muted';

/**
 * One normalized comparison window. Domain components (burst windows,
 * defensive windows, …) map their data into this shape so the rendering,
 * scaling and selection behaviour can be shared.
 */
export interface ComparisonWindow {
  /** Window bounds in seconds; rendered as a `m:ss - m:ss` range. */
  timeStartS: number;
  timeEndS: number;
  /** Spell-icon ids shown in the header (CDs, or the defensive itself). */
  spellIds: number[];
  /** Plain-text header labels for entries that have no spell id. */
  labels: string[];
  /** Drives the status glyph colour. */
  status: WindowStatus;
  /** Material icon name for the status glyph. */
  statusIcon: string;
  /** Single comparison row drawn as the panel overview. */
  overview: RangeRow;
  /** Per-ability rows shown in the panel detail. */
  detailRows: RangeRow[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-window-comparison',
  imports: [MatIconModule, MatButtonModule, MatCardModule, MatDividerModule, GameIconComponent, CompactAbilityRowComponent, FormatDurationPipe],
  templateUrl: './window-comparison.html',
})
export class WindowComparisonComponent {
  readonly windows = input.required<ComparisonWindow[]>();
  /** Whether a higher bar is better (burst = true, damage taken = false). */
  readonly higherIsBetter = input<boolean>(true);
  /** Total fight length in seconds; positions timeline segments and ticks. */
  readonly fightDuration = input<number>(0);
  /** Show the "open positioning map" button (only when position data exists). */
  readonly showMap = input<boolean>(false);
  /** Emits the window index whose map should open. */
  readonly openMap = output<number>();

  /**
   * Default selection = the most actionable window. Direction-aware: for burst
   * (higherIsBetter) the worst is the lowest player/top ratio; for damage taken
   * the worst is the highest ratio. Muted windows and missing data are skipped;
   * falls back to 0.
   */
  protected readonly selectedIndex = computed(() => {
    const windows = this.windows();
    const higherIsBetter = this.higherIsBetter();
    let worst = 0;
    let worstRatio = higherIsBetter ? Infinity : -Infinity;
    windows.forEach((w, i) => {
      if (w.status === 'muted') return;
      const player = w.overview.playerPct;
      const top = w.overview.topAvg;
      if (player == null || !top || top <= 0) return;
      const ratio = player / top;
      if (higherIsBetter ? ratio < worstRatio : ratio > worstRatio) {
        worstRatio = ratio;
        worst = i;
      }
    });
    return worst;
  });

  /** Overridden when the user clicks a segment. */
  private readonly _manualIndex = signal<number | null>(null);

  protected readonly activeIndex = computed(() =>
    this._manualIndex() ?? this.selectedIndex());

  protected readonly activeWindow = computed(() =>
    this.windows()[this.activeIndex()] ?? null);

  /** 5-6 evenly spaced second values across the fight for the axis labels. */
  protected readonly timeTicks = computed<number[]>(() => {
    const duration = this.fightDuration();
    if (duration <= 0) return [];
    const steps = 5;
    return Array.from({ length: steps + 1 }, (_, i) => (duration / steps) * i);
  });

  protected select(i: number): void {
    if (this.windows()[i]?.status === 'muted') return;
    this._manualIndex.set(i);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const windows = this.windows();
    let i = this.activeIndex() + delta;
    while (i >= 0 && i < windows.length) {
      if (windows[i].status !== 'muted') {
        this.select(i);
        return;
      }
      i += delta;
    }
  }

  /** Left offset (%) of a segment along the timeline. */
  protected leftPct(timeS: number): number {
    const duration = this.fightDuration();
    if (duration <= 0) return 0;
    return Math.min(100, Math.max(0, (timeS / duration) * 100));
  }

  /** Shared scale across the overview row and every detail row. */
  protected readonly overviewMax = computed(() => {
    const vals = this.windows().flatMap(w =>
      [w.overview.topAvg, w.overview.topMax, w.overview.playerPct]
        .filter((v): v is number => v != null));
    return Math.max(...vals, 0.01);
  });

  protected detailMax(i: number): number {
    const rows = this.windows()[i]?.detailRows ?? [];
    const vals = rows.flatMap(r => [r.topMax, r.playerPct].filter((v): v is number => v != null));
    return Math.max(...vals, 0.001);
  }
}
