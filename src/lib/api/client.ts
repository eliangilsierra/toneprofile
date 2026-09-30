import createClient from "openapi-fetch";
import type { paths } from "./schema";
import { backendReady } from "./backend-ready";
import { ApiError, toApiError } from "./errors";

// Same-origin: in "http" mode Next rewrites /api/v1/* to the backend; in "mock" mode MSW answers.
// Absolute when a window exists so the same client works under jsdom (tests).
export const api = createClient<paths>({
  baseUrl: typeof window === "undefined" ? "/api" : `${window.location.origin}/api`,
  // Resolve fetch at call time so interceptors installed later (MSW, instrumentation) apply, and
  // wait for the demo backend when running in mock mode.
  fetch: async (request) => {
    await backendReady;
    return globalThis.fetch(request);
  },
});

type FetchResult<T> = { data?: T; error?: unknown; response: Response };

/**
 * Unwraps an openapi-fetch result: returns data or throws a typed ApiError.
 * Network failures (fetch rejects) are converted too.
 */
export async function unwrap<T>(request: Promise<FetchResult<T>>): Promise<T> {
  let result: FetchResult<T>;
  try {
    result = await request;
  } catch (error) {
    throw toApiError(error);
  }
  if (result.error !== undefined || !result.response.ok) {
    throw toApiError(result.error, result.response.status);
  }
  if (result.data === undefined) {
    throw new ApiError({ code: "unknown", status: result.response.status, retryable: false });
  }
  return result.data;
}

export const apiMode: "mock" | "http" =
  process.env.NEXT_PUBLIC_API_MODE === "http" ? "http" : "mock";
