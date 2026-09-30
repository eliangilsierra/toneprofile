"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { api, unwrap } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import type { Locale } from "@/lib/api/types";

/** Curated examples, with prose in the current UI locale. */
export function useExamples() {
  const locale = useLocale() as Locale;
  return useQuery({
    queryKey: queryKeys.examples(locale),
    queryFn: () => unwrap(api.GET("/v1/examples", { params: { query: { locale } } })),
    staleTime: Infinity,
  });
}

export function useExample(slug: string) {
  const locale = useLocale() as Locale;
  return useQuery({
    queryKey: queryKeys.example(slug, locale),
    queryFn: () => unwrap(api.GET("/v1/examples/{slug}", { params: { path: { slug }, query: { locale } } })),
    staleTime: Infinity,
  });
}
