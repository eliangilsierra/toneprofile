"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { PerceptualTargets, Spectrum, StepKey, StepStatus, StepSummary } from "@/lib/api/types";
import { reveal } from "@/motion/presets";
import { Retry } from "@/ui/icons";
import { SignalRail, type RailStation } from "@/features/generation/signal-rail";
import { useStepDetail } from "@/features/generation/use-step-detail";

// Loaded only when the illustrated run completes: the landing's first load doesn't pay for it.
const ToneSignature = dynamic(() => import("@/visualization/tone-signature/tone-signature").then((module) => module.ToneSignature), {
  ssr: false,
});

/*
 * Illustration of the pipeline with a FICTIONAL song. It reuses the real Signal Rail, the real
 * summary formatter and the real Tone Signature, fed with scripted data — it is labelled as an
 * illustration in the UI.
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

/** The illustrated tone's profile (same fictional values as the demo example "Northern Lights"). */
const SPECTRUM: Spectrum = {
  bands_hz: [80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500],
  db: [-0.6, 0.7, 0.6, 0.3, -0.1, -0.4, -0.6, -0.6, -0.4, -0.1, 0.1, 0.5, 0.8, 1.4, 1.9, 2.2, 2.3, 2, 1.4, 0.6, -0.9, -4, -6.9],
};
const TARGETS: PerceptualTargets = {
  saturation: { value: 0.12, confidence: 0.85, basis: "measured" },
  low_end: { value: 0.45, confidence: 0.7, basis: "measured" },
  mid_emphasis: { value: 0.4, confidence: 0.6, basis: "measured" },
  brightness: { value: 0.72, confidence: 0.75, basis: "measured" },
  tightness: { value: 0.55, confidence: 0.5, basis: "inferred" },
  compression: { value: 0.55, confidence: 0.6, basis: "research" },
  ambience: { value: 0.7, confidence: 0.8, basis: "measured" },
};

export function HeroDemo() {
  const t = useTranslations("Generation");
  const tl = useTranslations("Landing.hero");
  const tax = useTranslations("Taxonomy");
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
  const complete = effective >= SCRIPT.length;

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
              className="pressable grid size-7 place-items-center rounded-xs text-ink-muted hover:bg-surface-2 hover:text-ink"
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
      {/* The outcome: the tone becomes a signature and a device preset. */}
      <div className="min-h-[9.5rem] border-t border-line px-4 py-4 md:px-6">
        <AnimatePresence mode="wait">
          {complete && (
            <m.div key={run} variants={reveal} initial="hidden" animate="shown" exit={{ opacity: 0 }} className="flex items-center gap-5 md:gap-8">
              <ToneSignature spectrum={SPECTRUM} targets={TARGETS} label={tl("outcomeSignature")} centerLabel={tax("gainClass.clean")} className="!w-32 shrink-0 md:!w-36" />
              <div className="min-w-0">
                <p className="label !text-ok">{tl("outcomeTitle")}</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted md:text-base">{tl("outcomeBody")}</p>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
      <figcaption className="border-t border-line px-4 py-2.5 text-xs text-ink-faint md:px-6">{tl("illustration")}</figcaption>
    </figure>
  );
}
