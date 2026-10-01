import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { markBackendReady } from "@/lib/api/backend-ready";
import { server } from "@/mocks/node";
import { store } from "@/mocks/engine/store";

// jsdom has no IntersectionObserver: report every observed element as visible, so "on first view"
// animations settle immediately in tests.
class VisibleIntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe(target: Element) {
    this.callback([{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver ??= VisibleIntersectionObserver as unknown as typeof IntersectionObserver;

// The Node MSW server is installed below; API calls may proceed.
markBackendReady();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  store.reset();
});
afterAll(() => server.close());
