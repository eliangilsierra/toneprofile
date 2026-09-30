"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import { isTerminal, type FeedbackCreate } from "@/lib/api/types";

/** Polls the generation at the cadence the backend suggests until it reaches a terminal state. */
export function useGeneration(id: string, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.generation(id),
    enabled: enabled && Boolean(id),
    queryFn: () => unwrap(api.GET("/v1/generations/{generationId}", { params: { path: { generationId: id } } })),
    staleTime: 0,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      return isTerminal(data.status) ? false : Math.max(400, data.poll_after_ms);
    },
    // Keep polling while the tab is in the background so returning shows the real state.
    refetchIntervalInBackground: true,
  });
}

export function useCancelGeneration(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.POST("/v1/generations/{generationId}/cancel", { params: { path: { generationId: id } } })),
    onSuccess: (generation) => {
      client.setQueryData(queryKeys.generation(id), generation);
      void client.invalidateQueries({ queryKey: queryKeys.generations });
    },
  });
}

export function useRetryGeneration(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.POST("/v1/generations/{generationId}/retry", { params: { path: { generationId: id } } })),
    onSuccess: (generation) => {
      client.setQueryData(queryKeys.generation(id), generation);
      void client.invalidateQueries({ queryKey: queryKeys.generations });
    },
  });
}

export function useToneProfile(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.toneProfile(id ?? ""),
    queryFn: () => unwrap(api.GET("/v1/tone-profiles/{toneProfileId}", { params: { path: { toneProfileId: id! } } })),
    enabled: Boolean(id),
    staleTime: Infinity,
  });
}

export function usePreset(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.preset(id ?? ""),
    queryFn: () => unwrap(api.GET("/v1/presets/{presetId}", { params: { path: { presetId: id! } } })),
    enabled: Boolean(id),
  });
}

export function usePresetVersion(id: string | undefined, version: number | undefined) {
  return useQuery({
    queryKey: queryKeys.presetVersion(id ?? "", version ?? 0),
    queryFn: () =>
      unwrap(api.GET("/v1/presets/{presetId}/versions/{version}", { params: { path: { presetId: id!, version: version! } } })),
    enabled: Boolean(id && version),
    staleTime: Infinity,
  });
}

export function useSendFeedback(presetId: string, version: number) {
  return useMutation({
    mutationFn: async (body: FeedbackCreate) => {
      const result = await api.POST("/v1/presets/{presetId}/versions/{version}/feedback", {
        params: { path: { presetId, version } },
        body,
      });
      if (!result.response.ok) await unwrap(Promise.resolve(result));
    },
  });
}

/** Fetches the device file and hands it to the browser as a download. */
export async function downloadPresetFile(presetId: string, version: number, filename: string) {
  const result = await api.GET("/v1/presets/{presetId}/versions/{version}/download", {
    params: { path: { presetId, version } },
    parseAs: "blob",
  });
  if (!result.response.ok || !result.data) await unwrap(Promise.resolve(result));
  const url = URL.createObjectURL(result.data as Blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
