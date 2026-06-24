import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CharacterGear } from '../../../core/models/wcl.models';
import { EncounterGearStats } from '../../../core/models/encounter.models';
import { GameIconComponent } from '../../../shared/components/game-icon/game-icon';
import {
  GearStatus, slotName, statusIcon, statusClass,
  buildEnchantRows, enchantStatusOf, EnchantRow,
  buildTrinketRows, TrinketRow,
  buildTalentBuilds, talentStatusOf, TalentBuildRow,
  buildBenchEnchantRows, BenchEnchantRow,
  buildBenchTrinketRows, BenchTrinketRow,
} from '../../../shared/gear/gear-comparison';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-gear-section',
  imports: [MatCardModule, MatIconModule, GameIconComponent],
  templateUrl: './gear-section.html',
})
export class GearSectionComponent {
  readonly playerGear = input<CharacterGear | null>(null);
  readonly topGear = input<EncounterGearStats | null>(null);

  /** True when player gear is available: enables player-vs-bench comparison mode. */
  protected readonly comparison = computed(() => !!this.playerGear());

  // --- Enchants ---
  protected readonly enchantRows = computed<EnchantRow[]>(() =>
    buildEnchantRows(this.playerGear(), this.topGear()));
  protected readonly enchantStatus = computed<GearStatus>(() =>
    enchantStatusOf(this.enchantRows()));
  protected readonly enchantIssues = computed(() =>
    this.enchantRows().filter(r => r.status !== 'ok'));
  protected readonly enchantOnPlan = computed(() =>
    this.enchantRows().filter(r => r.status === 'ok'));
  protected readonly benchEnchantRows = computed<BenchEnchantRow[]>(() =>
    buildBenchEnchantRows(this.topGear()));

  // --- Trinkets ---
  protected readonly trinketRows = computed<TrinketRow[]>(() =>
    buildTrinketRows(this.playerGear(), this.topGear()));
  protected readonly trinketIssues = computed(() =>
    this.trinketRows().filter(r => r.status !== 'ok'));
  protected readonly trinketOnPlan = computed(() =>
    this.trinketRows().filter(r => r.status === 'ok'));
  protected readonly benchTrinketRows = computed<BenchTrinketRow[]>(() =>
    buildBenchTrinketRows(this.topGear()));

  // --- Talents ---
  protected readonly talentBuilds = computed<TalentBuildRow[]>(() =>
    buildTalentBuilds(this.topGear(), this.playerGear()?.talent_key ?? ''));
  protected readonly talentStatus = computed(() =>
    talentStatusOf(this.topGear(), this.playerGear()?.talent_key ?? ''));
  /** Usage % of the most common talent build (shown in the talent issue row). */
  protected readonly talentTopPct = computed(() => this.talentBuilds()[0]?.pct ?? null);
  /** Example parse link for the most common talent build. */
  protected readonly talentTopLink = computed(() => this.talentBuilds()[0]?.link ?? null);

  protected readonly slotName = slotName;
  protected readonly statusIcon = statusIcon;
  protected readonly statusClass = statusClass;
}
