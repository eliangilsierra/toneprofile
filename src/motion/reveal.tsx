"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { duration, ease } from "./tokens";

/** Entrance used for content that appears after async work (results, findings). */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const Component = as === "section" ? m.section : as === "li" ? m.li : m.div;
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slow, ease: ease.out, delay }}
    >
      {children}
    </Component>
  );
}
