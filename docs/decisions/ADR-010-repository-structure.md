# ADR-010 — Monorepo with a single Python package and a web app

- Status: superseded by [ADR-011](ADR-011-polyrepo-backend-and-web.md)
- Date: 2026-09-29

## Context

Python owns the domain; TypeScript only the web client; one developer.

## Decision

One repository: `src/toneprofile/` (a single Python distribution with internal modules and
import-linter boundary contracts) and `apps/web/` (TypeScript SPA). uv for Python, pnpm for the web
app. Layout in [repository.md](../architecture/repository.md).

## Alternatives considered

Multiple Python packages in a uv workspace (more packaging ceremony for the same boundaries),
polyrepo (versioning overhead), TypeScript-first monorepo (domain in the wrong language).

## Revisit when

A second team or a separately deployed service (e.g. GPU separation) needs independent releases.
