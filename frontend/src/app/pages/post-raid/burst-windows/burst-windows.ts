import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { BurstWindow, PlayerBurstWindow } from '../../../core/models/analysis.models';
import { FormatDurationPipe } from '../../../shared/pipes/format-duration-pipe';
import { RangeChartComponent, RangeRow } from '../../../shared/components/range-chart/range-chart';
import { SpellIconComponent } from '../../../shared/components/spell-icon/spell-icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-burst-windows',
  imports: [
    MatIconModule, MatButtonModule, MatDividerModule,
    RangeChartComponent, SpellIconComponent, FormatDurationPipe,
    MatCardModule
  ],
  templateUrl: './burst-windows.html',
  styleUrl: './burst-windows.scss',
})
export class BurstWindowsComponent {
  readonly topWindows = input.required<BurstWindow[]>();
  readonly playerWindows = input<PlayerBurstWindow[]>([]);
  readonly fightDuration = input<number>(0);
  readonly cdSpellIds = input<Record<string, number>>({});

  protected readonly expandedCards = signal(new Set<number>());

  protected toggleDetail(idx: number): void {
    this.expandedCards.update(s => {
      const next = new Set(s);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  protected isExpanded(idx: number): boolean {
    return this.expandedCards().has(idx);
  }

  protected readonly maxVal = computed(() => {
    const allVals = this.topWindows().flatMap((bw, i) => {
      const p = this.playerWindows()[i]?.pct_of_total;
      return [bw.pct_avg, bw.pct_max, p].filter((v): v is number => v != null);
    });
    return Math.max(...allVals, 0.01);
  });

  protected readonly cards = computed(() => {
    const fightDur = this.fightDuration();
    const cdSpellIds = this.cdSpellIds();
    return this.topWindows().map((bw, idx) => {
      const notReached = bw.time_s > fightDur;
      const playerBw = notReached ? null : (this.playerWindows()[idx] ?? null);
      const topPct = bw.pct_avg ?? 0;
      const playerPct = playerBw?.pct_of_total ?? null;
      const minPct = bw.pct_min ?? topPct * 0.7;
      const maxPct = bw.pct_max ?? topPct * 1.3;

      let statusIcon = 'check_circle';
      let isSuccess = true, isWarning = false, isCritical = false;
      if (notReached) { statusIcon = 'schedule'; isSuccess = false; }
      else if (playerPct === null) { statusIcon = 'help_outline'; isSuccess = false; }
      else if (playerPct < minPct - (bw.pct_stddev ?? 0.01)) {
        statusIcon = 'error'; isSuccess = false; isCritical = true;
      } else if (topPct > 0 && playerPct < topPct - (bw.pct_stddev ?? 0.005)) {
        statusIcon = 'warning_amber'; isSuccess = false; isWarning = true;
      }

      const commonCdEntries = (bw.common_cds || []).map(name => ({
        name,
        spellId: cdSpellIds[name] ?? null,
      }));

      const playerAbMap: Record<number, { pct: number }> = {};
      for (const a of (playerBw?.ability_breakdown || [])) playerAbMap[a.spell_id] = a;

      const rangeRows: RangeRow[] = [{
        label: '',
        playerPct,
        topAvg: topPct,
        topMin: minPct,
        topMax: maxPct,
      }];

      return {
        bw, idx, notReached, playerPct, topPct, minPct, maxPct,
        statusIcon, isSuccess, isWarning, isCritical,
        commonCdEntries, playerAbMap, rangeRows,
        endTime: bw.time_s + bw.window_length_s,
      };
    });
  });

  protected abDetailData(cardIdx: number): RangeRow[] {
    const card = this.cards()[cardIdx];
    if (!card) return [];
    return (card.bw.ability_breakdown || []).map(ab => ({
      spellId: ab.spell_id,
      label: `Spell ${ab.spell_id}`,
      playerPct: card.playerAbMap[ab.spell_id]?.pct ?? null,
      topAvg: ab.avg_pct,
      topMin: ab.min_pct ?? ab.avg_pct * 0.7,
      topMax: ab.max_pct ?? ab.avg_pct * 1.3,
    }));
  }
}
