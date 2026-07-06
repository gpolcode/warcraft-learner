import { describe, it, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BenchEmptyBannerComponent, RenderableLoadError } from './bench-empty-banner';

const TRANSIENT_ERROR: RenderableLoadError = { kind: 'transient', message: 'WCL is unreachable right now.' };
const PERMANENT_ERROR: RenderableLoadError = {
  kind: 'permanent', message: 'Analysis data could not be loaded.', id: 'gear.combatant-info',
};

interface Rendered {
  readonly text: string;
  readonly icon: string;
  readonly iconClasses: string;
}

function render(inputs: Record<string, unknown>): Rendered {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [BenchEmptyBannerComponent],
    providers: [provideZonelessChangeDetection()],
  });
  const fixture = TestBed.createComponent(BenchEmptyBannerComponent);
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  fixture.detectChanges();
  const host = fixture.nativeElement as HTMLElement;
  const iconEl = host.querySelector('mat-icon');
  return {
    text: (host.textContent ?? '').replace(/\s+/g, ' ').trim(),
    icon: (iconEl?.textContent ?? '').trim(),
    iconClasses: iconEl?.className ?? '',
  };
}

describe('BenchEmptyBannerComponent', () => {
  describe('not-yet-ingested banner (no error)', () => {
    it('names the encounter in the headline', () => {
      expect(render({ encounter: 'Chimaerus, the Undreamt God' }).text)
        .toContain('No benchmark for Chimaerus, the Undreamt God yet');
    });

    it('lists the three ingest steps', () => {
      const { text } = render({ encounter: 'Boss' });
      expect(text).toContain('Mythic kills logged');
      expect(text).toContain('Ingest samples them');
      expect(text).toContain('waiting');
      expect(text).toContain('hourly');
      expect(text).toContain('automatic');
    });

    it('uses the post-raid copy by default (Comparisons unlock)', () => {
      const { text } = render({ encounter: 'Boss', variant: 'post' });
      expect(text).toContain('Your pull graded against the spec rulebook below.');
      expect(text).toContain('Comparisons unlock');
      expect(text).toContain('The sections below fill in.');
    });

    it('uses the pre-fight copy for the pre variant (Plan unlocks)', () => {
      const { text } = render({ encounter: 'Boss', variant: 'pre' });
      expect(text).toContain('The pre-fight plan is built entirely from top-parse logs.');
      expect(text).toContain('Plan unlocks');
      expect(text).toContain('The cards below fill in.');
    });
  });

  describe('error header (shared with every card)', () => {
    it('renders a transient error with its message, the cloud_off icon and a retry-on-sync guide', () => {
      const { text, icon, iconClasses } = render({ error: TRANSIENT_ERROR });
      expect(text).toContain(TRANSIENT_ERROR.message);
      expect(text).toContain('Retries on the next sync, or reselect the fight.');
      expect(icon).toBe('cloud_off');
      expect(iconClasses).toContain('text-[var(--info)]');
    });

    it('renders a permanent error with its message, the error icon and a do-not-retry line', () => {
      const { text, icon, iconClasses } = render({ error: PERMANENT_ERROR });
      expect(text).toContain(PERMANENT_ERROR.message);
      expect(text).toContain('This analysis is bugged. Retrying will not fix it.');
      expect(icon).toBe('error');
      expect(iconClasses).toContain('text-[var(--info)]');
    });

    it('does not show the ingest pipeline for an error', () => {
      expect(render({ error: TRANSIENT_ERROR }).text).not.toContain('Mythic kills logged');
    });
  });
});
