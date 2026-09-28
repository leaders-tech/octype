/*
This file loads shared test setup for frontend unit tests.
Edit this file when all frontend tests need another shared setup step.
Copy the setup style here when you add another global frontend test helper.
*/

import "@testing-library/jest-dom/vitest";

// jsdom has no layout, observers, media queries, or canvas. The page only needs them for animation, so tests get quiet stand-ins.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

// Plain assignments (not vi.stubGlobal) so tests that call vi.unstubAllGlobals() keep them.
Object.assign(globalThis, { ResizeObserver: NoopObserver, IntersectionObserver: NoopObserver });

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement["getContext"];
