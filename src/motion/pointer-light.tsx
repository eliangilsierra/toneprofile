"use client";

import { useEffect } from "react";

/**
 * Drives the `.edge-light` effect: one passive, rAF-throttled listener for the whole document
 * sets the pointer position on the card under the cursor. Only on fine pointers without a
 * reduced-motion preference; touch devices never pay for it.
 */
export function PointerLight() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      const event = last;
      if (!event || !(event.target instanceof Element)) return;
      const card = event.target.closest<HTMLElement>(".edge-light");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--edge-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--edge-y", `${event.clientY - rect.top}px`);
    };
    const onMove = (event: PointerEvent) => {
      if (!fine.matches || reduce.matches || event.pointerType !== "mouse") return;
      last = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
