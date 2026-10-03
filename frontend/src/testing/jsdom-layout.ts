import { vi } from 'vitest';

// jsdom has no layout, yet the spartan select scrolls its active option into view and measures its trigger with a ResizeObserver.
Element.prototype.scrollIntoView = vi.fn();

class NoLayoutResizeObserver implements ResizeObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
}

globalThis.ResizeObserver = NoLayoutResizeObserver;
