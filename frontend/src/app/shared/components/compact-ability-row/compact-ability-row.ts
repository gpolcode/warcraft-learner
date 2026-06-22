import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GameIconComponent } from '../game-icon/game-icon';
import { FormatDamagePipe } from '../../pipes/format-damage-pipe';
import { RangeRow } from '../range-chart/range-chart';

const COLOR_GOOD = '#3fb950';
const COLOR_WARN = '#d29922';
const COLOR_BAD = '#f85149';
const COLOR_MUTED = 'var(--muted)';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-compact-ability-row',
  imports: [GameIconComponent, FormatDamagePipe],
  // Sorted-impact table row. Grid columns must match the headers in
  // window-comparison.html: the two stay in lockstep via gridCols().
  template: `
    <div class="grid {{ gridCols() }} gap-x-3 px-4 py-1.5 items-center min-w-0">
      <div class="flex items-center gap-1.5 min-w-0 overflow-hidden">
        @if (row().spellId) {
          <wl-game-icon class="min-w-0 shrink-0" [id]="row().spellId!"></wl-game-icon>
        }
        <span class="truncate text-sm">{{ row().label }}</span>
      </div>

      @if (showCasts() && !hidePlayer()) {
        <span class="justify-self-center tabular-nums text-xs rounded px-2 py-0.5 border"
              [style.color]="castsColor()"
              [style.border-color]="castsColor()">
          {{ row().playerCasts ?? 0 }} <span class="text-[var(--muted)]">/ {{ row().topCasts ?? '-' }}</span>
        </span>
      }

      <span class="tabular-nums text-xs text-right text-[var(--muted)]">
        {{ row().topAvg | formatDamage }}
      </span>

      @if (!hidePlayer()) {
        @if (row().playerPct == null) {
          <span class="tabular-nums text-xs text-right" [style.color]="badColor">missed</span>
        } @else {
          <span class="tabular-nums text-xs font-semibold text-right" [style.color]="gapColor()">
            {{ gapSign() }}{{ gapMagnitude() | formatDamage }}
          </span>
        }
      }
    </div>
  `,
})
export class CompactAbilityRowComponent {
  readonly row = input.required<RangeRow>();
  readonly higherIsBetter = input<boolean>(true);
  readonly showCasts = input<boolean>(true);
  readonly hidePlayer = input<boolean>(false);

  protected readonly badColor = COLOR_BAD;

  // Column layout, shared with the header grid in window-comparison.html.
  protected readonly gridCols = computed(() => {
    if (this.hidePlayer()) return 'grid-cols-[1fr_6rem]';
    if (this.showCasts()) return 'grid-cols-[1fr_5rem_6rem_6rem]';
    return 'grid-cols-[1fr_6rem_6rem]';
  });

  // Absolute gap = player damage - top average. Positive = ahead of top parses.
  private readonly gap = computed<number | null>(() => {
    const { playerPct, topAvg } = this.row();
    if (playerPct == null || topAvg == null) return null;
    return playerPct - topAvg;
  });

  protected readonly gapSign = computed(() => (this.gap() ?? 0) >= 0 ? '+' : '-');
  protected readonly gapMagnitude = computed(() => Math.abs(this.gap() ?? 0));

  protected readonly gapColor = computed(() => {
    const gap = this.gap();
    const { topAvg } = this.row();
    if (gap == null || topAvg == null || topAvg === 0) return COLOR_MUTED;
    // Direction-aware: burst wants gap >= 0; defensives want gap <= 0 (less taken).
    const signed = this.higherIsBetter() ? gap : -gap;
    if (signed >= 0) return COLOR_GOOD;
    if (Math.abs(gap) <= topAvg * 0.1) return COLOR_WARN;
    return COLOR_BAD;
  });

  protected readonly castsColor = computed(() => {
    const { playerCasts, topCasts } = this.row();
    if (topCasts == null) return COLOR_MUTED;
    const player = playerCasts ?? 0;
    if (player >= topCasts) return COLOR_GOOD;
    if (topCasts - player <= 1) return COLOR_WARN;
    return COLOR_BAD;
  });
}
