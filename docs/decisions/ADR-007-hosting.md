# ADR-007 — Hosting

- Status: proposed (final decision at roadmap P6)
- Date: 2026-09-29

## Context

Solo developer, low initial volume, CPU-heavy async jobs, need for local parity.

## Decision (proposed)

- SPA: Cloudflare Pages.
- API + worker: Fly.io Machines (one image, two process groups, scale to zero where possible).
- Postgres + Auth + Storage: Supabase (plain Postgres, JWT auth, S3-compatible storage) — one
  vendor for three concerns, each portable.
- Observability: OpenTelemetry → Grafana Cloud free tier; Sentry for errors.

## Alternatives considered

Railway/Render (similar trade-offs), a single Hetzner VPS with Compose (cheapest, more ops),
Vercel + Neon + R2 (more vendors), AWS (more ops for a solo developer).

## Consequences

Local parity via Compose (Postgres + MinIO + JWT stub). Every component is replaceable by a
standard equivalent (Postgres, S3 API, JWT/OIDC, containers).
