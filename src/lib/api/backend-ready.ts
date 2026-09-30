/**
 * Resolves when the API can be called. In "http" mode that's immediately; in "mock" mode it waits
 * for the in-browser demo backend (MSW) to start. Requests wait on this instead of the whole page
 * waiting, so pages render (and show their own loading states) straight away.
 */
let resolveReady: () => void = () => undefined;

export const backendReady: Promise<void> =
  process.env.NEXT_PUBLIC_API_MODE === "http" || typeof window === "undefined"
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        resolveReady = resolve;
      });

export function markBackendReady(): void {
  resolveReady();
}
