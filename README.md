# ToneProfile — web

**From song to tone.** Pick a song (and optionally a short excerpt you own); ToneProfile researches
the rig, measures the recording and builds a preset for your guitar processor — starting with the
**Valeton GP-180** — and shows exactly how sure it is.

This repository contains the **web application** (Next.js) and **all product and architecture
documentation** ([`docs/`](docs/README.md)). The Python backend will live in a separate repository;
until then the app runs against a **contract-faithful demo backend** with fictional data.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional; defaults to mock mode
npm run dev                  # http://localhost:3000 → redirects to /en or /es
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` · `npm run typecheck` · `npm test` | ESLint · TypeScript · Vitest |
| `npm run e2e` | Playwright + axe (needs `npm run build` first; `npx playwright install chromium` once) |
| `npm run api:types` | Regenerate `src/lib/api/schema.d.ts` from `docs/api/openapi-v1.yaml` |
| `node scripts/measure-bundles.mjs <url>` · `node scripts/measure-vitals.mjs <url>` · `node scripts/measure-motion.mjs <url>` | Performance measurements against a running production server (JS per route, lab vitals, animation smoothness) |

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `NEXT_PUBLIC_API_MODE` | `mock` | `mock`: in-browser demo backend (MSW). `http`: proxy `/api/v1/*` to the real API |
| `TONEPROFILE_API_URL` | — | Backend base URL (http mode, server-side only) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Absolute URL for metadata |
| `NEXT_PUBLIC_ENABLE_LAB` | — | `1` enables the design-system lab (`/en/lab`) outside development |

## Demo mode

Everything works without a backend: song search, uploads (with real client-side checks and
waveform), asynchronous analysis, tone profile, preset, dial-in sheet, feedback and library
(persisted in `localStorage`). The data is **fictional** — songs, artists, sources and quotes are
invented (sources point to `example.com`) so the demo never attributes gear to real musicians.
Preset files are not offered in the demo; the dial-in sheet is.

Also public: **Examples** (`/en/examples`, three finished results including a degraded one),
**Methodology** (`/en/methodology`) and **legal drafts** (`/en/legal/privacy`, `terms`, `audio`) —
the legal texts are marked as pending legal review.

Scenarios for trying every state:

| Try | You'll see |
|---|---|
| "Northern Lights" (+ an excerpt) | Clean ambient tone, measured delay/chorus, full evidence |
| "Iron Parade" | High gain; an "unknown" cabinet claim |
| "Porch Light" without excerpt / with excerpt | Refusal to invent a tone / degraded result with a warning |
| "Tape Hiss" | Engine failure → "Retry from last step" succeeds |
| "Slow Signal" | Timeout → retry |
| Excerpt named `*noguitar*`, `*multi*`, `*lowq*`, `*corrupt*` | No guitar detected · multiple guitars warning · low quality warning · invalid audio |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 tokens · next-intl
(en/es) · TanStack Query · React Hook Form · Motion (LazyMotion) · d3-scale/d3-shape · openapi-fetch
+ openapi-typescript · MSW · Vitest + Testing Library · Playwright + axe-core.
Why each choice (and what was rejected): [frontend architecture](docs/frontend/frontend-architecture.md)
and ADRs [012–016](docs/decisions/README.md).

## Troubleshooting (Windows)

If Next.js fails with `ERR_SWC_NATIVE_CACHE … DACL grants replacement rights`, point SWC's native
cache to a folder only your user can write, e.g.:

```bash
SWC_NATIVE_BINDING_CACHE="C:\Users\<you>\.cache\swc-native" npm run dev
```

## Documentation

Start at [docs/README.md](docs/README.md) — proposal, MVP master plan, UX architecture, design
system, API contract, GP-180 research, roadmap, risks and ADRs.

## Disclaimer & license

Independent project, not affiliated with or endorsed by Valeton or any artist; product and artist
names are used descriptively. [Apache-2.0](LICENSE).
