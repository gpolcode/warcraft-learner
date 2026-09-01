import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FlyoverPanel } from '../../shared/ui-flyover-panel/flyover-panel';
import { MapFeatureService } from '../data/map/map-feature-service';
import { MapCanvas } from './map-canvas';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-map-panel',
  imports: [FlyoverPanel, MapCanvas],
  templateUrl: './map-panel.html',
})
export class MapPanel {
  protected readonly map = inject(MapFeatureService);
}
