import { ApplicationRef, DestroyRef, EnvironmentInjector, Type, createComponent, provideZonelessChangeDetection } from '@angular/core';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { TuiRoot } from '@taiga-ui/core';

export interface MountedVm<T> {
  /** The component instance, typed loosely so protected computeds are readable. */
  vm: T & Record<string, unknown>;
  setInput: (name: string, value: unknown) => void;
}

/** Never calls `detectChanges()`, so the lifecycle hooks where components do their network I/O never run. */
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

/** Taiga renders drawers, dropdowns and toasts into a `tui-root`'s portal layer, outside the component under test, so a spec that opens one mounts that layer first. */
export function mountPortalLayer(): HTMLElement {
  const root = createComponent(TuiRoot, { environmentInjector: TestBed.inject(EnvironmentInjector) });
  const element = root.location.nativeElement as HTMLElement;
  TestBed.inject(ApplicationRef).attachView(root.hostView);
  document.body.appendChild(element);
  root.changeDetectorRef.detectChanges();
  TestBed.inject(DestroyRef).onDestroy(() => {
    root.destroy();
    element.remove();
  });
  return element;
}

interface DomScope {
  text: () => string;
  query: (selector: string) => HTMLElement | null;
  queryAll: (selector: string) => HTMLElement[];
  textAll: (selector: string) => string[];
  click: (selector: string) => void;
}

export interface MountedDom extends DomScope {
  /** The portal layer's drawers, dropdowns and toasts. Requires `portals` on `mountDom`. */
  portal: DomScope;
  dispatch: (target: HTMLElement, event: Event) => void;
  setInput: (name: string, value: unknown) => void;
  on: (name: string) => unknown[];
  detectChanges: () => void;
  /** Renders every `@defer` block to its complete state. Requires `manualDeferBlocks` on `mountDom`. */
  completeDeferBlocks: () => Promise<void>;
}

export function mountDom<T>(
  type: Type<T>,
  inputs: Record<string, unknown> = {},
  providers: unknown[] = [],
  { manualDeferBlocks = false, portals = false }: { manualDeferBlocks?: boolean; portals?: boolean } = {},
): MountedDom {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [type],
    providers: [provideZonelessChangeDetection(), ...(providers as never[])],
    ...(manualDeferBlocks ? { deferBlockBehavior: DeferBlockBehavior.Manual } : {}),
  });
  const portalLayer = portals ? mountPortalLayer() : null;
  const fixture = TestBed.createComponent(type);
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  fixture.detectChanges();
  const render = (): void => { fixture.detectChanges(); };
  return {
    ...domScope(fixture.nativeElement as HTMLElement, render),
    get portal(): DomScope {
      if (!portalLayer) throw new Error('portal: mount with { portals: true } to read the portal layer');
      return domScope(portalLayer, render);
    },
    dispatch: (target, event) => { target.dispatchEvent(event); fixture.detectChanges(); },
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
    completeDeferBlocks: async () => {
      for (const block of await fixture.getDeferBlocks()) await block.render(DeferBlockState.Complete);
      fixture.detectChanges();
    },
  };
}

function domScope(host: HTMLElement, render: () => void): DomScope {
  const clean = (el: Element): string => el.textContent.replace(/\s+/g, ' ').trim();
  // `querySelector` matches a selector against the whole document, so an unscoped `div > div:last-child` can bind to a TestBed wrapper outside the component.
  const scoped = (selector: string): string => selector.startsWith(':scope') ? selector : `:scope ${selector}`;
  const query = (selector: string): HTMLElement | null => host.querySelector(scoped(selector));
  return {
    text: () => clean(host),
    query,
    queryAll: (selector) => Array.from(host.querySelectorAll<HTMLElement>(scoped(selector))),
    textAll: (selector) => Array.from(host.querySelectorAll(scoped(selector))).map(clean),
    click: (selector) => {
      const el = query(selector);
      if (!el) throw new Error(`click: no element matches ${selector}`);
      el.click();
      render();
    },
  };
}

const STATUS_COLOR_CLASS = /^text-(critical|warning|success|accent|muted)$/;

export function statusColor(el: HTMLElement | null): string | null {
  for (const cls of Array.from(el?.classList ?? [])) {
    const match = STATUS_COLOR_CLASS.exec(cls);
    if (match) return match[1] ?? null;
  }
  return null;
}
