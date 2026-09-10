import {
  ChangeDetectionStrategy, Component,
  inject, signal, computed, effect,
} from '@angular/core';
import { toObservable, toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { EMPTY, combineLatest, from, merge, of } from 'rxjs';
import { distinctUntilChanged, exhaustMap, map, switchMap, tap } from 'rxjs/operators';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { POLL_INTERVAL_S } from '../domains/raid-analysis/data/wcl/live-report-sync-service';
import { WclFight, WclPlayer, PlayerDetailGroups } from '../domains/raid-analysis/data/wcl/wcl.models';
import { ClipAnchor } from '../domains/raid-analysis/data/capture/capture.models';
import { LoadingSpinner } from '../domains/shared/ui-load-state/loading-spinner';
import { BenchEmptyBanner } from '../domains/raid-analysis/ui-bench-empty-banner/bench-empty-banner';
import { PullOverview } from '../domains/raid-analysis/feature-pull-overview/pull-overview';
import { Rotation } from '../domains/raid-analysis/feature-rotation/rotation';
import { BurstWindows } from '../domains/raid-analysis/feature-burst-windows/burst-windows';
import { Defensive } from '../domains/raid-analysis/feature-defensive/defensive';
import { DefensiveMapAnchor } from '../domains/raid-analysis/data/defensive/defensive-feature-service';
import { Gear } from '../domains/raid-analysis/feature-gear/gear';
import { MapPanel } from '../domains/raid-analysis/feature-map/map-panel';
import { MapFeatureService, MapAnchor } from '../domains/raid-analysis/data/map/map-feature-service';
import { LiveCaptureFeatureService } from '../domains/raid-analysis/data/live/live-capture-feature-service';
import { LiveControls } from '../domains/raid-analysis/feature-live/live-controls';
import { ClipPanel } from '../domains/raid-analysis/feature-live/clip-panel';
import { FormatDurationPipe } from '../domains/shared/ui-format/format-duration-pipe';
import { FormatSpecPipe } from '../domains/raid-analysis/ui-spec-name/format-spec-pipe';
import { SpecIconPipe } from '../domains/raid-analysis/ui-game-icon/spec-icon-pipe';
import { ClassIconPipe } from '../domains/raid-analysis/ui-game-icon/class-icon-pipe';
import { BossIconPipe } from '../domains/raid-analysis/ui-game-icon/boss-icon-pipe';
import { ArtIcon } from '../domains/raid-analysis/ui-game-icon/art-icon';
import { LatestRun } from './latest-run';
import { LoadedReport, ReportSelectionService } from './report-selection-service';
import { CardDeck, CardEntry } from '../domains/shared/util-card-deck/card-deck';
import { SelectionStore } from '../domains/raid-analysis/data/selection/selection-store';
import { Result, Results } from '../domains/shared/util-http/result';
import { LoadState, RenderableLoadError } from '../domains/shared/ui-load-state/load-state';

type PostRaidCardId = 'pullOverview' | 'rotation' | 'burst' | 'defensive' | 'gear';

// Pull overview describes the pull itself instead of measuring it against top parses, so it has no bench and never keeps the empty-bench banner away.
const POST_RAID_CARDS: readonly CardEntry<PostRaidCardId>[] = [
  { id: 'pullOverview', hasBench: false },
  { id: 'rotation', hasBench: true },
  { id: 'burst', hasBench: true },
  { id: 'defensive', hasBench: true },
  { id: 'gear', hasBench: true },
];

// Selection is NOT mirrored to the URL: a report loads only via an explicit Analyze action, never auto-run from a query param, so a crawled link never spends the shared WCL rate-limit budget.
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-post-raid',
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatCardModule,
    LoadingSpinner, BenchEmptyBanner, LoadState, ArtIcon, PullOverview, Rotation, BurstWindows,
    Defensive, Gear, MapPanel, LiveControls, ClipPanel,
    FormatDurationPipe, FormatSpecPipe, SpecIconPipe, ClassIconPipe, BossIconPipe,
  ],
  // Provided here, not app.config: only this page's form fields want dynamic subscript sizing.
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } }],
  // Live sync and screen recording both hold state a page unload discards for good: warn before either is lost.
  host: { '(window:beforeunload)': 'onBeforeUnload($event)' },
  templateUrl: './post-raid.html',
})
export class PostRaid {
  private readonly selection = inject(ReportSelectionService);
  private readonly mapFeature = inject(MapFeatureService);
  protected readonly liveCapture = inject(LiveCaptureFeatureService);
  private readonly selectionStore = inject(SelectionStore);

  protected readonly reportControl = new FormControl('', { nonNullable: true, validators: [control => this.reportCodeValidator(control)] });
  protected readonly fightControl = new FormControl<number | null>(null);
  protected readonly playerControl = new FormControl<number | null>(null);

  constructor() {
    // Live sync owns the fight selection: disable the control while it drives it (setValue from the poll still works on a disabled control).
    effect(() => {
      if (this.liveCapture.liveEnabled()) this.fightControl.disable();
      else this.fightControl.enable();
    });
  }

  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.liveCapture.liveEnabled() && !this.liveCapture.isCapturing()) return;
    event.preventDefault();
  }

  protected readonly loadingReport = signal(false);
  protected readonly loadingAnalysis = signal(false);
  protected readonly loadingMsg = signal('Loading…');

  // Cards start busy, and the spinner stays up until every one emits busyChange(false), so they never flash empty content between mount and first data.
  protected readonly cards = new CardDeck(POST_RAID_CARDS, { availableUntilReported: false });
  protected readonly cardsBusy = this.cards.anyBusy;
  protected readonly benchAvailable = this.cards.benchAvailable;

  // `notice` carries the non-failure states the taxonomy does not cover (invalid code, zero-pull report).
  protected readonly loadError = signal<RenderableLoadError | null>(null);
  protected readonly notice = signal('');

  protected readonly fights = signal<WclFight[]>([]);
  protected readonly players = signal<WclPlayer[]>([]);
  protected readonly selectedFightId = toSignal(this.fightControl.valueChanges, { initialValue: this.fightControl.value });
  protected readonly selectedPlayerId = toSignal(this.playerControl.valueChanges, { initialValue: this.playerControl.value });
  protected readonly liveSyncEnabled = this.liveCapture.liveEnabled;

  protected readonly spec = signal('');

  // actor.subType is class-only since Midnight, so the dropdown resolves each player's spec from playerDetails instead.
  protected readonly playerDetailGroups = signal<PlayerDetailGroups>({});

  protected readonly reportCode = signal('');

  /** Report clock (unix epoch ms), the shared timebase for correlating clips to fights. */
  protected readonly reportStartTime = signal(0);

  private _enemies: LoadedReport['enemies'] = [];

  private readonly reportRun = new LatestRun();

  private readonly selectionRun = new LatestRun();

  protected readonly visiblePlayers = computed(() =>
    this.selection.visiblePlayersOf(this.fights(), this.players(), this.selectedFightId()));

  protected readonly playerSpecs = computed(() => {
    const groups = this.playerDetailGroups();
    const result: Record<number, string> = {};
    for (const player of this.visiblePlayers()) result[player.id] = this.selection.specOf(groups, player.id);
    return result;
  });

  protected readonly selectedFight = computed(() =>
    this.fights().find(f => f.id === this.selectedFightId()));

  protected readonly selectedPlayer = computed(() =>
    this.visiblePlayers().find(p => p.id === this.selectedPlayerId()));

  protected readonly selectedEncounterId = computed(() =>
    this.fights().find(f => f.id === this.selectedFightId())?.encounterID ?? 0);

  protected readonly ready = computed(() =>
    !!this.spec() && !!this.reportCode() && !!this.selectedFightId() && !!this.selectedPlayerId() && !!this.selectedEncounterId());

  protected readonly mapReady = this.mapFeature.ready;

  protected onOpenMap(anchor: MapAnchor): void {
    this.mapFeature.openAt(anchor);
  }

  protected onDefensiveOpenMap(anchor: DefensiveMapAnchor): void {
    this.mapFeature.openAt({
      timeS: anchor.timeS,
      windowLengthS: anchor.windowLengthS,
      reference: anchor.refGameId != null ? { kind: 'enemy', gameId: anchor.refGameId } : { kind: 'boss' },
    });
  }

  protected readonly clipReady = this.liveCapture.clipReady;

  protected onOpenClip(anchor: ClipAnchor): void {
    this.liveCapture.openClip(anchor);
  }

  // Must live in a field initializer so that toObservable() and takeUntilDestroyed() run inside the injection context.
  private readonly _pollingSub = combineLatest([
    toObservable(this.liveSyncEnabled),
    toObservable(this.reportCode),
  ]).pipe(
    tap(([live, code]) => {
      if (live && !code) this.liveCapture.setStatus('Load a report to start live sync.');
      else if (!live) this.liveCapture.setStatus('');
    }),
    map(([live, code]) => live && !!code),
    distinctUntilChanged(),
    switchMap(active =>
      active
        ? merge(of(undefined), this.selection.pollTriggers())
        : EMPTY,
    ),
    exhaustMap(() => from(this._pollOnce())),
    takeUntilDestroyed(),
  ).subscribe();

  protected onPaste(event: ClipboardEvent, input: HTMLInputElement): void {
    const pasted = event.clipboardData?.getData('text');
    if (!pasted) return;
    // Applied here rather than natively so loadReport() reads the final value in this same tick.
    event.preventDefault();
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    this.reportControl.setValue(input.value.slice(0, start) + pasted + input.value.slice(end));
    void this.loadReport();
  }

  // Folding `missing` to the notice keeps the shell exhaustive over the taxonomy without leaking a raw string.
  private _showError(result: Result<never>): void {
    if (result.ok) return; // toLoadError / permanent never return ok; this narrows the union
    if (result.error.kind === 'missing') this.notice.set(result.error.message);
    else this.loadError.set(result.error);
  }

  protected async loadReport(): Promise<void> {
    this.loadError.set(null);
    this.notice.set('');
    const rawInput = this.reportControl.value;
    const code = this.selection.extractCode(rawInput.trim());
    // The Analyze button is already disabled while invalid; this guard also covers the Enter-key path.
    if (!this.selection.isValidReportCode(code)) {
      if (code) this.notice.set('Enter a valid Warcraft Logs report URL or 16-character report code.');
      return;
    }
    const run = this.reportRun.begin();
    // Setting reportCode to '' stops any active poll before the fetch completes.
    this.reportCode.set('');

    this.loadingReport.set(true);
    this.fights.set([]);
    this.players.set([]);
    this.spec.set('');
    this.playerDetailGroups.set({});
    this.selectionRun.cancel();
    this.mapFeature.clear();
    this.liveCapture.clear();

    this.loadingMsg.set('Fetching report from Warcraft Logs…');
    const loaded = await this.selection.loadReport(code);
    if (!this.reportRun.isCurrent(run)) return;
    if (!loaded.ok) {
      this._showError(loaded);
      this.loadingReport.set(false);
      return;
    }
    this._applyReport(loaded.value);

    this.fightControl.setValue(this.selection.targetFightId(this.fights(), this.selection.extractFightId(rawInput)));
    // Without this a zero-pull log is a successful load that looks like nothing happened.
    if (!this.fights().length) this.notice.set('No boss pulls found in this report.');
    this._applyAutoPlayer();
    // Set reportCode last - this activates the polling pipeline if liveSync is on.
    this.reportCode.set(code);
    await this.resolveSelection();
    if (this.reportRun.isCurrent(run)) this.loadingReport.set(false);
  }

  private _applyReport(loaded: LoadedReport): void {
    this.fights.set(loaded.fights);
    this.players.set(loaded.players);
    this.reportStartTime.set(loaded.startTime);
    this._enemies = loaded.enemies;
  }

  private async _pollOnce(): Promise<void> {
    this.loadError.set(null);
    this.liveCapture.setStatus('Checking for new pulls…');
    // Pin the report this poll fetches; a mid-flight live-off or report switch must abandon its late writes.
    const code = this.reportCode();
    // Skipping the apply on an unchanged report keeps the rebuilt fight objects from retriggering the cards' own WCL fetches.
    const probed = await this.selection.probeFights(code);
    if (this._pollSuperseded(code)) return;
    if (!probed.ok) { this._pollFailed(probed); return; }
    const action = this.selection.livePollActionOf(probed.value, this.selectedFightId(), this.ready());
    if (action === 'none') { this.liveCapture.setStatus('No boss pulls found.'); return; }
    if (action === 'skip') {
      this.liveCapture.scheduleNextPollIn(POLL_INTERVAL_S);
      return;
    }

    const loaded = await this.selection.loadReport(code);
    if (this._pollSuperseded(code)) return;
    if (!loaded.ok) { this._pollFailed(loaded); return; }
    this._applyReport(loaded.value);

    const latest = this.fights()[this.fights().length - 1];
    if (!latest) { this.liveCapture.setStatus('No boss pulls found.'); return; }
    this._selectLatestPull(latest);
    await this.resolveSelection();
    if (this._pollSuperseded(code)) return;
    this.liveCapture.setStatus(`Updated ${new Date().toLocaleTimeString()} - ${latest.name}`);
  }

  private _pollFailed(result: Result<never>): void {
    this._showError(result);
    // Overwrite the in-flight "Checking..." status so the strip stops claiming a live check.
    this.liveCapture.setStatus('Live sync error, retrying on the next check.');
  }

  private _selectLatestPull(latest: WclFight): void {
    // A poll that lands a pull clears the zero-pull notice from the initial empty load.
    this.notice.set('');
    const currentName = this.players().find(player => player.id === this.selectedPlayerId())?.name ?? null;
    const visible = this.selection.visiblePlayersOf(this.fights(), this.players(), latest.id);
    this.fightControl.setValue(latest.id);
    this.playerControl.setValue(this.selection.pickLivePlayerId(visible, currentName));
  }

  private _pollSuperseded(code: string): boolean {
    return !this.liveSyncEnabled() || this.reportCode() !== code;
  }

  protected async onFightChange(): Promise<void> {
    if (this.liveSyncEnabled()) return;
    this._applyAutoPlayer();
    await this.resolveSelection();
  }

  protected async onPlayerChange(): Promise<void> {
    // Persist only on an explicit pick, so an auto-select fallback never overwrites the sticky name.
    this._persistPlayerName();
    await this.resolveSelection();
  }

  // The feature cards self-load from their spec/encounterId/selection inputs; this only does the cross-cutting work a shell owns.
  protected async resolveSelection(): Promise<void> {
    const run = this.selectionRun.begin();
    this.loadError.set(null);
    const fightId = this.selectedFightId();
    const playerId = this.selectedPlayerId();
    this.spec.set('');
    this.loadingAnalysis.set(false);
    this.mapFeature.clear();
    this.liveCapture.clear();
    if (!fightId || !playerId) return;
    this.notice.set('');

    const fight = this.fights().find(f => f.id === fightId);
    if (this._noticeUnsupported(fight)) return;

    this.loadingAnalysis.set(true);
    this.loadingMsg.set('Fetching player data from Warcraft Logs…');
    const groups = await this.selection.playerDetails(this.reportCode(), fightId);
    if (!this.selectionRun.isCurrent(run)) return;
    this._applySelectedSpec(groups, playerId, fight);
    this.loadingAnalysis.set(false);
  }

  private _noticeUnsupported(fight: WclFight | undefined): boolean {
    if (!this.selection.isUnsupportedDifficulty(fight?.difficulty)) return false;
    this.notice.set(this.selection.unsupportedEncounterNotice(fight?.name ?? '', fight?.difficulty));
    return true;
  }

  private _applySelectedSpec(groups: Result<PlayerDetailGroups>, playerId: number, fight: WclFight | undefined): void {
    if (!groups.ok) { this._showError(groups); return; }
    this.playerDetailGroups.set(groups.value);
    const spec = this.selection.specOf(groups.value, playerId);
    // Unmappable spec is a semantic dead end, not retriable: permanent, not transient.
    if (!spec) { this._showError(Results.permanent('Could not resolve the selected player\'s spec.', 'post-raid.spec-resolve')); return; }
    this.spec.set(spec);

    // Marks every card busy before they mount/reload, so the spinner stays up with no gap where the cards render empty.
    this.cards.markAllBusy();
    this.loadingMsg.set('Fetching analysis data from Warcraft Logs…');

    if (fight) {
      void this.mapFeature.prepare(this.reportCode(), fight, playerId, spec, this._enemies);
      this.liveCapture.prepare(this.reportCode(), this.reportStartTime(), fight);
    }
  }

  private _applyAutoPlayer(): void {
    // Sticks to the saved player NAME, not actor id, since actor ids are not stable across reports.
    const stickyName = this.selectionStore.loadPostRaid()?.playerName ?? null;
    this.playerControl.setValue(this.selection.pickLivePlayerId(this.visiblePlayers(), stickyName));
  }

  private _persistPlayerName(): void {
    // Guard the write so an unresolved selection never overwrites the sticky name with null.
    const playerName = this.players().find(player => player.id === this.selectedPlayerId())?.name ?? null;
    if (playerName) this.selectionStore.savePostRaid({ playerName });
  }

  // Keeps the Analyze button disabled - and no WCL request firing - until the input resolves to a usable report code.
  private reportCodeValidator(control: AbstractControl): ValidationErrors | null {
    const value = ((control.value as string | null) ?? '').trim();
    if (!value) return null; // empty is not an error (no red field); the button is disabled separately
    return this.selection.isValidReportCode(this.selection.extractCode(value)) ? null : { invalidReportCode: true };
  }
}
