"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { StepKey, StepStatus, StepSummary } from "@/lib/api/types";
import { SignalRail, type RailStation } from "@/features/generation/signal-rail";
import { useStepDetail } from "@/features/generation/use-step-detail";
import { Retry } from "@/ui/icons";

/*
 * Illustration of the pipeline with a FICTIONAL song. It reuses the real Signal Rail and the real
 * summary formatter, fed with scripted data — it is labelled as an illustration in the UI.
 */
const SCRIPT: { key: StepKey; summary: StepSummary }[] = [
  { key: "resolve_song", summary: { kind: "song", title: "Northern Lights", artist: "Glass Harbor", year: 2019 } },
  {
    key: "analyze_audio",
    summary: { kind: "audio", analyzed_s: 30, separation: "stem_model", guitar_dominance: 0.64, gain_class: { value: "clean", p: 0.88 } },
  },
  { key: "research_gear", summary: { kind: "research", sources_read: 7, claims_kept: 3, claims_dropped: 1 } },
  { key: "draft_intent", summary: { kind: "intent", blocks: 6, amp_archetype: "fender_blackface_clean" } },
  { key: "map_to_device", summary: { kind: "mapping", candidates_evaluated: 14, spectral_error_db: 1.1 } },
  { key: "build_preset", summary: { kind: "preset", file_bytes: 1128 } },
];
const STEP_MS = 1150;

export function HeroDemo() {
  const t = useTranslations("Generation");
  const tl = useTranslations("Landing.hero");
  const detail = useStepDetail();
  const reduceMotion = useReducedMotion();
  // position = number of completed steps; the step at `position` is running.
  const [position, setPosition] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    if (position >= SCRIPT.length) return;
    const timer = window.setTimeout(() => setPosition((value) => value + 1), position === 0 ? 700 : STEP_MS);
    return () => window.clearTimeout(timer);
  }, [position, run, reduceMotion]);

  const effective = reduceMotion ? SCRIPT.length : position;

  const stations: RailStation[] = SCRIPT.map((item, index) => {
    const status: StepStatus = index < effective ? "done" : index === effective ? "running" : "pending";
    return {
      key: item.key,
      label: t(`steps.${item.key}.title`),
      status,
      statusLabel: t(`stepStatus.${status}`),
      detail: status === "done" ? detail(item.summary) : null,
    };
  });

  return (
    <figure className="rounded-md border border-line bg-surface-1/80 shadow-[0_40px_120px_-60px_rgba(255,178,63,0.25)]">
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 md:px-6">
        <p className="label truncate">
          <span className="text-ink">Northern Lights</span> — Glass Harbor
        </p>
        <div className="flex items-center gap-3">
          <span className="label rounded-xs border border-line-strong px-1.5 py-0.5 !text-ink-faint">DEMO</span>
          {!reduceMotion && (
            <button
              type="button"
              onClick={() => {
                setPosition(0);
                setRun((value) => value + 1);
              }}
              className="grid size-7 place-items-center rounded-xs text-ink-muted hover:bg-surface-2 hover:text-ink"
              aria-label={tl("replay")}
            >
              <Retry />
            </button>
          )}
        </div>
      </div>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <SignalRail stations={stations} label={t("railLabel")} />
      </div>
      <figcaption className="border-t border-line px-4 py-2.5 text-xs text-ink-faint md:px-6">{tl("illustration")}</figcaption>
    </figure>
  );
}
