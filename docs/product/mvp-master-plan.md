# ToneProfile — MVP Master Plan

The single plan that ties product, UX, frontend, backend, AI, audio and device work together. It
summarises and links to the detailed documents rather than repeating them.

**Core hypothesis to prove:** *ToneProfile can take a musical reference and produce a useful,
understandable guitar tone reconstruction for a real device (Valeton GP-180).*

## 1. Product scope

| In the MVP | Out of the MVP |
|---|---|
| GP-180 only (data-driven device model, not coupled) | Other devices (the intent layer is ready for them) |
| Song reference (search) + optional user-uploaded excerpt | URLs (YouTube/Spotify), automatic audio acquisition |
| Evidence with sources and confidence; "unknown" allowed | Invented gear, confident guesses |
| Device-independent tone profile + GP-180 preset + dial-in sheet + import guide | Direct USB/Bluetooth push to the device |
| Feedback per preset version | Social, marketplace, sharing, payments, mobile apps |
| English + Spanish | Other languages |

## 2. Primary user journey

```text
Landing ──► New tone ──► Analysis (live) ──► Result ─────────────► Dial-in sheet / .prst
              │ song search       │ Signal Rail     │ Tone profile        │ Import in Valeton Suite
              │ excerpt (opt.)    │ real findings   │ Translation ⇄       │ Play on the GP-180
              │ guitar pickups    │ cancel / retry  │ Preset inspector    ▼
              │ device            │ error states    │ Feedback ◄───────── rate on the device
```

Secondary: Library (history) → reopen any tone; Sign-in (guest mode until the backend exists).
Detailed flows, states and the error catalogue: [UX architecture](ux-architecture.md).

## 3. Prioritised features

### P0 — required to validate the hypothesis

| Feature | Frontend | Backend |
|---|---|---|
| Landing that explains the product and its limits | ✅ built | — |
| Song search | ✅ built (MusicBrainz-backed in production) | P5 |
| Optional excerpt upload with 5–90 s window, rights attestation | ✅ built (client checks + presigned upload flow) | P4 |
| Guitar profile (pickups, position, tuning) | ✅ built | P3 (compensation) |
| Device selection (GP-180) | ✅ built | P1 catalog |
| Asynchronous analysis with honest progress (Signal Rail, elapsed vs typical, cancel, retry) | ✅ built | P6 job runner |
| Error states for every failure mode | ✅ built | P4–P6 |
| Tone profile: summary, confidence, fingerprint, character targets, measured facts, evidence with sources | ✅ built | P3–P5 |
| Translation universal ⇄ device + block inspector with every parameter + alternatives | ✅ built | P3 mapper |
| Explanation, validation checks, download (or honest reason), dial-in sheet, import guide | ✅ built | P1–P3 |
| Feedback per version | ✅ built | P6 |
| Library | ✅ built | P6 |
| Examples (curated, read-only results incl. a degraded one) | ✅ built (`/v1/examples`, demo fixtures) | P6 curation |
| Methodology + FAQ page | ✅ built (static) | — |
| Legal pages: privacy, terms, audio & copyright (drafts) | ✅ built (static; pending legal review) | — |
| English + Spanish | ✅ built | P5 (prose in locale) |

### P1 — important, after the First Loop gate

Match (record through the GP-180 → suggestions → new version), fine-tune with intent sliders
(re-solve), direct parameter editing, saved guitars, light theme, visual-regression tests, real authentication.

### P2 — future

More devices (Line 6, Boss, Neural DSP, Fractal…), share links, SSE progress, Web MIDI "send to
device" (after the SysEx write path is proven), NAM-assisted mode (SnapTones from captures),
section auto-detection UI, public preset library.

### Explicitly rejected (for now)

URL ingestion; chat UI; fabricated progress percentages; WebGL hero; marketplace/community;
payments; native mobile apps; LLM-generated knob values; auto-downloading songs.

## 4. UX architecture

Pages, states and navigation: [UX architecture](ux-architecture.md). Visual language and
signature interactions: [creative direction](../frontend/creative-direction.md). Components and
tokens: [design system](../frontend/design-system.md).

## 5. Architecture summary

| Area | Summary | Detail |
|---|---|---|
| Frontend | Next.js 16 as frontend only; static marketing, client app; next-intl; TanStack Query polling; MSW demo backend | [frontend architecture](../frontend/frontend-architecture.md) |
| Backend | Python modular monolith (FastAPI API + worker, one image), Postgres data + queue, S3 storage | [overview](../architecture/overview.md) |
| API contract | Contract-first OpenAPI v1; problem+json; async jobs with `steps[]`, `estimate`, `poll_after_ms` | [API](../api/README.md) |
| AI | Bounded research loop with verified quotes; schema-constrained intent drafting; explanations; never device values | [AI architecture](../ai/ai-architecture.md) |
| Audio | Sandboxed ffmpeg, ≤ 90 s window, optional separation behind a port, LTAS/saturation/ambience features; raw audio deleted ≤ 24 h | [audio architecture](../audio/audio-architecture.md) |
| Tone model | ToneEvidence → ToneIntent → DevicePatch; user-facing "Tone Profile" = evidence + intent | [tone representation](../architecture/tone-representation.md) |
| Device engine | Data-driven GP-180 catalog, deterministic mapper solving against measured device response, validator, codec | [device engine](../devices/valeton-gp180/device-engine.md) |
| GP-180 | `.prst` generation feasible (1128 bytes, no checksum); import via Valeton Suite; unknowns U1–U8 to verify on hardware | [GP-180 research](../research/gp180-ecosystem.md), [format](../devices/valeton-gp180/preset-format.md) |
| Storage | Postgres (entities, versions, traces), object storage (short-lived audio), no raw audio kept | [domain model](../architecture/domain-model.md) |
| Async | Postgres job queue, idempotent steps, retry from last successful step | [overview §6](../architecture/overview.md#6-job-execution) |
| Auth | Not needed for the demo; required for the private alpha (quotas, cost control) — Supabase Auth JWT | [ADR-007](../decisions/ADR-007-hosting.md) |
| Observability | Product trace tables + OpenTelemetry + Sentry; cost per generation | [observability](../architecture/observability.md) |
| Security | No URL fetching (no SSRF), sandboxed media parsing, schema-bound LLM, quotas, secrets in platform stores | [security](../architecture/security.md) |
| Cost | ≈ $0.05 (cached research) – $0.20 per generation; ≈ $200/month at 1k generations | [cost model](../architecture/cost-model.md) |
| Testing | Unit/component/E2E + axe in the web repo; golden codec tests and hardware-in-the-loop in the backend | [validation strategy](../testing/validation-strategy.md) |
| Deployment | Web on a Next.js host; API/worker on Fly.io; Supabase for Postgres/Auth/Storage | [overview §8](../architecture/overview.md#8-infrastructure-mvp) |
| CI/CD | GitHub Actions: contract sync, lint, types, tests, build, E2E | [repository](../architecture/repository.md) |
| Legal | User-provided audio only, no redistribution, fictional demo data, open questions for counsel | [legal](legal-considerations.md) |
| Risks | Technical, product, legal, cost, feasibility | [risk register](../risk-register.md) |

## 6. Roadmap

```text
MVP   = Backend P0–P6 (First Loop gate before P6)  +  Web track W0–W10 (done) → private alpha
V1    = P1 features (Match, fine-tune, saved guitars, methodology, light theme, auth), real users (P7)
V2    = Second device family via the same tone profile; NAM-assisted mode; direct device transfer
Future= Public preset library, community, advanced tone matching, plugins/DAWs
```

Sequencing and definitions of done: [roadmap](../roadmap.md).

## 7. MVP Definition of Done

Product: the primary journey works end to end on real hardware; success criteria S1–S10 met
([validation strategy](../testing/validation-strategy.md#5-mvp-success-criteria-measurable)).
Design: Signal Lab identity, signature interactions, desktop + mobile. Engineering: typed contract,
async jobs, errors and loading handled, dependencies justified. Performance: budgets in
[performance](../frontend/performance.md). Accessibility: keyboard, focus, semantics, reduced motion,
axe clean. Quality: build, lint, tests and E2E green in CI.
