// Taiga reads these browser APIs at construction (dark mode, breakpoints, scrolling a focused option into view, resize tracking) and jsdom implements none of them.
const win: Partial<Window> = window;
const element: Partial<Element> = Element.prototype;
const scope: Partial<typeof globalThis> = globalThis;

win.matchMedia ??= (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => undefined,
  removeListener: () => undefined,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  dispatchEvent: () => false,
});

element.scrollIntoView ??= () => undefined;

scope.ResizeObserver ??= class {
  observe(): void { return undefined; }
  unobserve(): void { return undefined; }
  disconnect(): void { return undefined; }
};
