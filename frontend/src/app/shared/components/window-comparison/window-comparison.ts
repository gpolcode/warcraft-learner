import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output, signal, viewChild } from '@angular/core';
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
  readonly openMap = output<number>();

  // Half the segment button width (w-9 = 36px) and the minimum center-to-center
  // spacing that keeps two adjacent buttons from overlapping (button width + 2px).
  private static readonly HALF_BUTTON_PX = 18;
  private static readonly MIN_GAP_PX = 38;

  private readonly trackEl = viewChild<HTMLElement>('track');
  // Default to 1000px so collision detection runs on the first render;
  // ResizeObserver corrects it after the initial paint.
  protected readonly trackWidth = signal(1000);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.trackEl();
      if (!el) return;
      const observer = new ResizeObserver(entries => {
        this.trackWidth.set(entries[0].contentRect.width);
      });
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

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

  protected leftPct(timeS: number): number {
    const end = this.timelineEnd();
    return Math.min(100, Math.max(0, (timeS / end) * 100));
  }

  // Resolved `left` CSS value per segment. Buttons whose ideal time positions
  // sit closer than one button width are nudged apart so they never overlap -
  // works for clusters of 2, 3, or more.
  protected readonly segmentLefts = computed<string[]>(() => {
    const windows = this.windows();
    const width = this.trackWidth();
    const half = WindowComparisonComponent.HALF_BUTTON_PX;
    const minGap = WindowComparisonComponent.MIN_GAP_PX;
    const minCenter = half;
    const maxCenter = Math.max(half, width - half);
    const centers = windows.map(w => (this.leftPct(w.timeStartS) / 100) * width);
    // Forward pass: push later buttons right to keep the minimum spacing.
    for (let i = 1; i < centers.length; i++) {
      if (centers[i] < centers[i - 1] + minGap) centers[i] = centers[i - 1] + minGap;
    }
    // Backward pass: pull buttons left so the cluster respects the right edge.
    for (let i = centers.length - 2; i >= 0; i--) {
      if (centers[i] > centers[i + 1] - minGap) centers[i] = centers[i + 1] - minGap;
    }
    return centers.map(center => `${Math.min(maxCenter, Math.max(minCenter, center))}px`);
  });

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
