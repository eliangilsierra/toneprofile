import type { CSSProperties } from "react";
import { cn } from "./cn";

/**
 * Placeholder block. A faint light travels across it in the signal direction: activity, not
 * progress. Reduced motion: static.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-sm", className)} />;
}

/**
 * Generic loading layout; the live region tells assistive tech something is loading. It reserves
 * a full viewport so the footer never jumps when the content arrives (no layout shift).
 */
export function PageSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-dvh flex-col gap-6">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

/** Loading layout for a generation: the shape of the heading and the Signal Rail to come. */
export function RailSkeleton({ label = "Loading…", stations = 7 }: { label?: string; stations?: number }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-dvh flex-col gap-10">
      <span className="sr-only">{label}</span>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-3/5" />
        <Skeleton className="h-6 w-1/3" />
      </div>
      <div aria-hidden className="rounded-md border border-line bg-surface-1/50 p-5 md:p-7">
        <ol className="grid gap-6 md:grid-cols-[repeat(var(--rail-stations),minmax(0,1fr))] md:gap-3" style={{ "--rail-stations": stations } as CSSProperties}>
          {Array.from({ length: stations }, (_, index) => (
            <li key={index} className="relative flex gap-3 md:flex-col">
              {index < stations - 1 && <span className="absolute left-4 right-0 top-[7px] hidden h-[2px] bg-line md:block" />}
              <span className="relative z-10 size-3.5 shrink-0 rounded-full border-[1.5px] border-line-strong bg-canvas" />
              <Skeleton className="h-3 w-16" />
            </li>
          ))}
        </ol>
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
