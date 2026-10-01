"use client";

import { useRef, type CSSProperties } from "react";
import { useSeenOnce } from "@/motion/hooks";
import { cn } from "./cn";

/**
 * Segmented meter (LED ladder) for 0–1 values. Exposes role="meter" so the value is available to
 * assistive tech; the visual is decorative. The first time it scrolls into view the lit segments
 * switch on one by one up to the real value, like a hardware meter settling (never beyond it).
 */
export function Meter({
  value,
  label,
  valueText,
  segments = 12,
  tone = "signal",
  className,
}: {
  value: number;
  label: string;
  valueText: string;
  segments?: number;
  tone?: "signal" | "measure" | "muted";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeenOnce(ref, 0.6);
  const clamped = Math.min(1, Math.max(0, value));
  const lit = Math.round(clamped * segments);
  const litClass = tone === "signal" ? "bg-signal" : tone === "measure" ? "bg-measure" : "bg-ink-faint";
  return (
    <div
      ref={ref}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuetext={valueText}
      data-seen={seen || undefined}
      className={cn("led-meter flex h-2.5 gap-[3px]", className)}
    >
      {Array.from({ length: segments }, (_, index) => (
        <span
          key={index}
          style={{ "--led-index": index } as CSSProperties}
          className={cn("h-full flex-1 rounded-[1px]", index < lit ? `led-on ${litClass}` : "bg-surface-3")}
        />
      ))}
    </div>
  );
}
