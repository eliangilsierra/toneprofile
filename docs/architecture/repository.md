# Repositories, Local Development and CI/CD

Decision record: [ADR-011](../decisions/ADR-011-polyrepo-backend-and-web.md)
(supersedes [ADR-010](../decisions/ADR-010-repository-structure.md)).

## 1. Two repositories, one per stack

| Repository | Stack | Content | Status |
|---|---|---|---|
| **`toneprofile`** (this repository) | TypeScript · Next.js | Web application + all product/architecture documentation (`/docs`) + the contract-first OpenAPI draft | Active |
| **`toneprofile-api`** (working name) | Python · FastAPI | Domain, GP-180 device engine, audio, research/AI, pipeline, API, worker, CLI, hardware rig | To be created by the product owner |

Contract between them: the versioned **OpenAPI** spec (see §4).

## 2. Web repository layout (`toneprofile`, this repository)

See [frontend architecture](../frontend/frontend-architecture.md) for details.

```text
toneprofile/
├── docs/                    all documentation (this folder); docs/api/openapi-v1.yaml = contract draft
├── messages/                en.json, es.json
├── public/                  static assets, MSW service worker
├── scripts/                 bundle and web-vitals measurement
├── src/                     Next.js app (app/, features/, ui/, motion/, lib/, mocks/, i18n/)
├── tests/e2e/               Playwright specs
└── .github/workflows/ci.yml
```

## 3. Backend repository layout (`toneprofile-api`, planned)

```text
toneprofile-api/
├── src/toneprofile/                single Python package
│   ├── domain/                     entities, value objects, ToneEvidence/ToneIntent schemas, confidence
│   ├── devices/
│   │   ├── core/                   capability model, DevicePatch, validator & mapper interfaces
│   │   └── valeton_gp180/          catalog loader, codec (.prst), rules, mapper, instructions
│   ├── tone/                       intent rules, archetype vocabulary, mapper objective
│   ├── audio/                      sandboxed decode, selection, separation port+adapters, features, compare
│   ├── research/                   song resolution, research orchestration, evidence grading
│   ├── ai/                         LLMGateway port, adapters (anthropic, openrouter, recorded), prompt loader, metering
│   ├── pipeline/                   generation state machine, steps, job runner
│   ├── storage/                    Postgres repositories (SQLAlchemy Core), S3 client, migrations (Alembic)
│   ├── api/                        FastAPI routers (/v1), DTOs, auth dependency
│   ├── worker/                     worker entrypoint
│   └── cli/                        `toneprofile` CLI (presets, generate, rig, export-openapi)
├── prompts/                        versioned prompts + JSON schemas (<task>/vN.md, schema.json)
├── data/
│   ├── devices/valeton_gp180/semantics.yaml   curated model semantics (ours, committed)
│   └── archetypes.yaml
├── rig/                            hardware-in-the-loop scripts (MIDI PC, re-amp, capture)
├── tests/
│   ├── unit/  integration/  golden/  eval/  hardware/
│   └── fixtures/                   own presets & DI clips (committed only if we own them)
│       └── private/                gitignored: third-party dumps, factory presets, song excerpts
├── infrastructure/
│   ├── docker/                     Dockerfile, compose.yaml (postgres, minio, api, worker)
│   └── fly/                        fly.toml (api + worker process groups)
├── docs/
├── .github/workflows/
└── pyproject.toml                  uv; ruff, pyright, pytest, import-linter config
```

### Boundary rules (import-linter)

```text
domain            → (nothing inside toneprofile)
devices, tone     → domain
audio             → domain
research, ai      → domain
pipeline          → domain, devices, tone, audio, research, ai (via ports)
storage           → domain
api, worker, cli  → pipeline, storage, domain   (composition roots)
devices.valeton_gp180 must not import pipeline/api/ai
```

A future second device is a sibling of `valeton_gp180`; nothing else changes.

## 4. API contract between the repositories

1. Today (no backend yet): the contract is authored here in `docs/api/openapi-v1.yaml`;
   `npm run api:types` regenerates `src/lib/api/schema.d.ts`; CI lints the spec and fails if the
   generated types are stale.
2. When the backend exists: its CI runs `toneprofile export-openapi > openapi.json` and publishes it
   as a GitHub Release asset (`api-vX.Y.Z`); this repository pins that version and regenerates its
   types from it.
4. Versioning: routes under `/v1`; additive changes are non-breaking; breaking changes go to `/v2`
   (or a coordinated release while there is a single client).
5. Web E2E tests run against the backend Docker image of the pinned version.

## 5. Local development

Backend (`toneprofile-api`, planned):

```bash
git clone …/toneprofile-api && cd toneprofile-api
cp .env.example .env              # ANTHROPIC_API_KEY, or LLM_PROVIDER=recorded
docker compose -f infrastructure/docker/compose.yaml up   # postgres, minio, api, worker
# or without Docker for the Python side:
uv sync && uv run pytest
```

Web (this repository):

```bash
git clone …/toneprofile && cd toneprofile
cp .env.example .env.local        # NEXT_PUBLIC_API_MODE=mock runs without any backend
npm install
npm run dev                       # http://localhost:3000
# against a local backend: NEXT_PUBLIC_API_MODE=http TONEPROFILE_API_URL=http://localhost:8000 npm run dev
```

| Service | Port |
|---|---|
| api (FastAPI, `/docs`) | 8000 |
| postgres | 5432 |
| minio (S3 + console) | 9000 / 9001 |
| web (Next.js, this repo) | 3000 |

- Auth: a local JWT issuer (`toneprofile dev-token`) replaces the hosted provider.
- Offline mode: `LLM_PROVIDER=recorded` replays recorded LLM responses; `SEPARATOR=noop`.
- Hardware work runs on the host (USB/MIDI access), not in containers: `uv run toneprofile rig …`.

## 6. CI/CD (GitHub Actions)

Backend (`toneprofile-api`, planned):

```text
pull_request
 ├─ ruff (lint+format) → pyright (strict on domain/devices) → import-linter
 ├─ pytest unit + golden (codec round trips) → pip-audit
 ├─ integration: compose (postgres, minio) → pytest -m integration (RecordedGateway, no live LLM)
 ├─ openapi.json up to date
 ├─ security: gitleaks, semgrep
 └─ docker build

push to main → all of the above → Alembic migration (gated) → deploy api+worker (Fly.io)
tag api-vX.Y.Z → publish image + openapi.json release asset
nightly/manual → eval suite with live LLM (cost-capped report)
workflow_dispatch on self-hosted runner `gp180` → hardware smoke test with the device
```

Web (this repository, `.github/workflows/ci.yml`):

```text
pull_request / push → api types in sync + OpenAPI lint → eslint → tsc → vitest → next build
                    → Playwright E2E (desktop + mobile smoke, axe) against the built app in mock mode
deploy (P6)         → Next-capable host (Vercel, Cloudflare via OpenNext, or a container)
```

## 7. Definition of Done (per change)

- Types check, lint clean, boundary rules pass.
- Unit tests for new logic; golden tests updated intentionally (reviewed diff).
- API changes: `openapi.json` updated; breaking changes versioned.
- Prompt changes come with an eval report.
- Codec/catalog changes come with a hardware verification note (level reached in the
  [verification ladder](../devices/valeton-gp180/preset-format.md#6-verification-ladder)).
- Docs/ADR updated when a decision changes.
