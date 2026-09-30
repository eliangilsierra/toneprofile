# ADR-006 — Modular monolith: Python API + worker, React SPA, Postgres queue

- Status: accepted — frontend choice superseded by [ADR-012](ADR-012-nextjs-frontend.md) (Next.js)
- Date: 2026-09-29

## Context

The brief's hypothesis: Next.js + API/BFF + Redis queue + separate Python workers. The domain
(codec, DSP, mapping, research) is Python-natural, and the team is one developer.

## Decision

- One Python codebase and image: FastAPI API and a job worker as two entrypoints.
- Postgres for data **and** the job queue (`FOR UPDATE SKIP LOCKED`); no Redis at MVP.
- React + Vite SPA (TypeScript) with an OpenAPI-generated client instead of Next.js.
- Async jobs for audio/research/generation; sync for CRUD, re-mapping and downloads.

## Alternatives considered

Mostly serverless (audio does not fit function limits), Next.js + container workers (domain split
across two languages, extra runtime), fully containerized frontend server (unneeded), local-first
desktop app (premature). Comparison table in [overview.md](../architecture/overview.md#2-architecture-options-compared).

## Consequences

Fewer moving parts; the web app is replaceable; scaling = more worker machines.

## Revisit when

Queue throughput exceeds ~100 jobs/min, SEO-heavy public pages are needed, or separate teams form.
