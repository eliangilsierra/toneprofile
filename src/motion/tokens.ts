/**
 * Motion tokens. Mirrors the CSS custom properties in globals.css so CSS transitions and Motion
 * animations share one vocabulary. Never hard-code durations or curves in components.
 */
export const duration = {
  instant: 0.08,
  fast: 0.14,
  base: 0.22,
  slow: 0.36,
  /** Signal travelling along the rail. */
  signal: 0.9,
} as const;

export const ease = {
  /** Default for most UI changes. */
  standard: [0.2, 0, 0, 1],
  /** Elements arriving: fast start, long settle. */
  out: [0.05, 0.7, 0.1, 1],
  /** Elements leaving. */
  in: [0.3, 0, 0.8, 0.15],
  /** Constant-speed signal flow. */
  linear: [0, 0, 1, 1],
} as const;

export const spring = {
  /** Controls and toggles: quick, no overshoot to speak of. */
  snappy: { type: "spring", stiffness: 520, damping: 42, mass: 0.8 },
  /** Layout morphs (the Signal Rail translation). */
  soft: { type: "spring", stiffness: 210, damping: 30, mass: 1 },
} as const;

/** Stagger between siblings entering (seconds). */
export const stagger = 0.045;
