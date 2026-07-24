import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AnalysisFinding } from '../../../core/models/analysis.models';
import { CoachFeatureService, countIssues } from './coach.service';

/** On-device AI debrief card; generation is user-triggered so a model download never starts without a click. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-coach',
  imports: [MatButtonModule],
  templateUrl: './coach.html',
})
export class CoachComponent {
  protected readonly coach = inject(CoachFeatureService);

  readonly spec = input.required<string>();
  readonly encounterName = input.required<string>();
  readonly kill = input.required<boolean>();
  readonly durationS = input.required<number>();
  readonly rotationFindings = input.required<AnalysisFinding[]>();
  readonly defensiveFindings = input.required<AnalysisFinding[]>();

  protected readonly hasFindings = computed(() =>
    countIssues(this.rotationFindings(), this.defensiveFindings()) > 0);

  protected readonly canGenerate = computed(() => {
    const availability = this.coach.availability();
    return (availability === 'ready' || availability === 'downloadable')
      && this.hasFindings() && !this.coach.generating();
  });

  constructor() {
    void this.coach.refresh();
    // A new selection means new findings; a debrief for the previous pull is stale.
    effect(() => {
      this.rotationFindings();
      this.defensiveFindings();
      this.coach.reset();
    });
  }

  protected generate(): void {
    void this.coach.generate(
      {
        spec: this.spec(),
        encounterName: this.encounterName(),
        kill: this.kill(),
        durationS: this.durationS(),
      },
      this.rotationFindings(),
      this.defensiveFindings(),
    );
  }
}
