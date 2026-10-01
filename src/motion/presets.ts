import type { Transition, Variants } from "motion/react";
import { distance, duration, ease, scale, spring, staggers } from "./tokens";

/*
 * Reusable Motion presets. Components compose these instead of inventing values. Under reduced
 * motion, MotionConfig reducedMotion="user" drops transforms and keeps opacity, so every preset
 * degrades to a plain fade (or an instant state change when opacity doesn't change).
 */

/** Content arriving after async work (results, findings, problem cards). */
export const reveal: Variants = {
  hidden: { opacity: 0, y: distance.rise },
  shown: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
};

/** Small in-place swaps (labels, icons): leave up, arrive from below. */
export const swap: Variants = {
  hidden: { opacity: 0, y: distance.nudge / 1.5 },
  shown: { opacity: 1, y: 0, transition: { duration: duration.fast, ease: ease.standard } },
  gone: { opacity: 0, y: -distance.nudge / 1.5, transition: { duration: duration.fast, ease: ease.in } },
};

/** Elements that materialise in place (chain blocks, badges). */
export const materialise: Variants = {
  hidden: { opacity: 0, scale: scale.enter },
  shown: { opacity: 1, scale: 1, transition: { ...spring.soft, opacity: { duration: duration.base, ease: ease.standard } } },
  gone: { opacity: 0, scale: scale.enter, transition: { duration: duration.fast, ease: ease.in } },
};

/** Container that staggers its children in list order. */
export function staggerChildren(step: number = staggers.list, delay = 0): Variants {
  return { hidden: {}, shown: { transition: { staggerChildren: step, delayChildren: delay } } };
}

/**
 * Delay for the block at `index` along the signal path, so changes read as the signal travelling
 * block to block (left → right, top → bottom).
 */
export function signalHop(index: number, start = 0): number {
  return start + Math.max(0, index) * staggers.signalHop;
}

/** Transition for data being drawn (curves, arcs, meters). */
export const drawTransition: Transition = { duration: duration.deliberate, ease: ease.settle };
