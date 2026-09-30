"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import type { StepSummary } from "@/lib/api/types";

/**
 * Renders a step's structured summary as a short localized finding. The backend sends facts, the
 * client writes the sentence — so findings are localized and never embellished.
 */
export function useStepDetail() {
  const t = useTranslations("Generation.summary");
  const tax = useTranslations("Taxonomy");

  return useCallback(
    (summary: StepSummary | null | undefined): string | null => {
      if (!summary) return null;
      switch (summary.kind) {
        case "song":
          return t("song", { title: summary.title, artist: summary.artist });
        case "audio": {
          const base = t("audio", {
            seconds: summary.analyzed_s,
            gain: tax(`gainClass.${summary.gain_class.value}`),
            p: summary.gain_class.p,
          });
          return summary.separation === "stem_model" ? `${base} · ${t("audioSeparation")}` : base;
        }
        case "research": {
          const base = t("research", { sources: summary.sources_read, kept: summary.claims_kept });
          return summary.claims_dropped > 0 ? `${base} · ${t("researchDropped", { dropped: summary.claims_dropped })}` : base;
        }
        case "intent":
          return t("intent", { blocks: summary.blocks, amp: tax(`archetypes.${summary.amp_archetype}`) });
        case "mapping": {
          const base = t("mapping", { candidates: summary.candidates_evaluated });
          return summary.spectral_error_db !== null && summary.spectral_error_db !== undefined
            ? `${base} · ${t("mappingError", { value: summary.spectral_error_db })}`
            : base;
        }
        case "validation":
          return t("validation", { passed: summary.checks_passed, total: summary.checks_total });
        case "preset":
          return summary.file_bytes ? t("preset", { bytes: summary.file_bytes }) : t("presetNoFile");
      }
    },
    [t, tax],
  );
}
