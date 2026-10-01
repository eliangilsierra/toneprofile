"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useState, type CSSProperties } from "react";
import type { StepStatus } from "@/lib/api/types";
import { duration, ease } from "@/motion/tokens";
import { cn } from "@/ui/cn";

export interface RailStation {
  key: string;
  label: string;
  description?: string;
  status: StepStatus;
  statusLabel: string;
  /** Real finding reported by the step (never invented by the UI). */
  detail?: string | null;
}

type Segment = "idle" | "flowing" | "passed";

function segmentAfter(current: RailStation, next: RailStation | undefined): Segment {
  if (!next) return "idle";
  if (next.status === "running") return "flowing";
  const settled = (status: StepStatus) => status === "done" || status === "skipped" || status === "failed";
  if (settled(current.status) && next.status !== "pending") return "passed";
  return "idle";
}

/**
 * The status this node changed to while mounted (null until it changes). Derived state, so a
 * reopened old result renders still and only live changes animate.
 */
function useLiveChange(status: StepStatus) {
  const [previous, setPrevious] = useState(status);
  const [change, setChange] = useState<{ to: StepStatus; count: number } | null>(null);
  if (status !== previous) {
    setPrevious(status);
    setChange({ to: status, count: (change?.count ?? 0) + 1 });
  }
  return change;
}

function Node({ status }: { status: StepStatus }) {
  const change = useLiveChange(status);
  const ping = change && (change.to === "done" || change.to === "failed") ? change : null;
  return (
    <span className="relative z-10 grid size-4 shrink-0 place-items-center" aria-hidden>
      {status === "running" && (
        <span className="absolute inset-[-5px] rounded-full bg-signal/25 animate-[signal-breathe_2.4s_ease-in-out_infinite]" />
      )}
      {/* One ring when the signal arrives (done) or drops (failed). */}
      <AnimatePresence>
        {ping && (
          <m.span
            key={ping.count}
            className={cn("absolute inset-0 rounded-full border", ping.to === "failed" ? "border-danger" : "border-signal")}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: duration.deliberate, ease: ease.out }}
          />
        )}
      </AnimatePresence>
      <span
        className={cn(
          "size-3.5 rounded-full border-[1.5px] transition-colors duration-[var(--duration-base)]",
          status === "pending" && "border-line-strong bg-canvas",
          status === "running" && "border-signal bg-canvas",
          status === "done" && "border-signal bg-signal",
          status === "skipped" && "border-dashed border-ink-faint bg-canvas",
          status === "failed" && "border-danger bg-canvas",
        )}
      />
      {status === "failed" && (
        <svg viewBox="0 0 10 10" className="absolute size-2 text-danger">
          <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

/**
 * A connector between stations. `passed` fills in the signal direction; `flowing` carries a pulse
 * travelling towards the running station (transform-only animation, compositor friendly).
 */
function Connector({ state, orientation }: { state: Segment; orientation: "horizontal" | "vertical" }) {
  const horizontal = orientation === "horizontal";
  return (
    <span
      aria-hidden
      className={cn(
        "absolute overflow-hidden rounded-full bg-line",
        horizontal ? "left-4 right-0 top-[7px] hidden h-[2px] md:block" : "bottom-[-4px] left-[7px] top-6 w-[2px] md:hidden",
      )}
    >
      <span
        className={cn(
          "absolute inset-0 bg-signal/70 transition-transform duration-[var(--duration-signal)] ease-[var(--ease-standard)]",
          horizontal ? "origin-left" : "origin-top",
          state === "passed" ? "scale-100" : horizontal ? "scale-x-0" : "scale-y-0",
        )}
      />
      {state === "flowing" && <span className={cn("absolute inset-0", horizontal ? "signal-pulse" : "signal-pulse-y")} />}
    </span>
  );
}

/**
 * The Signal Rail: the product's spine. Each station is a real pipeline step; segments light up
 * as the signal passes, and each step's reported finding prints under it.
 */
export function SignalRail({
  stations,
  label,
  className,
}: {
  stations: RailStation[];
  label: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <ol
      aria-label={label}
      className={cn("grid gap-0 md:grid-cols-[repeat(var(--rail-stations),minmax(0,1fr))] md:gap-3", className)}
      style={{ "--rail-stations": stations.length } as CSSProperties}
    >
      {stations.map((station, index) => {
        const segment = segmentAfter(station, stations[index + 1]);
        const isLast = index === stations.length - 1;
        return (
          <li
            key={station.key}
            aria-current={station.status === "running" ? "step" : undefined}
            className="relative flex gap-3 pb-6 md:flex-col md:gap-3 md:pb-0"
          >
            {!isLast && <Connector state={segment} orientation="horizontal" />}
            {!isLast && <Connector state={segment} orientation="vertical" />}
            <Node status={station.status} />
            <div className="min-w-0 md:pr-2">
              <p
                className={cn(
                  "label transition-colors duration-[var(--duration-base)]",
                  station.status === "running" && "!text-signal",
                  station.status === "done" && "!text-ink",
                  station.status === "failed" && "!text-danger",
                )}
              >
                {station.label}
                <span className="sr-only"> — {station.statusLabel}</span>
              </p>
              {station.description && <p className="mt-1 text-sm leading-snug text-ink-faint">{station.description}</p>}
              <AnimatePresence initial={false}>
                {station.detail ? (
                  // The finding prints left → right like an instrument readout.
                  <m.p
                    key={station.detail}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
                    animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: duration.deliberate, ease: ease.out }}
                    className="mt-1.5 font-mono text-xs leading-snug text-ink-muted tabular"
                  >
                    {station.detail}
                  </m.p>
                ) : null}
              </AnimatePresence>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
