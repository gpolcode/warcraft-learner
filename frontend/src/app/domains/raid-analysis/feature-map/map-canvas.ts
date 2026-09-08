import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect,
  inject, signal, viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReferenceSelector } from '../data/encounter/positioning.models';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import { LoadState, RenderableLoadError } from '../../shared/ui-load-state/load-state';
import { MapFeatureService, MapReadout } from '../data/map/map-feature-service';
import { RelPos } from '../data/map/map-draw-service';

const STEP_S = 0.5;
/** Clamped per frame so a backgrounded-then-resumed tab does not jump the scrubber by the whole elapsed gap. */
const MAX_FRAME_DT_S = 0.1;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-map-canvas',
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, FormatDurationPipe, LoadState],
  templateUrl: './map-canvas.html',
})
export class MapCanvas {
  private readonly map = inject(MapFeatureService);

  protected readonly positions = this.map.positions;
  protected readonly live = this.map.live;
  protected readonly anchorTime = this.map.anchorTime;
  /** Renderable bench/overlay failure; a `missing` bench is excluded (it shows the empty placeholder). */
  protected readonly loadError = computed<RenderableLoadError | null>(() => {
    const error = this.map.error();
    return error && error.kind !== 'missing' ? error : null;
  });

  protected readonly selector = signal<ReferenceSelector>({ kind: 'boss' });
  protected readonly scrubT = signal(0);
  protected readonly playing = signal(false);
  private rafId: number | null = null;
  private lastFrameMs = 0;
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly refEnemies = computed(() => {
    const positions = this.positions();
    return positions ? this.map.listReferenceEnemies(positions) : [];
  });

  protected readonly refValue = computed(() => {
    const selector = this.selector();
    return selector.kind === 'boss' ? 'boss' : selector.gameId;
  });

  protected readonly preS = this.map.preS;
  protected readonly postS = this.map.postS;
  protected readonly windowStart = computed(() => this.anchorTime() - this.preS());
  protected readonly windowEnd = computed(() => this.anchorTime() + this.postS());

  /** Scaling every stored row into a sample is the expensive step, so caching it here keeps playback cheap: each frame just interpolates the cached timelines. */
  private readonly parseTimelines = computed(() => this.map.parseTimelinesFor(this.positions(), this.selector()));

  private readonly benchTrails = computed(() =>
    this.map.benchTrailsAt(this.parseTimelines(), this.anchorTime(), this.preS(), this.postS(), STEP_S));

  private readonly liveRefId = computed(() => this.map.liveRefIdOf(this.live(), this.selector()));

  private readonly liveTrail = computed(() =>
    this.map.liveTrailAt(this.live(), this.liveRefId(), this.anchorTime(), this.preS(), this.postS(), STEP_S));

  protected readonly readout = computed<MapReadout | null>(() =>
    this.positions() ? this.map.readoutAt(this.parseTimelines(), this.live(), this.liveRefId(), this.scrubT()) : null);

  constructor() {
    inject(DestroyRef).onDestroy(() => { this.stopTimer(); });
    effect(() => {
      this.anchorTime();
      this.selector.set(this.map.reference());
      this.pause();
      this.scrubT.set(this.anchorTime());
    });
    effect(() => {
      const el = this.canvas()?.nativeElement;
      this.benchTrails(); this.liveTrail(); this.scrubT(); this.readout();
      if (el) this.draw(el);
    });
  }

  protected onRefChange(value: 'boss' | number): void {
    this.selector.set(value === 'boss' ? { kind: 'boss' } : { kind: 'enemy', gameId: value });
  }

  protected onScrub(value: number): void { this.pause(); this.scrubT.set(value); }

  protected togglePlay(): void {
    if (this.playing()) this.pause();
    else this.play();
  }

  private play(): void {
    if (this.scrubT() >= this.windowEnd() - 1e-6) this.scrubT.set(this.windowStart());
    this.playing.set(true);
    this.stopTimer();
    this.lastFrameMs = 0;
    const step = (nowMs: number): void => {
      const dt = this.lastFrameMs ? Math.min((nowMs - this.lastFrameMs) / 1000, MAX_FRAME_DT_S) : 0;
      this.lastFrameMs = nowMs;
      const next = this.scrubT() + dt;
      this.scrubT.set(next >= this.windowEnd() ? this.windowStart() : next);
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  protected pause(): void {
    this.playing.set(false);
    this.stopTimer();
  }

  private stopTimer(): void {
    if (this.rafId != null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  }

  private draw(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cssW = canvas.clientWidth || 600;
    const cssH = canvas.clientHeight || 420;
    resetSurface(canvas, ctx, cssW, cssH);

    const benchTrails = this.benchTrails();
    const liveTrail = this.liveTrail();
    const read = this.readout();
    const frame = buildFrame(canvas, ctx, cssW, cssH, benchTrails, liveTrail);

    drawRangeRings(frame);
    drawReference(frame);
    drawBenchTrails(frame, benchTrails);
    drawBenchNow(frame, read);
    drawLive(frame, liveTrail, read);
  }
}

interface Palette {
  gold: string;
  border: string;
  muted: string;
  enemy: string;
  ranked: string;
  outline: string;
}

interface Frame {
  ctx: CanvasRenderingContext2D;
  toScreen: (point: { fwd: number; right: number }) => [number, number];
  palette: Palette;
  cx: number;
  cy: number;
  scale: number;
  maxYd: number;
}

function resetSurface(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, cssW: number, cssH: number): void {
  const dpr = globalThis.devicePixelRatio || 1;
  // Only resize the backing buffer when it changed: assigning width/height reallocates + clears it, wasted work every frame during playback.
  const bufW = Math.round(cssW * dpr);
  const bufH = Math.round(cssH * dpr);
  if (canvas.width !== bufW || canvas.height !== bufH) {
    canvas.width = bufW;
    canvas.height = bufH;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
}

// The canvas draws imperatively and cannot consume `var(--token)`, so design tokens are resolved to concrete values here.
function readPalette(canvas: HTMLCanvasElement): Palette {
  const css = getComputedStyle(canvas);
  const token = (name: string): string => css.getPropertyValue(name).trim();
  return {
    gold: token('--color-gold'),
    border: token('--color-line'),
    muted: token('--color-muted'),
    enemy: token('--color-critical'),
    ranked: token('--color-accent'),
    outline: token('--map-dot-outline'),
  };
}

function maxYards(benchTrails: RelPos[][], liveTrail: RelPos[]): number {
  let maxYd = 10;
  for (const trail of benchTrails) for (const point of trail) maxYd = Math.max(maxYd, point.dist);
  for (const point of liveTrail) maxYd = Math.max(maxYd, point.dist);
  return Math.ceil(maxYd / 5) * 5 + 5;
}

function buildFrame(
  canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, cssW: number, cssH: number,
  benchTrails: RelPos[][], liveTrail: RelPos[],
): Frame {
  const cx = cssW / 2, cy = cssH / 2;
  const radiusPx = Math.min(cssW, cssH) / 2 - 28;
  const maxYd = maxYards(benchTrails, liveTrail);
  const scale = radiusPx / maxYd;
  return {
    ctx, cx, cy, scale, maxYd,
    palette: readPalette(canvas),
    toScreen: point => [cx + point.right * scale, cy - point.fwd * scale],
  };
}

function drawRangeRings({ ctx, cx, cy, scale, maxYd, palette }: Frame): void {
  ctx.strokeStyle = palette.border; ctx.fillStyle = palette.muted;
  ctx.font = '11px system-ui, sans-serif'; ctx.lineWidth = 1;
  for (let yd = 5; yd <= maxYd; yd += 5) {
    ctx.beginPath(); ctx.arc(cx, cy, yd * scale, 0, 2 * Math.PI); ctx.stroke();
    ctx.fillText(`${yd}y`, cx + 3, cy - yd * scale + 12);
  }
}

function drawReference({ ctx, cx, cy, palette }: Frame): void {
  ctx.fillStyle = palette.enemy;
  ctx.beginPath(); ctx.moveTo(cx, cy - 9); ctx.lineTo(cx - 7, cy + 6); ctx.lineTo(cx + 7, cy + 6); ctx.closePath(); ctx.fill();
}

function strokeTrail({ ctx, toScreen }: Frame, trail: RelPos[]): void {
  ctx.beginPath();
  let prev: RelPos | undefined;
  for (const point of trail) {
    const [x, y] = toScreen(point);
    if (prev && point.mapID === prev.mapID) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    prev = point;
  }
  ctx.stroke();
}

function drawBenchTrails(frame: Frame, benchTrails: RelPos[][]): void {
  const { ctx, palette } = frame;
  ctx.strokeStyle = palette.muted; ctx.globalAlpha = 0.25; ctx.lineWidth = 1.5;
  for (const trail of benchTrails) strokeTrail(frame, trail);
  ctx.globalAlpha = 1;
}

function drawBenchNow(frame: Frame, read: MapReadout | null): void {
  const { ctx, toScreen, palette } = frame;
  ctx.fillStyle = palette.muted;
  for (const point of read?.benchNow ?? []) { const [x, y] = toScreen(point); ctx.beginPath(); ctx.arc(x, y, 3, 0, 2 * Math.PI); ctx.fill(); }
  if (!read?.centroid) return;
  const [x, y] = toScreen(read.centroid);
  ctx.strokeStyle = palette.ranked; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 7, 0, 2 * Math.PI); ctx.stroke();
}

function drawLive(frame: Frame, liveTrail: RelPos[], read: MapReadout | null): void {
  const { ctx, toScreen, palette } = frame;
  if (liveTrail.length) {
    ctx.strokeStyle = palette.gold; ctx.globalAlpha = 0.5; ctx.lineWidth = 2;
    strokeTrail(frame, liveTrail);
    ctx.globalAlpha = 1;
  }
  if (!read?.player) return;
  const [x, y] = toScreen(read.player);
  const r = 5;
  ctx.fillStyle = palette.gold;
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = palette.outline; ctx.lineWidth = 1; ctx.stroke();
}
