import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ValidityReport } from '../domains/raid-analysis/feature-validity/validity-report';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-method',
  imports: [ValidityReport],
  templateUrl: './method.html',
})
export class Method {}
