import {
  ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject,
  input, signal, untracked, viewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { WclApiService } from '../../../core/services/wcl-api';
import { WclFight, WclAbility } from '../../../core/models/wcl.models';
import { GameIconComponent } from '../../../shared/components/game-icon/game-icon';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { FormatDurationPipe } from '../../../shared/pipes/format-duration-pipe';
import {
  ActorTimeline, RankedAbility, RelPos, buildActorTimelines, buildTrail,
  hasAnyPosition, positionAt, rankAbilities, relativePositionsAt, toReferenceLocal,
} from '../../../core/services/positioning-core';

const TRAIL_STEP_S = 0.5;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-positioning-card',
  imports: [
    MatCardModule, MatFormFieldModule, MatSelectModule, MatSliderModule,
    MatIconModule, DecimalPipe, GameIconComponent, LoadingSpinnerComponent,
    FormatDurationPipe,
  ],
  templateUrl: './positioning-card.html',
})
export class PositioningCardComponent {
  private readonly wclApi = inject(WclApiService);

  readonly reportCode = input.required<string>();
  readonly fightId = input.required<number>();
  readonly playerId = input.required<number>();
  readonly fights = input.required<WclFight[]>();
  readonly masterAbilities = input<WclAbility[]>([]);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly noPositionData = signal(false);
  /** When no positions are found, what the API actually returned, so we can tell a bug from an API limitation. */
  protected readonly diag = signal<{ castCount: number; posCount: number; sampleKeys: string[] } | null>(null);

  private readonly timelines = signal<Map<number, ActorTimeline>>(new Map());
  protected readonly ranked = signal<RankedAbility[]>([]);
  /** Labels for enemy reference actors, e.g. "casts Shadow Bolt". */
  private readonly refLabels = signal<Map<number, string>>(new Map());

  protected readonly selectedAbilityId = signal<number | null>(null);
  protected readonly selectedInstanceIdx = signal(0);
  protected readonly refOverride = signal<number | null>(null);
  protected readonly pre = signal(6);
  protected readonly post = signal(3);
  protected readonly scrubT = signal(0);

  private _lastKey = '';
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly fight = computed(() =>
    this.fights().find(f => f.id === this.fightId()) ?? null);

  protected readonly selectedAbility = computed(() =>
    this.ranked().find(a => a.abilityGameId === this.selectedAbilityId()) ?? null);

  protected readonly instance = computed(() => {
    const ab = this.selectedAbility();
    if (!ab) return null;
    return ab.instances[this.selectedInstanceIdx()] ?? ab.instances[0] ?? null;
  });

  /** Reference actor: manual override, else the caster of the selected instance. */
  protected readonly refId = computed(() =>
    this.refOverride() ?? this.instance()?.sourceId ?? null);

  /** Distinct enemy actors available as reference overrides, with labels. */
  protected readonly refOptions = computed(() => {
    const labels = this.refLabels();
    return [...labels.entries()].map(([id, label]) => ({ id, label }));
  });

  /** Player movement trail in the reference frame across the window. */
  protected readonly playerTrail = computed<RelPos[]>(() => {
    const inst = this.instance();
    const ref = this.refId();
    if (!inst || ref == null) return [];
    return buildTrail(this.playerId(), ref, this.timelines(), inst.t, this.pre(), this.post(), TRAIL_STEP_S);
  });

  /** Window bounds for the scrubber. */
  protected readonly windowStart = computed(() => (this.instance()?.t ?? 0) - this.pre());
  protected readonly windowEnd = computed(() => (this.instance()?.t ?? 0) + this.post());

  /** Readout at the scrubbed moment: player vs the raid centroid. */
  protected readonly readout = computed(() => {
    const ref = this.refId();
    const inst = this.instance();
    if (ref == null || !inst) return null;
    const t = this.scrubT();
    const fight = this.fight();
    const tl = this.timelines();
    const refPos = positionAt(tl.get(ref), t);
    const pPos = positionAt(tl.get(this.playerId()), t);
    if (!refPos || !pPos) return null;
    // Different map/phase - positions are not comparable.
    if (refPos.mapID != null && pPos.mapID != null && refPos.mapID !== pPos.mapID) return null;
    const player = toReferenceLocal(pPos, refPos, t);

    const cohort = (fight?.friendlyPlayers ?? []).filter(id => id !== this.playerId());
    const rel = relativePositionsAt(cohort, tl, ref, t);
    const pts = [...rel.values()];
    let centroid: RelPos | null = null;
    let deviation: number | null = null;
    if (pts.length) {
      const cf = pts.reduce((s, p) => s + p.fwd, 0) / pts.length;
      const cr = pts.reduce((s, p) => s + p.right, 0) / pts.length;
      centroid = { t, fwd: cf, right: cr, dist: Math.hypot(cf, cr), angleDeg: 0 };
      deviation = Math.hypot(player.fwd - cf, player.right - cr);
    }
    return { player, centroid, deviation, raidCount: pts.length, atCast: Math.abs(t - inst.t) < TRAIL_STEP_S / 2 };
  });

  constructor() {
    // Refetch whenever the analysed report/fight/player changes.
    effect(() => {
      const key = `${this.reportCode()}|${this.fightId()}|${this.playerId()}`;
      if (key === this._lastKey) return;
      this._lastKey = key;
      untracked(() => void this._load());
    });
    // Redraw the map on any state change once the canvas exists.
    effect(() => {
      const el = this.canvas()?.nativeElement;
      // Touch the signals the draw depends on so the effect re-runs.
      this.playerTrail(); this.scrubT(); this.readout(); this.refId();
      if (el) this._draw(el);
    });
  }

  protected onAbilityChange(id: number): void {
    this.selectedAbilityId.set(id);
    this._resetSelection();
  }

  protected onInstanceChange(idx: number): void {
    this.selectedInstanceIdx.set(idx);
    this.refOverride.set(null);
    this.scrubT.set(this.instance()?.t ?? 0);
  }

  protected onRefChange(id: number | null): void {
    this.refOverride.set(id);
  }

  protected onScrub(v: number): void {
    this.scrubT.set(v);
  }

  private _resetSelection(): void {
    this.selectedInstanceIdx.set(0);
    this.refOverride.set(null);
    this.scrubT.set(this.instance()?.t ?? 0);
  }

  private async _load(): Promise<void> {
    const fight = untracked(() => this.fight());
    const report = untracked(() => this.reportCode());
    const playerId = untracked(() => this.playerId());
    if (!fight || !report) return;

    this.loading.set(true);
    this.error.set('');
    this.noPositionData.set(false);
    this.diag.set(null);
    this.ranked.set([]);
    this.timelines.set(new Map());

    try {
      const { startTime, endTime } = fight;
      // includeResources:true attaches per-actor position; the events query
      // defaults to friendly events, so enemy casts need an explicit fetch.
      const [friendlyCasts, enemyCasts, dmgDone, dmgTaken] = await Promise.all([
        this.wclApi.getAllEvents(report, fight.id, 'Casts', startTime, endTime, undefined, true, 'Friendlies'),
        this.wclApi.getAllEvents(report, fight.id, 'Casts', startTime, endTime, undefined, true, 'Enemies'),
        this.wclApi.getAllEvents(report, fight.id, 'DamageDone', startTime, endTime, playerId, true),
        // DamageTaken scoped to the player (matches the convention in analysis-engine).
        this.wclApi.getAllEvents(report, fight.id, 'DamageTaken', startTime, endTime, playerId, true),
      ]);

      // Positions for the raid (friendly casts) + the enemies they fight (enemy
      // casts give boss/add positions) + the player's own damage to densify.
      const pool = [...friendlyCasts, ...enemyCasts, ...dmgDone];
      const timelines = buildActorTimelines(pool, startTime);
      const playerTl = timelines.get(playerId);
      if (!timelines.size || !playerTl?.samples.length) {
        // Diagnose: did the API return coordinates at all?
        const posCount = pool.filter(e => hasAnyPosition([e])).length;
        const sample = pool.find(e => typeof e.x === 'number') ?? pool[0];
        const sampleKeys = sample ? Object.keys(sample) : [];
        if (sample) console.log('[positioning] sample event:', sample);
        this.diag.set({ castCount: friendlyCasts.length, posCount, sampleKeys });
        this.noPositionData.set(true);
        return;
      }

      const friendlyIds = new Set(fight.friendlyPlayers ?? []);
      // The query is already scoped to the player, so every event here hit them.
      const hitPlayerAbilityIds = new Set<number>();
      for (const e of dmgTaken) {
        if (e.abilityGameID) hitPlayerAbilityIds.add(e.abilityGameID);
      }

      const abilityMap: Record<number, { name: string; icon: string }> = {};
      for (const a of this.masterAbilities()) {
        if (a.gameID) abilityMap[a.gameID] = { name: a.name || '', icon: a.icon || '' };
      }

      // Mechanics to inspect come from enemy casts (boss/adds).
      const ranked = rankAbilities({
        casts: enemyCasts, fStart: startTime, timelines, friendlyIds, abilityMap, hitPlayerAbilityIds,
      });

      this.refLabels.set(this._buildRefLabels(enemyCasts, friendlyIds, abilityMap));
      this.timelines.set(timelines);
      this.ranked.set(ranked);
      if (ranked.length) { this.selectedAbilityId.set(ranked[0].abilityGameId); this._resetSelection(); }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load positioning data.');
    } finally {
      this.loading.set(false);
    }
  }

  /** Label each enemy caster by its most frequent cast ability. */
  private _buildRefLabels(
    casts: { type: string; sourceID?: number; abilityGameID: number }[],
    friendlyIds: Set<number>,
    abilityMap: Record<number, { name: string }>,
  ): Map<number, string> {
    const perActor = new Map<number, Map<number, number>>();
    for (const e of casts) {
      if (e.type !== 'cast' && e.type !== 'begincast') continue;
      const src = e.sourceID;
      if (src == null || friendlyIds.has(src)) continue;
      let m = perActor.get(src);
      if (!m) { m = new Map(); perActor.set(src, m); }
      m.set(e.abilityGameID, (m.get(e.abilityGameID) ?? 0) + 1);
    }
    const labels = new Map<number, string>();
    for (const [id, m] of perActor) {
      const top = [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      const name = top != null ? abilityMap[top]?.name : '';
      labels.set(id, name ? `casts ${name}` : `actor ${id}`);
    }
    return labels;
  }

  // --- Canvas rendering ----------------------------------------------------

  private _draw(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = (globalThis.devicePixelRatio || 1);
    const cssW = canvas.clientWidth || 600;
    const cssH = canvas.clientHeight || 420;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const cx = cssW / 2, cy = cssH / 2;
    const margin = 28;
    const radiusPx = Math.min(cssW, cssH) / 2 - margin;

    const trail = this.playerTrail();
    const read = this.readout();
    // Fit scale to the data so the trail and raid always fit.
    let maxYd = 10;
    for (const p of trail) maxYd = Math.max(maxYd, p.dist);
    if (read?.player) maxYd = Math.max(maxYd, read.player.dist);
    if (read?.centroid) maxYd = Math.max(maxYd, read.centroid.dist);
    maxYd = Math.ceil(maxYd / 5) * 5 + 5;
    const scale = radiusPx / maxYd;

    const toScreen = (p: { fwd: number; right: number }): [number, number] =>
      [cx + p.right * scale, cy - p.fwd * scale];

    const css = getComputedStyle(canvas);
    const gold = css.getPropertyValue('--gold').trim() || '#e5cc80';
    const border = css.getPropertyValue('--border').trim() || 'rgba(255,255,255,0.15)';
    const muted = css.getPropertyValue('--muted').trim() || 'rgba(255,255,255,0.5)';

    // Range rings + labels.
    ctx.strokeStyle = border;
    ctx.fillStyle = muted;
    ctx.font = '11px system-ui, sans-serif';
    ctx.lineWidth = 1;
    for (let yd = 5; yd <= maxYd; yd += 5) {
      ctx.beginPath();
      ctx.arc(cx, cy, yd * scale, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillText(`${yd}y`, cx + 3, cy - yd * scale + 12);
    }

    // Reference at center, facing up (a triangle).
    ctx.fillStyle = '#e05252';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 9);
    ctx.lineTo(cx - 7, cy + 6);
    ctx.lineTo(cx + 7, cy + 6);
    ctx.closePath();
    ctx.fill();

    // Raid cohort dots + centroid at the scrubbed moment.
    const ref = this.refId();
    if (ref != null && read) {
      const fight = this.fight();
      const cohort = (fight?.friendlyPlayers ?? []).filter(id => id !== this.playerId());
      const rel = relativePositionsAt(cohort, this.timelines(), ref, this.scrubT());
      ctx.fillStyle = muted;
      for (const p of rel.values()) {
        const [x, y] = toScreen(p);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
      if (read.centroid) {
        const [x, y] = toScreen(read.centroid);
        ctx.strokeStyle = '#5b9bd5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    // Player trail polyline (before -> after), with before/after markers.
    if (trail.length) {
      ctx.strokeStyle = gold;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2;
      ctx.beginPath();
      trail.forEach((p, i) => {
        const [x, y] = toScreen(p);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;

      const tCast = this.instance()?.t ?? 0;
      for (const p of trail) {
        const [x, y] = toScreen(p);
        const isAtCast = Math.abs(p.t - tCast) < TRAIL_STEP_S / 2;
        ctx.beginPath();
        ctx.arc(x, y, isAtCast ? 0 : 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = p.t < tCast ? muted : gold;
        if (!isAtCast) ctx.fill();
      }
      // At-cast marker (diamond).
      const atCast = trail.find(p => Math.abs(p.t - tCast) < TRAIL_STEP_S / 2);
      if (atCast) {
        const [x, y] = toScreen(atCast);
        ctx.fillStyle = gold;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-5, -5, 10, 10);
        ctx.restore();
      }
    }

    // Player current position at the scrubbed moment (filled gold dot + facing arrow).
    if (read?.player) {
      const [x, y] = toScreen(read.player);
      // Facing arrow: heading unit vector in the reference frame -> screen (up = -fwd).
      if (read.player.headFwd != null && read.player.headRight != null) {
        const len = 16;
        const ex = x + read.player.headRight * len;
        const ey = y - read.player.headFwd * len;
        ctx.strokeStyle = gold;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        // Arrowhead.
        const ang = Math.atan2(ey - y, ex - x);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 5 * Math.cos(ang - 0.4), ey - 5 * Math.sin(ang - 0.4));
        ctx.lineTo(ex - 5 * Math.cos(ang + 0.4), ey - 5 * Math.sin(ang + 0.4));
        ctx.closePath();
        ctx.fillStyle = gold;
        ctx.fill();
      }
      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}
