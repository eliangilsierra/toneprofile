import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "@/mocks/node";
import { store } from "@/mocks/engine/store";
import { markBackendReady } from "@/lib/api/backend-ready";

// The Node MSW server is installed below; API calls may proceed.
markBackendReady();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  store.reset();
});
afterAll(() => server.close());
