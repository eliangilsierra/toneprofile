"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef } from "react";
import type { Generation } from "@/lib/api/types";
import { useLoopActive } from "@/motion/hooks";
import { SharedElement } from "@/motion/view-transitions";
import { cn } from "@/ui/cn";
import { slicePeaks, useWaveformCanvas } from "@/visualization/waveform";
import { useExcerptPreview } from "./excerpt-preview";

/** Same name as the selected window in the create form (see waveform-window.tsx). */
const EXCERPT_TRANSITION = "excerpt-window";

/**
 * The passage being analysed. Right after submitting, the user's own waveform (kept in memory
 * from the create form) morphs into this strip. While the audio step runs a scan line sweeps it —
 * an activity indicator, not progress; once measured, the bars switch to the "measured" colour.
 * After a reload there are no peaks in memory, so only the window is shown.
 */
export function ExcerptStrip({ generation }: { generation: Generation }) {
  const t = useTranslations("Generation.excerpt");
  const preview = useExcerptPreview(generation.id);
  const window = generation.input.reference_window;
  const step = generation.steps.find((item) => item.key === "analyze_audio");
  const status = step?.status ?? "pending";
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const active = useLoopActive(ref);
  const peaks = useMemo(
    () => (preview && window ? slicePeaks(preview.peaks, preview.duration, window.start_s, window.end_s) : []),
    [preview, window],
  );
  // Repaint when the step status changes: the bar colour encodes measured vs not yet measured.
  useWaveformCanvas(canvasRef, peaks, { redrawKey: status });

  if (!window) return null;
  const scanning = status === "running";
  const caption =
    status === "running" ? t("measuring") : status === "done" ? t("measured") : status === "failed" ? t("failed") : t("waiting");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="label">{t("label")}</p>
        <p className={cn("font-mono text-xs", status === "done" ? "text-measure" : status === "failed" ? "text-danger" : "text-ink-muted")}>
          {caption}
        </p>
      </div>
      <SharedElement name={EXCERPT_TRANSITION}>
        <div
          ref={ref}
          aria-hidden
          className={cn(
            "relative h-14 overflow-hidden rounded-sm border bg-surface-1 transition-colors duration-[var(--duration-slow)]",
            status === "done" ? "border-measure/40" : status === "failed" ? "border-danger/40" : "border-line",
          )}
        >
          {peaks.length > 0 ? (
            <canvas
              ref={canvasRef}
              className={cn(
                "absolute inset-0 size-full transition-opacity duration-[var(--duration-slow)]",
                status === "done"
                  ? "[--wave-color:var(--color-measure)]"
                  : status === "failed"
                    ? "opacity-50 [--wave-color:var(--color-ink-faint)]"
                    : "[--wave-color:var(--color-ink-muted)]",
                status === "pending" && "opacity-60",
              )}
            />
          ) : (
            <span className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
          )}
          {scanning && (
            <span className="scan absolute inset-0" data-active={active || undefined}>
              <span className="absolute inset-y-0 left-0 w-px bg-signal shadow-[0_0_14px_2px_rgb(255_178_63_/_0.45)]" />
              <span className="absolute inset-y-0 -left-24 w-24 bg-linear-to-l from-signal/20 to-transparent" />
            </span>
          )}
        </div>
      </SharedElement>
    </div>
  );
}
