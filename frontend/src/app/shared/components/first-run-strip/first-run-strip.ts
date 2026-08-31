import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface FirstRunCopy {
  headline: string;
  intro: string;
  steps: readonly { icon: string; label: string; detail: string }[];
}

const PRE_FIGHT: FirstRunCopy = {
  headline: 'What the pre-fight plan gives you',
  intro: 'No log of your own needed. Here is the whole flow:',
  steps: [
    { icon: 'tune', label: 'Pick class, spec and boss', detail: 'Three dropdowns, nothing else.' },
    { icon: 'query_stats', label: 'We read the top logs', detail: 'The top 10 Mythic logs for that spec.' },
    { icon: 'checklist', label: 'You get their plan', detail: 'Cooldowns, defensives, gear and positioning.' },
  ],
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-first-run-strip',
  imports: [MatIconModule],
  host: { class: 'block' },
  templateUrl: './first-run-strip.html',
})
export class FirstRunStrip {
  protected readonly copy = PRE_FIGHT;
}
