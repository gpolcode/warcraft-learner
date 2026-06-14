import {
  ChangeDetectionStrategy, Component, ElementRef, computed, effect,
  input, signal, viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { EncounterPositions, ReferenceSelector } from '../../../core/models/positioning.models';
import {
  ActorTimeline, RelPos, buildTrail, listReferenceEnemies, positionAt,
  toReferenceLocal, topParsePoints, topParseTrails,
} from '../../../core/services/positioning-core';
import { FormatDurationPipe } from '../../pipes/format-duration-pipe';

const STEP_S = 0.5;

/** Live player overlay: live-pull timelines plus how to resolve the reference actor per selector. */
export interface LiveOverlay {
  timelines: Map<number, ActorTimeline>;
  playerId: number;
  /** Live boss actor id (matched to the ingested boss). */
  bossActorId: number | null;
  /** gameID -> live actor id, so a chosen enemy reference maps to this pull's actor. */
  refActorByGameId: Map<number, number>;
}

/**
 * The positioning map: top-parse benchmark (ingested) of where the best players
 * of this spec stood relative to a reference (boss or add), with an optional
 * overlay of the analysed player's own trail. Reference is switchable; a
 * scrubber steps through the window around the anchor time.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-positioning-map',
  imports: [MatFormFieldModule, MatSelectModule, MatSliderModule, DecimalPipe, FormatDurationPipe],
  templateUrl: './positioning-map.html',
})
export class PositioningMapComponent {
  readonly positions = input<EncounterPositions | null>(null);
  readonly anchorTime = input.required<number>();
  readonly pre = input(6);
  readonly post = input(3);
  readonly contextLabel = input('');
  readonly live = input<LiveOverlay | null>(null);
  /** Initial reference: boss (default) or a specific enemy gameID. */
  readonly defaultReference = input<ReferenceSelector>({ kind: 'boss' });

  protected readonly selector = signal<ReferenceSelector>({ kind: 'boss' });
  protected readonly scrubT = signal(0);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly refEnemies = computed(() => {
    const p = this.positions();
    return p ? listReferenceEnemies(p) : [];
  });

  /** mat-select value: 'boss' or the enemy gameId. */
  protected readonly refValue = computed(() => {
    const s = this.selector();
    return s.kind === 'boss' ? 'boss' : s.gameId;
  });

  protected readonly windowStart = computed(() => this.anchorTime() - this.pre());
  protected readonly windowEnd = computed(() => this.anchorTime() + this.post());

  private readonly benchTrails = computed(() => {
    const p = this.positions();
    return p ? topParseTrails(p, this.selector(), this.anchorTime(), this.pre(), this.post(), STEP_S) : [];
  });

  /** Live reference actor id for the current selector. */
  private readonly liveRefId = computed(() => {
    const l = this.live();
    if (!l) return null;
    const s = this.selector();
    return s.kind === 'boss' ? l.bossActorId : (l.refActorByGameId.get(s.gameId) ?? null);
  });

  private readonly liveTrail = computed<RelPos[]>(() => {
    const l = this.live();
    const refId = this.liveRefId();
    if (!l || refId == null) return [];
    return buildTrail(l.playerId, refId, l.timelines, this.anchorTime(), this.pre(), this.post(), STEP_S);
  });

  /** Readout at the scrubbed moment: top-parse cluster + the player's offset from it. */
  protected readonly readout = computed(() => {
    const p = this.positions();
    if (!p) return null;
    const t = this.scrubT();
    const pts = topParsePoints(p, this.selector(), t);
    let centroid: { fwd: number; right: number } | null = null;
    if (pts.length) {
      centroid = {
        fwd: pts.reduce((s, q) => s + q.fwd, 0) / pts.length,
        right: pts.reduce((s, q) => s + q.right, 0) / pts.length,
      };
    }
    const player = this._livePlayerAt(t);
    const deviation = centroid && player ? Math.hypot(player.fwd - centroid.fwd, player.right - centroid.right) : null;
    return { topCount: pts.length, centroid, player, deviation };
  });

  constructor() {
    effect(() => { this.selector.set(this.defaultReference()); });
    effect(() => { this.anchorTime(); this.scrubT.set(this.anchorTime()); });
    effect(() => {
      const el = this.canvas()?.nativeElement;
      this.benchTrails(); this.liveTrail(); this.scrubT(); this.readout();
      if (el) this._draw(el);
    });
  }

  protected onRefChange(value: 'boss' | number): void {
    this.selector.set(value === 'boss' ? { kind: 'boss' } : { kind: 'enemy', gameId: value });
  }

  protected onScrub(v: number): void { this.scrubT.set(v); }

  private _livePlayerAt(t: number): RelPos | null {
    const l = this.live();
    const refId = this.liveRefId();
    if (!l || refId == null) return null;
    const ref = positionAt(l.timelines.get(refId), t);
    const p = positionAt(l.timelines.get(l.playerId), t);
    if (!ref || !p) return null;
    if (ref.mapID != null && p.mapID != null && ref.mapID !== p.mapID) return null;
    return toReferenceLocal(p, ref, t);
  }

  // --- Canvas ---------------------------------------------------------------

  private _draw(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = globalThis.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 600;
    const cssH = canvas.clientHeight || 420;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const cx = cssW / 2, cy = cssH / 2;
    const radiusPx = Math.min(cssW, cssH) / 2 - 28;

    const benchTrails = this.benchTrails();
    const liveTrail = this.liveTrail();
    const read = this.readout();

    let maxYd = 10;
    for (const tr of benchTrails) for (const q of tr) maxYd = Math.max(maxYd, q.dist);
    for (const q of liveTrail) maxYd = Math.max(maxYd, q.dist);
    maxYd = Math.ceil(maxYd / 5) * 5 + 5;
    const scale = radiusPx / maxYd;
    const toScreen = (q: { fwd: number; right: number }): [number, number] => [cx + q.right * scale, cy - q.fwd * scale];

    const css = getComputedStyle(canvas);
    const gold = css.getPropertyValue('--gold').trim() || '#e5cc80';
    const border = css.getPropertyValue('--border').trim() || 'rgba(255,255,255,0.15)';
    const muted = css.getPropertyValue('--muted').trim() || 'rgba(255,255,255,0.5)';

    // Range rings.
    ctx.strokeStyle = border; ctx.fillStyle = muted; ctx.font = '11px system-ui, sans-serif'; ctx.lineWidth = 1;
    for (let yd = 5; yd <= maxYd; yd += 5) {
      ctx.beginPath(); ctx.arc(cx, cy, yd * scale, 0, 2 * Math.PI); ctx.stroke();
      ctx.fillText(`${yd}y`, cx + 3, cy - yd * scale + 12);
    }

    // Reference at centre, facing up.
    ctx.fillStyle = '#e05252';
    ctx.beginPath(); ctx.moveTo(cx, cy - 9); ctx.lineTo(cx - 7, cy + 6); ctx.lineTo(cx + 7, cy + 6); ctx.closePath(); ctx.fill();

    // Benchmark: faint top-parse trails + their current dots.
    const t = this.scrubT();
    ctx.strokeStyle = muted; ctx.globalAlpha = 0.25; ctx.lineWidth = 1.5;
    for (const tr of benchTrails) {
      ctx.beginPath();
      tr.forEach((q, i) => { const [x, y] = toScreen(q); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const benchNow = this.positions() ? topParsePoints(this.positions()!, this.selector(), t) : [];
    ctx.fillStyle = muted;
    for (const q of benchNow) { const [x, y] = toScreen(q); ctx.beginPath(); ctx.arc(x, y, 3, 0, 2 * Math.PI); ctx.fill(); }
    if (read?.centroid) {
      const [x, y] = toScreen(read.centroid);
      ctx.strokeStyle = '#5b9bd5'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 7, 0, 2 * Math.PI); ctx.stroke();
    }

    // Live player trail + current dot with facing.
    if (liveTrail.length) {
      ctx.strokeStyle = gold; ctx.globalAlpha = 0.5; ctx.lineWidth = 2;
      ctx.beginPath();
      liveTrail.forEach((q, i) => { const [x, y] = toScreen(q); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (read?.player) {
      const [x, y] = toScreen(read.player);
      if (read.player.headFwd != null && read.player.headRight != null) {
        const ex = x + read.player.headRight * 16, ey = y - read.player.headFwd * 16;
        ctx.strokeStyle = gold; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
      }
      ctx.fillStyle = gold;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
    }
  }
}
