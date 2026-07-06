import { describe, it, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LoadErrorComponent, RenderableLoadError } from './load-error';

const TRANSIENT_MESSAGE = 'WCL is unreachable right now.';
const PERMANENT_MESSAGE = 'Analysis data could not be loaded.';
const PERMANENT_ID = 'gear.combatant-info';

const TRANSIENT_ERROR: RenderableLoadError = { kind: 'transient', message: TRANSIENT_MESSAGE };
const PERMANENT_ERROR: RenderableLoadError = { kind: 'permanent', message: PERMANENT_MESSAGE, id: PERMANENT_ID };

const TRANSIENT_ICON = 'cloud_off';
const PERMANENT_ICON = 'error';

interface Rendered {
  readonly text: string;
  readonly icon: string;
  readonly iconClasses: string;
}

function render(error: RenderableLoadError): Rendered {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [LoadErrorComponent],
    providers: [provideZonelessChangeDetection()],
  });
  const fixture = TestBed.createComponent(LoadErrorComponent);
  fixture.componentRef.setInput('error', error);
  fixture.detectChanges();
  const host = fixture.nativeElement as HTMLElement;
  const iconEl = host.querySelector('mat-icon');
  return {
    text: (host.textContent ?? '').replace(/\s+/g, ' ').trim(),
    icon: (iconEl?.textContent ?? '').trim(),
    iconClasses: iconEl?.className ?? '',
  };
}

describe('LoadErrorComponent', () => {
  it('renders the transient message with the transient icon and a retry-on-sync guide, no button', () => {
    const rendered = render(TRANSIENT_ERROR);
    expect(rendered.text).toContain(TRANSIENT_MESSAGE);
    expect(rendered.text).toContain('Retries on the next sync, or reselect the fight.');
    expect(rendered.icon).toBe(TRANSIENT_ICON);
    expect(document.querySelector('button')).toBeNull();
  });

  it('renders the permanent message with the permanent icon and a do-not-retry line', () => {
    const rendered = render(PERMANENT_ERROR);
    expect(rendered.text).toContain(PERMANENT_MESSAGE);
    expect(rendered.text).toContain('This analysis is bugged. Retrying will not fix it.');
    expect(rendered.icon).toBe(PERMANENT_ICON);
  });

  it('visually distinguishes the two kinds by icon and status class', () => {
    const transientRendered = render(TRANSIENT_ERROR);
    const permanentRendered = render(PERMANENT_ERROR);
    expect(transientRendered.icon).not.toBe(permanentRendered.icon);
    expect(transientRendered.iconClasses).toContain('badge-warning');
    expect(permanentRendered.iconClasses).toContain('badge-critical');
  });
});
