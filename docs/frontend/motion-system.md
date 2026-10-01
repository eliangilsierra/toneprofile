# Motion System — "Calibrated Signal"

ToneProfile should feel like a precision instrument for understanding guitar tone: things move
because signal moves, measured things settle like meters, and nothing moves just to decorate.
This document is the reference for motion in the web app. Decision record:
[ADR-017](../decisions/ADR-017-motion-system.md) (extends [ADR-015](../decisions/ADR-015-motion.md)).
Code: `src/motion/`, `src/visualization/`, motion utilities in `src/app/globals.css`.

## 1. Audit (before this work, 2026-09-30)

| Keep (worked) | Static / weak | Disconnected |
|---|---|---|
| Signal Lab palette, type and layout; the Signal Rail concept; the universal ⇄ device shared-layout translation; reduced-motion wiring (`MotionConfig reducedMotion="user"` + CSS kill-switch); Motion features loaded asynchronously | Hero (rail only); result arrival (one fade); meters and targets (static bars); fingerprint (static SVG, band switch jumped); block inspector (flat sliders); buttons/cards (colour-only hovers); toggles (no indicator motion); skeletons ("Loading…" boxes); error panels (appeared abruptly); upload/waveform (appeared instantly) | Create → analysis → result were hard cuts; list → detail too; the selected excerpt disappeared after submit; the translation flipped every block at once; the example page shifted by 0.446 CLS when content arrived |

**Deliberately not animated:** body text, legal and methodology prose, tables, form values while
typing, numeric readouts (numbers change instantly; only their visuals ease), and anything that
would imply progress the backend didn't report.

## 2. Research and decision matrix

Sizes are gzip (bundlephobia, 2026-09-30). Browser support: View Transitions (same-document)
Baseline since Firefox 144 (Oct 2025, web.dev); scroll-driven animations in Chromium and Safari 26,
Firefox behind a flag (MDN / caniuse, ~83 % global); `@property` Baseline 2024.

| Technology | Size | Performance | React/Next fit | Maintenance | Verdict | Responsible for · NOT for |
|---|---|---|---|---|---|---|
| **Motion 13** (in use) | ~5 KB `m` + async `domMax` | Hybrid engine (WAAPI for opacity/transform) | Client components; `LazyMotion` strict | Active | **Keep** | In-page state: presence, shared layout, springs, stagger · not route transitions, scroll-linked effects or ambient loops |
| **React `<ViewTransition>`** + View Transitions API | 0 KB | Browser-composited snapshots | Built into the Next 16 App Router (canary React); typed | Platform | **Adopt** | Route transitions, cross-route shared elements · not in-page state |
| **CSS** transitions, keyframes, `@property`, scroll-driven animations | 0 KB | Compositor for transform/opacity | Works in Server Components | Platform | **Adopt** | Micro-interactions, ambient loops, landing scroll reveals · never hide content where unsupported |
| **SVG** (+ existing d3-scale/d3-shape) | 0 KB new | Fine for < 1 000 nodes | Any | — | **Adopt** | Tone Signature, fingerprint, knobs, connectors |
| **Canvas 2D** | 0 KB | Best for many bars/points | Client only | Platform | **Adopt** | Waveform draw-in, live spectrum |
| **Web Audio API** (AnalyserNode) | 0 KB | Native | Client only | Platform | **Adopt** | Previewing the user's own excerpt · no analysis claims (the backend analyses) |
| GSAP 3.15 (free since 2025) | 27 KB | Excellent | Client only | Active | Reject | Duplicates Motion + CSS |
| Lenis 1.3 | 5 KB | Main-thread scroll | Client only | Active | Reject | Scroll hijacking hurts a11y; no product value |
| Three.js 0.186 + R3F 9.8 | 185 + 57 KB | GPU, battery | SSR-unsafe, lazy only | Active | Reject (revisit V2 hero) | No 3D data to show |
| PixiJS 8 / OGL | 261 / 10–34 KB | GPU | Client only | Active / slower | Reject | Nothing needs WebGL; Canvas 2D suffices |
| React Spring, AutoAnimate, React Transition Group | 5–20 KB | Fine | Client | RTG unmaintained since 2023 | Reject | Overlap with Motion |
| Custom cursor, magnetic buttons | — | Main-thread pointer work | — | — | Reject | Gimmicks; bad on touch and for accessibility |
| WebGPU | — | — | — | — | Reject | No workload that needs it |

**Result: zero new dependencies.**

## 3. Creative directions

| Direction | Idea | Strength | Why not alone |
|---|---|---|---|
| A · Precision Audio | Oscilloscope/analyzer: linear, measured, mono readouts, phosphor traces | Fits Signal Lab exactly; honest | Can feel cold and static |
| B · Living Signal | Signal flow: pulses travelling along paths, energy moving through blocks | Makes the pipeline feel alive; explains causality | Everything glowing and moving becomes noise |
| C · Future Instrument | Immersive/cinematic: depth, WebGL fields, generative visuals | Spectacle | GPU/battery cost; wrong mood for a low-light rehearsal tool; fights Signal Lab restraint |

**Selected: "Calibrated Signal" = A as the base + B reserved for signal flow. C rejected.**

## 4. Principles

1. **Motion is signal.** Movement follows the signal direction (left → right, top → bottom):
   the rail, the translation stagger, draw-ins, directional route transitions.
2. **Amber moves only where signal energy or the user's focus is.** Everything else is still.
3. **Measured things settle like instruments.** LED ladders, needles and knobs decelerate; nothing bounces.
4. **Loops only while work is reported.** A breathing node, a pulse or a scan exists only for a
   step the backend says is `running`, or while audio is actually playing.
5. **Celebrate only what was witnessed.** The completion sweep plays when the user watched the run
   finish (`useWitnessed`), never when an old result is reopened.
6. **One signature moment at a time.** Level-5 moments never overlap.
7. **Truth over spectacle.** Every visual is computed from API data or the user's own audio;
   illustrations are labelled; indeterminate activity never looks like progress.

## 5. Tokens

`src/motion/tokens.ts` ↔ CSS custom properties in `globals.css` (one vocabulary).

| Token | Value | Use |
|---|---|---|
| `duration.instant` | 80 ms | State flips with no travel |
| `duration.micro` | 120 ms | Hover and press feedback, LED segment switch-on |
| `duration.fast` | 160 ms | Swaps inside a component (labels, icons, route exit) |
| `duration.base` | 220 ms | Component state changes, route entry fade |
| `duration.slow` | 360 ms | Content entering a section, route slide, morphs |
| `duration.deliberate` | 560 ms | Drawing data (curves, arcs, rings, waveform draw-in) |
| `duration.signal` | 900 ms | One signal hop along a connector |
| `duration.ambient` | 2400 ms | Period of loops (breathing node, scan) |
| `ease.standard` | `(.2, 0, 0, 1)` | Default |
| `ease.out` / `ease.in` | `(.05, .7, .1, 1)` / `(.3, 0, .8, .15)` | Arrivals / departures |
| `ease.linear` | linear | Constant-speed signal travel |
| `ease.settle` | `(.16, 1, .3, 1)` | Instruments settling (curves, arcs) |
| `spring.snappy` | 520 / 42 / 0.8 | Toggles, sliding indicators |
| `spring.soft` | 210 / 30 / 1 | Layout morphs, sliding band highlight |
| `spring.needle` | 260 / 24 / 0.9 | Knobs and needles (hint of overshoot) |
| `staggers.micro / list / signalHop` | 30 / 45 / 120 ms | LED segments / lists / blocks along the chain |
| `distance.nudge / rise / travel` | 4 / 8 / 16 px | Swaps / reveals / larger moves (route slides: 24 px) |
| `scale.press / enter` | 0.98 / 0.96 | Press / materialise |

Presets (`src/motion/presets.ts`): `reveal`, `swap`, `materialise`, `staggerChildren()`,
`signalHop(i)`, `drawTransition`. Hooks (`src/motion/hooks.ts`): `useWitnessed`, `useLoopActive`
(on screen + tab visible + motion allowed), `useSeenOnce`, `useDocumentVisible`, `useFinePointer`.
CSS utilities: `pressable`, `sheen`, `edge-light` (+ `<PointerLight/>`), `lift`, `skeleton`,
`signal-pulse(-y)`, `scan`, `swap-in`, `draw-in`, `led-meter`, `scroll-reveal`, `scroll-draw`.

## 6. Hierarchy and inventory

| Level | Where | What | Tech |
|---|---|---|---|
| L1 micro | Buttons, links, toggles, cards, band buttons | Press scale 0.98; primary sheen (fine pointer); sliding indicators; pointer edge light + 1 px lift (fine pointer); busy spinner → drawn check | CSS, Motion `layoutId` |
| L2 component | Meters, knobs, fingerprint, waveform, skeletons | LED ladder to the real value on first view; knob arcs + needle sweep on block select; curve draws, band highlight slides, hover crosshair readout; waveform draws in from real peaks; skeleton light travels in the signal direction | CSS, Motion, SVG, Canvas |
| L3 section | Analysis, result, errors | Rail pulse towards the running station, connector fills, node rings on live change, findings print in; excerpt strip scan; problems slide in from the rail; Tone Signature draws in; chain translates block by block with a light sweep | CSS, Motion, Canvas, SVG |
| L4 route | Every page | Forward slides from the right, back from the left, others fade through; header fixed; shared elements: excerpt window → excerpt strip, song title → detail heading, preset name → dial-in sheet heading | React `<ViewTransition>` |
| L5 signature | See §7 | — | — |

Not done (P2): WebGL hero, device illustration, mini signatures in lists.

## 7. Signature moments ("wow") — all driven by real data

1. **Hero outcome.** The illustrated run (labelled, fictional) carries a pulse into each station;
   when it completes, its Tone Signature draws in with what was produced (lazy chunk).
2. **Excerpt.** The user's real peaks draw in left → right; *Listen to selection* plays exactly
   the chosen window with a live 1/3-octave spectrum and a playhead.
3. **Create → analysis.** The selected window morphs into the analysis page's excerpt strip
   (cache seeded with the created generation and the in-memory peaks so the pair forms). A scan
   sweeps it while `analyze_audio` runs; once measured, the bars switch to the "measured" colour.
4. **Live analysis.** A pulse travels to the running station; a ring marks each arrival; findings
   print in; a failure drops the signal at its node and the problem slides in from the rail.
5. **Completion.** If watched live, a light sweeps the whole rail as the result appears.
6. **Tone Signature.** The measured spectrum wrapped into a closed curve, surrounded by seven arcs
   for the perceptual targets (colour + dash = basis). Selecting a characteristic highlights its
   arc, the related chain blocks and fingerprint band.
7. **Universal → device.** When the chain comes into view it translates block by block in signal
   order, with a light sweeping across it. Device-agnostic: driven by `TranslationItem[]`.
8. **Preset.** Selecting a block sweeps its knobs to their values; download shows busy → done.

## 8. Accessibility and reduced motion

| Element | `prefers-reduced-motion: reduce` |
|---|---|
| Route transitions | Durations 0 (instant swap) |
| Motion components | `reducedMotion="user"`: transforms/layout off, opacity kept; `pathLength`/`clipPath` draw-ins explicitly skipped |
| CSS loops (pulse, scan, breathe, skeleton, spinner) | Neutralised by the global rule; captions carry the state ("Measuring…") |
| Scroll-driven reveals, sheen, edge light, lift | Only under `no-preference` (and fine pointers for pointer effects) |
| Hero | Shown complete at once, no replay |
| Meters, signature, fingerprint, knobs | Rendered at their values |
| Translation | Opens on the device view, no auto-play |

No animation gates input or focus; `aria-live` announcements are unchanged; every visual has a
text equivalent on the page (targets list, spectrum table, readouts). The signature's highlight
never dims text (dimming failed AA contrast in testing). E2E runs a `reduced-motion` project and
axe waits for finite animations to settle before auditing.

## 9. Performance

Rules: animate `transform`/`opacity` (and a few registered custom properties); `will-change` only
on looping elements; loops pause off-screen and in hidden tabs; heavy visuals load lazily (result
chunk, hero signature after the run, waveform/player once a file is chosen); memoised result
components so view toggles don't re-render charts. Measurements before/after:
[performance](performance.md#motion-system-v2-2026-09-30).
