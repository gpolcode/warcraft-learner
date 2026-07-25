import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AnalysisFinding } from '../../../core/models/analysis.models';
import { ComparisonWindow } from '../../../core/models/window-comparison.models';
import { logWarn } from '../../../core/log';
import {
  CoachData, CoachFeatureService, canStartWith, hasCoachContext, suggestedQuestions,
} from './coach.service';

/** On-device AI coach card; starting is user-triggered so a model download never begins without a click. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-coach',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
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
  readonly burstWindows = input.required<ComparisonWindow[]>();
  readonly defensiveWindows = input.required<ComparisonWindow[]>();
  readonly gearNotes = input.required<string[]>();

  protected readonly questionControl = new FormControl('', { nonNullable: true });

  private readonly data = computed<CoachData>(() => ({
    context: {
      spec: this.spec(),
      encounterName: this.encounterName(),
      kill: this.kill(),
      durationS: this.durationS(),
    },
    rotationFindings: this.rotationFindings(),
    defensiveFindings: this.defensiveFindings(),
    burstWindows: this.burstWindows(),
    defensiveWindows: this.defensiveWindows(),
    gearNotes: this.gearNotes(),
  }));

  protected readonly hasContext = computed(() => hasCoachContext(this.data()));
  protected readonly suggested = computed(() => suggestedQuestions(this.data()));
  protected readonly showDiagnostics = signal(false);

  protected readonly canStart = computed(() =>
    canStartWith(this.coach.availability()) && this.hasContext() && !this.coach.generating());

  /** Identifies the pull, not the analysis payload: the cards emit their data at different times. */
  private readonly pullKey = computed(() =>
    [this.spec(), this.encounterName(), this.kill(), this.durationS()].join('|'));

  constructor() {
    void this.coach.refresh();
    // Keyed on the pull, so a late-settling card cannot tear down a live debrief session.
    effect(() => {
      this.pullKey();
      this.coach.reset();
    });
  }

  protected recheck(): void {
    void this.coach.refresh();
  }

  protected copyDiagnostics(): void {
    navigator.clipboard.writeText(this.coach.diagnostics().join('\n'))
      .catch(err => logWarn('CoachComponent.copyDiagnostics', err));
  }

  protected start(): void {
    void this.coach.start(this.data());
  }

  protected ask(text: string): void {
    const question = text.trim();
    if (!question || !this.coach.chatReady() || this.coach.generating()) return;
    this.questionControl.setValue('');
    void this.coach.ask(question);
  }
}
