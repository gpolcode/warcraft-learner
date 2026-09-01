import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { mountDom } from '../../../../../testing/component-harness';
import { whenDeferred } from '../../../../../testing/when-stable';
import { LiveCaptureFeatureService } from '../facade/live-capture-feature-service';
import { ClipPanel } from './clip-panel';

const INTRO = 'Plays your screen recording of this moment on a loop.';

describe('ClipPanel', () => {
  it('says what the replay plays under the heading', async () => {
    const dom = mountDom(ClipPanel);
    TestBed.inject(LiveCaptureFeatureService).open.set(true);
    await whenDeferred();
    dom.detectChanges();

    expect(dom.text()).toContain('Replay');
    expect(dom.text()).toContain(INTRO);
  });

  it('renders nothing while no clip is open', async () => {
    const dom = mountDom(ClipPanel);
    await whenDeferred();
    dom.detectChanges();

    expect(dom.text()).toBe('');
  });
});
