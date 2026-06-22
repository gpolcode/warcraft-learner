import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RangeRow } from '../range-chart/range-chart';
import { GameIconComponent } from '../game-icon/game-icon';
import { CompactAbilityRowComponent } from '../compact-ability-row/compact-ability-row';
import { FormatDurationPipe } from '../../pipes/format-duration-pipe';
import { FormatDamagePipe } from '../../pipes/format-damage-pipe';

export type WindowStatus = 'good' | 'warn' | 'bad' | 'muted';

export interface ComparisonWindow {
  timeStartS: number;
  timeEndS: number;
  spellIds: number[];
  labels: string[];
  status: WindowStatus;
  statusIcon: string;
  overview: RangeRow;
  detailRows: RangeRow[];
}

const STATUS_COLORS: Record<WindowStatus, string> = {
  good: '#3fb950',
  warn: '#d29922',
  bad: '#f85149',
  muted: 'var(--muted)',
};

const SEG_BG: Record<WindowStatus, string> = {
  good: 'rgba(63,185,80,0.55)',
  warn: 'rgba(210,153,34,0.55)',
  bad: 'rgba(248,81,73,0.55)',
  muted: 'transparent',
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-window-comparison',
  imports: [MatIconModule, MatButtonModule, MatCardModule, GameIconComponent, CompactAbilityRowComponent, FormatDurationPipe, FormatDamagePipe],
  templateUrl: './window-comparison.html',
})
export class WindowComparisonComponent {
  readonly windows = input.required<ComparisonWindow[]>();
  readonly higherIsBetter = input<boolean>(true);
  readonly fightDuration = input<number>(0);
  readonly showMap = input<boolean>(false);
  // Casts column is meaningful for burst (offensive) windows only; hidden for defensives.
  readonly showCasts = input<boolean>(true);
  readonly openMap = output<number>();

  // Minimum center-to-center gap between adjacent segments, expressed as a
  // percentage of the track width. 5% corresponds to ~36px on a 720px track
  // (the narrowest likely layout) and scales up proportionally on wider screens.
  private static readonly MIN_GAP_PCT = 5;

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

  private readonly _manualIndex = signal<number | null>(null);

  protected readonly activeIndex = computed(() =>
    this._manualIndex() ?? this.selectedIndex());

  protected readonly activeWindow = computed(() =>
    this.windows()[this.activeIndex()] ?? null);

  protected readonly timelineEnd = computed(() => {
    const windows = this.windows();
    if (!windows.length) return Math.max(this.fightDuration(), 1);
    return Math.max(...windows.map(w => w.timeEndS), 1);
  });

  protected readonly timeTicks = computed<number[]>(() => {
    const end = this.timelineEnd();
    const steps = 5;
    return Array.from({ length: steps + 1 }, (_, i) => (end / steps) * i);
  });

  protected readonly segmentStyles = computed(() => {
    const activeIdx = this.activeIndex();
    return this.windows().map((w, i) => {
      const ring = activeIdx === i ? ';outline:2px solid var(--gold);outline-offset:2px' : '';
      if (w.status === 'muted') {
        const bc = w.statusIcon === 'schedule' ? '#555' : 'rgba(248,81,73,0.4)';
        const bg = w.statusIcon === 'schedule' ? 'transparent' : 'rgba(248,81,73,0.07)';
        return `background:${bg};border:1.5px dashed ${bc};color:var(--muted)${ring}`;
      }
      const color = STATUS_COLORS[w.status];
      const bg = SEG_BG[w.status];
      return `background:${bg};border:1px solid ${color};color:${color}${ring}`;
    });
  });

  protected statusColor(status: WindowStatus): string {
    return STATUS_COLORS[status];
  }

  protected select(i: number): void {
    this._manualIndex.set(i);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = this.activeIndex() + delta;
    if (next >= 0 && next < this.windows().length) this.select(next);
  }

  protected readonly activeIsMuted = computed(() =>
    this.activeWindow()?.status === 'muted');

  // Active window's ability rows, sorted by absolute gap (biggest damage loss
  // first) so the most actionable abilities surface at the top of the table.
  // Direction-aware: burst wants player >= top (loss = negative gap); defensives
  // want player <= top (loss = positive gap, i.e. more damage taken).
  protected readonly activeDetailRows = computed<RangeRow[]>(() => {
    const rows = this.activeWindow()?.detailRows ?? [];
    const higherIsBetter = this.higherIsBetter();
    const loss = (row: RangeRow): number => {
      const gap = (row.playerPct ?? 0) - (row.topAvg ?? 0);
      return higherIsBetter ? gap : -gap; // negative = worse
    };
    return [...rows].sort((a, b) => loss(a) - loss(b));
  });

  // Header grid must mirror gridCols() in CompactAbilityRowComponent.
  protected readonly headerGridCols = computed(() => {
    if (this.activeIsMuted()) return 'grid-cols-[1fr_6rem]';
    if (this.showCasts()) return 'grid-cols-[1fr_5rem_6rem_6rem]';
    return 'grid-cols-[1fr_6rem_6rem]';
  });

  protected leftPct(timeS: number): number {
    const end = this.timelineEnd();
    return Math.min(100, Math.max(0, (timeS / end) * 100));
  }

  // Resolved `left` CSS value per segment, in percentage space so no DOM
  // measurement is needed and buttons can never overflow the track.
  // A two-pass collision algorithm nudges overlapping buttons apart.
  protected readonly segmentLefts = computed<string[]>(() => {
    const windows = this.windows();
    const minGap = WindowComparisonComponent.MIN_GAP_PCT;
    const centers = windows.map(w => this.leftPct(w.timeStartS));
    // Forward pass: push later buttons right.
    for (let i = 1; i < centers.length; i++) {
      if (centers[i] < centers[i - 1] + minGap) centers[i] = centers[i - 1] + minGap;
    }
    // Clamp rightmost to 100%, then backward pass to pull earlier buttons left.
    centers[centers.length - 1] = Math.min(centers[centers.length - 1], 100);
    for (let i = centers.length - 2; i >= 0; i--) {
      centers[i] = Math.min(centers[i], centers[i + 1] - minGap);
    }
    return centers.map(c =>
      `clamp(1.125rem, ${Math.max(0, c)}%, calc(100% - 1.125rem))`);
  });

  protected readonly overviewMax = computed(() => {
    const vals = this.windows().flatMap(w =>
      [w.overview.topAvg, w.overview.topMax, w.overview.playerPct]
        .filter((v): v is number => v != null));
    return Math.max(...vals, 0.01);
  });

  private barPct(value: number, max: number): number {
    return Math.min(100, Math.max(0, (value / max) * 100));
  }

  protected readonly overviewDelta = computed<number | null>(() => {
    const w = this.activeWindow();
    if (!w) return null;
    const { playerPct, topAvg } = w.overview;
    if (playerPct == null || topAvg == null || topAvg === 0) return null;
    return ((playerPct - topAvg) / topAvg) * 100;
  });

  protected readonly overviewDeltaText = computed(() => {
    const delta = this.overviewDelta();
    if (delta == null) return '';
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(0)}%`;
  });

  protected readonly overviewDeltaColor = computed(() => {
    const delta = this.overviewDelta();
    if (delta == null) return 'var(--muted)';
    const isBetter = this.higherIsBetter() ? delta >= 0 : delta <= 0;
    return isBetter ? '#3fb950' : '#f85149';
  });

  protected readonly overviewRangeStyle = computed<string | null>(() => {
    const w = this.activeWindow();
    if (!w) return null;
    const { topMin, topMax } = w.overview;
    if (topMin == null || topMax == null) return null;
    const max = this.overviewMax();
    const left = this.barPct(topMin, max);
    const width = Math.max(0, this.barPct(topMax, max) - left);
    return `left:${left}%;width:${width}%;background:rgba(74,158,255,0.28);border:1px solid #4a9eff;`;
  });

  protected readonly overviewAvgStyle = computed<string | null>(() => {
    const w = this.activeWindow();
    if (!w) return null;
    const { topAvg } = w.overview;
    if (topAvg == null) return null;
    return `left:${this.barPct(topAvg, this.overviewMax())}%;background:#60cfff;`;
  });

  protected readonly overviewPlayerStyle = computed<string | null>(() => {
    const w = this.activeWindow();
    if (!w) return null;
    const { playerPct } = w.overview;
    if (playerPct == null) return null;
    const color = STATUS_COLORS[w.status];
    const width = this.barPct(playerPct, this.overviewMax());
    return `left:0;width:${width}%;background:${color};opacity:0.65;`;
  });
}
