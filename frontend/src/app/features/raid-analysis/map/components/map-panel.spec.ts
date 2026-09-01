import { describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { mountDom, MountedDom } from '../../../../../testing/component-harness';
import { whenDeferred } from '../../../../../testing/when-stable';
import { mapFeatureStub } from '../../../../../testing/page-stubs';
import { MapFeatureService } from '../facade/map-feature-service';
import { MapPanel } from './map-panel';

const INTRO = 'Replays where top raiders stood through the window this map opened at.';
const PAD_S = 5;

// The canvas mounts with the panel and reads these straight off the service, so a leaner stub throws.
function stub(open: boolean): unknown {
  return mapFeatureStub({
    open: signal(open),
    positions: signal(null),
    live: signal(null),
    error: signal(null),
    anchorTime: signal(0),
    reference: signal({ kind: 'boss' }),
    preS: signal(PAD_S),
    postS: signal(PAD_S),
  });
}

async function render(open: boolean): Promise<MountedDom> {
  const dom = mountDom(MapPanel, {}, [{ provide: MapFeatureService, useValue: stub(open) }]);
  await whenDeferred();
  dom.detectChanges();
  return dom;
}

describe('MapPanel', () => {
  it('says what the map replays under the heading', async () => {
    const dom = await render(true);

    expect(dom.text()).toContain('Positioning');
    expect(dom.text()).toContain(INTRO);
  });

  it('renders nothing while the map is closed', async () => {
    const dom = await render(false);

    expect(dom.text()).toBe('');
  });
});
