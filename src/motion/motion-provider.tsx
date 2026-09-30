"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Layout/shared-element features are loaded asynchronously so they never block first paint.
const loadFeatures = () => import("./features").then((module) => module.default);

/**
 * `reducedMotion="user"`: when the OS asks for reduced motion, Motion drops transform and layout
 * animations and keeps opacity changes, so state changes stay perceivable without movement.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
