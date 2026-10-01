# ADR-015 — Motion stack

- Status: accepted — extended by [ADR-017](ADR-017-motion-system.md) (View Transitions adopted, tokens and visualisations expanded)
- Date: 2026-09-29

## Options evaluated

| Tech | Need in MVP | Cost | Verdict |
|---|---|---|---|
| CSS transitions/keyframes | Hover, signal flow, breathing indicators | ~0 KB | ✅ |
| Motion for React (`LazyMotion` + `m`) | Shared-layout morph of the chain translation, presence animations | ~5 KB initial + features loaded async | ✅ |
| React `<ViewTransition>` / View Transitions API | Route transitions | 0 KB, uneven browser support | Later (progressive enhancement) |
| GSAP + ScrollTrigger | Scroll storytelling | ~25 KB+ | ❌ not needed |
| Lenis | Smooth scroll | Scroll hijacking, a11y cost | ❌ |
| React Three Fiber / Three.js / WebGL | 3D hero | Large bundle, GPU/battery, a11y | ❌ (revisit V2) |
| Canvas 2D | Waveform | 0 KB | ✅ |
| SVG | Spectrum, glyphs, rail | 0 KB | ✅ |

## Decision

CSS for micro-interactions, Motion for layout/presence, Canvas/SVG for data. `MotionConfig
reducedMotion="user"` plus a global CSS reduced-motion rule; no essential information depends on
animation.
