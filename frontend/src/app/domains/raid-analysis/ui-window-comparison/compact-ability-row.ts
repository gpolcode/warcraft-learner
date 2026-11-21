import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TuiBadge } from '@taiga-ui/kit';
import { GameIcon } from '../ui-game-icon/game-icon';
import { FormatDamagePipe } from '../../shared/ui-format/format-damage-pipe';
import type { RangeRow } from '../data/analysis/window-comparison.models';

/** No rule grades a single ability, so the row prints its numbers without color. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-compact-ability-row',
  imports: [TuiBadge, GameIcon, FormatDamagePipe],
  templateUrl: './compact-ability-row.html',
})
export class CompactAbilityRow {
  readonly row = input.required<RangeRow>();
  readonly showCasts = input<boolean>(true);
  readonly hidePlayer = input<boolean>(false);

  private readonly gap = computed<number | null>(() => {
    const { playerPct, topAvg } = this.row();
    if (playerPct == null || topAvg == null) return null;
    return playerPct - topAvg;
  });

  protected readonly gapSign = computed(() => (this.gap() ?? 0) >= 0 ? '+' : '-');
  protected readonly gapMagnitude = computed(() => Math.abs(this.gap() ?? 0));

  // Passive abilities (proc/auto/pet damage) are never cast, so the casts cell shows a "passive" tag instead of a count.
  protected readonly isPassive = computed<boolean>(() => this.row().passive === true);
}
