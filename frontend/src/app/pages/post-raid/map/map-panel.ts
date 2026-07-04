import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MapFeatureService } from './map.service';
import { MapCanvasComponent } from './map-canvas';

/**
 * Host for the positioning map: a full-screen sheet on mobile, a right-side drawer on
 * desktop (the responsive switch is pure Tailwind `md:` utilities in the template). A
 * feature component - it injects exactly one service (`MapFeatureService`) and renders the
 * canvas when the panel is open. The page renders this once and wires other cards'
 * `openMap` outputs into `MapFeatureService.openAt`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-map-panel',
  imports: [MatButtonModule, MatIconModule, MapCanvasComponent],
  templateUrl: './map-panel.html',
})
export class MapPanelComponent {
  protected readonly map = inject(MapFeatureService);
}
