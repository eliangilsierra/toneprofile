"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { Generation } from "@/lib/api/types";
import { formatClock } from "@/lib/format/time";
import { StatusChip } from "@/ui/status-chip";
import type { RailStation } from "./signal-rail";
import { useStepDetail } from "./use-step-detail";

/** Signal Rail stations from the generation's real steps. */
export function useStations(generation: Generation): RailStation[] {
  const t = useTranslations("Generation");
  const detail = useStepDetail();
  return generation.steps.map((step) => {
    let text: string | null = null;
    if (step.status === "done") text = detail(step.summary);
    else if (step.status === "skipped" && t.has(`skippedReason.${step.key}` as "skippedReason.resolve_song")) {
      text = t(`skippedReason.${step.key}` as "skippedReason.resolve_song");
    }
    return {
      key: step.key,
      label: t(`steps.${step.key}.title`),
      description: step.status === "pending" || step.status === "running" ? t(`steps.${step.key}.description`) : undefined,
      status: step.status,
      statusLabel: t(`stepStatus.${step.status}`),
      detail: text,
    };
  });
}

/** Song (or "from excerpt"), device, excerpt window and status: the page heading of a generation. */
export function GenerationHeading({ generation, eyebrow }: { generation: Generation; eyebrow?: ReactNode }) {
  const t = useTranslations("Generation");
  const tp = useTranslations("Preset");
  const song = generation.input.song;
  const window = generation.input.reference_window;
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="label">
          {eyebrow ?? t("title")} · {tp(`deviceNames.${generation.input.device_key}` as "deviceNames.valeton_gp180")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
          {song ? song.title : t("fromExcerpt")}
          {song && <span className="block text-xl font-normal text-ink-muted md:text-2xl">{song.artist}</span>}
        </h1>
        {window && (
          <p className="mt-2 font-mono text-sm text-ink-muted tabular">
            {formatClock(window.start_s)} → {formatClock(window.end_s)}
          </p>
        )}
      </div>
      <StatusChip status={generation.status} />
    </div>
  );
}
