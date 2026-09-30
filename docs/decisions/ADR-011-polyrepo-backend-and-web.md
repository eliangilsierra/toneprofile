# ADR-011 — Separate repositories for backend (Python) and web (TypeScript)

- Status: accepted — amended 2026-09-29 (repository roles swapped, see "Amendment")
- Date: 2026-09-29
- Supersedes: [ADR-010](ADR-010-repository-structure.md)

## Context

ADR-010 proposed a single repository holding both the Python backend and the TypeScript SPA. The
product owner prefers one repository per project/stack: two stacks with different toolchains,
dependencies, CI and release cycles should not share a repository.

## Decision

Two repositories, one per stack:

| Repository | Content | Stack |
|---|---|---|
| **`toneprofile`** (this one) | Web application (Next.js) **and** the product/architecture documentation | TypeScript, Next.js, npm |
| **`toneprofile-api`** (working name; to be created by the product owner) | Backend: domain, GP-180 device engine, audio, research/AI, pipeline, API, worker, CLI, hardware rig | Python (uv), FastAPI, Docker |

The contract between them is the **OpenAPI specification**:

1. Until the backend repository exists, the contract is authored here, contract-first, in
   `docs/api/openapi-v1.yaml`; the web app generates its types from it (`npm run api:types`) and
   CI fails if they are stale.
2. Once the backend exists it becomes the source of truth: its CI exports `openapi.json` with every
   release (tag `api-vX.Y.Z`); this repository pins a copy and regenerates its types.
3. Routes are versioned under `/v1`; breaking changes need `/v2` or a coordinated release.

## Amendment (2026-09-29)

The first version of this ADR assigned `toneprofile` to the backend and a future `toneprofile-web`
to the frontend. The product owner decided instead that this repository hosts the frontend (and
keeps all documentation under `/docs`), and that a new repository will be created for the backend.
The decision itself — one repository per stack, joined by a versioned OpenAPI contract — is
unchanged. The Python layout in [repository.md](../architecture/repository.md) now describes the
future backend repository.

## Alternatives considered

- Monorepo (ADR-010): atomic cross-stack changes, but mixes toolchains and CI in one place.
- Three repositories (separate docs repo): more coordination for no benefit.

## Consequences

- Clear ownership, independent CI/CD and dependency updates per stack.
- Cross-stack features need two PRs; the versioned OpenAPI contract keeps them in sync.
- The frontend can be built now against a contract-faithful mock backend
  ([ADR-016](ADR-016-mock-backend.md)); the backend "First Loop" phases proceed independently.

## Revisit when

The contract overhead becomes a bottleneck (frequent lock-step changes across both repositories).
