"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, unwrap } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/keys";
import type { Generation, GenerationCreate, Upload } from "@/lib/api/types";
import { contentTypeFor } from "@/lib/audio/file";

export function useDevices() {
  return useQuery({
    queryKey: queryKeys.devices,
    queryFn: () => unwrap(api.GET("/v1/devices")),
    staleTime: Infinity,
  });
}

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

export function useSongSearch(rawQuery: string) {
  const query = useDebounced(rawQuery.trim(), 250);
  const result = useQuery({
    queryKey: queryKeys.songSearch(query),
    queryFn: ({ signal }) => unwrap(api.GET("/v1/songs/search", { params: { query: { q: query, limit: 8 } }, signal })),
    enabled: query.length >= 2,
    staleTime: 5 * 60_000,
  });
  return { ...result, query, settled: query === rawQuery.trim() };
}

export type SubmitPhase = "uploading" | "checking" | "starting";

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/**
 * Direct-to-storage upload: ticket → PUT → complete → poll until the server has probed the file.
 * Throws ApiError with the server's reason when the file is rejected.
 */
export async function uploadReference(file: File, onPhase: (phase: SubmitPhase) => void): Promise<Upload> {
  const contentType = contentTypeFor(file);
  if (!contentType) throw new ApiError({ code: "unsupported_format", status: 415, retryable: false });

  onPhase("uploading");
  const ticket = await unwrap(
    api.POST("/v1/uploads", {
      body: { purpose: "reference", filename: file.name, content_type: contentType, size_bytes: file.size },
    }),
  );
  const put = await fetch(ticket.put_url, { method: "PUT", headers: ticket.headers, body: file }).catch(() => null);
  if (!put || !put.ok) throw new ApiError({ code: "network", status: put?.status ?? 0, retryable: true });

  onPhase("checking");
  let upload = await unwrap(
    api.POST("/v1/uploads/{uploadId}/complete", { params: { path: { uploadId: ticket.upload_id } } }),
  );
  const deadline = Date.now() + 90_000;
  while (upload.status === "probing" || upload.status === "awaiting_upload") {
    if (Date.now() > deadline) throw new ApiError({ code: "job_timeout", status: 504, retryable: true });
    await sleep(700);
    upload = await unwrap(api.GET("/v1/uploads/{uploadId}", { params: { path: { uploadId: ticket.upload_id } } }));
  }
  if (upload.status === "rejected") {
    throw upload.error ? ApiError.fromProblem(upload.error) : new ApiError({ code: "invalid_audio", status: 422, retryable: false });
  }
  return upload;
}

export function createGeneration(body: GenerationCreate): Promise<Generation> {
  return unwrap(api.POST("/v1/generations", { body }));
}
