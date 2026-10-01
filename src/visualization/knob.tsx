"use client";

import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { spring } from "@/motion/tokens";
import { cn } from "@/ui/cn";

const SIZE = 44;
const R = 17;
const C = SIZE / 2;
/** 270° sweep from 7:30 to 4:30, like a hardware pot. */
const START = 135;
const SWEEP = 270;

function point(angleDeg: number, radius = R): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [C + radius * Math.cos(rad), C + radius * Math.sin(rad)];
}

function arc(fromDeg: number, toDeg: number): string {
  const [x0, y0] = point(fromDeg);
  const [x1, y1] = point(toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

const TRACK = arc(START, START + SWEEP);

/**
 * A device-style knob (decorative; the numeric readout next to it is the accessible value).
 * On mount — i.e. when a block is selected — the value arc sweeps up to the real setting and the
 * pointer settles on it like a needle. Reduced motion: drawn at the value.
 */
export function Knob({ fraction, className }: { fraction: number; className?: string }) {
  const reduce = useReducedMotion();
  const value = Math.min(1, Math.max(0, fraction));
  const angle = START + SWEEP * value;
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden className={cn("size-11 shrink-0", className)}>
      <path d={TRACK} fill="none" stroke="var(--color-surface-3)" strokeWidth={3} strokeLinecap="round" />
      <m.path
        d={TRACK}
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth={3}
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: value }}
        transition={spring.needle}
      />
      <circle cx={C} cy={C} r={11} fill="var(--color-surface-2)" stroke="var(--color-line-strong)" />
      <m.g
        style={{ originX: `${C}px`, originY: `${C}px` }}
        initial={reduce ? false : { rotate: START - 90 }}
        animate={{ rotate: angle - 90 }}
        transition={spring.needle}
      >
        <line x1={C} y1={C} x2={C} y2={C - 8} stroke="var(--color-ink)" strokeWidth={2} strokeLinecap="round" transform={`rotate(90 ${C} ${C})`} />
      </m.g>
    </svg>
  );
}
