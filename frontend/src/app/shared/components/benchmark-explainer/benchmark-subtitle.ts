import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BenchmarkExplainerStore } from '../../state/benchmark-explainer-store';

/** Both spellings the subtitles use; the word boundary keeps "top parsers", a measured-cell unit, out of the match. */
const BENCHMARK_TERM = /top[- ]parses?\b/i;

interface SubtitleParts {
  before: string;
  /** Empty when the subtitle never names the benchmark, which renders the text with no trigger. */
  term: string;
  after: string;
}

/** A card subtitle that turns its benchmark noun into the trigger for the shared explainer, so the ruler is one click from every card. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-benchmark-subtitle',
  imports: [MatTooltipModule],
  templateUrl: './benchmark-subtitle.html',
})
export class BenchmarkSubtitle {
  protected readonly explainer = inject(BenchmarkExplainerStore);

  readonly text = input.required<string>();

  protected readonly parts = computed<SubtitleParts>(() => {
    const text = this.text();
    const match = BENCHMARK_TERM.exec(text);
    if (!match) return { before: text, term: '', after: '' };
    return {
      before: text.slice(0, match.index),
      term: match[0],
      after: text.slice(match.index + match[0].length),
    };
  });
}
