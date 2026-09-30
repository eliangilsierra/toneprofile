"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { markBackendReady } from "@/lib/api/backend-ready";
import { apiMode } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Retry transient failures only; 4xx problems are answers, not glitches.
        retry: (count, error) => error instanceof ApiError && error.retryable && count < 3,
      },
    },
  });
}

/**
 * Starts the in-browser demo backend (mock mode only). Pages render immediately; API requests
 * wait for it through `backendReady` (see lib/api/backend-ready.ts).
 */
function useMockBackend() {
  useEffect(() => {
    if (apiMode !== "mock") return;
    import("@/mocks/browser")
      .then(({ startMockBackend }) => startMockBackend())
      .finally(markBackendReady);
  }, []);
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(makeQueryClient);
  useMockBackend();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
