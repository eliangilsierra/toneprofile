"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

/**
 * True once `reached` became true *during this mount* after having been false. Used so
 * celebrations only play when the user watched the state change live — never when an old result is
 * simply reopened.
 */
export function useWitnessed(reached: boolean, known = true): boolean {
  // First known value, captured once (derived state; `known` is false while data is loading).
  const [initial, setInitial] = useState<boolean | null>(known ? reached : null);
  if (known && initial === null) setInitial(reached);
  return initial === false && reached;
}

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

/** Whether the tab is visible (loops pause in background tabs). */
export function useDocumentVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );
}

/**
 * Whether a looping animation attached to `ref` should run: element on screen, tab visible and no
 * reduced-motion preference. Every ambient loop in the product goes through this.
 */
export function useLoopActive(ref: RefObject<Element | null>): boolean {
  const onScreen = useInView(ref, { margin: "64px" });
  const visible = useDocumentVisible();
  const reduce = useReducedMotion();
  return onScreen && visible && !reduce;
}

/** True after the element has been at least `amount` visible once. */
export function useSeenOnce(ref: RefObject<Element | null>, amount = 0.3): boolean {
  return useInView(ref, { once: true, amount });
}

/** Fine pointer with hover (desktop): gate for pointer-following effects. */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return fine;
}
