/**
 * ToneProfile motion tokens ("Calibrated Signal"). Mirrors the CSS custom properties in
 * globals.css so CSS transitions, view transitions and Motion share one vocabulary. Never hard-code
 * durations or curves in components. Rationale and reduced-motion mapping:
 * docs/frontend/motion-system.md.
 */

/** Seconds (Motion's unit). CSS mirrors: --duration-<name> in ms. */
export const duration = {
  /** State flips with no travel: colour of a pressed toggle. */
  instant: 0.08,
  /** Hover and press feedback. */
  micro: 0.12,
  /** Small swaps inside a component (label change, icon swap). */
  fast: 0.16,
  /** Default for component state changes. */
  base: 0.22,
  /** Content entering a section. */
  slow: 0.36,
  /** Drawing data (curves, meters): long enough to read the gesture, short enough not to wait. */
  deliberate: 0.56,
  /** One signal hop travelling along the rail or the chain. */
  signal: 0.9,
  /** Period of ambient loops (breathing node, scan). Loops only exist while work is reported. */
  ambient: 2.4,
} as const;

/** Cubic-bezier curves. CSS mirrors: --ease-<name>. */
export const ease = {
  /** Default for most UI changes. */
  standard: [0.2, 0, 0, 1],
  /** Elements arriving: fast start, long settle. */
  out: [0.05, 0.7, 0.1, 1],
  /** Elements leaving. */
  in: [0.3, 0, 0.8, 0.15],
  /** Constant-speed signal travel. */
  linear: [0, 0, 1, 1],
  /** Instruments settling on a value (meters, knobs): decelerates hard, no overshoot. */
  settle: [0.16, 1, 0.3, 1],
} as const;

export const spring = {
  /** Controls and toggles: quick, no visible overshoot. */
  snappy: { type: "spring", stiffness: 520, damping: 42, mass: 0.8 },
  /** Layout morphs (translation, sliding indicators). */
  soft: { type: "spring", stiffness: 210, damping: 30, mass: 1 },
  /** Meter needles: a hint of overshoot like a VU needle, never a bounce. */
  needle: { type: "spring", stiffness: 260, damping: 24, mass: 0.9 },
} as const;

/** Seconds between siblings. */
export const staggers = {
  /** Segments of one control (LED ladder). */
  micro: 0.03,
  /** Items of a list entering. */
  list: 0.045,
  /** Blocks along the signal path: reads as the signal moving block to block. */
  signalHop: 0.12,
} as const;

/** @deprecated kept for existing imports; use `staggers.list`. */
export const stagger = staggers.list;

/** Pixels. */
export const distance = { nudge: 4, rise: 8, travel: 16 } as const;

export const scale = { press: 0.98, enter: 0.96 } as const;
