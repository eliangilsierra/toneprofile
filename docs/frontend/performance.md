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

## Budgets (revised with evidence)

The planned budget of 120 KB for the landing is not reachable with the Next.js App Router, whose
runtime alone is ≈ 130 KB gzip. Revised budgets, enforced by review until automated in CI:

| Budget | Target | Status |
|---|---|---|
| Landing initial JS | ≤ 190 KB gzip | ✅ 178 KB |
| App routes initial JS | ≤ 220 KB gzip | ✅ 183–208 KB |
| Content pages initial JS | ≤ 190 KB gzip | ✅ 165 KB |
| Landing LCP (throttled mobile) | ≤ 2.5 s | ✅ |
| CLS | ≤ 0.1 | ✅ |
| TBT (throttled mobile) | ≤ 300 ms landing, ≤ 400 ms app | ✅ |

## Next steps

- Add the bundle script to CI with thresholds.
- Re-measure with Lighthouse in CI (Linux runner) and on real devices.
- Consider moving the landing's two client islands behind `IntersectionObserver` if TBT grows.
