import type { ReactNode } from "react";

export type ActionState = "idle" | "busy" | "done";

/** A check mark that draws itself (success confirmation). CSS only; static with reduced motion. */
export function DrawnCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" width="1em" height="1em" aria-hidden className={className}>
      <path
        d="M4 10.5l4 4 8-9"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="draw-in"
      />
    </svg>
  );
}

/**
 * Icon slot of an action button: its own icon when idle, a spinner while the request is actually
 * running, a drawn check once it succeeded. The spinner is the only looping animation in controls
 * and exists only while work is in flight. Keyed swap + CSS, so pages with forms don't pay for a
 * JS animation library.
 */
export function ActionIcon({ state, idle }: { state: ActionState; idle: ReactNode }) {
  return (
    <span key={state} className="swap-in relative inline-grid size-[1em] place-items-center">
      {state === "busy" ? (
        <span aria-hidden className="size-[0.9em] animate-spin rounded-full border-[1.5px] border-current border-r-transparent" />
      ) : state === "done" ? (
        <DrawnCheck />
      ) : (
        idle
      )}
    </span>
  );
}
