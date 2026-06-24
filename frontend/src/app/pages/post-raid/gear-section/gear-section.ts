import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CharacterGear } from '../../../core/models/wcl.models';
import { EncounterGearStats } from '../../../core/models/encounter.models';
import { GameIconComponent } from '../../../shared/components/game-icon/game-icon';
import {
  statusIcon, statusClass, GearCategory,
  buildTalentCategory, buildTrinketCategory, buildEnchantCategory,
} from '../../../shared/gear/gear-comparison';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-gear-section',
  imports: [MatIconModule, GameIconComponent],
  templateUrl: './gear-section.html',
})
export class GearSectionComponent {
  readonly playerGear = input<CharacterGear | null>(null);
  readonly topGear = input<EncounterGearStats | null>(null);

  // One block per category (Talents / Trinkets / Enchants), each styled like a
  // wl-finding-table: issue rows up top, a single "On plan" chip when clean.
  protected readonly categories = computed<GearCategory[]>(() => [
    buildTalentCategory(this.playerGear(), this.topGear()),
    buildTrinketCategory(this.playerGear(), this.topGear()),
    buildEnchantCategory(this.playerGear(), this.topGear()),
  ]);

  protected readonly statusIcon = statusIcon;
  protected readonly statusClass = statusClass;
}
