import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiCheckbox, TuiLabel, TuiTitle } from '@taiga-ui/core';
import { TUI_COPY_TEXTS, TuiButtonCopy } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { FlyoverPanel } from '../../shared/ui-flyover-panel/flyover-panel';
import { GameIcon } from '../ui-game-icon/game-icon';
import { LoadState } from '../../shared/ui-load-state/load-state';
import { NorthernSkyBench } from '../data/northern-sky/northern-sky-data-source';
import { NorthernSkyFeatureService } from '../data/northern-sky/northern-sky-feature-service';
import { LoadResourceService } from '../../shared/ui-load-state/load-resource-service';

const COPY_TEXTS = ['Copy note', 'Copied'] as const;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-northern-sky-export',
  imports: [FormsModule, TuiCardLarge, TuiHeader, TuiTitle, TuiButton, TuiButtonCopy, TuiCheckbox, TuiLabel, FlyoverPanel, GameIcon, LoadState],
  templateUrl: './northern-sky-export.html',
  providers: [{ provide: TUI_COPY_TEXTS, useValue: signal(COPY_TEXTS) }],
})
export class NorthernSkyExport {
  private readonly loadRes = inject(LoadResourceService);
  private readonly feature = inject(NorthernSkyFeatureService);

  readonly spec = input.required<string>();
  readonly encounterId = input.required<number>();
  readonly busyChange = output<boolean>();
  readonly availableChange = output<boolean>();

  private readonly load = this.loadRes.loadResource({
    params: () => ({ spec: this.spec(), encounterId: this.encounterId() }),
    load: ({ spec, encounterId }) => this.feature.getExport(spec, encounterId),
    context: 'northernSky.getExport',
    availableWhen: (bench: NorthernSkyBench) => bench.abilities.length > 0,
    busyChange: this.busyChange,
    availableChange: this.availableChange,
  });

  private readonly bench = this.load.value;
  private readonly excluded = signal<ReadonlySet<number>>(this.feature.loadExcluded());
  protected readonly open = signal(false);
  protected readonly error = this.load.error;

  protected readonly abilities = computed(() => this.bench()?.abilities ?? []);
  private readonly grouped = computed(() => this.feature.abilitiesByKind(this.abilities()));
  protected readonly cooldowns = computed(() => this.grouped().cooldowns);
  protected readonly defensives = computed(() => this.grouped().defensives);
  protected readonly available = this.load.available;
  protected readonly allSelected = computed(() => this.feature.isAllSelected(this.abilities(), this.excluded()));
  protected readonly panelOpen = computed(() => this.feature.isPanelOpen(this.open(), this.available()));
  protected readonly note = computed(() => {
    const bench = this.bench();
    return bench ? this.feature.buildNorthernSkyNote(bench, this.feature.selectedIds(this.abilities(), this.excluded())) : '';
  });

  protected isSelected(spellId: number): boolean {
    return !this.excluded().has(spellId);
  }

  protected toggle(spellId: number, checked: boolean): void {
    this.persist(this.feature.toggleExclusion(this.excluded(), spellId, checked));
  }

  protected toggleAll(): void {
    this.persist(this.feature.toggleAllExclusion(this.abilities(), this.excluded()));
  }

  private persist(excluded: ReadonlySet<number>): void {
    this.excluded.set(excluded);
    this.feature.saveExcluded(excluded);
  }
}
