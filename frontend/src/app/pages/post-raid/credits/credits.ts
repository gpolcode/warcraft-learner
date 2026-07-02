import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { logWarn } from '../../../core/log';
import { TopParseCredit, RulebookSource } from '../../../core/models/credits.models';
import { CreditsFeatureService } from './credits.service';

/**
 * Credits card. A feature component: it injects exactly one service
 * (`CreditsFeatureService`) and renders a quiet, collapsed-by-default "Sources" section
 * at the bottom of an analysis page. It credits the top parses the encounter's
 * benchmarks drew from and the guides its rulebook was built from, each linking out.
 *
 * Bench-only and shared: driven purely by `spec`/`encounterId`, it renders identically on
 * the post-raid and pre-fight pages. Renders nothing until it has at least one credit.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-credits',
  templateUrl: './credits.html',
})
export class CreditsComponent {
  private readonly credits = inject(CreditsFeatureService);

  readonly spec = input.required<string>();
  readonly encounterId = input.required<number>();

  private readonly _parses = signal<TopParseCredit[]>([]);
  private readonly _sources = signal<RulebookSource[]>([]);
  protected readonly parses = this._parses.asReadonly();
  protected readonly sources = this._sources.asReadonly();

  // Bumped on every reload so a slow earlier response can't overwrite a newer one.
  private loadToken = 0;

  constructor() {
    effect(() => {
      const spec = this.spec();
      const encounterId = this.encounterId();
      const token = ++this.loadToken;
      void this.credits.loadCredits(spec, encounterId)
        .then(view => {
          if (token !== this.loadToken) return;
          this._parses.set(view.parses);
          this._sources.set(view.sources);
        })
        .catch(err => logWarn('credits.loadCredits', err));
    });
  }
}
