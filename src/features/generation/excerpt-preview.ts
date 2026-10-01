"use client";

import { useQueryClient } from "@tanstack/react-query";

/**
 * The user's own excerpt (peaks computed in the browser) handed from the create form to the
 * analysis page for this session only. Kept in the query cache (memory), never persisted or sent
 * anywhere; after a reload the analysis page simply shows the window times.
 */
export interface ExcerptPreview {
  peaks: number[];
  duration: number;
  window: { start: number; end: number };
}

export const excerptPreviewKey = (generationId: string) => ["excerpt-preview", generationId] as const;

export function useExcerptPreview(generationId: string): ExcerptPreview | undefined {
  return useQueryClient().getQueryData<ExcerptPreview>(excerptPreviewKey(generationId));
}
