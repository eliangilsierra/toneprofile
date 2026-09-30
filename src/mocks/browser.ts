import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

let started: Promise<unknown> | null = null;

/** Starts the demo backend once per page. Unknown requests (assets, fonts) pass through. */
export function startMockBackend(): Promise<unknown> {
  started ??= worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
  return started;
}
