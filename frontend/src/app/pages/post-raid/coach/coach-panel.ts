import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FlyoverPanelComponent } from '../../../shared/components/flyover-panel/flyover-panel';
import { FormatDamagePipe } from '../../../shared/pipes/format-damage-pipe';
import { logWarn } from '../../../core/log';
import { CoachFeatureService, causeLabel, evidenceDamageTaken } from './coach.service';

/**
 * Host for the "why" flyover, composed from the shared `wl-flyover-panel` shell. Mirrors
 * `MapPanelComponent` and `ClipPanelComponent`: it injects exactly one service and the page
 * renders it once, wiring each card's `explain` output into it.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-coach-panel',
  imports: [MatButtonModule, FlyoverPanelComponent, FormatDamagePipe],
  templateUrl: './coach-panel.html',
})
export class CoachPanelComponent {
  protected readonly coach = inject(CoachFeatureService);
  protected readonly showDiagnostics = signal(false);

  protected readonly causeLabel = causeLabel;
  protected readonly damageTaken = computed(() => evidenceDamageTaken(this.coach.evidence()));
  protected readonly castCount = computed(() =>
    this.coach.evidence().filter(entry => entry.kind === 'cast').length);

  protected recheck(): void {
    void this.coach.refresh();
  }

  protected copyDiagnostics(): void {
    navigator.clipboard.writeText(this.coach.diagnostics().join('\n'))
      .catch(err => logWarn('CoachPanelComponent.copyDiagnostics', err));
  }
}
