# ADR-017 — Motion system v2 ("Calibrated Signal")

- Status: accepted
- Date: 2026-09-30
- Extends: [ADR-015](ADR-015-motion.md)

## Context

The MVP looked right but felt static: motion was limited to the Signal Rail sweep, the chain
translation and a fade. The product needs a coherent motion language (feedback, continuity,
animated data, signature moments) without redesigning the Signal Lab identity, without inventing
progress or data, and without hurting accessibility or Core Web Vitals.

## Options

Researched in [motion system §2](../frontend/motion-system.md#2-research-and-decision-matrix):
Motion, React `<ViewTransition>`/View Transitions API, CSS (`@property`, scroll-driven
animations), SVG, Canvas 2D, Web Audio, GSAP, Lenis, Three.js/R3F, PixiJS/OGL, React Spring,
AutoAnimate, React Transition Group, custom cursors, WebGPU.

## Decision

- Direction **"Calibrated Signal"**: precision-instrument base; signal-flow motion reserved for
  signal; no cinematic/WebGL direction.
- Stack, **no new dependencies**: Motion (in-page state) · React `<ViewTransition>` (routes and
  shared elements) · CSS (micro-interactions, loops, scroll reveals) · SVG and Canvas 2D (data) ·
  Web Audio (previewing the user's excerpt only).
- Centralised tokens, presets and hooks in `src/motion/`; reusable visuals in `src/visualization/`.
- Honesty rules: loops only for backend-reported activity; celebrations only when witnessed;
  visuals computed from API data or the user's own audio; illustrations labelled.
- Reduced motion defined per element; E2E runs a reduced-motion project.

## Consequences

- Route transitions and scroll reveals are progressive enhancement: unsupported browsers navigate
  instantly and show content statically.
- Shared elements need the destination's data cached at navigation time (cache seeding and
  hover/focus prefetch).
- Measured cost: landing +3 KB initial JS, app routes +1–2 KB, content pages +0.3 KB; animation at
  ~59 fps under 4× CPU; example page CLS 0.446 → 0 (see performance).
- WebGL remains out of scope until there is 3D data worth showing (revisit for a V2 hero).
