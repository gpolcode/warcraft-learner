import { describe, it, expect } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { EmptyState } from './empty-state';

@Component({
  imports: [EmptyState],
  template: `<wl-empty-state [icon]="icon" [tone]="tone">No talent data.</wl-empty-state>`,
})
class Host {
  icon = 'help_outline';
  tone: 'muted' | 'success' = 'muted';
}

function render(over: Partial<Host> = {}): HTMLElement {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, over);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('EmptyState', () => {
  it('shows the projected message in a block status', () => {
    const host = render();
    expect(host.querySelector('tui-block-status')?.textContent.replace(/\s+/g, ' ').trim()).toBe('No talent data.');
  });

  it('draws the help icon in the muted color by default', () => {
    const icon = render().querySelector('tui-icon');
    expect(icon?.getAttribute('data-icon-start')).toBe('help_outline');
    expect(icon?.classList.contains('text-muted')).toBe(true);
    expect(icon?.classList.contains('text-success')).toBe(false);
  });

  it('draws the given icon in the success color for a clean result', () => {
    const icon = render({ icon: 'check_circle', tone: 'success' }).querySelector('tui-icon');
    expect(icon?.getAttribute('data-icon-start')).toBe('check_circle');
    expect(icon?.classList.contains('text-success')).toBe(true);
    expect(icon?.classList.contains('text-muted')).toBe(false);
  });
});
