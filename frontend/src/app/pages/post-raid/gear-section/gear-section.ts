import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CharacterGear } from '../../../core/models/wcl.models';
import { EncounterGearStats } from '../../../core/models/encounter.models';
import { GameIconComponent } from '../../../shared/components/game-icon/game-icon';
import {
  statusIcon, statusClass,
  buildEnchantRows, EnchantRow,
  buildTalentBuilds, talentStatusOf, TalentBuildRow,
  buildTrinketRows, TrinketRow,
  buildBenchEnchantRows, BenchEnchantRow,
  buildBenchTrinketRows, BenchTrinketRow,
} from '../../../shared/gear/gear-comparison';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-gear-section',
  imports: [MatCardModule, MatChipsModule, MatDividerModule, MatIconModule, GameIconComponent],
  templateUrl: './gear-section.html',
})
export class GearSectionComponent {
  readonly playerGear = input<CharacterGear | null>(null);
  readonly topGear = input<EncounterGearStats | null>(null);

  protected readonly enchantRows = computed<EnchantRow[]>(() =>
    buildEnchantRows(this.playerGear(), this.topGear()));
  // Issues (wrong/missing) surface as rows; matching enchants collapse to a count chip.
  protected readonly enchantIssues = computed(() =>
    this.enchantRows().filter(row => row.status !== 'ok'));
  protected readonly enchantOnPlanCount = computed(() =>
    this.enchantRows().filter(row => row.status === 'ok').length);

  // Every slot renders as a row (success or info); no on-plan collapse for trinkets,
  // since there are only two slots and the equipped item is worth always showing.
  protected readonly trinketRows = computed<TrinketRow[]>(() =>
    buildTrinketRows(this.playerGear(), this.topGear()));

  protected readonly talentBuilds = computed<TalentBuildRow[]>(() =>
    buildTalentBuilds(this.topGear(), this.playerGear()?.talent_key ?? ''));
  protected readonly talentStatus = computed(() =>
    talentStatusOf(this.topGear(), this.playerGear()?.talent_key ?? ''));
  protected readonly talentIssue = computed(() => this.talentStatus().status === 'warn');
  // The most-common build, used for the "View parse" affordance and the on-plan chip.
  protected readonly topBuild = computed<TalentBuildRow | null>(() => this.talentBuilds()[0] ?? null);

  // Bench-only display used when playerGear has not yet loaded.
  protected readonly benchEnchantRows = computed<BenchEnchantRow[]>(() =>
    buildBenchEnchantRows(this.topGear()));
  protected readonly benchTrinketRows = computed<BenchTrinketRow[]>(() =>
    buildBenchTrinketRows(this.topGear()));

  protected readonly statusIcon = statusIcon;
  protected readonly statusClass = statusClass;
}
