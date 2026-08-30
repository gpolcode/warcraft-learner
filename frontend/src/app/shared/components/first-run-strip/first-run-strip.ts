import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Which page the strip introduces: the post-raid analysis or the pre-fight plan. */
export type FirstRunVariant = 'post' | 'pre';

interface FirstRunCopy {
  headline: string;
  intro: string;
  steps: readonly { icon: string; label: string; detail: string }[];
}

const POST_RAID: FirstRunCopy = {
  headline: 'What pasting a report gets you',
  intro: 'Everything runs in your browser. Here is the whole flow:',
  steps: [
    { icon: 'content_paste', label: 'Paste a report', detail: 'A Warcraft Logs URL or code. Mythic raid pulls only.' },
    { icon: 'query_stats', label: 'Your pull gets graded', detail: 'Against the top 10 logs for your spec.' },
    { icon: 'checklist', label: 'Every flag names a fix', detail: 'What to change on the next pull.' },
  ],
};

const PRE_FIGHT: FirstRunCopy = {
  headline: 'What the pre-fight plan gives you',
  intro: 'No log of your own needed. Here is the whole flow:',
  steps: [
    { icon: 'tune', label: 'Pick class, spec and boss', detail: 'Three dropdowns, nothing else.' },
    { icon: 'query_stats', label: 'We read the top logs', detail: 'The top 10 Mythic logs for that spec.' },
    { icon: 'checklist', label: 'You get their plan', detail: 'Cooldowns, defensives, gear and positioning.' },
  ],
};

/** `variant` switches the headline and the three steps between the post-raid and pre-fight flow. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-first-run-strip',
  imports: [MatIconModule],
  host: { class: 'block' },
  templateUrl: './first-run-strip.html',
})
export class FirstRunStrip {
  readonly variant = input<FirstRunVariant>('post');

  protected readonly copy = computed(() => this.variant() === 'pre' ? PRE_FIGHT : POST_RAID);
}
