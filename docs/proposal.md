# toneprofile — Technical Proposal

Date: 2026-09-29 · Status: discovery complete, pre-implementation · Target device: Valeton GP-180

This document answers the brief's final requirement (§41) and links to the detailed documents.
It deliberately **replaces** several parts of the initial hypothesis; each replacement is justified
in an ADR.

## 0. Executive summary

1. **Feasible.** The GP-180 `.prst` format is a fixed 1128-byte, checksum-free structure,
   fully mapped by the community on the sibling GP-150 (hardware-confirmed) and consistent with all
   200 GP-180 files we analysed. Generated presets can be imported with the official Valeton Suite.
   Five concrete unknowns remain and are testable in days on our own device.
2. **The market already has "song → GP-180 preset".** GP Tone Builder (iOS) does it with stem
   separation and Bluetooth transfer. LLM-only generators are everywhere. So toneprofile must win
   on **measured quality and honesty**, not on the idea.
3. **Core technical bet:** measure the real GP-180 (hardware-in-the-loop characterization) and map
   a device-independent *tone intent* onto it with a deterministic solver, instead of letting an LLM
   guess knob values. Close the loop with the user's own recording ("Match").
4. **Architecture:** Python modular monolith (FastAPI API + worker, one image), Postgres as database
   *and* queue, a Next.js web app (frontend only), S3-compatible storage, Anthropic API behind a provider-neutral
   gateway. No Redis, no Next.js, no agent swarm.
5. **Sequence:** prove the physical loop from a CLI first (codec → rig → mapper → analysis → AI),
   pass a go/no-go gate, then build the web app.

## 1. Product

| Question | Answer | Detail |
|---|---|---|
| What exactly is the MVP? | Pick a song (+ optional short excerpt, + your guitar's pickups) → evidence-backed tone intent → GP-180 preset (`.prst` + dial-in sheet) → import via Valeton Suite → optionally record yourself and get device-level adjustments. | [product-definition](product/product-definition.md) |
| Who is it for? | GP-180 owners (GP-150 as a by-product): hobbyist/intermediate players who want song tones without expert rig knowledge. | same |
| What problem? | Knowing the original rig, which device models approximate it, and how to set them — three expertises most players lack; existing answers are guesswork. | same |
| Modes | A Song ✓ · B Excerpt upload ✓ · C URL ✗ · D Recording→Match ✓ (lite) | [ADR-001](decisions/ADR-001-mvp-scope-and-modes.md) |
| Not in MVP | Other devices, direct USB/BT push, NAM/IR management, URL ingestion, library/social/marketplace, payments, mobile apps | same |

## 2. Technical architecture

| Question | Answer |
|---|---|
| Architecture | Modular monolith: one Python package/image with API and worker entrypoints; Postgres for data + job queue; object storage; Next.js web app. [overview](architecture/overview.md), [ADR-006](decisions/ADR-006-system-architecture.md) |
| Why | Domain is Python-native (DSP, ML, binary codec, optimization); one developer; fewest moving parts; backend runs locally with `docker compose up`; every component replaceable. |
| Serverless | Web hosting; managed Postgres/Auth/Storage; LLM and optional separation APIs. |
| Containerized | API and worker (same image), scale-to-zero machines. |
| Asynchronous | Audio probe/decode/separation/features, gear research, intent drafting + mapping (one generation job with persisted steps), Match comparisons. |
| Synchronous | Auth, CRUD, song search, re-mapping after edits (deterministic, < 1 s), `.prst` download, presigned upload URLs. |
| Frontend | Next.js 16 + React 19 + TypeScript, TanStack Query, Tailwind v4 tokens, next-intl (en/es), Motion, OpenAPI-generated client, MSW mock backend — [ADR-012](decisions/ADR-012-nextjs-frontend.md) (supersedes the earlier Vite SPA choice) and [frontend architecture](frontend/frontend-architecture.md). |
| Tone representation | Three layers: ToneEvidence → ToneIntent → DevicePatch. [tone-representation](architecture/tone-representation.md), [ADR-003](decisions/ADR-003-tone-representation.md) |
| Domain model | [domain-model](architecture/domain-model.md) (ERD, indexes, lifecycle, versioning) |

## 3. AI

| Question | Answer | Detail |
|---|---|---|
| Which models? | Anthropic API as primary; starting hypothesis Sonnet 5.5 (research, intent), Haiku 4.5 (disambiguation, explanation), Opus 5.5 (eval judge). Final choice by eval: measure a capable model at low effort before any cascade. | [ai-architecture](ai/ai-architecture.md), [ADR-004](decisions/ADR-004-ai-provider-strategy.md) |
| Which tasks? | Song disambiguation, bounded gear research with provider web search and **verified quotes**, schema-constrained intent drafting, explanations, natural-language fine-tune → bounded deltas. | same |
| Why? | These are language/reasoning tasks over heterogeneous text; everything else is better done deterministically. | same |
| What must not use AI? | Catalog, ranges, device model choice *values*, knob solving, validation, serialization, DSP features, similarity metrics, evidence levels, costs/limits. | same |
| OpenRouter? | Evaluation/dev tool for cross-vendor benchmarking; not in the production path (fee, extra hop, loses provider-specific features). | same |
| Agents? | One bounded research loop. No multi-agent system. | same |

## 4. Audio

| Question | Answer | Detail |
|---|---|---|
| How is audio processed? | Presigned upload → sandboxed ffprobe/ffmpeg (allow-list, rlimits, no network) → 48 kHz → window selection (≤ 90 s) → optional guitar separation → descriptors → derived features stored, raw audio deleted ≤ 24 h. | [audio-architecture](audio/audio-architecture.md) |
| Technology | FFmpeg; numpy/scipy/librosa/pyloudnorm; Demucs (CPU) behind a `StemSeparator` port with Noop and commercial-API adapters; embeddings only if they correlate with human ratings. Essentia avoided (AGPL). | [ADR-005](decisions/ADR-005-audio-processing.md) |
| Evaluation metrics | Loudness-normalised LTAS distance (primary), saturation/dynamics/ambience deltas, known-answer parameter recovery, and blind human ratings as the headline metric. | [validation-strategy](testing/validation-strategy.md) |

## 5. GP-180

| Question | Answer |
|---|---|
| Can real presets be generated? | Very likely yes. Community spec + our 200-file corpus analysis; checksum-free; GP-150 hardware-confirmed. [gp180-ecosystem](research/gp180-ecosystem.md) |
| How? | Template-based `.prst` serializer driven by a versioned device catalog (extracted locally from Valeton Suite metadata) and observed engine-tag/chain rules; user imports via Suite. [preset-format](devices/valeton-gp180/preset-format.md), [ADR-002](decisions/ADR-002-preset-delivery.md) |
| What is known? | Layout, header fields, 12 × 68-byte blocks, float32 engineering-unit parameters, footer; transport framing and many SysEx families (RE). |
| What is unknown? | U1 Suite accepts modified files · U2 header `0x0E–0x0F` · U3 chain-order semantics (AMP always stored first) · U4 DSP engine-tag rules · U5 parameter order · U6 SnapTone selection · U7 USB re-amp · U8 firmware catalog diffs. |
| Device engine | Data-driven capability model, validator, mapper solving against **measured** device response. [device-engine](devices/valeton-gp180/device-engine.md), [ADR-008](decisions/ADR-008-device-characterization.md) |

## 6. Infrastructure

| Concern | Choice |
|---|---|
| Hosting | Vercel or equivalent (web), Fly.io Machines (API + worker) — [ADR-007](decisions/ADR-007-hosting.md) (proposed) |
| Database | Postgres (Supabase), SQLAlchemy Core + Alembic |
| Storage | S3-compatible (Supabase Storage or R2; MinIO locally) |
| Queue | Postgres `job` table, `SKIP LOCKED`, idempotent steps |
| Workers | Same image, `toneprofile worker`; CPU-only at MVP; serverless GPU later if needed |
| Auth | Supabase Auth JWT (local JWT stub for dev) |
| CI/CD | GitHub Actions: lint, types, boundaries, unit + golden, integration (compose), contract check, security scans, build, deploy; nightly evals; manual hardware runs on a self-hosted runner. [repository](architecture/repository.md) |
| Observability | OpenTelemetry (GenAI conventions) + product trace tables + Sentry. [observability](architecture/observability.md) |

## 7. Security

Threat model and mitigations in [security](architecture/security.md). Key design choices:
no user-URL fetching (SSRF eliminated by design); sandboxed media parsing with allow-lists and
resource limits; LLM with no state-changing tools, strict schemas, quote verification; per-user
quotas and a global spend circuit breaker; ownership-scoped queries + RLS; secrets only in platform
stores; device-safe validator. Legal considerations and open questions for counsel:
[legal-considerations](product/legal-considerations.md).

## 8. Cost

| Volume / month | Estimated total | Per generation (all-in) |
|---|---|---|
| 100 | ≈ $30–55 | ≈ $0.30–0.55 |
| 1,000 | ≈ $200–215 | ≈ $0.20 |
| 10,000 | ≈ $1,300–1,450 | ≈ $0.13–0.15 |

Variable cost: ≈ $0.05 with cached research, ≈ $0.20 uncached. The research cache (shared per
song) is the main lever. Target ≤ $0.10 median variable cost at scale. [cost-model](architecture/cost-model.md)

## 9. Development

| Question | Answer |
|---|---|
| Repositories | Two repositories, one per stack: `toneprofile` (this one: Next.js web app + all docs + contract-first OpenAPI draft) and `toneprofile-api` (planned Python backend: single package with import-linter boundaries), connected by a versioned OpenAPI contract — [ADR-011](decisions/ADR-011-polyrepo-backend-and-web.md) |
| Modules | domain · devices (core, valeton_gp180) · tone · audio · research · ai · pipeline · storage · api · worker · cli · rig |
| Roadmap | P0 research ✓ → P1 codec PoC (hardware gate) → P2 measurement rig → P3 tone model + mapper → P4 analysis + Match → P5 research + intent → ★ First Loop gate → P6 web alpha → P7 real-world validation. [roadmap](roadmap.md) |
| Definition of Done | Per milestone exit criteria + global DoD in the roadmap; success criteria S1–S10 in the validation strategy. |

## 10. Changes versus the initial hypothesis

| Hypothesis | Replaced by | Why |
|---|---|---|
| Next.js + BFF | Next.js as frontend only + Python API | No domain logic in a second server runtime (Next.js kept for the marketing surface, ADR-012) |
| Redis queue | Postgres queue | One fewer service; ample for MVP throughput |
| Audio / Research / Tone workers as separate services | One worker, pipeline steps | Same code, simpler ops; split later by pool if needed |
| Universal knob-value tone model | Evidence → Intent → DevicePatch | Knob values don't transfer; honesty and editability |
| LLM tone reasoning produces parameters | LLM produces evidence/intent; deterministic solver produces parameters against measured device data | Verifiable and reproducible |
| OpenRouter as gateway | Provider-neutral port, Anthropic primary, OpenRouter for evals | Features, cost, latency |
| URL → Tone | Removed | ToS, copyright, SSRF |
| Recording → Match "later" | In MVP (lite) | Reuses eval code; biggest quality lever |
| Roadmap: AI before device validation | Device codec and measurement rig first | Highest risk first; AI needs an eval harness to be meaningful |

## 11. Immediate next steps (P0 → P1)

1. Record the GP-180 firmware and Suite versions; check USB settings for re-amp/playback routing.
2. Export 5–10 of *your own* presets (default, reordered chain, SnapTone-based, all modules on).
3. Scaffold the repository and CI; implement `parse`/`serialize` with golden round-trip tests.
4. Run PoC-1…PoC-5 from the roadmap on the device; update the format spec with verified facts.

## Sources (selection)

- Device & ecosystem: see [gp180-ecosystem § Sources](research/gp180-ecosystem.md#sources).
- Competitors: see [competitive-analysis](research/competitive-analysis.md).
- ST-ITO: Steinmetz et al., "Controlling Audio Effects for Style Transfer with Inference-Time
  Optimization", ISMIR 2024 — https://arxiv.org/abs/2410.21233
- Comunità, Stowell, Reiss, "Guitar Effects Recognition and Parameter Estimation with CNNs",
  JAES 2021 — https://mcomunita.github.io/files/comunita2020guitarfx-paper.pdf
- Lee et al., "Blind Estimation of Audio Processing Graph", ICASSP 2023.
- NablAFx — https://arxiv.org/pdf/2502.11668 · GuitarML paper list — https://github.com/GuitarML/mldsp-papers
- Mel-Band RoFormer — https://arxiv.org/pdf/2310.01809 · python-audio-separator — https://github.com/nomadkaraoke/python-audio-separator
- Music.AI pricing — https://music.ai/pricing/ · LALAL.AI pricing — https://www.lalal.ai/pricing/
- Modal GPU pricing summary — https://computeprices.com/providers/modal
- OpenRouter fees — https://www.truefoundry.com/blog/openrouter-pricing
- Gemini API pricing — https://ai.google.dev/gemini-api/docs/pricing · OpenAI API pricing — https://developers.openai.com/api/docs/pricing
- Spotify Developer Terms — https://developer.spotify.com/terms · API changes (Nov 2024) — https://musically.com/2024/11/28/spotify-removes-features-from-web-api-citing-security-issues/
- TONE3000 API — https://www.tone3000.com/api
