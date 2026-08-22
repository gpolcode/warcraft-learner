/** Harness for testing signal view-models; deliberately does NOT call `detectChanges()`, so lifecycle hooks (`ngOnInit`/`ngOnChanges`) - where components do their network I/O - never run. */
import { Type, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

export interface MountedVm<T> {
  /** The component instance, typed loosely so protected computeds are readable. */
  vm: T & Record<string, unknown>;
  setInput: (name: string, value: unknown) => void;
}

export function mountVm<T>(
  type: Type<T>,
  inputs: Record<string, unknown> = {},
  providers: unknown[] = [],
): MountedVm<T> {
  TestBed.configureTestingModule({
    imports: [type],
    providers: [provideZonelessChangeDetection(), ...(providers as never[])],
  });
  const fixture = TestBed.createComponent(type);
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  return {
    vm: fixture.componentInstance as T & Record<string, unknown>,
    setInput: (name, value) => { fixture.componentRef.setInput(name, value); },
  };
}

export interface MountedDom {
  /** Whitespace-collapsed text of the whole host, for asserting on rendered copy. */
  text: () => string;
  /** First match, or null when the branch under test renders nothing. */
  query: (selector: string) => HTMLElement | null;
  queryAll: (selector: string) => HTMLElement[];
  /** Whitespace-collapsed text of each match, the usual shape for asserting on a list of rows or chips. */
  textAll: (selector: string) => string[];
  /** Dispatches a real event and re-renders, so a click reaches the same handler the browser would. */
  dispatch: (target: HTMLElement, event: Event) => void;
  click: (selector: string) => void;
  setInput: (name: string, value: unknown) => void;
  /** Collects everything the named output emits; the array fills as the test drives the DOM. */
  on: (name: string) => unknown[];
  detectChanges: () => void;
}

/** Renders a component and reads it back through the DOM, which is the seam its consumers actually see. */
export function mountDom<T>(
  type: Type<T>,
  inputs: Record<string, unknown> = {},
  providers: unknown[] = [],
): MountedDom {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [type],
    providers: [provideZonelessChangeDetection(), ...(providers as never[])],
  });
  const fixture = TestBed.createComponent(type);
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  fixture.detectChanges();
  const host = fixture.nativeElement as HTMLElement;
  const clean = (el: Element): string => el.textContent.replace(/\s+/g, ' ').trim();
  // Unscoped selectors match against the whole document, so a structural one like `div > div:last-child` can bind to a TestBed wrapper outside the component and return the wrong node.
  const scoped = (selector: string): string => selector.startsWith(':scope') ? selector : `:scope ${selector}`;
  const query = (selector: string): HTMLElement | null => host.querySelector(scoped(selector));
  return {
    text: () => clean(host),
    query,
    queryAll: (selector) => Array.from(host.querySelectorAll<HTMLElement>(scoped(selector))),
    textAll: (selector) => Array.from(host.querySelectorAll(scoped(selector))).map(clean),
    dispatch: (target, event) => { target.dispatchEvent(event); fixture.detectChanges(); },
    click: (selector) => {
      const el = query(selector);
      if (!el) throw new Error(`click: no element matches ${selector}`);
      el.click();
      fixture.detectChanges();
    },
    setInput: (name, value) => { fixture.componentRef.setInput(name, value); fixture.detectChanges(); },
    on: (name) => {
      const emitted: unknown[] = [];
      const source = (fixture.componentInstance as Record<string, unknown>)[name] as
        { subscribe: (fn: (value: unknown) => void) => unknown } | undefined;
      if (!source) throw new Error(`on: ${type.name} has no output named ${name}`);
      source.subscribe(value => emitted.push(value));
      return emitted;
    },
    detectChanges: () => { fixture.detectChanges(); },
  };
}

// A status badge reaches the DOM only as its class, so this reads the semantic half back out.
const BADGE_CLASS = /^badge-(\w+)$/;

export function badgeStatus(el: HTMLElement | null): string | null {
  for (const cls of Array.from(el?.classList ?? [])) {
    const match = BADGE_CLASS.exec(cls);
    if (match) return match[1] ?? null;
  }
  return null;
}
