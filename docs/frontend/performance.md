# Performance — Measured

Measured on 2026-09-29 (re-measured 2026-09-30 after adding Examples, Methodology and Legal) against a local production build (`next build && next start`), mock mode.
Scripts: `scripts/measure-bundles.mjs` (JS per route) and `scripts/measure-vitals.mjs` (lab
vitals). Lighthouse could not launch Chrome in this environment, so vitals were measured with
Playwright + CDP using Lighthouse-like mobile throttling (Pixel 7 viewport, 4× CPU slowdown,
1.6 Mbps / 150 ms "slow 4G").

## Initial JavaScript (module scripts in the HTML, gzip)

| Route | Initial JS | Of which framework (React DOM + Next runtime) |
|---|---|---|
| `/en` (landing) | **178 KB** | ≈ 130 KB |
| `/en/tones` | **189 KB** | ≈ 130 KB |
| `/en/tones/new` | **203–208 KB** | ≈ 130 KB |
| `/en/examples` | **183 KB** | ≈ 130 KB |
| `/en/examples/northern-lights` | **197 KB** | ≈ 130 KB |
| `/en/methodology`, `/en/legal/*` (static, no client components beyond the shell) | **165 KB** | ≈ 130 KB |

"Initial" counts the scripts referenced by the server HTML. Earlier versions of the script read
`<script>` tags at network idle, which also counted chunks injected later for link prefetching
(the site footer links to five routes); those now appear only in the "total" column of the script.

Changes that got here: removed Zod + resolvers (−~50 KB on app routes), removed unused Radix,
lazy-loaded `ResultView` and the d3 `Fingerprint`, Motion features loaded asynchronously via
`LazyMotion`. The `nomodule` polyfill chunk (~39 KB) is excluded: modern browsers don't download it.

## Lab vitals (throttled mobile)

| Route | FCP | LCP | TBT (approx.) | CLS |
|---|---|---|---|---|
| `/en` | 0.9–1.4 s | 0.9–1.4 s | ~130–180 ms | 0.02 |
| `/en/tones/new` | 0.9 s | 0.9 s | ~370 ms | 0 |
| `/en/tones` | 0.9 s | 3.8 s* | ~170 ms | 0 |

\* The library's largest element is its data (list or empty state), which in mock mode waits for
the in-browser demo backend to boot. In http mode there is no such wait.

## Motion system v2 (2026-09-30)

Before = `main` at merge of PR #1; after = branch `feat/motion-system`. Same scripts, production
build, mock mode. New script `scripts/measure-motion.mjs`: desktop viewport, 4× CPU slowdown,
frame intervals and long tasks while things animate.

**Initial JS (gzip)**

| Route | Before | After | Δ |
|---|---|---|---|
| `/en` landing | 178.8 KB | 181.8 KB | +3.0 (Tone Signature is lazy, loaded after the hero run) |
| `/en/tones` | 184.7 KB | 186.4 KB | +1.7 |
| `/en/tones/new` | 203.2 KB | 205.3 KB | +2.1 (waveform + Web Audio preview load once a file is chosen) |
| `/en/examples` | 183.0 KB | 186.2 KB | +3.2 |
| `/en/examples/northern-lights` | 196.9 KB | 198.1 KB | +1.2 |
| `/en/methodology`, `/en/legal/*` | 165.1 KB | 165.4 KB | +0.3 |

**Animation smoothness (4× CPU)**

| Scenario | Before fps · p95 frame · frames > 50 ms · TBT | After |
|---|---|---|
| Landing hero run (8 s) | 59.9 · 16.7 ms · 0 · 0 ms | 59.6 · 16.8 ms · 0 · 0 ms |
| Live analysis → result (~20 s) | 59.4 · 16.7 ms · 2 · 45 ms | 59.4 · 16.8 ms · 1 · 84–99 ms |
| Translation toggled ×4 | 58.9 · 16.8 ms · 0 · 1 ms | 58.7 · 16.8 ms · 0–2 · 0 ms (after memoising the result's charts; 4 · 43 ms before that) |

**Lab vitals (throttled mobile)**

| Route | Before LCP · CLS | After LCP · CLS |
|---|---|---|
| `/en` | 1.54 s · 0.019 | 1.02 s · 0.019 |
| `/en/tones/new` | 0.95 s · 0.001 | 0.95 s · 0.001 |
| `/en/examples/northern-lights` | 0.86 s* · **0.446** | 0.88 s · **0** |

\* Before, the LCP element was the footer paragraph, visible because the short skeleton left it on
screen; the real content then pushed it down (CLS 0.446). Skeletons now reserve the viewport, and
the example's back link and "illustrative example" note (no data needed) render immediately, so
LCP is real content and nothing shifts. Analysis TBT grew by ~40–50 ms over a 20 s run (typed
findings, rings, pulses); within budget.

## Budgets (revised with evidence)

The planned budget of 120 KB for the landing is not reachable with the Next.js App Router, whose
runtime alone is ≈ 130 KB gzip. Revised budgets, enforced by review until automated in CI:

| Budget | Target | Status |
|---|---|---|
| Landing initial JS | ≤ 190 KB gzip | ✅ 182 KB |
| App routes initial JS | ≤ 220 KB gzip | ✅ 186–205 KB |
| Content pages initial JS | ≤ 190 KB gzip | ✅ 165 KB |
| Animation under 4× CPU | ≥ 55 fps average, p95 frame ≤ 20 ms | ✅ 57–60 fps, 16.8 ms |
| Landing LCP (throttled mobile) | ≤ 2.5 s | ✅ |
| CLS | ≤ 0.1 | ✅ (example page fixed: 0.446 → 0) |
| TBT (throttled mobile) | ≤ 300 ms landing, ≤ 400 ms app | ✅ |

## Next steps

- Add the bundle script to CI with thresholds.
- Re-measure with Lighthouse in CI (Linux runner) and on real devices.
- Consider moving the landing's two client islands behind `IntersectionObserver` if TBT grows.
