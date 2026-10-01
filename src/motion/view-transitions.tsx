import { ViewTransition, type ReactNode } from "react";

/*
 * Route transitions with React's <ViewTransition> (built into the Next.js App Router; 0 KB).
 * Browsers without the View Transitions API simply navigate without animation. CSS lives in
 * globals.css (::view-transition-*), including the reduced-motion override.
 */

/**
 * React's <ViewTransition> ships in the canary React bundled by the Next.js App Router. Stable
 * React (unit tests, other hosts) doesn't export it: render the children unchanged there.
 */
const supported = ViewTransition !== undefined;

/** Navigating deeper into the flow (landing → create → analysis, list → detail, result → sheet). */
export const NAV_FORWARD = ["nav-forward"];
/** Returning up the hierarchy (back to library, all examples, back to result). */
export const NAV_BACK = ["nav-back"];

const DIRECTIONAL = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "page-fade" };

/**
 * Wraps a page's content. Put it in each page (layouts persist, so enter/exit never fire there).
 * Typed navigations slide in their direction; untyped ones fade through.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  if (!supported) return <>{children}</>;
  return (
    <ViewTransition enter={DIRECTIONAL} exit={DIRECTIONAL} default="none">
      {children}
    </ViewTransition>
  );
}

/**
 * An element that persists across routes (same `name` on both pages) and morphs between them.
 * The pair only forms when the destination renders in the same commit as the navigation, so its
 * data must already be cached.
 */
export function SharedElement({ name, children }: { name: string; children: ReactNode }) {
  if (!supported) return <>{children}</>;
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}

/** View-transition names must be valid CSS identifiers. */
export function sharedName(...parts: string[]): string {
  return parts.join("-").replaceAll(/[^a-zA-Z0-9_-]/g, "_");
}
