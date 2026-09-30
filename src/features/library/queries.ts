"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";

export function useGenerations() {
  return useQuery({
    queryKey: queryKeys.generations,
    queryFn: () => unwrap(api.GET("/v1/generations", { params: { query: { limit: 50 } } })),
    // Keep running items fresh while the library is open.
    refetchInterval: (query) =>
      query.state.data?.items.some((item) => item.status === "queued" || item.status === "running") ? 2000 : false,
  });
}
