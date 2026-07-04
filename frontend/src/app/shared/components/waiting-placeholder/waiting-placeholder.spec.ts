import { describe, it, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WaitingPlaceholderComponent } from './waiting-placeholder';

function render(inputs: Record<string, unknown>): string {
  TestBed.configureTestingModule({
    imports: [WaitingPlaceholderComponent],
    providers: [provideZonelessChangeDetection()],
  });
  const fixture = TestBed.createComponent(WaitingPlaceholderComponent);
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  fixture.detectChanges();
  return fixture.nativeElement.textContent ?? '';
}

describe('WaitingPlaceholderComponent', () => {
  it('renders the heading and the waiting message', () => {
    const text = render({ heading: 'Offensives' });
    expect(text).toContain('Offensives');
    expect(text).toContain('Waiting for top parses');
  });

  it('renders the optional subtitle and caption when provided', () => {
    const text = render({
      heading: 'Offensives',
      subtitle: 'Offensive cooldowns vs top parses.',
      caption: 'Your cooldown timing has nothing to be compared against yet.',
    });
    expect(text).toContain('Offensive cooldowns vs top parses.');
    expect(text).toContain('Your cooldown timing has nothing to be compared against yet.');
  });

  it('omits the caption when none is given', () => {
    const text = render({ heading: 'Defensives' });
    expect(text).toContain('Defensives');
    expect(text).toContain('Waiting for top parses');
  });
});
